import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin-shell";
import { getPaidOrdersForAdmin } from "@/lib/commerce-store";
import { decodeSession, SESSION_COOKIE } from "@/lib/session";
import { AdminOrdersClient } from "./orders-client";

export default async function AdminOrdersPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  const session = token ? decodeSession(token) : null;

  if (!session || session.role !== "admin") {
    redirect("/login");
  }

  const orders = await getPaidOrdersForAdmin();

  return (
    <AdminShell active="orders" sessionName={session.name}>
      <div className="admin-page-stack">
        <AdminOrdersClient initialOrders={orders} />
      </div>
    </AdminShell>
  );
}
