import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin-shell";
import { getAllAccountTypes } from "@/lib/account-types-store";
import { decodeSession, SESSION_COOKIE } from "@/lib/session";
import { AccountTypesClient } from "./types-client";

export default async function AdminAccountTypesPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  const session = token ? decodeSession(token) : null;

  if (!session || session.role !== "admin") {
    redirect("/login");
  }

  const accountTypes = await getAllAccountTypes();

  return (
    <AdminShell active="account-types" sessionName={session.name}>
      <div className="admin-page-stack">
        <AccountTypesClient initialAccountTypes={accountTypes} />
      </div>
    </AdminShell>
  );
}
