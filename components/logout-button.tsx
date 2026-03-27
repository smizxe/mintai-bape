"use client";

import { useRouter } from "next/navigation";
import { clearMockSessionRole } from "@/components/site-chrome";

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
    clearMockSessionRole();
    router.push("/login");
  }

  return (
    <button type="button" onClick={handleLogout} className={className}>
      {children}
    </button>
  );
}
