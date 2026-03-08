import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";

import { getDb, blogPosts } from "@ultra/db";

import { updatePost, deletePost } from "../actions";

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const rows = await getDb().select().from(blogPosts).where(eq(blogPosts.id, id)).limit(1);
  const post = rows[0];
  if (!post) notFound();

  const updateWithId = updatePost.bind(null, id);

  return (
    <div className="page page-narrow">
      <div className="page-header">
        <div>
          <a href="/admin/content" className="back-link">← Blog</a>
          <h1>Edit post</h1>
        </div>
        <form action={deletePost.bind(null, id)}>
          <button type="submit" className="btn-danger">Delete</button>
        </form>
      </div>

      <div className="panel">
        <form action={updateWithId} className="form">
          <div className="form-row">
            <div className="field">
              <label htmlFor="title">Title *</label>
              <input id="title" name="title" type="text" required defaultValue={post.title} />
            </div>
            <div className="field">
              <label htmlFor="slug">Slug *</label>
              <input id="slug" name="slug" type="text" required defaultValue={post.slug} />
            </div>
          </div>

          <div className="field">
            <label htmlFor="excerpt">Excerpt</label>
            <textarea id="excerpt" name="excerpt" rows={2} defaultValue={post.excerpt} />
          </div>

          <div className="field">
            <label htmlFor="body">Body</label>
            <textarea id="body" name="body" rows={12} defaultValue={post.body} />
          </div>

          <div className="field">
            <label htmlFor="status">Status</label>
            <select id="status" name="status" defaultValue={post.status}>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>

          <div className="form-actions">
            <a href="/admin/content" className="btn-secondary">Cancel</a>
            <button type="submit" className="btn-primary">Save changes</button>
          </div>
        </form>
      </div>
    </div>
  );
}
