import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "crypto";
import { prisma } from "@/lib/prisma";
import { getSessionSecret, type SessionRole, type SessionUser } from "@/lib/session-shared";

export { ROLE_COOKIE, SESSION_COOKIE } from "@/lib/session-shared";

function toSessionRole(role: string): SessionRole {
  return role.toUpperCase() === "ADMIN" ? "admin" : "user";
}

function signPayload(payload: string) {
  return createHmac("sha256", getSessionSecret()).update(payload).digest("base64url");
}

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const derived = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${derived}`;
}

export function verifyPassword(password: string, hash: string): boolean {
  const [salt, stored] = hash.split(":");
  if (!salt || !stored) return false;

  const derived = scryptSync(password, salt, 64);
  const storedBuffer = Buffer.from(stored, "hex");

  if (derived.length !== storedBuffer.length) return false;

  return timingSafeEqual(derived, storedBuffer);
}

export async function validateCredentials(email: string, password: string): Promise<SessionUser | null> {
  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail || !password) return null;

  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (!user?.passwordHash) return null;
  if (!verifyPassword(password, user.passwordHash)) return null;

  return {
    email: user.email,
    role: toSessionRole(user.role),
    name: user.displayName || user.email.split("@")[0],
  };
}

export async function registerUser(input: {
  email: string;
  password: string;
  displayName?: string;
}): Promise<SessionUser> {
  const email = input.email.trim().toLowerCase();
  const displayName = input.displayName?.trim() || email.split("@")[0];

  const user = await prisma.user.create({
    data: {
      email,
      displayName,
      passwordHash: hashPassword(input.password),
      role: "USER",
    },
  });

  return {
    email: user.email,
    role: "user",
    name: user.displayName || user.email.split("@")[0],
  };
}

export function encodeSession(user: SessionUser): string {
  const payload = Buffer.from(JSON.stringify(user)).toString("base64url");
  const signature = signPayload(payload);
  return `${payload}.${signature}`;
}

export function decodeSession(value: string): SessionUser | null {
  try {
    const [payload, signature] = value.split(".");
    if (!payload || !signature) return null;

    const expected = signPayload(payload);
    if (!timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null;

    const parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    if (!parsed?.email || !parsed?.role) return null;
    return parsed as SessionUser;
  } catch {
    return null;
  }
}
