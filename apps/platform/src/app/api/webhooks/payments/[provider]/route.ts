import { createHmac, timingSafeEqual } from "node:crypto";

import { NextResponse, type NextRequest } from "next/server";

import { resolveSecretValue } from "@ultra/modules";

type RouteContext = {
  params: Promise<{ provider: string }>;
};

function verifySignature(secret: string, payload: string, signature: string): boolean {
  const digest = createHmac("sha256", secret).update(payload).digest("hex");
  const expected = Buffer.from(digest, "hex");
  const actual = Buffer.from(signature, "hex");

  if (expected.length !== actual.length) {
    return false;
  }

  return timingSafeEqual(expected, actual);
}

export async function POST(request: NextRequest, context: RouteContext) {
  const params = await context.params;
  const payload = await request.text();
  const signature = request.headers.get("x-ultra-signature");
  const secret = await resolveSecretValue("payment_webhook_secret");

  if (!secret) {
    return NextResponse.json(
      { error: "Webhook secret is not configured" },
      { status: 503 },
    );
  }

  if (!signature || !verifySignature(secret, payload, signature)) {
    return NextResponse.json(
      { error: "Invalid webhook signature" },
      { status: 401 },
    );
  }

  return NextResponse.json({
    data: {
      ok: true,
      provider: params.provider,
      receivedAt: new Date().toISOString(),
    },
  });
}
