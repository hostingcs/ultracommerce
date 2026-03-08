import {
  getAnalyticsSnapshot,
  getCatalogProducts,
  getOrders,
  getBlogPosts,
  getModuleDescriptors,
} from "@ultra/modules";

function fmt(cents: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);
}

function statusClass(status: string) {
  if (["active", "published", "completed", "delivered"].includes(status)) return "badge badge--success";
  if (["pending", "draft", "processing"].includes(status)) return "badge badge--warning";
  return "badge badge--neutral";
}

export default function AdminDashboard() {
  const analytics = getAnalyticsSnapshot();
  const products = getCatalogProducts();
  const orders = getOrders();
  const posts = getBlogPosts();
  const modules = getModuleDescriptors();

  const recentOrders = orders.slice(0, 5);
  const recentProducts = products.slice(0, 5);

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1>Dashboard</h1>
          <p className="admin-muted">Your store at a glance</p>
        </div>
      </div>

      {/* KPI row */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <p className="kpi-label">Revenue</p>
          <p className="kpi-value">{fmt(analytics.revenueCents)}</p>
          <p className="kpi-hint">Total lifetime</p>
        </div>
        <div className="kpi-card">
          <p className="kpi-label">Orders</p>
          <p className="kpi-value">{orders.length}</p>
          <p className="kpi-hint">All time</p>
        </div>
        <div className="kpi-card">
          <p className="kpi-label">Avg order value</p>
          <p className="kpi-value">{fmt(analytics.averageOrderValueCents)}</p>
          <p className="kpi-hint">Per order</p>
        </div>
        <div className="kpi-card">
          <p className="kpi-label">Conversion</p>
          <p className="kpi-value">{(analytics.conversionRate * 100).toFixed(1)}%</p>
          <p className="kpi-hint">Sessions to orders</p>
        </div>
        <div className="kpi-card">
          <p className="kpi-label">Active carts</p>
          <p className="kpi-value">{analytics.activeCarts}</p>
          <p className="kpi-hint">Open sessions</p>
        </div>
        <div className="kpi-card">
          <p className="kpi-label">Products</p>
          <p className="kpi-value">{products.length}</p>
          <p className="kpi-hint">In catalog</p>
        </div>
      </div>

      {/* Main content grid */}
      <div className="dashboard-grid">
        {/* Recent orders */}
        <div className="panel">
          <div className="panel-header">
            <h2>Recent orders</h2>
            <a href="/admin/orders" className="panel-link">View all</a>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Customer</th>
                <th>Status</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order) => (
                <tr key={order.number}>
                  <td className="table-mono">{order.number}</td>
                  <td>{order.email}</td>
                  <td><span className={statusClass(order.status)}>{order.status}</span></td>
                  <td>{fmt(order.totalCents)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Recent products */}
        <div className="panel">
          <div className="panel-header">
            <h2>Catalog</h2>
            <a href="/admin/products" className="panel-link">View all</a>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Status</th>
                <th>Price</th>
              <th>Stock</th>
            </tr>
          </thead>
          <tbody>
            {recentProducts.map((product) => (
              <tr key={product.id}>
                <td>
                  <p className="table-strong">{product.title}</p>
                  <p className="table-mono table-sub admin-muted">{product.slug}</p>
                </td>
                  <td><span className={statusClass(product.status)}>{product.status}</span></td>
                  <td>{fmt(product.priceCents)}</td>
                  <td>{product.inventory}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Blog content */}
        <div className="panel">
          <div className="panel-header">
            <h2>Content</h2>
            <a href="/admin/content" className="panel-link">View all</a>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Post</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => (
                <tr key={post.id}>
                  <td>{post.title}</td>
                  <td><span className={statusClass(post.status)}>{post.status}</span></td>
                  <td className="admin-muted">
                    {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Module health */}
        <div className="panel">
          <div className="panel-header">
            <h2>Platform modules</h2>
          </div>
          <div className="module-list">
            {modules.map((mod) => (
              <div key={mod.name} className="module-row">
                <div>
                  <p className="module-name">{mod.label}</p>
                  <p className="admin-muted module-summary">{mod.summary}</p>
                </div>
                <span className={statusClass(mod.status)}>{mod.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
