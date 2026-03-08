import { desc } from "drizzle-orm";

import { getDb, orders } from "@ultra/db";

function fmt(val: string | null) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(parseFloat(val ?? "0"));
}

export default async function OrdersPage() {
  const rows = await getDb().select().from(orders).orderBy(desc(orders.createdAt));

  return (
    <div className="page">
      <div className="page-header">
        <h1>Orders</h1>
        <span className="page-count">{rows.length} total</span>
      </div>

      <div className="panel">
        {rows.length === 0 ? (
          <p className="empty">No orders yet.</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Order #</th>
                <th>Customer</th>
                <th>Status</th>
                <th>Total</th>
                <th>Currency</th>
                <th>Date</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((o) => (
                <tr key={o.id}>
                  <td><a href={`/admin/orders/${o.id}`} className="link font-medium">{o.number}</a></td>
                  <td>{o.email}</td>
                  <td>
                    <span className={`badge ${
                      o.status === "fulfilled" ? "badge-green" :
                      o.status === "paid" ? "badge-blue" :
                      o.status === "pending" ? "badge-yellow" : "badge-red"
                    }`}>{o.status}</span>
                  </td>
                  <td>{fmt(o.total)}</td>
                  <td className="text-muted">{o.currency}</td>
                  <td className="text-muted text-sm">{o.createdAt.toLocaleDateString()}</td>
                  <td><a href={`/admin/orders/${o.id}`} className="btn-ghost-sm">View</a></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
