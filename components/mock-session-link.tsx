"use client";

import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { clearMockSessionRole, setMockSessionRole } from "@/components/site-chrome";

type SessionRole = "user" | "admin";

type MockSessionLinkProps = {
  href: string;
  role?: SessionRole;
  clearSession?: boolean;
  className?: string;
  children: ReactNode;
} & Omit<ComponentProps<typeof Link>, "href" | "className" | "children">;

export function MockSessionLink({
  href,
  role,
  clearSession = false,
  className,
  children,
  ...props
}: MockSessionLinkProps) {
  return (
    <Link
      {...props}
      href={href}
      className={className}
      onClick={() => {
        if (clearSession) {
          clearMockSessionRole();
          return;
        }

        if (role) {
          setMockSessionRole(role);
        }
      }}
    >
      {children}
    </Link>
  );
}
