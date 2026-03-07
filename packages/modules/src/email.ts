import {
  bulkEmailRequestSchema,
  bulkEmailResponseSchema,
  emailControlCenterSchema,
  inboundEmailSchema,
  type BulkEmailRequest,
  type BulkEmailResponse,
  type EmailControlCenter,
  type EmailProvider,
  type InboundEmail,
} from "@ultra/api-contracts";
import { getAppConfig } from "@ultra/core";
import { Resend } from "resend";

import { resolveSecretValue } from "./secret-vault";

type ResendWebhookHeaders = {
  id: string;
  timestamp: string;
  signature: string;
};

type ResendWebhookEvent = {
  type?: string;
  created_at?: string;
  data?: Record<string, unknown>;
};

async function getResendClient(): Promise<Resend | null> {
  const apiKey = await resolveSecretValue("resend_api_key");

  if (!apiKey) {
    return null;
  }

  return new Resend(apiKey);
}

function getEmailDefaults() {
  const appConfig = getAppConfig();

  return {
    from: appConfig.email.defaults.from,
    replyTo: appConfig.email.defaults.replyTo,
  };
}

export async function getEmailProviders(): Promise<EmailProvider[]> {
  const appConfig = getAppConfig();
  const resendKey = await resolveSecretValue("resend_api_key");
  const resendEnabled =
    appConfig.email.provider === "resend" && Boolean(resendKey);

  return [
    {
      key: "console",
      label: "Console Mailer",
      enabled: appConfig.email.provider === "console",
      delivery: "transactional",
      publicConfig: {},
      capabilities: ["local preview", "development fallback"],
    },
    {
      key: "resend",
      label: "Resend",
      enabled: resendEnabled,
      delivery: "hybrid",
      publicConfig: {
        audienceId: appConfig.email.resend.audienceId,
        from: getEmailDefaults().from,
        inboundRoute: "/api/webhooks/resend",
      },
      capabilities: [
        "transactional sending",
        "bulk batch sending",
        "custom headers and tags",
        "inbound webhooks",
      ],
    },
  ];
}

export async function getEmailControlCenter(): Promise<EmailControlCenter> {
  const appConfig = getAppConfig();
  const providers = await getEmailProviders();
  const resendEnabled = providers.some(
    (provider) => provider.key === "resend" && provider.enabled,
  );
  const webhookSecret = await resolveSecretValue("resend_webhook_secret");
  const defaults = getEmailDefaults();

  return emailControlCenterSchema.parse({
    providers,
    bulk: {
      enabled: resendEnabled,
      maxBatchSize: 100,
      supportsScheduling: true,
      supportsTags: true,
    },
    inbound: {
      enabled: resendEnabled && Boolean(webhookSecret),
      route: "/api/webhooks/resend",
      domain: appConfig.email.resend.inboundDomain,
      address: appConfig.email.resend.inboundAddress,
    },
    defaults,
  });
}

export async function sendBulkEmails(input: BulkEmailRequest): Promise<BulkEmailResponse> {
  const payload = bulkEmailRequestSchema.parse(input);
  const resend = await getResendClient();
  const dryRun = payload.options.dryRun ?? false;

  if (!resend || dryRun) {
    return bulkEmailResponseSchema.parse({
      provider: resend ? "resend" : "console",
      accepted: true,
      requested: payload.messages.length,
      processedAt: new Date().toISOString(),
      messageIds: payload.messages.map((_, index) => `dry-run-${index + 1}`),
      dryRun: true,
    });
  }

  const batch = payload.messages.map((message) => {
    const batchMessage: {
      from: string;
      to: string[];
      subject: string;
      cc?: string[];
      bcc?: string[];
      replyTo?: string;
      html?: string;
      text?: string;
      headers?: Record<string, string>;
      tags?: Array<{ name: string; value: string }>;
      scheduledAt?: string;
    } = {
      from: message.from,
      to: message.to,
      subject: message.subject,
    };

    if (message.cc) {
      batchMessage.cc = message.cc;
    }

    if (message.bcc) {
      batchMessage.bcc = message.bcc;
    }

    if (message.replyTo) {
      batchMessage.replyTo = message.replyTo;
    }

    if (message.html) {
      batchMessage.html = message.html;
    }

    if (message.text) {
      batchMessage.text = message.text;
    }

    if (message.headers) {
      batchMessage.headers = message.headers;
    }

    if (message.tags) {
      batchMessage.tags = message.tags;
    }

    if (message.scheduledAt) {
      batchMessage.scheduledAt = message.scheduledAt;
    }

    return batchMessage;
  });

  const { data, error } = await resend.batch.send(batch);

  if (error) {
    throw new Error(error.message);
  }

  const messageIds = Array.isArray(data)
    ? data.map((item) => {
        const typedItem = item as { id?: string };
        return typedItem.id ?? crypto.randomUUID();
      })
    : [];

  return bulkEmailResponseSchema.parse({
    provider: "resend",
    accepted: true,
    requested: payload.messages.length,
    processedAt: new Date().toISOString(),
    messageIds,
    dryRun: false,
  });
}

export async function verifyResendWebhook(
  payload: string,
  headers: ResendWebhookHeaders,
): Promise<ResendWebhookEvent> {
  const resend = await getResendClient();
  const webhookSecret = await resolveSecretValue("resend_webhook_secret");

  if (!resend || !webhookSecret) {
    throw new Error("Resend webhook support is not configured.");
  }

  return resend.webhooks.verify({
    payload,
    headers,
    webhookSecret,
  }) as unknown as ResendWebhookEvent;
}

function extractEmailList(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((entry) => {
    if (typeof entry === "string") {
      return [entry];
    }

    if (entry && typeof entry === "object" && "email" in entry) {
      const email = (entry as { email?: unknown }).email;
      return typeof email === "string" ? [email] : [];
    }

    return [];
  });
}

async function fetchInboundSnippet(resend: Resend, emailId: string): Promise<string | undefined> {
  const client = resend as unknown as {
    inbound?: {
      get?: (emailId: string) => Promise<{ data?: { text?: string; html?: string } }>;
    };
    emails?: {
      receiving?: {
        get?: (emailId: string) => Promise<{ data?: { text?: string; html?: string } }>;
      };
    };
  };

  const inboundResponse =
    (await client.inbound?.get?.(emailId).catch(() => undefined)) ??
    (await client.emails?.receiving?.get?.(emailId).catch(() => undefined));

  const text = inboundResponse?.data?.text ?? inboundResponse?.data?.html;
  return typeof text === "string" ? text.slice(0, 280) : undefined;
}

export async function normalizeInboundEmail(
  event: ResendWebhookEvent,
): Promise<InboundEmail | null> {
  if (event.type !== "email.received" || !event.data) {
    return null;
  }

  const resend = await getResendClient();
  const emailId = typeof event.data.email_id === "string" ? event.data.email_id : "";
  const snippet = resend && emailId ? await fetchInboundSnippet(resend, emailId) : undefined;

  return inboundEmailSchema.parse({
    provider: "resend",
    type: event.type,
    emailId,
    from: typeof event.data.from === "string" ? event.data.from : "",
    to: extractEmailList(event.data.to),
    subject: typeof event.data.subject === "string" ? event.data.subject : "",
    receivedAt:
      typeof event.data.created_at === "string"
        ? event.data.created_at
        : event.created_at ?? new Date().toISOString(),
    snippet,
  });
}
