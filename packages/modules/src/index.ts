import {
  apiReference,
  analyticsControlCenterSchema,
  analyticsFrontendBootstrapSchema,
  blogPostSchema,
  cartSchema,
  createOpenApiDocument,
  customerSchema,
  healthSchema,
  moduleDescriptorSchema,
  orderSchema,
  productSchema,
  type AnalyticsSnapshot,
  type AnalyticsControlCenter,
  type AnalyticsEventDefinition,
  type AnalyticsFrontendBootstrap,
  type AnalyticsProvider,
  type Cart,
  type Customer,
  type ModuleDescriptor,
  type OpenApiDocument,
  type Order,
  type PlatformHealth,
  type Product,
  type SeoMetadata,
  type SeoRoute,
  type SeoSiteConfig,
  seoRouteSchema,
  seoSiteConfigSchema,
} from "@ultra/api-contracts";
import {
  DomainEventBus,
  definePlugin,
  getAppConfig,
  getUltraConfig,
  type UltraPlugin,
} from "@ultra/core";
import { getPool } from "@ultra/db";

export * from "./email";
export * from "./secret-vault";

const moduleDescriptors = [
  {
    name: "auth",
    label: "Authentication",
    summary: "Admin, customer, API key, and service account access control.",
    status: "active",
    apiBasePath: "/api/v1/admin/auth",
    adminPath: "/admin/security",
    docsPath: "/docs#auth",
    entities: ["users", "sessions", "api_keys"],
    events: ["auth.login", "auth.password_reset_requested"],
    securityControls: ["mfa-ready", "password hashing", "session rotation"],
  },
  {
    name: "users",
    label: "Users",
    summary: "Profiles, addresses, lifecycle state, and support tooling.",
    status: "active",
    apiBasePath: "/api/v1/admin/customers",
    adminPath: "/admin/customers",
    docsPath: "/docs#users",
    entities: ["users", "addresses", "segments"],
    events: ["users.customer.created", "users.customer.disabled"],
    securityControls: ["email verification", "api scopes", "audit trail"],
  },
  {
    name: "catalog",
    label: "Catalog",
    summary: "Products, variants, collections, brands, and rich merchandising data.",
    status: "active",
    apiBasePath: "/api/v1/store/catalog",
    adminPath: "/admin/catalog",
    docsPath: "/docs#catalog",
    entities: ["products", "variants", "collections"],
    events: ["catalog.product.published", "catalog.inventory.low"],
    securityControls: ["input validation", "draft workflow"],
  },
  {
    name: "inventory",
    label: "Inventory",
    summary: "Warehouse stock, reservations, and availability orchestration.",
    status: "active",
    apiBasePath: "/api/v1/admin/inventory",
    adminPath: "/admin/inventory",
    docsPath: "/docs#inventory",
    entities: ["stock_items", "warehouses", "reservations"],
    events: ["inventory.reserved", "inventory.released"],
    securityControls: ["idempotent reservations", "concurrency-safe updates"],
  },
  {
    name: "pricing",
    label: "Pricing",
    summary: "Price books, discounts, tax inputs, regional catalogs, and promotions.",
    status: "active",
    apiBasePath: "/api/v1/admin/pricing",
    adminPath: "/admin/pricing",
    docsPath: "/docs#pricing",
    entities: ["price_lists", "tax_rules", "promotions"],
    events: ["pricing.promotion.applied", "pricing.price_list.changed"],
    securityControls: ["approval workflow", "currency normalization"],
  },
  {
    name: "cart",
    label: "Cart",
    summary: "Storefront cart state, coupons, totals, and recovery.",
    status: "active",
    apiBasePath: "/api/v1/store/cart",
    adminPath: "/admin/carts",
    docsPath: "/docs#cart",
    entities: ["carts", "cart_items"],
    events: ["cart.updated", "cart.abandoned"],
    securityControls: ["idempotency keys", "ownership checks"],
  },
  {
    name: "orders",
    label: "Orders",
    summary: "Order capture, fulfillment, returns, refunds, and customer support tooling.",
    status: "active",
    apiBasePath: "/api/v1/store/orders",
    adminPath: "/admin/orders",
    docsPath: "/docs#orders",
    entities: ["orders", "fulfillments", "refunds"],
    events: ["order.placed", "order.refunded"],
    securityControls: ["append-only history", "refund approvals"],
  },
  {
    name: "payments",
    label: "Payments",
    summary: "Provider-agnostic payment intents, captures, refunds, and webhooks.",
    status: "active",
    apiBasePath: "/api/v1/store/checkout",
    adminPath: "/admin/payments",
    docsPath: "/docs#payments",
    entities: ["payment_intents", "transactions", "provider_accounts"],
    events: ["payment.captured", "payment.failed"],
    securityControls: ["signature verification", "idempotent webhooks"],
  },
  {
    name: "shipping",
    label: "Shipping",
    summary: "Zones, methods, carrier rates, labels, and tracking sync.",
    status: "active",
    apiBasePath: "/api/v1/store/shipping",
    adminPath: "/admin/shipping",
    docsPath: "/docs#shipping",
    entities: ["shipping_methods", "zones", "shipments"],
    events: ["shipping.rate.quoted", "shipping.label.created"],
    securityControls: ["carrier secrets isolation", "address normalization"],
  },
  {
    name: "analytics",
    label: "Analytics",
    summary: "Revenue dashboards, conversion, cohorts, and operational KPIs.",
    status: "active",
    apiBasePath: "/api/v1/admin/analytics",
    adminPath: "/admin/analytics",
    docsPath: "/docs#analytics",
    entities: ["events", "snapshots", "exports"],
    events: ["analytics.snapshot.generated"],
    securityControls: ["pii minimization", "export auditing"],
  },
  {
    name: "cms",
    label: "Content",
    summary: "Blogs, pages, navigation, SEO metadata, and merch blocks.",
    status: "active",
    apiBasePath: "/api/v1/admin/cms",
    adminPath: "/admin/content",
    docsPath: "/docs#cms",
    entities: ["pages", "blog_posts", "navigation"],
    events: ["cms.post.published"],
    securityControls: ["draft publishing", "sanitized rich content"],
  },
  {
    name: "notifications",
    label: "Notifications",
    summary: "Email and async customer communications behind provider adapters.",
    status: "active",
    apiBasePath: "/api/v1/admin/notifications",
    adminPath: "/admin/notifications",
    docsPath: "/docs#notifications",
    entities: ["templates", "deliveries"],
    events: ["notifications.email.queued"],
    securityControls: ["provider failover", "template approval"],
  },
  {
    name: "search",
    label: "Search",
    summary: "Search indexing contracts with a Postgres-first baseline.",
    status: "active",
    apiBasePath: "/api/v1/store/search",
    adminPath: "/admin/search",
    docsPath: "/docs#search",
    entities: ["search_documents", "index_jobs"],
    events: ["search.index.updated"],
    securityControls: ["query throttling", "safe filter parsing"],
  },
  {
    name: "settings",
    label: "Settings",
    summary: "Platform configuration, channels, branding, feature flags, and environments.",
    status: "active",
    apiBasePath: "/api/v1/admin/settings",
    adminPath: "/admin/settings",
    docsPath: "/docs#settings",
    entities: ["settings", "feature_flags"],
    events: ["settings.changed"],
    securityControls: ["secret masking", "change approval"],
  },
  {
    name: "audit",
    label: "Audit",
    summary: "Security and administrative event logging for enterprise traceability.",
    status: "active",
    apiBasePath: "/api/v1/admin/audit",
    adminPath: "/admin/audit",
    docsPath: "/docs#audit",
    entities: ["audit_logs", "security_events"],
    events: ["audit.log.created"],
    securityControls: ["immutable append-only records", "tamper detection"],
  },
] satisfies ModuleDescriptor[];

const sampleProducts: Product[] = [
  {
    id: "prod_ultra_jacket",
    slug: "ultra-light-jacket",
    title: "Ultra Light Jacket",
    status: "active",
    currency: "USD",
    priceCents: 14900,
    inventory: 32,
    tags: ["outerwear", "spring", "featured"],
    seo: createSeoMetadata({
      title: "Ultra Light Jacket",
      description:
        "Featherweight premium outerwear with modular catalog pricing and fast fulfillment support.",
      canonicalPath: "/products/ultra-light-jacket",
      type: "product",
      keywords: ["ultra light jacket", "premium jacket", "technical outerwear"],
      imagePath: "/og/product-ultra-light-jacket.png",
    }),
  },
  {
    id: "prod_ultra_pack",
    slug: "ultra-travel-pack",
    title: "Ultra Travel Pack",
    status: "active",
    currency: "USD",
    priceCents: 18900,
    inventory: 18,
    tags: ["bags", "travel", "bestseller"],
    seo: createSeoMetadata({
      title: "Ultra Travel Pack",
      description:
        "Travel-ready carry system optimized for modern storefront merchandising and search coverage.",
      canonicalPath: "/products/ultra-travel-pack",
      type: "product",
      keywords: ["travel pack", "carry bag", "premium backpack"],
      imagePath: "/og/product-ultra-travel-pack.png",
    }),
  },
];

const sampleCustomers: Customer[] = [
  {
    id: "cus_001",
    email: "alex@ultra.test",
    firstName: "Alex",
    lastName: "Rivera",
    role: "admin",
    status: "active",
  },
  {
    id: "cus_002",
    email: "sam@ultra.test",
    firstName: "Sam",
    lastName: "Lee",
    role: "customer",
    status: "active",
  },
];

const sampleOrders: Order[] = [
  {
    id: "ord_001",
    number: "ULTRA-1001",
    email: "sam@ultra.test",
    totalCents: 18900,
    currency: "USD",
    status: "paid",
  },
];

const sampleBlogPosts = [
  {
    id: "blog_001",
    slug: "launching-ultra-commerce",
    title: "Launching Ultra Commerce",
    excerpt: "Why a modular, API-first commerce core matters for modern storefronts.",
    status: "published",
    publishedAt: new Date().toISOString(),
    seo: createSeoMetadata({
      title: "Launching Ultra Commerce",
      description:
        "How Ultra Commerce combines modular ecommerce, API-first architecture, and enterprise security.",
      canonicalPath: "/blog/launching-ultra-commerce",
      type: "article",
      keywords: ["ultra commerce", "nextjs ecommerce backend", "commerce architecture"],
      imagePath: "/og/blog-ultra-commerce.png",
    }),
  },
  {
    id: "blog_002",
    slug: "railway-deployment-basics",
    title: "Railway Deployment Basics",
    excerpt: "How to ship a stateless Next.js commerce backend with Postgres and workers.",
    status: "draft",
    publishedAt: null,
    seo: createSeoMetadata({
      title: "Railway Deployment Basics",
      description:
        "Deployment guidance for running Ultra Commerce with Railway web, worker, and Postgres services.",
      canonicalPath: "/blog/railway-deployment-basics",
      type: "article",
      keywords: ["railway deploy", "nextjs railway", "postgres railway"],
      imagePath: "/og/blog-railway-basics.png",
    }),
  },
];

const plugins: UltraPlugin[] = [
  definePlugin({
    key: "ultra.analytics-dashboard",
    name: "Analytics Dashboard",
    version: "0.1.0",
    description: "Adds executive dashboard cards and nightly KPI rollups.",
    capabilities: [
      {
        key: "dashboard.widget",
        label: "Dashboard widget",
        description: "Injects analytics widgets into the admin dashboard.",
      },
      {
        key: "worker.job",
        label: "Background jobs",
        description: "Registers recurring analytics aggregation tasks.",
      },
    ],
    adminRoutes: ["/admin/analytics"],
    apiRoutes: ["/api/v1/admin/analytics"],
    adminExtensions: [
      {
        path: "/admin/analytics",
        title: "Executive Summary",
        summary: "KPI widgets, trend charts, and revenue comparisons.",
      },
    ],
    eventSubscriptions: ["order.placed", "order.refunded"],
    storeRoutes: [],
    register(context) {
      context.eventBus.subscribe("order.placed", () => {
        return;
      });
    },
  }),
  definePlugin({
    key: "ultra.payments.manual-review",
    name: "Manual Review Queue",
    version: "0.1.0",
    description: "Routes high-risk orders into an admin review workflow.",
    capabilities: [
      {
        key: "checkout.validator",
        label: "Checkout validator",
        description: "Adds fraud review gates during checkout orchestration.",
      },
    ],
    adminRoutes: ["/admin/orders?queue=review"],
    apiRoutes: ["/api/v1/admin/orders"],
    adminExtensions: [
      {
        path: "/admin/orders?queue=review",
        title: "Fraud Review Queue",
        summary: "Review flagged orders before capture or fulfillment.",
      },
    ],
    eventSubscriptions: ["payment.failed"],
    storeRoutes: [],
    register() {
      return;
    },
  }),
];

let pluginsInitialized = false;

export function getModuleDescriptors(): ModuleDescriptor[] {
  return moduleDescriptors.map((item) => moduleDescriptorSchema.parse(item));
}

export function getPlugins(): UltraPlugin[] {
  if (!pluginsInitialized) {
    const eventBus = new DomainEventBus();
    const config = getUltraConfig();

    for (const plugin of plugins) {
      try {
        void plugin.register({
          env: { NODE_ENV: config.NODE_ENV, APP_URL: config.APP_URL },
          modules: getModuleDescriptors(),
          eventBus,
        });
      } catch (error) {
        console.error(`Plugin "${plugin.key}" failed to register:`, error);
      }
    }

    pluginsInitialized = true;
  }

  return plugins;
}

export function getOpenApiDocument(): OpenApiDocument {
  return createOpenApiDocument(getModuleDescriptors());
}

export async function getPlatformHealth(): Promise<PlatformHealth> {
  let dbStatus: "ok" | "degraded" | "offline" = "offline";
  let dbDetail = "DATABASE_URL is not configured.";

  if (process.env.DATABASE_URL) {
    try {
      const pool = getPool();
      await pool.query("SELECT 1");
      dbStatus = "ok";
      dbDetail = "Database connection is healthy.";
    } catch {
      dbStatus = "degraded";
      dbDetail = "Database connection failed.";
    }
  }

  return healthSchema.parse({
    name: "Ultra Commerce",
    version: "0.1.0",
    status: dbStatus === "ok" ? "ok" : "degraded",
    timestamp: new Date().toISOString(),
    services: [
      {
        name: "Next.js platform",
        status: "ok",
        detail: "Admin UI, APIs, and docs are online.",
      },
      {
        name: "Worker",
        status: "ok",
        detail: "Queue polling and analytics aggregation are configured.",
      },
      {
        name: "Postgres",
        status: dbStatus,
        detail: dbDetail,
      },
    ],
  });
}

function createSeoMetadata({
  title,
  description,
  canonicalPath,
  type,
  keywords,
  imagePath,
}: {
  title: string;
  description: string;
  canonicalPath: string;
  type: "website" | "article" | "product";
  keywords: string[];
  imagePath: string;
}): SeoMetadata {
  const siteUrl = getUltraConfig().APP_URL;
  const imageUrl = new URL(imagePath, siteUrl).toString();

  return {
    title,
    description,
    canonicalPath,
    keywords,
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        maxVideoPreview: -1,
        maxImagePreview: "large",
        maxSnippet: -1,
      },
    },
    openGraph: {
      type,
      title,
      description,
      images: [
        {
          url: imageUrl,
          alt: title,
          width: 1200,
          height: 630,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      image: imageUrl,
    },
    jsonLd: {
      "@context": "https://schema.org",
      "@type": type === "product" ? "Product" : type === "article" ? "Article" : "WebSite",
      name: title,
      description,
      url: new URL(canonicalPath, siteUrl).toString(),
    },
  };
}

export function getSeoConfig(): SeoSiteConfig {
  const config = getUltraConfig();
  const appConfig = getAppConfig();

  return seoSiteConfigSchema.parse({
    siteName: appConfig.appName,
    siteUrl: config.APP_URL,
    titleTemplate: `%s | ${appConfig.appName}`,
    defaultLocale: "en-US",
    locales: ["en-US"],
    defaultMetadata: createSeoMetadata({
      title: "Ultra Commerce",
      description:
        "Modular ecommerce backend with APIs, docs, analytics, content, plugins, and enterprise security.",
      canonicalPath: "/",
      type: "website",
      keywords: [
        "ecommerce backend",
        "nextjs commerce",
        "modular commerce platform",
        "headless ecommerce api",
      ],
      imagePath: "/og/ultra-home.png",
    }),
    sitemap: {
      enabled: true,
      excludedPaths: ["/admin"],
    },
    verification: {
      google: "ultra-google-site-verification-placeholder",
    },
  });
}

export function getSeoRoutes(): SeoRoute[] {
  const docsUpdatedAt = new Date().toISOString();
  const blogPosts = getBlogPosts();
  const products = getCatalogProducts();

  const routes: SeoRoute[] = [
    {
      id: "home",
      path: "/",
      type: "homepage",
      title: "Ultra Commerce",
      changeFrequency: "daily",
      priority: 1,
      lastModified: docsUpdatedAt,
      metadata: getSeoConfig().defaultMetadata,
    },
    {
      id: "docs",
      path: "/docs",
      type: "docs",
      title: "Ultra Commerce Docs",
      changeFrequency: "weekly",
      priority: 0.8,
      lastModified: docsUpdatedAt,
      metadata: createSeoMetadata({
        title: "Ultra Commerce Docs",
        description:
          "Reference documentation for modules, plugins, APIs, SEO, deployments, and operations.",
        canonicalPath: "/docs",
        type: "website",
        keywords: ["commerce docs", "api docs", "plugin docs"],
        imagePath: "/og/ultra-docs.png",
      }),
    },
  ];

  for (const product of products) {
    routes.push(
      seoRouteSchema.parse({
        id: product.id,
        path: `/products/${product.slug}`,
        type: "product",
        title: product.title,
        changeFrequency: "weekly",
        priority: 0.9,
        lastModified: new Date().toISOString(),
        metadata: product.seo,
      }),
    );
  }

  for (const post of blogPosts) {
    routes.push(
      seoRouteSchema.parse({
        id: post.id,
        path: `/blog/${post.slug}`,
        type: "blog",
        title: post.title,
        changeFrequency: "weekly",
        priority: 0.7,
        lastModified: post.publishedAt ?? docsUpdatedAt,
        metadata: post.seo,
      }),
    );
  }

  return routes;
}

export function getSeoCoverage() {
  const routes = getSeoRoutes();

  return {
    defaults: getSeoConfig(),
    routes,
    coverage: {
      totalRoutes: routes.length,
      indexedRoutes: routes.filter((route) => route.metadata.robots.index).length,
      productRoutes: routes.filter((route) => route.type === "product").length,
      contentRoutes: routes.filter((route) => route.type === "blog" || route.type === "docs").length,
      structuredDataTypes: [...new Set(routes.map((route) => route.metadata.jsonLd["@type"]))],
    },
  };
}

export function getCatalogProducts(): Product[] {
  return sampleProducts.map((product) => productSchema.parse(product));
}

export function getCustomers(): Customer[] {
  return sampleCustomers.map((customer) => customerSchema.parse(customer));
}

export function getOrders(): Order[] {
  return sampleOrders.map((order) => orderSchema.parse(order));
}

export function getBlogPosts() {
  return sampleBlogPosts.map((post) => blogPostSchema.parse(post));
}

export function getAnalyticsSnapshot(): AnalyticsSnapshot {
  return {
    revenueCents: 2485000,
    averageOrderValueCents: 17140,
    conversionRate: 0.043,
    activeCarts: 28,
  };
}

export function getAnalyticsProviders(): AnalyticsProvider[] {
  const appConfig = getAppConfig();
  const runtimeConfig = getUltraConfig();

  return [
    {
      key: "internal",
      label: "Ultra Analytics",
      enabled: appConfig.features.analytics,
      delivery: "hybrid",
      publicConfig: {
        endpoint: "/api/v1/store/analytics/events",
      },
      capabilities: [
        "commerce event normalization",
        "operational dashboards",
        "server-side forwarding",
      ],
    },
    {
      key: "google_analytics",
      label: "Google Analytics",
      enabled:
        appConfig.features.analytics &&
        appConfig.analytics.googleAnalytics.enabled &&
        Boolean(appConfig.analytics.googleAnalytics.measurementId),
      delivery: "browser",
      publicConfig: {
        measurementId: appConfig.analytics.googleAnalytics.measurementId,
      },
      capabilities: ["page views", "enhanced ecommerce", "audiences", "ads attribution"],
    },
    {
      key: "meta_pixel",
      label: "Facebook Pixel",
      enabled:
        appConfig.features.analytics &&
        appConfig.analytics.facebookPixel.enabled &&
        Boolean(appConfig.analytics.facebookPixel.pixelId),
      delivery: "browser",
      publicConfig: {
        pixelId: appConfig.analytics.facebookPixel.pixelId,
      },
      capabilities: ["page views", "catalog retargeting", "purchase tracking", "lead tracking"],
    },
    {
      key: "meta_ads",
      label: "Meta Conversions API",
      enabled:
        appConfig.features.analytics &&
        appConfig.analytics.metaConversionsApi.enabled &&
        Boolean(appConfig.analytics.facebookPixel.pixelId) &&
        Boolean(runtimeConfig.META_CONVERSIONS_API_TOKEN),
      delivery: "server",
      publicConfig: {
        pixelId: appConfig.analytics.facebookPixel.pixelId,
        testEventCode: appConfig.analytics.metaConversionsApi.testEventCode,
      },
      capabilities: ["server events", "purchase deduplication", "ads optimization", "offline resilience"],
    },
  ];
}

export function getAnalyticsEventDefinitions(): AnalyticsEventDefinition[] {
  return [
    {
      key: "page_view",
      label: "Page View",
      category: "engagement",
      description: "Tracks route views and landing-page engagement for all storefront sessions.",
      triggers: ["page load", "route transition"],
      providerMappings: {
        internal: "page_view",
        google_analytics: "page_view",
        meta_pixel: "PageView",
        meta_ads: "PageView",
      },
    },
    {
      key: "view_item",
      label: "View Item",
      category: "commerce",
      description: "Tracks product detail impressions with item, pricing, and merchandising context.",
      triggers: ["product page rendered"],
      providerMappings: {
        internal: "view_item",
        google_analytics: "view_item",
        meta_pixel: "ViewContent",
        meta_ads: "ViewContent",
      },
    },
    {
      key: "add_to_cart",
      label: "Add To Cart",
      category: "commerce",
      description: "Captures cart-add intent for merchandising, funnel, and ad optimization.",
      triggers: ["line item added to cart"],
      providerMappings: {
        internal: "add_to_cart",
        google_analytics: "add_to_cart",
        meta_pixel: "AddToCart",
        meta_ads: "AddToCart",
      },
    },
    {
      key: "begin_checkout",
      label: "Begin Checkout",
      category: "commerce",
      description: "Tracks entry into checkout and validates session-to-order funnel steps.",
      triggers: ["checkout initiated"],
      providerMappings: {
        internal: "begin_checkout",
        google_analytics: "begin_checkout",
        meta_pixel: "InitiateCheckout",
        meta_ads: "InitiateCheckout",
      },
    },
    {
      key: "purchase",
      label: "Purchase",
      category: "commerce",
      description: "Records completed orders with deduplicated transaction and attribution context.",
      triggers: ["order placed", "payment captured"],
      providerMappings: {
        internal: "purchase",
        google_analytics: "purchase",
        meta_pixel: "Purchase",
        meta_ads: "Purchase",
      },
    },
    {
      key: "sign_up",
      label: "Sign Up",
      category: "identity",
      description: "Tracks account creation for acquisition reporting and audience building.",
      triggers: ["customer registration completed"],
      providerMappings: {
        internal: "sign_up",
        google_analytics: "sign_up",
        meta_pixel: "CompleteRegistration",
        meta_ads: "CompleteRegistration",
      },
    },
  ];
}

export function getFrontendAnalyticsBootstrap(): AnalyticsFrontendBootstrap {
  const appConfig = getAppConfig();

  return analyticsFrontendBootstrapSchema.parse({
    enabled: appConfig.features.analytics,
    endpoint: "/api/v1/store/analytics/events",
    providers: getAnalyticsProviders(),
    eventDefinitions: getAnalyticsEventDefinitions(),
    dataLayer: {
      currency: appConfig.commerce.defaultCurrency,
      region: appConfig.commerce.defaultRegion,
    },
  });
}

export function getAnalyticsControlCenter(): AnalyticsControlCenter {
  return analyticsControlCenterSchema.parse({
    snapshot: getAnalyticsSnapshot(),
    providers: getAnalyticsProviders(),
    eventDefinitions: getAnalyticsEventDefinitions(),
    frontend: getFrontendAnalyticsBootstrap(),
    serverDestinations: [
      {
        key: "meta_conversions_api",
        label: "Meta Conversions API",
        enabled: getAnalyticsProviders().some(
          (provider) => provider.key === "meta_ads" && provider.enabled,
        ),
        purpose: "Server-side conversion forwarding and browser/server deduplication.",
      },
      {
        key: "internal_pipeline",
        label: "Ultra Analytics Pipeline",
        enabled: true,
        purpose: "Normalizes commerce events for reporting, plugins, and future warehouse exports.",
      },
    ],
  });
}

export function createCartPreview(): Cart {
  const appConfig = getAppConfig();

  return cartSchema.parse({
    id: "cart_preview",
    currency: appConfig.commerce.defaultCurrency,
    subtotalCents: 33800,
    totalCents: 33800,
    itemCount: 2,
  });
}

export function createCheckoutPreview() {
  return {
    status: "validated",
    requiresPaymentAction: false,
    supportedPaymentProviders: ["manual", "stripe-compatible"],
    supportedShippingProviders: ["flat-rate", "custom-carrier"],
  };
}

export function getApiReference() {
  return apiReference;
}
