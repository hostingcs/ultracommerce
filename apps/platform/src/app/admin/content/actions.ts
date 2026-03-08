"use server";

import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";

import { getDb, blogPosts } from "@ultra/db";

export async function createPost(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const slug = String(formData.get("slug") ?? "").trim();
  const excerpt = String(formData.get("excerpt") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  const status = String(formData.get("status") ?? "draft") as "draft" | "published";
  const publishNow = status === "published";

  if (!title || !slug) redirect("/admin/content/new?error=missing");

  await getDb().insert(blogPosts).values({
    title,
    slug,
    excerpt,
    body,
    status,
    publishedAt: publishNow ? new Date() : null,
  });
  redirect("/admin/content");
}

export async function updatePost(id: string, formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const slug = String(formData.get("slug") ?? "").trim();
  const excerpt = String(formData.get("excerpt") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  const status = String(formData.get("status") ?? "draft") as "draft" | "published";

  if (!title || !slug) redirect(`/admin/content/${id}?error=missing`);

  const db = getDb();
  const existing = await db.select({ publishedAt: blogPosts.publishedAt, status: blogPosts.status })
    .from(blogPosts).where(eq(blogPosts.id, id)).limit(1);
  const currentPost = existing[0];
  const wasPublished = currentPost?.status === "published";
  const publishedAt = status === "published" && !wasPublished ? new Date() : (currentPost?.publishedAt ?? null);

  await db.update(blogPosts).set({ title, slug, excerpt, body, status, publishedAt }).where(eq(blogPosts.id, id));
  redirect("/admin/content");
}

export async function deletePost(id: string) {
  await getDb().delete(blogPosts).where(eq(blogPosts.id, id));
  redirect("/admin/content");
}
