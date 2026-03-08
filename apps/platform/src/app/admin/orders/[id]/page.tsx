import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";

import { getDb, orders } from "@ultra/db";

import { updateOrderStatus } from "../actions";

function fmt(val: string | null) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(parseFloat(val ?? "0"));
}

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const rows = await getDb().select().from(orders).where(eq(orders.id, id)).limit(1);
  const order = rows[0];
  if (!order) notFound();

  const updateWithId = updateOrderStatus.bind(null, id);

  return (
    <div className="page page-narrow">
      <div className="page-header">
        <div>
          <a href="/admin/orders" className="back-link">← Orders</a>
          <h1>{order.number}</h1>
        </div>
      </div>

      <div className="panel">
        <table className="detail-table">
          <tbody>
            <tr><td className="detail-label">Order #</td><td>{order.number}</td></tr>
            <tr><td className="detail-label">Customer</td><td>{order.email}</td></tr>
            <tr><td className="detail-label">Total</td><td>{fmt(order.total)} {order.currency}</td></tr>
            <tr><td className="detail-label">Status</td><td>
              <span className={`badge ${
                order.status === "fulfilled" ? "badge-green" :
                order.status === "paid" ? "badge-blue" :
                order.status === "pending" ? "badge-yellow" : "badge-red"
              }`}>{order.status}</span>
            </td></tr>
            <tr><td className="detail-label">Created</td><td>{order.createdAt.toLocaleString()}</td></tr>
            <tr><td className="detail-label">Updated</td><td>{order.updatedAt.toLocaleString()}</td></tr>
          </tbody>
        </table>
      </div>

      <div className="panel">
        <div className="panel-header"><h2>Update status</h2></div>
        <form action={updateWithId} className="form form-inline">
          <select name="status" defaultValue={order.status}>
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="fulfilled">Fulfilled</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <button type="submit" className="btn-primary">Update</button>
        </form>
      </div>
    </div>
  );
}
