import {
  boolean,
  index,
  integer,
  jsonb,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const userRoleEnum = pgEnum("user_role", ["customer", "admin"]);
export const userStatusEnum = pgEnum("user_status", ["active", "invited", "disabled"]);
export const productStatusEnum = pgEnum("product_status", ["draft", "active", "archived"]);
export const orderStatusEnum = pgEnum("order_status", [
  "pending",
  "paid",
  "fulfilled",
  "cancelled",
]);
export const contentStatusEnum = pgEnum("content_status", ["draft", "published"]);
export const jobStatusEnum = pgEnum("job_status", ["queued", "processing", "completed", "failed"]);

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull()
    .$onUpdateFn(() => new Date()),
};

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  firstName: varchar("first_name", { length: 120 }).notNull(),
  lastName: varchar("last_name", { length: 120 }).notNull(),
  role: userRoleEnum("role").notNull().default("customer"),
  status: userStatusEnum("status").notNull().default("active"),
  passwordHash: text("password_hash"),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().notNull().default({}),
  ...timestamps,
});

export const apiKeys = pgTable("api_keys", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 120 }).notNull(),
  hashedKey: text("hashed_key").notNull(),
  scopes: jsonb("scopes").$type<string[]>().notNull().default([]),
  lastUsedAt: timestamp("last_used_at", { withTimezone: true }),
  ...timestamps,
});

export const products = pgTable("products", {
  id: uuid("id").defaultRandom().primaryKey(),
  slug: varchar("slug", { length: 180 }).notNull().unique(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull().default(""),
  status: productStatusEnum("status").notNull().default("draft"),
  currency: varchar("currency", { length: 10 }).notNull().default("USD"),
  price: numeric("price", { precision: 12, scale: 2 }).notNull().default("0"),
  inventory: integer("inventory").notNull().default(0),
  tags: jsonb("tags").$type<string[]>().notNull().default([]),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().notNull().default({}),
  ...timestamps,
}, (table) => ({
  statusIdx: index("products_status_idx").on(table.status),
}));

export const orders = pgTable("orders", {
  id: uuid("id").defaultRandom().primaryKey(),
  number: varchar("number", { length: 24 }).notNull().unique(),
  email: varchar("email", { length: 255 }).notNull(),
  status: orderStatusEnum("status").notNull().default("pending"),
  currency: varchar("currency", { length: 10 }).notNull().default("USD"),
  total: numeric("total", { precision: 12, scale: 2 }).notNull().default("0"),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().notNull().default({}),
  ...timestamps,
}, (table) => ({
  emailIdx: index("orders_email_idx").on(table.email),
  statusIdx: index("orders_status_idx").on(table.status),
}));

export const blogPosts = pgTable("blog_posts", {
  id: uuid("id").defaultRandom().primaryKey(),
  slug: varchar("slug", { length: 180 }).notNull().unique(),
  title: varchar("title", { length: 255 }).notNull(),
  excerpt: text("excerpt").notNull().default(""),
  body: text("body").notNull().default(""),
  status: contentStatusEnum("status").notNull().default("draft"),
  publishedAt: timestamp("published_at", { withTimezone: true }),
  ...timestamps,
});

export const analyticsSnapshots = pgTable("analytics_snapshots", {
  id: uuid("id").defaultRandom().primaryKey(),
  revenue: numeric("revenue", { precision: 12, scale: 2 }).notNull().default("0"),
  averageOrderValue: numeric("average_order_value", { precision: 12, scale: 2 })
    .notNull()
    .default("0"),
  conversionRate: numeric("conversion_rate", { precision: 6, scale: 4 }).notNull().default("0"),
  activeCarts: integer("active_carts").notNull().default(0),
  ...timestamps,
});

export const jobs = pgTable("jobs", {
  id: uuid("id").defaultRandom().primaryKey(),
  queue: varchar("queue", { length: 80 }).notNull(),
  type: varchar("type", { length: 120 }).notNull(),
  status: jobStatusEnum("status").notNull().default("queued"),
  attempts: integer("attempts").notNull().default(0),
  maxAttempts: integer("max_attempts").notNull().default(25),
  runAt: timestamp("run_at", { withTimezone: true }).defaultNow().notNull(),
  payload: jsonb("payload").$type<Record<string, unknown>>().notNull().default({}),
  lastError: text("last_error"),
  lockedBy: varchar("locked_by", { length: 120 }),
  lockedAt: timestamp("locked_at", { withTimezone: true }),
  ...timestamps,
}, (table) => ({
  queueStatusRunAtIdx: index("jobs_queue_status_run_at_idx").on(table.queue, table.status, table.runAt),
}));

export const auditLogs = pgTable("audit_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  actorId: uuid("actor_id"),
  action: varchar("action", { length: 160 }).notNull(),
  entityType: varchar("entity_type", { length: 120 }).notNull(),
  entityId: varchar("entity_id", { length: 120 }).notNull(),
  ipAddress: varchar("ip_address", { length: 120 }),
  userAgent: text("user_agent"),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().notNull().default({}),
  ...timestamps,
}, (table) => ({
  actorIdIdx: index("audit_logs_actor_id_idx").on(table.actorId),
  entityTypeIdx: index("audit_logs_entity_type_idx").on(table.entityType),
}));

export const settings = pgTable("settings", {
  id: uuid("id").defaultRandom().primaryKey(),
  key: varchar("key", { length: 160 }).notNull().unique(),
  value: jsonb("value").$type<Record<string, unknown>>().notNull(),
  isSecret: boolean("is_secret").notNull().default(false),
  ...timestamps,
});
