"use server";

import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";

import { getDb, orders } from "@ultra/db";

export async function updateOrderStatus(id: string, formData: FormData) {
  const status = String(formData.get("status") ?? "") as "pending" | "paid" | "fulfilled" | "cancelled";
  await getDb().update(orders).set({ status }).where(eq(orders.id, id));
  redirect(`/admin/orders/${id}`);
}
