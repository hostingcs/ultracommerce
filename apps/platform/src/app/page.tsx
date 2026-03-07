import type { PluginDescriptor } from "@ultra/api-contracts";

import { getApiReference, getModuleDescriptors, getPlugins } from "@ultra/modules";
import { AppShell, Badge, Card, DataTable, PageHeader, StatGrid } from "@ultra/ui";

export default function HomePage() {
  const modules = getModuleDescriptors();
  const plugins = getPlugins();
  const apiReference = getApiReference();

  return (
    <AppShell>
      <div className="page-grid">
        <PageHeader
          eyebrow="Ultra Commerce"
          title="All-in-one modular ecommerce backend."
          description="A Next.js platform that combines admin UI, API routes, docs, commerce modules, plugin support, and Railway-ready deployment."
        />
        <div className="hero-grid">
          <Card>
            <h2>Platform pillars</h2>
            <div className="pill-row">
              <Badge tone="success">API-first</Badge>
              <Badge tone="success">Plugin-ready</Badge>
              <Badge tone="success">Railway-ready</Badge>
              <Badge tone="warning">Security-first</Badge>
            </div>
            <p className="ultra-description">
              The platform is structured as a Next.js admin/API shell backed by isolated
              commerce modules, shared contracts, a worker runtime, and a reusable UI kit.
            </p>
          </Card>
          <StatGrid
            items={[
              { label: "Modules", value: String(modules.length), hint: "Commerce domains" },
              { label: "Plugins", value: String(plugins.length), hint: "Example extensions" },
              { label: "API routes", value: String(apiReference.length), hint: "Documented endpoints" },
            ]}
          />
        </div>
        <div className="page-section">
          <Card>
            <h2>Included domains</h2>
            <DataTable
              columns={["Module", "Summary"]}
              rows={modules.map((module) => [module.label, module.summary])}
            />
          </Card>
          <Card>
            <h2>Plugin capabilities</h2>
            <DataTable
              columns={["Plugin", "Capabilities"]}
              rows={plugins.map((plugin: PluginDescriptor) => [
                plugin.name,
                plugin.capabilities
                  .map((capability: PluginDescriptor["capabilities"][number]) => capability.label)
                  .join(", "),
              ])}
            />
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
