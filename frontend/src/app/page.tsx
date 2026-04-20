import { HeroSection } from "@/components/HeroSection";
import { MarketingFooter } from "@/components/MarketingFooter";
import { Navbar } from "@/components/Navbar";
import { ValuesTokenSectionsGroup } from "@/components/ValuesTokenSectionsGroup";

export default function HomePage() {
  return (
    <div className="min-h-screen max-w-full overflow-x-hidden bg-[#020202]">
      <Navbar />
      <main>
        <HeroSection />
        <ValuesTokenSectionsGroup />
      </main>
      <MarketingFooter />
    </div>
  );
}
