"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { eq } from "drizzle-orm";

import { getDb, users } from "@ultra/db";

import { signSession, verifyPassword } from "../../../server/session";

export async function login(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    redirect("/admin/login?error=1");
  }

  let user: typeof users.$inferSelect | undefined;
  try {
    const db = getDb();
    const rows = await db.select().from(users).where(eq(users.email, email)).limit(1);
    user = rows[0];
  } catch {
    redirect("/admin/login?error=1");
  }

  if (!user || user.role !== "admin" || !user.passwordHash) {
    redirect("/admin/login?error=1");
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    redirect("/admin/login?error=1");
  }

  const token = await signSession({
    userId: user.id,
    email: user.email,
    role: user.role,
  });

  const cookieStore = await cookies();
  cookieStore.set("ultra-session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });

  redirect("/admin");
}
