import { getAnalyticsSnapshot, getAnalyticsControlCenter } from "@ultra/modules";

function fmt(cents: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);
}

export default function AnalyticsPage() {
  const snapshot = getAnalyticsSnapshot();
  const control = getAnalyticsControlCenter();

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1>Analytics</h1>
          <p className="admin-muted">Performance snapshot and integration status</p>
        </div>
      </div>

      <div className="kpi-grid">
        <div className="kpi-card">
          <p className="kpi-label">Revenue</p>
          <p className="kpi-value">{fmt(snapshot.revenueCents)}</p>
        </div>
        <div className="kpi-card">
          <p className="kpi-label">Avg order value</p>
          <p className="kpi-value">{fmt(snapshot.averageOrderValueCents)}</p>
        </div>
        <div className="kpi-card">
          <p className="kpi-label">Conversion rate</p>
          <p className="kpi-value">{(snapshot.conversionRate * 100).toFixed(1)}%</p>
        </div>
        <div className="kpi-card">
          <p className="kpi-label">Active carts</p>
          <p className="kpi-value">{snapshot.activeCarts}</p>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="panel">
          <div className="panel-header">
            <h2>Integrations</h2>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Provider</th>
                <th>Status</th>
                <th>Delivery</th>
                <th>Capabilities</th>
              </tr>
            </thead>
            <tbody>
              {control.providers.map((p) => (
                <tr key={p.label}>
                  <td>{p.label}</td>
                  <td>
                    <span className={p.enabled ? "badge badge--success" : "badge badge--neutral"}>
                      {p.enabled ? "Enabled" : "Disabled"}
                    </span>
                  </td>
                  <td className="admin-muted">{p.delivery}</td>
                  <td className="admin-muted">{p.capabilities.join(", ")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="panel">
          <div className="panel-header">
            <h2>Event map</h2>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Event</th>
                <th>Google Analytics</th>
                <th>Meta Pixel</th>
                <th>Meta CAPI</th>
              </tr>
            </thead>
            <tbody>
              {control.eventDefinitions.map((e) => (
                <tr key={e.key}>
                  <td className="table-mono">{e.key}</td>
                  <td className="admin-muted">{e.providerMappings.google_analytics ?? "—"}</td>
                  <td className="admin-muted">{e.providerMappings.meta_pixel ?? "—"}</td>
                  <td className="admin-muted">{e.providerMappings.meta_ads ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
