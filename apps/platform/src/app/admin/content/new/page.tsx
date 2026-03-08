import { createPost } from "../actions";

export default async function NewPostPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;

  return (
    <div className="page page-narrow">
      <div className="page-header">
        <div>
          <a href="/admin/content" className="back-link">← Blog</a>
          <h1>New post</h1>
        </div>
      </div>

      {params.error && <div className="form-error">Title and slug are required.</div>}

      <div className="panel">
        <form action={createPost} className="form">
          <div className="form-row">
            <div className="field">
              <label htmlFor="title">Title *</label>
              <input id="title" name="title" type="text" required placeholder="Post title" />
            </div>
            <div className="field">
              <label htmlFor="slug">Slug *</label>
              <input id="slug" name="slug" type="text" required placeholder="post-slug" />
            </div>
          </div>

          <div className="field">
            <label htmlFor="excerpt">Excerpt</label>
            <textarea id="excerpt" name="excerpt" rows={2} placeholder="Short summary..." />
          </div>

          <div className="field">
            <label htmlFor="body">Body</label>
            <textarea id="body" name="body" rows={12} placeholder="Write your post content here..." />
          </div>

          <div className="field">
            <label htmlFor="status">Status</label>
            <select id="status" name="status" defaultValue="draft">
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>

          <div className="form-actions">
            <a href="/admin/content" className="btn-secondary">Cancel</a>
            <button type="submit" className="btn-primary">Create post</button>
          </div>
        </form>
      </div>
    </div>
  );
}
