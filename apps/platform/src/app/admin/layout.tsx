import type { PropsWithChildren } from "react";

import { AdminSidebar } from "../../components/admin-sidebar";

export default function AdminLayout({ children }: PropsWithChildren) {
  return (
    <div className="admin-layout">
      <AdminSidebar />
      <main className="admin-main">{children}</main>
    </div>
  );
}
