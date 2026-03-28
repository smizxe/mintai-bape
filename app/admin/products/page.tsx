import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { decodeSession, SESSION_COOKIE } from "@/lib/session";
import { getAllProducts } from "@/lib/products-store";
import { getAllAccountTypes } from "@/lib/account-types-store";
import { AdminProductsClient } from "./products-client";
import { AdminShell } from "@/components/admin-shell";

export default async function AdminProductsPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  const session = token ? decodeSession(token) : null;

  if (!session || session.role !== "admin") {
    redirect("/login");
  }

  const [products, accountTypes] = await Promise.all([
    getAllProducts(),
    getAllAccountTypes(),
  ]);

  return (
    <AdminShell active="products" sessionName={session.name}>
      <div className="admin-page-stack">
        <AdminProductsClient initialProducts={products} initialAccountTypes={accountTypes} />
      </div>
    </AdminShell>
  );
}
