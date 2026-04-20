import Link from "next/link";

/** Gray-mint atmospheric glow (bottom-left + top-right washes) */
const GLOW_RGB = "158, 214, 188";

function LogoMark() {
  return (
    <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#0a0a0a] ring-1 ring-white/20 shadow-[0_0_18px_4px_rgba(178,200,188,0.3)]">
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/15 via-white/5 to-transparent" />
      <span className="relative font-mulish text-base font-bold tracking-tight text-white">K</span>
    </div>
  );
}

const productLinks = [
  { label: "Overview", href: "#footer-product" },
  { label: "Features", href: "#footer-product" },
  { label: "Solutions", href: "#footer-product" },
  { label: "Tutorials", href: "#footer-product" },
  { label: "Pricing", href: "#footer-product" },
] as const;

const companyLinks = [
  { label: "About us", href: "#footer-company" },
  { label: "Careers", href: "#footer-company" },
  { label: "Press", href: "#footer-company" },
  { label: "News", href: "#footer-company" },
] as const;

const socialLinks = [
  { label: "Twitter", href: "https://twitter.com" },
  { label: "LinkedIn", href: "https://linkedin.com" },
  { label: "GitHub", href: "https://github.com" },
  { label: "Dribbble", href: "https://dribbble.com" },
] as const;

const legalLinks = [
  { label: "Terms", href: "#footer-legal" },
  { label: "Privacy", href: "#footer-legal" },
  { label: "Cookies", href: "#footer-legal" },
  { label: "Contact", href: "#footer-legal" },
] as const;

function FooterLink({ href, label }: { href: string; label: string }) {
  const className =
    "font-mulish text-sm font-normal text-white/55 transition hover:text-white/85";
  if (href.startsWith("http")) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
        {label}
      </a>
    );
  }
  return (
    <Link href={href} className={className}>
      {label}
    </Link>
  );
}

function LinkColumn({
  id,
  title,
  links,
}: {
  id: string;
  title: string;
  links: readonly { label: string; href: string }[];
}) {
  return (
    <div id={id} className="min-w-0 scroll-mt-28">
      <h3 className="font-mulish text-sm font-semibold tracking-wide text-white/90">{title}</h3>
      <ul className="mt-4 space-y-3">
        {links.map((item) => (
          <li key={item.label}>
            <FooterLink href={item.href} label={item.label} />
          </li>
        ))}
      </ul>
    </div>
  );
}

export function MarketingFooter() {
  return (
    <div className="w-full bg-[#000000]">
      <footer
        id="site-footer"
        className="relative w-full overflow-hidden border-t border-white/[0.06] px-[clamp(16px,5vw,80px)] pb-[clamp(48px,7vw,88px)] pt-[clamp(40px,6vw,72px)]"
        style={{
          fontFamily: "var(--font-mulish), system-ui, sans-serif",
          backgroundColor: "#000000",
          backgroundImage: `
            radial-gradient(ellipse 85% 65% at 0% 100%, rgba(${GLOW_RGB}, 0.34) 0%, rgba(${GLOW_RGB}, 0.06) 38%, transparent 62%),
            radial-gradient(ellipse 110% 90% at 100% 0%, rgba(${GLOW_RGB}, 0.28) 0%, rgba(${GLOW_RGB}, 0.05) 42%, transparent 58%),
            radial-gradient(ellipse 55% 45% at 18% 88%, rgba(200, 230, 215, 0.12) 0%, transparent 55%)
          `,
        }}
      >
        <div className="relative z-[1] mx-auto flex w-full max-w-[1400px] flex-col gap-14 lg:flex-row lg:justify-between lg:gap-12">
          <div className="max-w-[min(100%,320px)] shrink-0">
            <div className="flex items-center gap-3">
              <LogoMark />
              <span className="font-mulish text-lg font-bold tracking-tight text-white">K-INTENT</span>
            </div>
            <p className="mt-5 font-mulish text-[15px] font-normal leading-relaxed text-white/50">
              Crypto-native payment intents for merchants and builders — settle on Solana with clear, verifiable flows.
            </p>
          </div>

          <div className="grid min-w-0 flex-1 grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-4 sm:gap-x-8 lg:max-w-[640px] lg:justify-end">
            <LinkColumn id="footer-product" title="Product" links={productLinks} />
            <LinkColumn id="footer-company" title="Company" links={companyLinks} />
            <LinkColumn id="footer-social" title="Social" links={socialLinks} />
            <LinkColumn id="footer-legal" title="Legal" links={legalLinks} />
          </div>
        </div>
      </footer>
    </div>
  );
}
