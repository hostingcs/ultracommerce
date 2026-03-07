import {
  getApiReference,
  getAnalyticsControlCenter,
  getEmailControlCenter,
  getModuleDescriptors,
  getOpenApiDocument,
  getSecretDefinitions,
  getSeoCoverage,
} from "@ultra/modules";
import { AppShell, Badge, Card, DataTable, PageHeader } from "@ultra/ui";

export default async function DocsPage() {
  const modules = getModuleDescriptors();
  const reference = getApiReference();
  const analyticsControl = getAnalyticsControlCenter();
  const emailControl = await getEmailControlCenter();
  const secretDefinitions = getSecretDefinitions();
  const openApi = getOpenApiDocument();
  const seoCoverage = getSeoCoverage();

  return (
    <AppShell>
      <PageHeader
        eyebrow="Documentation"
        title="Platform and API docs"
        description="Ultra Commerce documents modules, plugin extension points, deployment, and every major API surface from the same shared contracts."
      />
      <div className="page-grid">
        <Card>
          <h2>Getting started</h2>
          <ol className="link-list">
            <li>Configure environment variables and `DATABASE_URL`.</li>
            <li>Run database migrations from `@ultra/db`.</li>
            <li>Start the Next.js platform service.</li>
            <li>Point your storefront frontend to `/api/v1/store/*` endpoints.</li>
          </ol>
        </Card>
        <div className="page-section">
          <Card>
            <h2>Module reference</h2>
            <DataTable
              columns={["Module", "Admin", "API", "Security"]}
              rows={modules.map((module) => [
                module.label,
                module.adminPath,
                module.apiBasePath,
                module.securityControls.join(", "),
              ])}
            />
          </Card>
          <Card>
            <h2>Plugin model</h2>
            <p className="ultra-description">
              Plugins can register admin views, store/admin API routes, event subscribers,
              capability adapters, and background jobs without reaching across module boundaries.
            </p>
            <div className="pill-row">
              <Badge>Route hooks</Badge>
              <Badge>Admin widgets</Badge>
              <Badge>Event subscribers</Badge>
              <Badge>Payment adapters</Badge>
              <Badge>Shipping adapters</Badge>
            </div>
          </Card>
        </div>
        <Card>
          <h2>API reference</h2>
          <DataTable
            columns={["Method", "Path", "Auth", "Summary"]}
            rows={reference.map((item) => [
              item.method,
              item.path,
              item.auth,
              item.summary,
            ])}
          />
        </Card>
        <div className="page-section">
          <Card>
            <h2>Secret vault</h2>
            <p className="ultra-description">
              External service secrets can be managed in-app through the encrypted vault while one
              root key remains in env as `APP_ENCRYPTION_KEY`. Secrets are stored encrypted in the
              database, returned as masked status only, and consumed server-side.
            </p>
            <DataTable
              columns={["Secret", "Provider", "Used for"]}
              rows={secretDefinitions.map((definition) => [
                definition.label,
                definition.provider,
                definition.requiredFor.join(", "),
              ])}
            />
          </Card>
          <Card>
            <h2>Vault routes</h2>
            <div className="pill-row">
              <Badge>GET /api/v1/admin/settings/secrets</Badge>
              <Badge>POST /api/v1/admin/settings/secrets</Badge>
              <Badge>Masked previews only</Badge>
              <Badge>DB encrypted storage</Badge>
            </div>
          </Card>
        </div>
        <div className="page-section">
          <Card>
            <h2>Email and inbox contract</h2>
            <p className="ultra-description">
              Admin clients can inspect `/api/v1/admin/notifications/email`, submit bulk sends to
              `/api/v1/admin/notifications/email/bulk`, and receive verified Resend webhook events
              at `/api/webhooks/resend` for inbound email workflows.
            </p>
            <DataTable
              columns={["Provider", "Enabled", "Delivery", "Public config"]}
              rows={emailControl.providers.map((provider) => [
                provider.label,
                provider.enabled ? "Yes" : "No",
                provider.delivery,
                Object.entries(provider.publicConfig)
                  .filter(([, value]) => value)
                  .map(([key, value]) => `${key}: ${value}`)
                  .join(", ") || "None",
              ])}
            />
          </Card>
          <Card>
            <h2>Bulk send options</h2>
            <p className="ultra-description">
              Bulk email requests support per-message recipients, cc, bcc, reply-to, HTML/text
              bodies, custom headers, tags, and optional dry-run or scheduling metadata.
            </p>
            <div className="pill-row">
              <Badge>Bulk batch send</Badge>
              <Badge>Inbound webhooks</Badge>
              <Badge>Custom headers</Badge>
              <Badge>Tags</Badge>
              <Badge>Dry run</Badge>
            </div>
          </Card>
        </div>
        <div className="page-section">
          <Card>
            <h2>Frontend analytics contract</h2>
            <p className="ultra-description">
              Frontends can fetch `/api/v1/store/analytics/config` to detect enabled providers,
              read Google Analytics and Facebook Pixel public IDs, and map commerce events once
              through a normalized event schema.
            </p>
            <DataTable
              columns={["Provider", "Enabled", "Delivery", "Public config"]}
              rows={analyticsControl.providers.map((provider) => [
                provider.label,
                provider.enabled ? "Yes" : "No",
                provider.delivery,
                Object.entries(provider.publicConfig)
                  .filter(([, value]) => value)
                  .map(([key, value]) => `${key}: ${value}`)
                  .join(", ") || "None",
              ])}
            />
          </Card>
          <Card>
            <h2>Ads and attribution coverage</h2>
            <p className="ultra-description">
              Ultra Commerce supports browser tracking with Google Analytics and Facebook Pixel,
              plus optional Meta Conversions API forwarding for server-side deduplication and ads
              optimization.
            </p>
            <div className="pill-row">
              <Badge>Google Analytics</Badge>
              <Badge>Facebook Pixel</Badge>
              <Badge>Meta CAPI</Badge>
              <Badge>Normalized ecommerce events</Badge>
              <Badge>Frontend bootstrap API</Badge>
            </div>
          </Card>
        </div>
        <div className="page-section">
          <Card>
            <h2>SEO coverage</h2>
            <DataTable
              columns={["Metric", "Value"]}
              rows={[
                ["Indexed routes", String(seoCoverage.coverage.indexedRoutes)],
                ["Total routes", String(seoCoverage.coverage.totalRoutes)],
                ["Product routes", String(seoCoverage.coverage.productRoutes)],
                ["Content routes", String(seoCoverage.coverage.contentRoutes)],
                [
                  "Structured data",
                  seoCoverage.coverage.structuredDataTypes.join(", "),
                ],
              ]}
            />
          </Card>
          <Card>
            <h2>Frontend SEO contract</h2>
            <p className="ultra-description">
              Frontends can fetch global defaults from `/api/v1/store/seo`, route metadata from
              `/api/v1/store/seo/routes`, and reuse canonical URLs, robots directives, Open Graph,
              Twitter cards, locale alternates, and JSON-LD from the shared API contracts.
            </p>
            <div className="pill-row">
              <Badge>Canonical URLs</Badge>
              <Badge>Open Graph</Badge>
              <Badge>Twitter cards</Badge>
              <Badge>JSON-LD</Badge>
              <Badge>Sitemaps</Badge>
            </div>
          </Card>
        </div>
        <Card>
          <h2>Analytics event mapping</h2>
          <DataTable
            columns={["Event", "Category", "GA", "Meta Pixel", "Meta CAPI"]}
            rows={analyticsControl.eventDefinitions.map((eventDefinition) => [
              eventDefinition.key,
              eventDefinition.category,
              eventDefinition.providerMappings.google_analytics ?? "-",
              eventDefinition.providerMappings.meta_pixel ?? "-",
              eventDefinition.providerMappings.meta_ads ?? "-",
            ])}
          />
        </Card>
        <Card>
          <h2>OpenAPI metadata</h2>
          <pre>{JSON.stringify(openApi.info, null, 2)}</pre>
        </Card>
      </div>
    </AppShell>
  );
}
