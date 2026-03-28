export const AUTH_EVENT = "mintai-auth-change";

export type ClientSessionRole = "guest" | "user" | "admin";

export function getRoleFromDocumentCookie(): ClientSessionRole {
  if (typeof document === "undefined") return "guest";

  const roleCookie = document.cookie
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith("mintai-role="));

  const role = roleCookie?.split("=")[1];
  return role === "admin" || role === "user" ? role : "guest";
}

export function notifyAuthChanged() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(AUTH_EVENT));
}
