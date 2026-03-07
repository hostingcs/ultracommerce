import { NextResponse, type NextRequest } from "next/server";

import { normalizeInboundEmail, verifyResendWebhook } from "@ultra/modules";

export async function POST(request: NextRequest) {
  const payload = await request.text();

  try {
    const event = await verifyResendWebhook(payload, {
      id: request.headers.get("svix-id") ?? "",
      timestamp: request.headers.get("svix-timestamp") ?? "",
      signature: request.headers.get("svix-signature") ?? "",
    });
    const inboundEmail = await normalizeInboundEmail(event);

    return NextResponse.json({
      ok: true,
      eventType: event.type ?? "unknown",
      inboundEmail,
      receivedAt: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Invalid Resend webhook",
      },
      { status: 401 },
    );
  }
}
