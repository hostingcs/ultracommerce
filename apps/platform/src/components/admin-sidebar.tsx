"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavItem {
  href: string;
  label: string;
  exact?: boolean;
  external?: boolean;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    label: "Commerce",
    items: [
      { href: "/admin", label: "Dashboard", exact: true },
      { href: "/admin/orders", label: "Orders" },
      { href: "/admin/products", label: "Products" },
      { href: "/admin/customers", label: "Customers" },
    ],
  },
  {
    label: "Insights",
    items: [{ href: "/admin/analytics", label: "Analytics" }],
  },
  {
    label: "Content",
    items: [
      { href: "/admin/content", label: "Blog" },
      { href: "/admin/email", label: "Email" },
    ],
  },
  {
    label: "Platform",
    items: [
      { href: "/admin/settings", label: "Settings" },
      { href: "/api/openapi", label: "OpenAPI", external: true },
    ],
  },
];

export function AdminSidebar() {
  const pathname = usePathname();

  function isActive(href: string, exact?: boolean) {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  }

  return (
    <aside className="admin-sidebar">
      <div className="admin-sidebar-logo">
        <span className="admin-sidebar-mark" />
        <div>
          <strong>Ultra Commerce</strong>
          <p>Admin</p>
        </div>
      </div>
      <nav className="admin-sidebar-nav">
        {NAV_GROUPS.map((group) => (
          <div key={group.label} className="admin-nav-group">
            <p className="admin-nav-label">{group.label}</p>
            {group.items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                target={item.external ? "_blank" : undefined}
                className={`admin-nav-item${isActive(item.href, item.exact) ? " admin-nav-item--active" : ""}`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        ))}
      </nav>
    </aside>
  );
}
