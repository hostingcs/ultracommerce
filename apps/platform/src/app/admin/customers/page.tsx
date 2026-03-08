import { getOrders } from "@ultra/modules";

export default function CustomersPage() {
  const orders = getOrders();

  const customerMap = new Map<string, { email: string; orders: number; totalCents: number }>();
  for (const order of orders) {
    const existing = customerMap.get(order.email);
    if (existing) {
      existing.orders += 1;
      existing.totalCents += order.totalCents;
    } else {
      customerMap.set(order.email, { email: order.email, orders: 1, totalCents: order.totalCents });
    }
  }
  const customers = Array.from(customerMap.values()).sort((a, b) => b.totalCents - a.totalCents);

  function fmt(cents: number) {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);
  }

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1>Customers</h1>
          <p className="admin-muted">{customers.length} unique customers</p>
        </div>
      </div>
      <div className="panel">
        <table className="data-table">
          <thead>
            <tr>
              <th>Email</th>
              <th>Orders</th>
              <th>Total spent</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((c) => (
              <tr key={c.email}>
                <td>{c.email}</td>
                <td>{c.orders}</td>
                <td>{fmt(c.totalCents)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
