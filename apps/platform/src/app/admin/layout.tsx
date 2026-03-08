import type { PropsWithChildren } from "react";

import { AdminSidebar } from "../../components/admin-sidebar";
import { getSession } from "../../server/get-session";
import { logout } from "./actions";

export default async function AdminLayout({ children }: PropsWithChildren) {
  const session = await getSession();

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <div className="admin-body">
        <header className="admin-topbar">
          <div />
          <div className="admin-topbar-right">
            <span className="topbar-email">{session?.email}</span>
            <form action={logout}>
              <button type="submit" className="btn-ghost-sm">Sign out</button>
            </form>
          </div>
        </header>
        <main className="admin-main">{children}</main>
      </div>
    </div>
  );
}
