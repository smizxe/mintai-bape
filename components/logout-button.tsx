"use client";

import { useRouter } from "next/navigation";
import { notifyAuthChanged } from "@/lib/auth-client";

export function LogoutButton({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    notifyAuthChanged();
    router.push("/login");
    router.refresh();
  }

  return (
    <button type="button" onClick={handleLogout} className={className}>
      {children}
    </button>
  );
}
