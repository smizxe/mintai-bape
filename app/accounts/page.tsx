import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Menu } from "lucide-react";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import { SectionHeading } from "@/components/section-heading";
import { accountCatalog } from "@/lib/catalog";

export default function AccountsPage() {
  return (
    <>
      <SiteHeader
        links={[
          { href: "/", label: "Trang chu" },
          { href: "/accounts", label: "Account" },
          { href: "/products", label: "San pham" },
          { href: "/login", label: "Login" },
        ]}
        mobileIcon={<Menu size={28} />}
      />

      <main className="inner-page">
        <section className="page-hero page-hero-dark">
          <SectionHeading
            eyebrow="Trang account"
            title="Xem toan bo anh account trong kho hien tai"
            description="Day la trang list anh rieng de nguoi mua quet bo suu tap. Moi card deu co anh lon, mo ta ngan, tag va loi di sang trang san pham."
            inverted
          />
        </section>

        <section className="accounts-catalog">
          <div className="accounts-grid">
            {accountCatalog.map((account) => (
              <article key={account.id} className="account-showcase-card">
                <div className="account-showcase-media">
                  <Image src={account.image} alt={account.title} fill sizes="(max-width: 720px) 100vw, (max-width: 1100px) 50vw, 33vw" />
                </div>
                <div className="account-showcase-body">
                  <div className="gallery-topline">
                    <span className="tag-dark">{account.tag}</span>
                    <span className={`tier-badge ${account.tierClass}`}>{account.tier}</span>
                  </div>
                  <h3>{account.title}</h3>
                  <p>{account.summary}</p>
                  <ul className="mini-stat-list">
                    {account.stats.map((stat) => (
                      <li key={stat}>{stat}</li>
                    ))}
                  </ul>
                  <div className="account-showcase-footer">
                    <strong>{account.price}</strong>
                    <Link href="/products">
                      Xem tren trang san pham
                      <ArrowRight size={16} />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
