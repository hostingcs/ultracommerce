import { getEmailControlCenter } from "@ultra/modules";

export default async function EmailPage() {
  const emailControl = await getEmailControlCenter();

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1>Email</h1>
          <p className="admin-muted">Delivery providers and bulk sending configuration</p>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="panel">
          <div className="panel-header">
            <h2>Providers</h2>
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
              {emailControl.providers.map((p) => (
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
            <h2>Configuration</h2>
          </div>
          <table className="data-table">
            <tbody>
              <tr>
                <td className="admin-muted">Bulk sending</td>
                <td>
                  <span className={emailControl.bulk.enabled ? "badge badge--success" : "badge badge--neutral"}>
                    {emailControl.bulk.enabled ? "Enabled" : "Disabled"}
                  </span>
                </td>
              </tr>
              <tr>
                <td className="admin-muted">Max batch size</td>
                <td>{emailControl.bulk.maxBatchSize}</td>
              </tr>
              <tr>
                <td className="admin-muted">Scheduling</td>
                <td>{emailControl.bulk.supportsScheduling ? "Supported" : "Not supported"}</td>
              </tr>
              <tr>
                <td className="admin-muted">Inbound receiving</td>
                <td>
                  <span className={emailControl.inbound.enabled ? "badge badge--success" : "badge badge--neutral"}>
                    {emailControl.inbound.enabled ? "Enabled" : "Disabled"}
                  </span>
                </td>
              </tr>
              <tr>
                <td className="admin-muted">Inbound route</td>
                <td className="table-mono">{emailControl.inbound.route}</td>
              </tr>
              <tr>
                <td className="admin-muted">Default from</td>
                <td>{emailControl.defaults.from}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="panel">
        <div className="panel-header">
          <h2>API endpoints</h2>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Method</th>
              <th>Route</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><span className="badge badge--neutral">POST</span></td>
              <td className="table-mono">/api/v1/store/email/bulk</td>
              <td className="admin-muted">Send bulk email</td>
            </tr>
            <tr>
              <td><span className="badge badge--neutral">POST</span></td>
              <td className="table-mono">/api/webhooks/resend</td>
              <td className="admin-muted">Inbound webhook receiver</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
