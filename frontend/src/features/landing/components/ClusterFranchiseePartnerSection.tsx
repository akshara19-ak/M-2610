import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";

export function ClusterFranchiseePartnerSection() {
  return (
    <section
      id="cluster-franchise-partner-network"
      aria-labelledby="franchise-partner-heading"
      className="scroll-mt-20 border-t border-b border-black/80 bg-[#0A0A0A] text-white py-14 sm:py-16 lg:py-20 relative overflow-hidden"
    >
      {/* Subtle ambient warm glow in the background to complement Meyveda brand */}
      <div 
        className="pointer-events-none absolute -top-24 -left-24 size-96 rounded-full bg-[#E67230]/10 blur-3xl"
        aria-hidden="true" 
      />
      <div 
        className="pointer-events-none absolute -bottom-24 -right-24 size-96 rounded-full bg-[#E67230]/10 blur-3xl"
        aria-hidden="true" 
      />

      <div className="relative mx-auto max-w-[1280px] px-5 sm:px-8 lg:px-12">
        {/* Header & Primary Action CTA Block */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 sm:gap-8">
          <div className="max-w-3xl">
            {/* Section Eyebrow Label */}
            <p className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#FF8542] mb-2.5">
              CLUSTER MANAGEMENT PARTNER
            </p>

            {/* Headline */}
            <h2
              id="franchise-partner-heading"
              className="text-3xl sm:text-4xl lg:text-[44px] font-bold tracking-tight text-white leading-[1.15]"
              style={{ fontFamily: 'var(--font-display), "Cormorant Garamond", Georgia, serif' }}
            >
              Bring care closer to your community.
            </h2>

            {/* Description */}
            <p className="mt-3 text-sm sm:text-base lg:text-[17px] leading-relaxed text-[#D1D5DB] max-w-2xl">
              The Meyveda ecosystem bridges traditional medical wisdom with cutting-edge digital infrastructure. While our technology layer empowers independent AYUSH practitioners to optimize their clinical operations, our Cluster Management Partners (CMPs) serve as the vital physical anchor in every territory.
            </p>
          </div>

          {/* Primary Action Button */}
          <div className="shrink-0 pt-2 lg:pt-0">
            <Link
              to="/cluster-franchise"
              className="group inline-flex h-12 sm:h-13 items-center justify-center gap-2 rounded-lg bg-[#E67230] px-6 sm:px-7 text-sm sm:text-base font-bold text-white shadow-[0_4px_20px_rgba(230,114,48,0.35)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#F07A38] hover:shadow-[0_8px_28px_rgba(230,114,48,0.5)] active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF8542] focus-visible:ring-offset-2 focus-visible:ring-offset-black"
            >
              <span>Become a CMP</span>
              <ArrowUpRight className="size-4 shrink-0 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
