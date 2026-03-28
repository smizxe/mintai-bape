import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Menu } from "lucide-react";
import { CartClient } from "@/app/cart/cart-client";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import { getCartByUserId, getUserProfileByEmail } from "@/lib/commerce-store";
import { decodeSession, SESSION_COOKIE } from "@/lib/session";

export default async function CartPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  const session = token ? decodeSession(token) : null;

  if (!session) {
    redirect("/login?next=/cart");
  }

  if (session.role === "admin") {
    redirect("/admin");
  }

  const user = await getUserProfileByEmail(session.email);
  if (!user) {
    redirect("/login?next=/cart");
  }

  const cart = await getCartByUserId(user.id);

  return (
    <>
      <SiteHeader mobileIcon={<Menu size={28} />} />

      <main className="dashboard-page">
        <CartClient initialCart={cart} />
      </main>

      <SiteFooter />
    </>
  );
}
