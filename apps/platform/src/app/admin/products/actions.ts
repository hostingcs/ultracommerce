"use server";

import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";

import { getDb, products } from "@ultra/db";

export async function createProduct(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const slug = String(formData.get("slug") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const price = String(formData.get("price") ?? "0");
  const inventory = parseInt(String(formData.get("inventory") ?? "0"), 10);
  const status = String(formData.get("status") ?? "draft") as "draft" | "active" | "archived";
  const currency = String(formData.get("currency") ?? "USD").trim();

  if (!title || !slug) redirect("/admin/products/new?error=missing");

  await getDb().insert(products).values({ title, slug, description, price, inventory, status, currency });
  redirect("/admin/products");
}

export async function updateProduct(id: string, formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const slug = String(formData.get("slug") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const price = String(formData.get("price") ?? "0");
  const inventory = parseInt(String(formData.get("inventory") ?? "0"), 10);
  const status = String(formData.get("status") ?? "draft") as "draft" | "active" | "archived";
  const currency = String(formData.get("currency") ?? "USD").trim();

  if (!title || !slug) redirect(`/admin/products/${id}?error=missing`);

  await getDb().update(products).set({ title, slug, description, price, inventory, status, currency }).where(eq(products.id, id));
  redirect("/admin/products");
}

export async function deleteProduct(id: string) {
  await getDb().delete(products).where(eq(products.id, id));
  redirect("/admin/products");
}
