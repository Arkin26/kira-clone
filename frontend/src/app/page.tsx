import { HeroSection } from "@/components/HeroSection";
import { Navbar } from "@/components/Navbar";
import { ValuesTokenSectionsGroup } from "@/components/ValuesTokenSectionsGroup";

export default function HomePage() {
  return (
    <div className="min-h-screen max-w-full overflow-x-hidden bg-[#020202]">
      <Navbar />
      <main>
        <HeroSection />
        <ValuesTokenSectionsGroup />

        <section
          id="how-it-works"
          className="mx-auto max-w-6xl scroll-mt-24 border-t border-white/[0.06] px-4 py-20 sm:px-6 lg:px-8"
        >
          <h2 className="font-mulish text-2xl font-semibold text-white">How it Works</h2>
          <p className="mt-3 max-w-2xl text-white/50">
            Create an intent, sign a SOL transfer in your wallet, and let the backend finalize
            verification against Devnet — no custody, no shared secrets.
          </p>
        </section>

        <section
          id="plans"
          className="mx-auto max-w-6xl scroll-mt-24 border-t border-white/[0.06] px-4 py-20 sm:px-6 lg:px-8"
        >
          <h2 className="font-mulish text-2xl font-semibold text-white">Plans</h2>
          <p className="mt-3 text-white/45">Pricing placeholder — tie to your launch tiers.</p>
        </section>

        <section
          id="affiliate"
          className="mx-auto max-w-6xl scroll-mt-24 border-t border-white/[0.06] px-4 py-20 sm:px-6 lg:px-8"
        >
          <h2 className="font-mulish text-2xl font-semibold text-white">Affiliate</h2>
          <p className="mt-3 text-white/45">Partner program placeholder.</p>
        </section>

        <section
          id="support"
          className="mx-auto max-w-6xl scroll-mt-24 border-t border-white/[0.06] px-4 py-20 sm:px-6 lg:px-8"
        >
          <h2 className="font-mulish text-2xl font-semibold text-white">Support</h2>
          <p className="mt-3 text-white/45">Help center &amp; contact placeholder.</p>
        </section>
      </main>

      <footer className="border-t border-white/[0.06] py-10 text-center text-xs text-white/35">
        © {new Date().getFullYear()} K-INTENT · Devnet demo
      </footer>
    </div>
  );
}
