import { getOrders } from "@ultra/modules";

function fmt(cents: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);
}

function statusClass(status: string) {
  if (["completed", "delivered"].includes(status)) return "badge badge--success";
  if (["pending", "processing"].includes(status)) return "badge badge--warning";
  return "badge badge--neutral";
}

export default function OrdersPage() {
  const orders = getOrders();

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1>Orders</h1>
          <p className="admin-muted">{orders.length} total orders</p>
        </div>
      </div>
      <div className="panel">
        <table className="data-table">
          <thead>
            <tr>
              <th>Order #</th>
              <th>Customer</th>
              <th>Status</th>
              <th>Total</th>
              <th>Currency</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.number}>
                <td className="table-mono">{order.number}</td>
                <td>{order.email}</td>
                <td><span className={statusClass(order.status)}>{order.status}</span></td>
                <td>{fmt(order.totalCents)}</td>
                <td className="admin-muted">{order.currency}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
