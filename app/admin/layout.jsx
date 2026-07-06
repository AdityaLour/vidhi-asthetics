import { requireAdmin } from "@/lib/session";
import { redirect } from "next/navigation";

import Sidebar from "@/components/admin/Sidebar";
import Header from "@/components/admin/Header";

export default async function AdminLayout({ children }) {
  const admin = await requireAdmin();

  if (!admin) {
    redirect("/");
  }

  return (
    <div className="admin-layout">
      <Sidebar />

      <div className="admin-content">
        <Header />

        <main className="admin-main">{children}</main>
      </div>
    </div>
  );
}
