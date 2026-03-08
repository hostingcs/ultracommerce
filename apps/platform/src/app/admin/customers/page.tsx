import { desc, eq } from "drizzle-orm";

import { getDb, users } from "@ultra/db";

export default async function CustomersPage() {
  const rows = await getDb()
    .select()
    .from(users)
    .where(eq(users.role, "customer"))
    .orderBy(desc(users.createdAt));

  return (
    <div className="page">
      <div className="page-header">
        <h1>Customers</h1>
        <span className="page-count">{rows.length} total</span>
      </div>

      <div className="panel">
        {rows.length === 0 ? (
          <p className="empty">No customers yet.</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Status</th>
                <th>Joined</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((c) => (
                <tr key={c.id}>
                  <td className="font-medium">{c.firstName} {c.lastName}</td>
                  <td>{c.email}</td>
                  <td>
                    <span className={`badge ${c.status === "active" ? "badge-green" : c.status === "invited" ? "badge-yellow" : "badge-gray"}`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="text-muted text-sm">{c.createdAt.toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
