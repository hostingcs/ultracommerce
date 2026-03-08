import { getBlogPosts } from "@ultra/modules";

function statusClass(status: string) {
  if (status === "published") return "badge badge--success";
  if (status === "draft") return "badge badge--warning";
  return "badge badge--neutral";
}

export default function ContentPage() {
  const posts = getBlogPosts();

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1>Blog</h1>
          <p className="admin-muted">{posts.length} posts</p>
        </div>
      </div>
      <div className="panel">
        <table className="data-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Status</th>
              <th>Published</th>
            </tr>
          </thead>
          <tbody>
            {posts.map((post) => (
              <tr key={post.id}>
                <td>
                  <p className="table-strong">{post.title}</p>
                  <p className="admin-muted table-sub">{post.excerpt.slice(0, 80)}</p>
                </td>
                <td><span className={statusClass(post.status)}>{post.status}</span></td>
                <td className="admin-muted">
                  {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
