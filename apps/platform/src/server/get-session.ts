import { cookies } from "next/headers";

import { verifySession, type SessionPayload } from "./session";

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("ultra-session")?.value;
  if (!token) return null;
  return verifySession(token);
}
