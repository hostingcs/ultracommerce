import { createHash } from "node:crypto";

import { NextResponse, type NextRequest } from "next/server";

import { apiScopeSchema, productSchema } from "@ultra/api-contracts";
import {
  getAnalyticsControlCenter,
  getAnalyticsEventDefinitions,
  getAnalyticsProviders,
  createCartPreview,
  createCheckoutPreview,
  getEmailControlCenter,
  getAnalyticsSnapshot,
  getBlogPosts,
  getCatalogProducts,
  getCustomers,
  getFrontendAnalyticsBootstrap,
  getModuleDescriptors,
  getOrders,
  getPlatformHealth,
  getPlugins,
  getSeoConfig,
  getSeoCoverage,
  getSeoRoutes,
  listSecretStatuses,
  sendBulkEmails,
  upsertSecret,
} from "@ultra/modules";

import { requireAdmin } from "../../../../../lib/auth";
import { rateLimit } from "../../../../../lib/rate-limit";

type RouteContext = {
  params: Promise<{ scope: string; resource?: string[] }>;
};

function stableStringify(value: unknown): string {
  if (value === null || value === undefined || typeof value !== "object") {
    return JSON.stringify(value);
  }

  if (Array.isArray(value)) {
    return `[${value.map(stableStringify).join(",")}]`;
  }

  const obj = value as Record<string, unknown>;
  const sorted = Object.keys(obj).sort();
  return `{${sorted.map((k) => `${JSON.stringify(k)}:${stableStringify(obj[k])}`).join(",")}}`;
}

function hashIdempotencyKey(key: string): string {
  return createHash("sha256").update(key).digest("hex");
}

function createRequestFingerprint(payload: unknown): string {
  return createHash("sha256")
    .update(stableStringify(payload))
    .digest("hex");
}

function resolveGetPayload(scope: "store" | "admin", resource: string[]) {
  const key = resource.join("/") || "health";

  if (scope === "store") {
    switch (key) {
      case "seo":
        return { data: getSeoConfig() };
      case "seo/routes":
        return { data: getSeoRoutes() };
      case "analytics/config":
        return { data: getFrontendAnalyticsBootstrap() };
      case "catalog/products":
        return { data: getCatalogProducts() };
      case "cart":
        return { data: createCartPreview() };
      case "checkout":
        return { data: createCheckoutPreview() };
      case "orders":
        return { data: getOrders() };
      case "account":
        return { data: getCustomers()[1] ?? null };
      default:
        return null;
    }
  }

  switch (key) {
    case "seo":
      return { data: getSeoCoverage() };
    case "modules":
      return { data: getModuleDescriptors() };
    case "catalog/products":
      return { data: getCatalogProducts() };
    case "orders":
      return { data: getOrders() };
    case "customers":
      return { data: getCustomers() };
    case "cms/posts":
      return { data: getBlogPosts() };
    case "analytics":
      return {
        data: {
          snapshot: getAnalyticsSnapshot(),
          controlCenter: getAnalyticsControlCenter(),
        },
      };
    case "analytics/integrations":
      return { data: getAnalyticsProviders() };
    case "analytics/events":
      return { data: getAnalyticsEventDefinitions() };
    case "plugins":
      return { data: getPlugins() };
    default:
      return null;
  }
}

function rateLimitResponse(resetAt: number): NextResponse {
  return NextResponse.json(
    { error: "Too many requests" },
    {
      status: 429,
      headers: { "retry-after": String(Math.ceil((resetAt - Date.now()) / 1000)) },
    },
  );
}

export async function GET(request: NextRequest, context: RouteContext) {
  const params = await context.params;
  const scope = apiScopeSchema.parse(params.scope);
  const resource = (params.resource ?? []).join("/");

  if (resource === "health" || resource === "") {
    const health = await getPlatformHealth();
    return NextResponse.json({ data: health });
  }

  if (scope === "admin") {
    const authError = requireAdmin(request);
    if (authError) return authError;
  }

  if (scope === "admin" && resource === "settings/secrets") {
    return NextResponse.json({ data: await listSecretStatuses() });
  }

  if (scope === "admin" && resource === "notifications/email") {
    return NextResponse.json({ data: await getEmailControlCenter() });
  }

  const payload = resolveGetPayload(scope, params.resource ?? []);

  if (!payload) {
    return NextResponse.json({ error: "Route not found" }, { status: 404 });
  }

  return NextResponse.json(payload);
}

export async function POST(request: NextRequest, context: RouteContext) {
  const params = await context.params;
  const scope = apiScopeSchema.parse(params.scope);
  const resource = (params.resource ?? []).join("/");

  if (scope === "admin") {
    const authError = requireAdmin(request);
    if (authError) return authError;
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 },
    );
  }

  const idempotencyKey =
    request.headers.get("x-idempotency-key") ?? crypto.randomUUID();
  const fingerprint = createRequestFingerprint(body);

  if (scope === "store" && resource === "cart") {
    return NextResponse.json({
      data: createCartPreview(),
      security: {
        idempotencyKeyHash: hashIdempotencyKey(idempotencyKey),
        fingerprint,
      },
    });
  }

  if (scope === "store" && resource === "checkout") {
    return NextResponse.json({
      data: createCheckoutPreview(),
      security: {
        idempotencyKeyHash: hashIdempotencyKey(idempotencyKey),
        fingerprint,
      },
    });
  }

  if (scope === "store" && resource === "analytics/events") {
    const ip = request.headers.get("x-forwarded-for") ?? "unknown";
    const rl = rateLimit(ip, 60, 60_000, "analytics-events");

    if (!rl.allowed) {
      return rateLimitResponse(rl.resetAt);
    }

    const event =
      typeof (body as Record<string, unknown>)?.event === "string"
        ? (body as Record<string, unknown>).event
        : "unknown";

    return NextResponse.json(
      {
        data: {
          accepted: true,
          event,
          fingerprint,
          receivedAt: new Date().toISOString(),
          routedProviders: getAnalyticsProviders()
            .filter((provider) => provider.enabled)
            .map((provider) => provider.key),
        },
      },
      { status: 202 },
    );
  }

  if (scope === "admin" && resource === "catalog/products") {
    const parsed = productSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 422 },
      );
    }

    return NextResponse.json(
      {
        data: {
          ...parsed.data,
          id: crypto.randomUUID(),
          status: "draft",
        },
      },
      { status: 201 },
    );
  }

  if (scope === "admin" && resource === "analytics/integrations") {
    return NextResponse.json(
      { error: "Analytics integration persistence is not yet implemented" },
      { status: 501 },
    );
  }

  if (scope === "admin" && resource === "settings/secrets") {
    const ip = request.headers.get("x-forwarded-for") ?? "unknown";
    const rl = rateLimit(ip, 10, 60_000, "secret-upsert");

    if (!rl.allowed) {
      return rateLimitResponse(rl.resetAt);
    }

    try {
      const status = await upsertSecret(body as { key: string; value: string });
      return NextResponse.json({ data: status }, { status: 200 });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Secret save failed";
      console.error("Secret upsert error:", error);
      return NextResponse.json({ error: message }, { status: 400 });
    }
  }

  if (scope === "admin" && resource === "notifications/email/bulk") {
    const ip = request.headers.get("x-forwarded-for") ?? "unknown";
    const rl = rateLimit(ip, 5, 60_000, "bulk-email");

    if (!rl.allowed) {
      return rateLimitResponse(rl.resetAt);
    }

    try {
      const result = await sendBulkEmails(body as Parameters<typeof sendBulkEmails>[0]);
      return NextResponse.json({ data: result }, { status: 202 });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Bulk email send failed";
      console.error("Bulk email error:", error);
      return NextResponse.json({ error: message }, { status: 400 });
    }
  }

  return NextResponse.json(
    { error: "Mutation route not implemented yet" },
    { status: 400 },
  );
}
