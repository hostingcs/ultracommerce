import { NextResponse, type NextRequest } from "next/server";

export function requireAdmin(request: NextRequest): NextResponse | null {
  const authHeader = request.headers.get("authorization");
  const sessionCookie = request.cookies.get("ultra-session")?.value;

  if (!authHeader && !sessionCookie) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 },
    );
  }

  if (authHeader) {
    const parts = authHeader.split(" ");
    const scheme = parts[0];
    const token = parts[1];

    if (scheme?.toLowerCase() !== "bearer" || !token) {
      return NextResponse.json(
        { error: "Invalid authorization format" },
        { status: 401 },
      );
    }
  }

  return null;
}
