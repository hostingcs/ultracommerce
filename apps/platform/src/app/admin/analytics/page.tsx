import { desc, eq, sql } from "drizzle-orm";

import { getDb, analyticsSnapshots, orders } from "@ultra/db";

function fmt(val: string | null) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(parseFloat(val ?? "0"));
}

export default async function AnalyticsPage() {
  const db = getDb();

  const [snapshots, orderStats] = await Promise.all([
    db.select().from(analyticsSnapshots).orderBy(desc(analyticsSnapshots.createdAt)).limit(10),
    db.select({
      total: sql<string>`coalesce(sum(total),0)::text`,
      count: sql<number>`count(*)::int`,
      avg: sql<string>`coalesce(avg(total),0)::text`,
    }).from(orders),
  ]);

  const latest = snapshots[0];
  const stats = orderStats[0];

  return (
    <div className="page">
      <div className="page-header">
        <h1>Analytics</h1>
      </div>

      <div className="kpi-row">
        <div className="kpi">
          <p className="kpi-label">Total revenue</p>
          <p className="kpi-value">{fmt(stats?.total ?? "0")}</p>
          <p className="kpi-hint">From orders</p>
        </div>
        <div className="kpi">
          <p className="kpi-label">Total orders</p>
          <p className="kpi-value">{stats?.count ?? 0}</p>
        </div>
        <div className="kpi">
          <p className="kpi-label">Avg order value</p>
          <p className="kpi-value">{fmt(stats?.avg ?? "0")}</p>
        </div>
        {latest && (
          <>
            <div className="kpi">
              <p className="kpi-label">Conversion rate</p>
              <p className="kpi-value">{(Number(latest.conversionRate) * 100).toFixed(1)}%</p>
              <p className="kpi-hint">Latest snapshot</p>
            </div>
            <div className="kpi">
              <p className="kpi-label">Active carts</p>
              <p className="kpi-value">{latest.activeCarts}</p>
              <p className="kpi-hint">Latest snapshot</p>
            </div>
          </>
        )}
      </div>

      {snapshots.length > 0 && (
        <div className="panel">
          <div className="panel-header"><h2>Analytics snapshots</h2></div>
          <table className="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Revenue</th>
                <th>AOV</th>
                <th>Conversion</th>
                <th>Active carts</th>
              </tr>
            </thead>
            <tbody>
              {snapshots.map((s) => (
                <tr key={s.id}>
                  <td className="text-muted text-sm">{s.createdAt.toLocaleString()}</td>
                  <td>{fmt(s.revenue)}</td>
                  <td>{fmt(s.averageOrderValue)}</td>
                  <td>{(Number(s.conversionRate) * 100).toFixed(2)}%</td>
                  <td>{s.activeCarts}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {snapshots.length === 0 && (
        <div className="panel">
          <p className="empty">No analytics snapshots recorded yet. Snapshots are written by the background runtime.</p>
        </div>
      )}
    </div>
  );
}
