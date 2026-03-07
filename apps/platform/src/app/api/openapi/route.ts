import { NextResponse } from "next/server";

import { getOpenApiDocument } from "@ultra/modules";

export async function GET() {
  return NextResponse.json(getOpenApiDocument());
}
