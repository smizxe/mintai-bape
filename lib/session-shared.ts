export const SESSION_COOKIE = "mintai-token";
export const ROLE_COOKIE = "mintai-role";

export type SessionRole = "admin" | "user";

export type SessionUser = {
  email: string;
  role: SessionRole;
  name: string;
};

export function getSessionSecret() {
  return process.env.AUTH_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || "mintai-dev-secret";
}
