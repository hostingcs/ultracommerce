import { moduleNames } from "@ultra/api-contracts";

export const platformPermissions = [
  { key: "platform.manage", label: "Manage platform settings", scope: "platform" },
  { key: "security.audit.read", label: "Read audit logs", scope: "system" },
  { key: "plugins.manage", label: "Install and configure plugins", scope: "system" },
  { key: "docs.publish", label: "Publish documentation content", scope: "platform" },
  { key: "analytics.read", label: "Read analytics dashboards", scope: "platform" },
  { key: "catalog.manage", label: "Manage catalog and pricing", scope: "platform" },
  { key: "inventory.manage", label: "Manage inventory and availability", scope: "platform" },
  { key: "orders.manage", label: "Manage orders, returns, and refunds", scope: "platform" },
  { key: "customers.manage", label: "Manage customer records", scope: "platform" },
  { key: "content.manage", label: "Manage blogs, pages, and navigation", scope: "platform" },
] as const;

export type PlatformPermission = (typeof platformPermissions)[number]["key"];

export type RoleKey =
  | "super_admin"
  | "operations_manager"
  | "merchandiser"
  | "support_agent"
  | "content_editor"
  | "storefront_app";

export const rolePermissions: Record<RoleKey, PlatformPermission[]> = {
  super_admin: platformPermissions.map((permission) => permission.key),
  operations_manager: [
    "analytics.read",
    "inventory.manage",
    "orders.manage",
    "customers.manage",
  ],
  merchandiser: ["catalog.manage", "inventory.manage", "content.manage"],
  support_agent: ["orders.manage", "customers.manage", "security.audit.read"],
  content_editor: ["content.manage", "docs.publish"],
  storefront_app: ["analytics.read"],
};

export function hasPermission(
  role: RoleKey,
  permission: PlatformPermission,
): boolean {
  return rolePermissions[role].includes(permission);
}

const modulePermissionMapping: Record<string, PlatformPermission[]> = {
  auth: [],
  users: ["customers.manage"],
  catalog: ["catalog.manage"],
  inventory: ["inventory.manage"],
  pricing: [],
  cart: [],
  orders: ["orders.manage"],
  payments: [],
  shipping: [],
  analytics: ["analytics.read"],
  cms: ["content.manage", "docs.publish"],
  notifications: [],
  search: [],
  settings: ["platform.manage", "plugins.manage"],
  audit: ["security.audit.read"],
};

export function buildModulePermissionMap(): Record<string, PlatformPermission[]> {
  return moduleNames.reduce<Record<string, PlatformPermission[]>>((accumulator, moduleName) => {
    accumulator[moduleName] = modulePermissionMapping[moduleName] ?? [];
    return accumulator;
  }, {});
}
