import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin-shell";
import { decodeSession, SESSION_COOKIE } from "@/lib/session";
import { getAllProducts, getFeaturedHeroProduct, getFeaturedWeekProducts } from "@/lib/products-store";
import { FeaturedManagerClient } from "./featured-client";

export default async function AdminFeaturedPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  const session = token ? decodeSession(token) : null;

  if (!session || session.role !== "admin") {
    redirect("/login");
  }

  const [products, heroProduct, weekProducts] = await Promise.all([
    getAllProducts(),
    getFeaturedHeroProduct(),
    getFeaturedWeekProducts(3),
  ]);

  return (
    <AdminShell active="featured" sessionName={session.name}>
      <div className="admin-page-stack">
        <FeaturedManagerClient
          products={products}
          initialHeroProductId={heroProduct?.id ?? null}
          initialWeekProductIds={weekProducts.map((product) => product.id)}
        />
      </div>
    </AdminShell>
  );
}
