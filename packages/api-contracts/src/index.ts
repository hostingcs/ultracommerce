import { z } from "zod";

export const moduleNames = [
  "auth",
  "users",
  "catalog",
  "inventory",
  "pricing",
  "cart",
  "orders",
  "payments",
  "shipping",
  "analytics",
  "cms",
  "notifications",
  "search",
  "settings",
  "audit",
] as const;

export type ModuleName = (typeof moduleNames)[number];

export const moduleNameSchema = z.enum(moduleNames);

export const apiScopeSchema = z.enum(["store", "admin"]);

export type ApiScope = z.infer<typeof apiScopeSchema>;

export const healthSchema = z.object({
  name: z.string(),
  version: z.string(),
  status: z.enum(["ok", "degraded"]),
  timestamp: z.string(),
  services: z.array(
    z.object({
      name: z.string(),
      status: z.enum(["ok", "degraded", "offline"]),
      detail: z.string(),
    }),
  ),
});

export const permissionSchema = z.object({
  key: z.string(),
  label: z.string(),
  scope: z.enum(["platform", "storefront", "system"]),
});

export const pluginCapabilitySchema = z.object({
  key: z.string(),
  label: z.string(),
  description: z.string(),
});

export const pluginDescriptorSchema = z.object({
  key: z.string(),
  name: z.string(),
  version: z.string(),
  description: z.string(),
  capabilities: z.array(pluginCapabilitySchema),
  adminRoutes: z.array(z.string()),
  apiRoutes: z.array(z.string()),
});

export const moduleDescriptorSchema = z.object({
  name: moduleNameSchema,
  label: z.string(),
  summary: z.string(),
  status: z.enum(["planned", "active"]),
  apiBasePath: z.string(),
  adminPath: z.string(),
  docsPath: z.string(),
  entities: z.array(z.string()),
  events: z.array(z.string()),
  securityControls: z.array(z.string()),
});

export const seoRobotsSchema = z.object({
  index: z.boolean(),
  follow: z.boolean(),
  googleBot: z.object({
    index: z.boolean(),
    follow: z.boolean(),
    maxVideoPreview: z.number().int(),
    maxImagePreview: z.enum(["none", "standard", "large"]),
    maxSnippet: z.number().int(),
  }),
});

export const seoImageSchema = z.object({
  url: z.string().url(),
  alt: z.string(),
  width: z.number().int().optional(),
  height: z.number().int().optional(),
});

export const seoMetadataSchema = z.object({
  title: z.string(),
  description: z.string(),
  canonicalPath: z.string(),
  keywords: z.array(z.string()),
  robots: seoRobotsSchema,
  openGraph: z.object({
    type: z.enum(["website", "article", "product"]),
    title: z.string(),
    description: z.string(),
    images: z.array(seoImageSchema),
  }),
  twitter: z.object({
    card: z.enum(["summary", "summary_large_image"]),
    title: z.string(),
    description: z.string(),
    image: z.string().url(),
  }),
  jsonLd: z.record(z.string(), z.unknown()),
});

export const seoRouteSchema = z.object({
  id: z.string(),
  path: z.string(),
  type: z.enum(["homepage", "product", "collection", "blog", "page", "docs"]),
  title: z.string(),
  changeFrequency: z.enum(["hourly", "daily", "weekly", "monthly"]),
  priority: z.number().min(0).max(1),
  lastModified: z.string(),
  metadata: seoMetadataSchema,
});

export const seoSiteConfigSchema = z.object({
  siteName: z.string(),
  siteUrl: z.string().url(),
  titleTemplate: z.string(),
  defaultLocale: z.string(),
  locales: z.array(z.string()),
  defaultMetadata: seoMetadataSchema,
  sitemap: z.object({
    enabled: z.boolean(),
    excludedPaths: z.array(z.string()),
  }),
  verification: z.object({
    google: z.string(),
    yandex: z.string().optional(),
  }),
});

export const productSchema = z.object({
  id: z.string(),
  slug: z.string(),
  title: z.string(),
  status: z.enum(["draft", "active", "archived"]),
  currency: z.string(),
  priceCents: z.number().int().nonnegative(),
  inventory: z.number().int(),
  tags: z.array(z.string()),
  seo: seoMetadataSchema,
});

export const customerSchema = z.object({
  id: z.string(),
  email: z.email(),
  firstName: z.string(),
  lastName: z.string(),
  role: z.enum(["customer", "admin"]),
  status: z.enum(["active", "invited", "disabled"]),
});

export const blogPostSchema = z.object({
  id: z.string(),
  slug: z.string(),
  title: z.string(),
  excerpt: z.string(),
  status: z.enum(["draft", "published"]),
  publishedAt: z.string().nullable(),
  seo: seoMetadataSchema,
});

export const orderSchema = z.object({
  id: z.string(),
  number: z.string(),
  email: z.email(),
  totalCents: z.number().int().nonnegative(),
  currency: z.string(),
  status: z.enum(["pending", "paid", "fulfilled", "cancelled"]),
});

export const cartSchema = z.object({
  id: z.string(),
  currency: z.string(),
  subtotalCents: z.number().int().nonnegative(),
  totalCents: z.number().int().nonnegative(),
  itemCount: z.number().int().nonnegative(),
});

export const analyticsSnapshotSchema = z.object({
  revenueCents: z.number().int().nonnegative(),
  averageOrderValueCents: z.number().int().nonnegative(),
  conversionRate: z.number().nonnegative(),
  activeCarts: z.number().int().nonnegative(),
});

export const analyticsProviderSchema = z.object({
  key: z.enum(["internal", "google_analytics", "meta_pixel", "meta_ads"]),
  label: z.string(),
  enabled: z.boolean(),
  delivery: z.enum(["browser", "server", "hybrid"]),
  publicConfig: z.record(z.string(), z.string()),
  capabilities: z.array(z.string()),
});

export const analyticsEventDefinitionSchema = z.object({
  key: z.string(),
  label: z.string(),
  category: z.enum(["commerce", "engagement", "identity"]),
  description: z.string(),
  triggers: z.array(z.string()),
  providerMappings: z.record(z.string(), z.string()),
});

export const analyticsFrontendBootstrapSchema = z.object({
  enabled: z.boolean(),
  endpoint: z.string(),
  providers: z.array(analyticsProviderSchema),
  eventDefinitions: z.array(analyticsEventDefinitionSchema),
  dataLayer: z.object({
    currency: z.string(),
    region: z.string(),
  }),
});

export const analyticsControlCenterSchema = z.object({
  snapshot: analyticsSnapshotSchema,
  providers: z.array(analyticsProviderSchema),
  eventDefinitions: z.array(analyticsEventDefinitionSchema),
  frontend: analyticsFrontendBootstrapSchema,
  serverDestinations: z.array(
    z.object({
      key: z.string(),
      label: z.string(),
      enabled: z.boolean(),
      purpose: z.string(),
    }),
  ),
});

export const analyticsEventPayloadSchema = z.object({
  event: z.string(),
  source: z.enum(["storefront", "admin", "server"]),
  url: z.string().optional(),
  userId: z.string().optional(),
  anonymousId: z.string().optional(),
  timestamp: z.string(),
  properties: z.record(z.string(), z.unknown()),
});

export const emailProviderSchema = z.object({
  key: z.enum(["console", "resend"]),
  label: z.string(),
  enabled: z.boolean(),
  delivery: z.enum(["transactional", "bulk", "inbound", "hybrid"]),
  publicConfig: z.record(z.string(), z.string()),
  capabilities: z.array(z.string()),
});

export const bulkEmailMessageSchema = z.object({
  from: z.string().min(1),
  to: z.array(z.string().email()).min(1),
  cc: z.array(z.string().email()).optional(),
  bcc: z.array(z.string().email()).optional(),
  replyTo: z.string().email().optional(),
  subject: z.string().min(1),
  html: z.string().optional(),
  text: z.string().optional(),
  tags: z.array(z.object({ name: z.string(), value: z.string() })).optional(),
  headers: z.record(z.string(), z.string()).optional(),
  scheduledAt: z.string().optional(),
});

export const bulkEmailRequestSchema = z.object({
  messages: z.array(bulkEmailMessageSchema).min(1).max(100),
  options: z.object({
    audience: z.string().optional(),
    campaign: z.string().optional(),
    trackOpens: z.boolean().optional(),
    trackClicks: z.boolean().optional(),
    dryRun: z.boolean().optional(),
  }),
});

export const bulkEmailResponseSchema = z.object({
  provider: z.string(),
  accepted: z.boolean(),
  requested: z.number().int(),
  processedAt: z.string(),
  messageIds: z.array(z.string()),
  dryRun: z.boolean(),
});

export const inboundEmailSchema = z.object({
  provider: z.string(),
  type: z.string(),
  emailId: z.string(),
  from: z.string(),
  to: z.array(z.string()),
  subject: z.string(),
  receivedAt: z.string(),
  snippet: z.string().optional(),
});

export const emailControlCenterSchema = z.object({
  providers: z.array(emailProviderSchema),
  bulk: z.object({
    enabled: z.boolean(),
    maxBatchSize: z.number().int(),
    supportsScheduling: z.boolean(),
    supportsTags: z.boolean(),
  }),
  inbound: z.object({
    enabled: z.boolean(),
    route: z.string(),
    domain: z.string().optional(),
    address: z.string().optional(),
  }),
  defaults: z.object({
    from: z.string(),
    replyTo: z.string().optional(),
  }),
});

export const secretDefinitionSchema = z.object({
  key: z.string(),
  label: z.string(),
  provider: z.string(),
  description: z.string(),
  requiredFor: z.array(z.string()),
});

export const storedSecretStatusSchema = z.object({
  key: z.string(),
  configured: z.boolean(),
  updatedAt: z.string().nullable(),
  maskedPreview: z.string().nullable(),
  source: z.enum(["database", "environment", "missing"]),
});

export const secretVaultResponseSchema = z.object({
  definitions: z.array(secretDefinitionSchema),
  statuses: z.array(storedSecretStatusSchema),
});

export const upsertSecretRequestSchema = z.object({
  key: z.string().min(1),
  value: z.string().min(1),
});

export const apiReferenceItemSchema = z.object({
  method: z.enum(["GET", "POST", "PUT", "PATCH", "DELETE"]),
  path: z.string(),
  summary: z.string(),
  auth: z.enum(["public", "customer", "admin", "webhook"]),
});

export const openApiDocumentSchema = z.object({
  openapi: z.string(),
  info: z.object({
    title: z.string(),
    version: z.string(),
    description: z.string(),
  }),
  tags: z.array(
    z.object({
      name: z.string(),
      description: z.string(),
    }),
  ),
  paths: z.record(
    z.string(),
    z.record(
      z.string(),
      z.object({
        summary: z.string(),
        description: z.string(),
      }),
    ),
  ),
});

export type ModuleDescriptor = z.infer<typeof moduleDescriptorSchema>;
export type PluginDescriptor = z.infer<typeof pluginDescriptorSchema>;
export type ApiReferenceItem = z.infer<typeof apiReferenceItemSchema>;
export type OpenApiDocument = z.infer<typeof openApiDocumentSchema>;
export type PlatformHealth = z.infer<typeof healthSchema>;
export type SeoMetadata = z.infer<typeof seoMetadataSchema>;
export type SeoRoute = z.infer<typeof seoRouteSchema>;
export type SeoSiteConfig = z.infer<typeof seoSiteConfigSchema>;
export type Product = z.infer<typeof productSchema>;
export type Customer = z.infer<typeof customerSchema>;
export type BlogPost = z.infer<typeof blogPostSchema>;
export type Order = z.infer<typeof orderSchema>;
export type Cart = z.infer<typeof cartSchema>;
export type AnalyticsSnapshot = z.infer<typeof analyticsSnapshotSchema>;
export type AnalyticsProvider = z.infer<typeof analyticsProviderSchema>;
export type AnalyticsEventDefinition = z.infer<typeof analyticsEventDefinitionSchema>;
export type AnalyticsFrontendBootstrap = z.infer<typeof analyticsFrontendBootstrapSchema>;
export type AnalyticsControlCenter = z.infer<typeof analyticsControlCenterSchema>;
export type AnalyticsEventPayload = z.infer<typeof analyticsEventPayloadSchema>;
export type EmailProvider = z.infer<typeof emailProviderSchema>;
export type BulkEmailMessage = z.infer<typeof bulkEmailMessageSchema>;
export type BulkEmailRequest = z.infer<typeof bulkEmailRequestSchema>;
export type BulkEmailResponse = z.infer<typeof bulkEmailResponseSchema>;
export type InboundEmail = z.infer<typeof inboundEmailSchema>;
export type EmailControlCenter = z.infer<typeof emailControlCenterSchema>;
export type SecretDefinition = z.infer<typeof secretDefinitionSchema>;
export type StoredSecretStatus = z.infer<typeof storedSecretStatusSchema>;
export type SecretVaultResponse = z.infer<typeof secretVaultResponseSchema>;
export type UpsertSecretRequest = z.infer<typeof upsertSecretRequestSchema>;

export const apiReference: ApiReferenceItem[] = [
  {
    method: "GET",
    path: "/api/v1/store/catalog/products",
    summary: "List published products for storefront clients.",
    auth: "public",
  },
  {
    method: "GET",
    path: "/api/v1/store/seo",
    summary: "Fetch global SEO defaults, locale config, and verification metadata.",
    auth: "public",
  },
  {
    method: "GET",
    path: "/api/v1/store/seo/routes",
    summary: "Fetch route-level SEO metadata and sitemap inputs for frontend rendering.",
    auth: "public",
  },
  {
    method: "GET",
    path: "/api/v1/store/analytics/config",
    summary: "Fetch frontend-safe analytics providers, public IDs, and normalized event mappings.",
    auth: "public",
  },
  {
    method: "POST",
    path: "/api/v1/store/cart",
    summary: "Create or update a cart with line items and coupons.",
    auth: "customer",
  },
  {
    method: "POST",
    path: "/api/v1/store/checkout",
    summary: "Validate totals, customer info, shipping, and payment readiness.",
    auth: "customer",
  },
  {
    method: "POST",
    path: "/api/v1/store/analytics/events",
    summary: "Ingest normalized storefront analytics events for internal routing and server-side destinations.",
    auth: "public",
  },
  {
    method: "GET",
    path: "/api/v1/admin/modules",
    summary: "Inspect registered commerce modules and plugin metadata.",
    auth: "admin",
  },
  {
    method: "GET",
    path: "/api/v1/admin/catalog/products",
    summary: "Manage products and merchandising inventory from the admin UI.",
    auth: "admin",
  },
  {
    method: "GET",
    path: "/api/v1/admin/seo",
    summary: "Inspect SEO defaults, route coverage, and optimization status from the admin side.",
    auth: "admin",
  },
  {
    method: "GET",
    path: "/api/v1/admin/analytics",
    summary: "Inspect analytics providers, event mappings, and storefront bootstrap config.",
    auth: "admin",
  },
  {
    method: "GET",
    path: "/api/v1/admin/notifications/email",
    summary: "Inspect email providers, inbound routes, and bulk sending capabilities.",
    auth: "admin",
  },
  {
    method: "POST",
    path: "/api/v1/admin/notifications/email/bulk",
    summary: "Send or dry-run bulk emails with custom recipients, tags, and headers.",
    auth: "admin",
  },
  {
    method: "GET",
    path: "/api/v1/admin/settings/secrets",
    summary: "Inspect in-app external service secrets with masked previews and storage source.",
    auth: "admin",
  },
  {
    method: "POST",
    path: "/api/v1/admin/settings/secrets",
    summary: "Store or rotate an encrypted external service secret in the application vault.",
    auth: "admin",
  },
  {
    method: "POST",
    path: "/api/webhooks/payments/:provider",
    summary: "Receive verified payment provider callbacks with idempotency checks.",
    auth: "webhook",
  },
  {
    method: "POST",
    path: "/api/webhooks/resend",
    summary: "Receive verified Resend webhook events for inbound email and delivery telemetry.",
    auth: "webhook",
  },
];

export function createOpenApiDocument(
  modules: ModuleDescriptor[],
): OpenApiDocument {
  const paths = apiReference.reduce<OpenApiDocument["paths"]>((accumulator, item) => {
    const method = item.method.toLowerCase();
    const current = accumulator[item.path] ?? {};
    return {
      ...accumulator,
      [item.path]: {
        ...current,
        [method]: {
          summary: item.summary,
          description: `${item.summary} Authentication: ${item.auth}.`,
        },
      },
    };
  }, {});

  return {
    openapi: "3.1.0",
    info: {
      title: "Ultra Commerce API",
      version: "0.1.0",
      description:
        "API-first commerce platform for catalog, customers, checkout, content, analytics, and plugins.",
    },
    tags: modules.map((module) => ({
      name: module.name,
      description: module.summary,
    })),
    paths,
  };
}
