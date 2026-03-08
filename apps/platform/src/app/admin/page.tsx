import { desc, eq, sql } from "drizzle-orm";

import { getDb, analyticsSnapshots, orders, products, users, blogPosts } from "@ultra/db";

function fmt(val: string | null | undefined) {
  const n = parseFloat(val ?? "0");
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);
}

function statusClass(status: string) {
  const map: Record<string, string> = {
    active: "badge-green",
    published: "badge-green",
    paid: "badge-green",
    fulfilled: "badge-green",
    draft: "badge-gray",
    pending: "badge-yellow",
    processing: "badge-yellow",
    cancelled: "badge-red",
    archived: "badge-gray",
  };
  return `badge ${map[status] ?? "badge-gray"}`;
}

export default async function AdminDashboard() {
  const db = getDb();

  const [productRow, orderRow, customerRow, recentOrders, latestSnapshot] = await Promise.all([
    db.select({ count: sql<number>`count(*)::int` }).from(products),
    db.select({ count: sql<number>`count(*)::int`, total: sql<string>`coalesce(sum(total),0)::text` }).from(orders),
    db.select({ count: sql<number>`count(*)::int` }).from(users).where(eq(users.role, "customer")),
    db.select().from(orders).orderBy(desc(orders.createdAt)).limit(6),
    db.select().from(analyticsSnapshots).orderBy(desc(analyticsSnapshots.createdAt)).limit(1),
  ]);

  const productCount = productRow[0]?.count ?? 0;
  const orderCount = orderRow[0]?.count ?? 0;
  const orderTotal = orderRow[0]?.total ?? "0";
  const customerCount = customerRow[0]?.count ?? 0;
  const snapshot = latestSnapshot[0];

  return (
    <div className="page">
      <div className="page-header">
        <h1>Dashboard</h1>
      </div>

      <div className="kpi-row">
        <div className="kpi">
          <p className="kpi-label">Revenue</p>
          <p className="kpi-value">{fmt(orderTotal)}</p>
        </div>
        <div className="kpi">
          <p className="kpi-label">Orders</p>
          <p className="kpi-value">{orderCount}</p>
        </div>
        <div className="kpi">
          <p className="kpi-label">Products</p>
          <p className="kpi-value">{productCount}</p>
        </div>
        <div className="kpi">
          <p className="kpi-label">Customers</p>
          <p className="kpi-value">{customerCount}</p>
        </div>
        {snapshot && (
          <>
            <div className="kpi">
              <p className="kpi-label">Conversion</p>
              <p className="kpi-value">{(Number(snapshot.conversionRate) * 100).toFixed(1)}%</p>
            </div>
            <div className="kpi">
              <p className="kpi-label">Active carts</p>
              <p className="kpi-value">{snapshot.activeCarts}</p>
            </div>
          </>
        )}
      </div>

      <div className="panel">
        <div className="panel-header">
          <h2>Recent orders</h2>
          <a href="/admin/orders" className="panel-link">View all</a>
        </div>
        {recentOrders.length === 0 ? (
          <p className="empty">No orders yet.</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Order #</th>
                <th>Customer</th>
                <th>Status</th>
                <th>Total</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((o) => (
                <tr key={o.id}>
                  <td><a href={`/admin/orders/${o.id}`} className="link">{o.number}</a></td>
                  <td>{o.email}</td>
                  <td><span className={statusClass(o.status)}>{o.status}</span></td>
                  <td>{fmt(o.total)}</td>
                  <td className="text-muted">{o.createdAt.toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
