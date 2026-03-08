import { getSecretDefinitions } from "@ultra/modules";

export default function SettingsPage() {
  const secrets = getSecretDefinitions();

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1>Settings</h1>
          <p className="admin-muted">Secret vault and platform configuration</p>
        </div>
      </div>

      <div className="panel">
        <div className="panel-header">
          <h2>Secret vault</h2>
          <span className="admin-muted" style={{ fontSize: "0.85rem" }}>
            Secrets are encrypted at rest using AES-256-GCM
          </span>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Secret</th>
              <th>Provider</th>
              <th>Required for</th>
            </tr>
          </thead>
          <tbody>
            {secrets.map((s) => (
              <tr key={s.key}>
                <td>
                  <p className="table-strong">{s.label}</p>
                  <p className="table-mono table-sub admin-muted">{s.key}</p>
                </td>
                <td className="admin-muted">{s.provider}</td>
                <td className="admin-muted">{s.requiredFor.join(", ")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="panel">
        <div className="panel-header">
          <h2>Vault API</h2>
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
              <td><span className="badge badge--neutral">GET</span></td>
              <td className="table-mono">/api/v1/admin/settings/secrets</td>
              <td className="admin-muted">List masked secret status</td>
            </tr>
            <tr>
              <td><span className="badge badge--warning">POST</span></td>
              <td className="table-mono">/api/v1/admin/settings/secrets</td>
              <td className="admin-muted">Store or rotate a secret</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
