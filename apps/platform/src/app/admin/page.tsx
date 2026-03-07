import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import {
  getAnalyticsControlCenter,
  getAnalyticsSnapshot,
  getBlogPosts,
  getCatalogProducts,
  getEmailControlCenter,
  getSecretDefinitions,
  getModuleDescriptors,
  getOrders,
} from "@ultra/modules";
import { AppShell, Badge, Card, DataTable, PageHeader, StatGrid } from "@ultra/ui";

function formatCents(cents: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(
    cents / 100,
  );
}

export default async function AdminPage() {
  const cookieStore = await cookies();
  const session = cookieStore.get("ultra-session");

  if (!session?.value) {
    redirect("/");
  }

  const analytics = getAnalyticsSnapshot();
  const analyticsControl = getAnalyticsControlCenter();
  const emailControl = await getEmailControlCenter();
  const secretDefinitions = getSecretDefinitions();
  const products = getCatalogProducts();
  const orders = getOrders();
  const posts = getBlogPosts();
  const modules = getModuleDescriptors();

  return (
    <AppShell>
      <PageHeader
        eyebrow="Admin"
        title="Command center"
        description="Compact operational dashboard for catalog, orders, analytics, content, and platform modules."
      />
      <div className="page-grid">
        <StatGrid
          items={[
            { label: "Revenue", value: formatCents(analytics.revenueCents) },
            {
              label: "AOV",
              value: formatCents(analytics.averageOrderValueCents),
            },
            {
              label: "Conversion",
              value: `${(analytics.conversionRate * 100).toFixed(1)}%`,
            },
            { label: "Active carts", value: String(analytics.activeCarts) },
          ]}
        />
        <div className="page-section">
          <Card>
            <h2>Secret vault</h2>
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
            <h2>Vault API</h2>
            <DataTable
              columns={["Action", "Route"]}
              rows={[
                ["List masked secret status", "GET /api/v1/admin/settings/secrets"],
                ["Store or rotate secret", "POST /api/v1/admin/settings/secrets"],
              ]}
            />
          </Card>
        </div>
        <div className="page-section">
          <Card>
            <h2>Email delivery</h2>
            <DataTable
              columns={["Provider", "Enabled", "Delivery", "Capabilities"]}
              rows={emailControl.providers.map((provider) => [
                provider.label,
                provider.enabled ? "Yes" : "No",
                provider.delivery,
                provider.capabilities.join(", "),
              ])}
            />
          </Card>
          <Card>
            <h2>Inbound and bulk controls</h2>
            <DataTable
              columns={["Setting", "Value"]}
              rows={[
                ["Bulk enabled", emailControl.bulk.enabled ? "Yes" : "No"],
                ["Max batch size", String(emailControl.bulk.maxBatchSize)],
                ["Supports scheduling", emailControl.bulk.supportsScheduling ? "Yes" : "No"],
                ["Inbound enabled", emailControl.inbound.enabled ? "Yes" : "No"],
                ["Inbound route", emailControl.inbound.route],
                ["Default from", emailControl.defaults.from],
              ]}
            />
          </Card>
        </div>
        <div className="page-section">
          <Card>
            <h2>Analytics integrations</h2>
            <DataTable
              columns={["Provider", "Enabled", "Delivery", "Capabilities"]}
              rows={analyticsControl.providers.map((provider) => [
                provider.label,
                provider.enabled ? "Yes" : "No",
                provider.delivery,
                provider.capabilities.join(", "),
              ])}
            />
          </Card>
          <Card>
            <h2>Normalized event map</h2>
            <DataTable
              columns={["Event", "GA", "Meta Pixel", "Meta CAPI"]}
              rows={analyticsControl.eventDefinitions.map((eventDefinition) => [
                eventDefinition.key,
                eventDefinition.providerMappings.google_analytics ?? "-",
                eventDefinition.providerMappings.meta_pixel ?? "-",
                eventDefinition.providerMappings.meta_ads ?? "-",
              ])}
            />
          </Card>
        </div>
        <div className="page-section">
          <Card>
            <h2>Catalog</h2>
            <DataTable
              columns={["Product", "Status", "Price", "Inventory"]}
              rows={products.map((product) => [
                product.title,
                product.status,
                formatCents(product.priceCents),
                String(product.inventory),
              ])}
            />
          </Card>
          <Card>
            <h2>Orders</h2>
            <DataTable
              columns={["Order", "Customer", "Status", "Total"]}
              rows={orders.map((order) => [
                order.number,
                order.email,
                order.status,
                formatCents(order.totalCents),
              ])}
            />
          </Card>
        </div>
        <div className="page-section">
          <Card>
            <h2>Content pipeline</h2>
            <DataTable
              columns={["Post", "Status", "Published"]}
              rows={posts.map((post) => [
                post.title,
                post.status,
                post.publishedAt ? "Yes" : "No",
              ])}
            />
          </Card>
          <Card>
            <h2>Module health</h2>
            <ul className="link-list">
              {modules.map((module) => (
                <li key={module.name}>
                  <strong>{module.label}</strong> <Badge>{module.status}</Badge>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
