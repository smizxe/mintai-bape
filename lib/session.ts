export const SESSION_COOKIE = "mintai-token";
export const ROLE_COOKIE = "mintai-role";

export type SessionRole = "admin" | "user";

export type SessionUser = {
  email: string;
  role: SessionRole;
  name: string;
};

// Demo credentials — swap for real DB lookup when Supabase is connected
const DEMO_USERS: Array<SessionUser & { password: string }> = [
  { email: "admin@mintaibape.vn", password: "mintai2024", role: "admin", name: "MinTai Admin" },
  { email: "user@mintaibape.vn", password: "user2024", role: "user", name: "MinTai User" },
];

export function validateCredentials(email: string, password: string): SessionUser | null {
  const user = DEMO_USERS.find(
    (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password,
  );
  if (!user) return null;
  return { email: user.email, role: user.role, name: user.name };
}

export function encodeSession(user: SessionUser): string {
  return Buffer.from(JSON.stringify(user)).toString("base64");
}

export function decodeSession(value: string): SessionUser | null {
  try {
    const parsed = JSON.parse(Buffer.from(value, "base64").toString("utf8"));
    if (!parsed?.email || !parsed?.role) return null;
    return parsed as SessionUser;
  } catch {
    return null;
  }
}
