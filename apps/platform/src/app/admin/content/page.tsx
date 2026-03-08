import { desc } from "drizzle-orm";

import { getDb, blogPosts } from "@ultra/db";

import { deletePost } from "./actions";

export default async function ContentPage() {
  const rows = await getDb().select().from(blogPosts).orderBy(desc(blogPosts.createdAt));

  return (
    <div className="page">
      <div className="page-header">
        <h1>Blog posts</h1>
        <a href="/admin/content/new" className="btn-primary">New post</a>
      </div>

      <div className="panel">
        {rows.length === 0 ? (
          <p className="empty">No posts yet. <a href="/admin/content/new" className="link">Write your first post →</a></p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Slug</th>
                <th>Status</th>
                <th>Published</th>
                <th>Created</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((p) => (
                <tr key={p.id}>
                  <td><a href={`/admin/content/${p.id}`} className="link font-medium">{p.title}</a></td>
                  <td className="text-muted text-sm">{p.slug}</td>
                  <td>
                    <span className={`badge ${p.status === "published" ? "badge-green" : "badge-yellow"}`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="text-muted text-sm">
                    {p.publishedAt ? p.publishedAt.toLocaleDateString() : "—"}
                  </td>
                  <td className="text-muted text-sm">{p.createdAt.toLocaleDateString()}</td>
                  <td>
                    <div className="row-actions">
                      <a href={`/admin/content/${p.id}`} className="btn-ghost-sm">Edit</a>
                      <form action={deletePost.bind(null, p.id)}>
                        <button type="submit" className="btn-danger-sm">Delete</button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
