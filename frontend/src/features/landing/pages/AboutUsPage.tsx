import { LandingNavbar } from "../components/LandingNavbar";
import { LandingFooter } from "../components/LandingFooter";
import { useState } from "react";
import { Link } from "@tanstack/react-router";
import meyvedaLogo2 from "@/assets/MEY_VEDA Logo2.png";
import clinicianPartnerImg from "@/assets/image03.jpeg";
import {
  ArrowRight,
  ShieldCheck,
  Building2,
  Award,
  CheckCircle2,
  Compass,
  Scale,
  Boxes,
  ChevronRight,
  LineChart,
} from "lucide-react";

interface ImpactPillar {
  id: string;
  number: string;
  title: string;
  tagline: string;
  summary: string;
  bullets: string[];
  metricLabel: string;
  metricValue: string;
  icon: typeof ShieldCheck;
  highlightColor: string;
}

const IMPACT_PILLARS: ImpactPillar[] = [
  {
    id: "credibility",
    number: "01",
    title: "Eliminating the Credibility Gap",
    tagline: "Statutory Verification & National ABDM Gateway Integration",
    summary:
      "We elevate your professional identity with verified digital credentials, ensuring your traditional medical practice commands universal trust across the modern healthcare ecosystem.",
    bullets: [
      "completely quack-free network secured by 100% qualification verification",
      "Seamless integration with Ayushman Bharat Digital Mission (ABDM-HPR registry).",
      "No pay-to-play rankings, commercial advertising bias, or synthetic score inflation.",
      "Tamper-proof digital prescription signatures verified by statutory standards.",
    ],
    metricValue: "100%",
    metricLabel: "ABDM - Verified Registry",
    icon: ShieldCheck,
    highlightColor: "#E67230",
  },
  {
    id: "supply-chain",
    number: "02",
    title: "pharma supply chain",
    tagline: "Doctor-Supervised, Zero-Inventory Direct Formulation Fulfillment",
    summary:
      "We replace risky direct-to-consumer self-medication with an authentic, doctor-guided distribution model. Every prescribed classical medicine reaches the patient under clinical supervision, backed by authenticated batch monographs and heavy-metal testing.",
    bullets: [
      "Direct clinic-to-patient fulfillment: zero inventory burden or expired stock risk.",
      "Strict compliance with Pharmacopoeia Laboratory for Indian Medicines (PLIM) norms.",
      "Mandatory Certificate of Analysis (CoA) and heavy-metal assays for every listed batch.",
      "Traceable classical formulation lineages directly referenced to authoritative texts.",
    ],
    metricValue: "0%",
    metricLabel: "Clinic Inventory Burden",
    icon: Boxes,
    highlightColor: "#D86423",
  },
  {
    id: "real-world-evidence",
    number: "03",
    title: "Building Global Real-World Evidence (RWE)",
    tagline: "Longitudinal Outcomes & Classical Root-Cause Clinical Research",
    summary:
      "By standardizing clinical intake, constitutional (Prakriti) assessment, and longitudinal outcomes, we aggregate structured clinical evidence that bridges millennia of classical healing with modern peer-reviewed integrative medical science.",
    bullets: [
      "Standardized digital clinical intake matching classical AYUSH pathology (Samprapti).",
      "Longitudinal patient recovery tracking across chronic, lifestyle, and autoimmune care.",
      "Anonymized clinical data sets contributing to peer-reviewed AYUSH research registries.",
      "Structured documentation for ADR (Adverse Drug Reaction) pharmacovigilance reporting.",
    ],
    metricValue: "Global",
    metricLabel: "Integrative Medical Reach",
    icon: LineChart,
    highlightColor: "#BE561A",
  },
  {
    id: "career-empowerment",
    number: "04",
    title: "Economic & Career Empowerment",
    tagline: "Enterprise Software & Compliant Practice Scale for Independent Doctors",
    summary:
      "We provide independent practitioners and physical clinics with enterprise-grade clinical software, multi-center scheduling, and transparent practice revenue models — removing commercial marketing burdens and middleman exploitation.",
    bullets: [
      "Zero referral commissions: doctors maintain 100% clinical and financial independence.",
      "Integrated Virtual Clinic with teleconsultation, e-prescriptions, and AI clinical support.",
      "Cluster co-working clinic network and district territory fulfillment infrastructure.",
      "Multi-center calendar coordination, automated patient follow-ups, and billing.",
    ],
    metricValue: "100%",
    metricLabel: "Clinical Autonomy",
    icon: Building2,
    highlightColor: "#AE4E18",
  },
];

const OPERATIONS_LAYERS = [
  {
    title: "The Base:",
    description: "A Trusted Foundation for Traditional Practice",
  },
  {
    title: "The Essential:",
    description: "The Vital Toolkit for Clinical Excellence",
  },
  {
    title: "The Gateway:",
    description: "Your Connection to a Thriving Network",
  },
  {
    title: "The Core:",
    description: "The Central Engine for Enterprise Expansion",
  },
];

export function AboutUsPage() {
  const [activePillarId, setActivePillarId] = useState<string>("credibility");

  const activePillar =
    IMPACT_PILLARS.find((p) => p.id === activePillarId) ?? IMPACT_PILLARS[0];
  const ActiveIcon = activePillar.icon;

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#111111] antialiased selection:bg-[#E67230] selection:text-white flex flex-col justify-between">
      {/* -------------------------------------------------------------------- */}
      {/* 1. BRAND NAVIGATION HEADER                                           */}
      {/* -------------------------------------------------------------------- */}
      <LandingNavbar activePath="/about" />

      {/* -------------------------------------------------------------------- */}
      {/* MAIN CONTENT CONTAINER                                               */}
      {/* -------------------------------------------------------------------- */}
      <main className="flex-1">
        {/* ================================================================== */}
        {/* 2. HERO SECTION — THE MODERN ERA OF AYUSH                           */}
        {/* ================================================================== */}
        <section className="relative overflow-hidden border-b border-[#EBE7DF] bg-[#FAF9F6] py-16 sm:py-24 lg:py-28">
          <div className="relative mx-auto max-w-[1216px] px-5 sm:px-8 lg:px-12 text-center">
            {/* Clean Section Eyebrow */}
            <p className="mb-3 text-xs sm:text-sm font-bold uppercase tracking-widest text-[#E67230]">
              The modern era of “Traditional Medicine System”
            </p>

            {/* Main Hero Headline */}
            <h1
              className="text-[38px] sm:text-[50px] lg:text-[60px] xl:text-[66px] font-bold tracking-tight text-[#111111] leading-[1.08] text-balance max-w-4xl mx-auto"
              style={{ fontFamily: 'var(--font-display), "Cormorant Garamond", Georgia, serif' }}
            >
              Operating System for <br className="hidden sm:inline" />
              <span className="text-[#E67230]">AYUSH Practitioners</span>
            </h1>

            {/* Sub-headline */}
            <p className="mx-auto mt-5 max-w-3xl text-lg sm:text-xl lg:text-[22px] leading-relaxed text-[#444444] font-medium">
              21st-Century Modern Assistance for India’s Oldest Sovereign Medicine System.
            </p>

            <p className="mx-auto mt-3 max-w-2xl text-sm sm:text-base text-[#666666] leading-relaxed">
              Meyveda equips independent AYUSH practitioners with verified digital identities, seamless zero-inventory logistics, and the foundational clinical infrastructure needed to scale their daily practice.
            </p>

            {/* Action Buttons */}
            <div className="mt-8 sm:mt-10 flex flex-wrap items-center justify-center gap-3.5">
              <a
                href="#who-we-are"
                className="group relative inline-flex h-12 items-center justify-center gap-2 rounded-md bg-[#E67230] px-8 text-sm font-bold text-white shadow-[0_4px_16px_-4px_rgba(230,114,48,0.4)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#D15F1F] hover:shadow-[0_8px_24px_-4px_rgba(230,114,48,0.5)] active:translate-y-0 active:shadow-sm"
              >
                <span>Learn Our Story</span>
                <ChevronRight className="size-4 transition-transform duration-200 group-hover:translate-x-1" />
              </a>

              <Link
                to="/"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-md border border-[#EBE7DF] bg-white px-7 text-sm font-semibold text-[#111111] shadow-none transition-all duration-200 hover:border-[#E67230]/40 hover:bg-[#FAF9F6] hover:text-[#111111]"
              >
                <span>Explore Doctor Platform</span>
                <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* ================================================================== */}
        {/* 3. WHO WE ARE: YOUR CLINICIAN-FIRST PARTNER                        */}
        {/* ================================================================== */}
        <section id="who-we-are" className="py-16 sm:py-24 border-b border-[#EBE7DF] bg-white">
          <div className="mx-auto max-w-[1320px] px-5 sm:px-8 lg:px-12">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
              {/* Left Column: Editorial Text & Charter Callout */}
              <div className="lg:col-span-7 space-y-6">
                <div>
                  <p className="mb-2.5 text-xs font-bold uppercase tracking-wider text-[#E67230]">
                    WHO WE ARE
                  </p>
                  <h2
                    className="text-balance text-3xl font-extrabold leading-[1.14] tracking-tight text-[#111111] sm:text-4xl lg:text-[42px]"
                    style={{ fontFamily: 'var(--font-display), "Cormorant Garamond", Georgia, serif' }}
                  >
                    Your Clinician-First Partner
                  </h2>
                </div>

                <p className="text-base sm:text-lg text-[#555555] leading-relaxed">
                  <strong className="font-bold text-[#111111]">Meyveda Ayush Pvt Ltd</strong> is an
                  AYUSH-focused practitioner enablement ecosystem and Phygital practice toolkit.
                  Rather than positioning as an abstract algorithm or commercial middleman, Meyveda serves as a
                  grounded, clinician-first partner designed to help registered AYUSH practitioners (Vaidyas)
                  launch, operate, and scale their careers with absolute professional dignity.
                </p>

                {/* The Clean Division of Responsibility Charter Callout */}
                <div className="rounded-xl border-l-4 border-[#E67230] border-y border-r border-[#EBE7DF] bg-[#FAF9F6] p-6 sm:p-7 space-y-3">
                  <p className="text-xs font-bold uppercase tracking-wider text-[#E67230] flex items-center gap-1.5">
                    <Scale className="size-3.5" />
                    <span>The Meyveda Practice Charter</span>
                  </p>
                  <blockquote className="text-base sm:text-lg italic font-medium text-[#111111] leading-relaxed">
                    &ldquo;We establish a clean division of responsibility: every non-medical, operational,
                    administrative, and logistical task stays with us, leaving all clinical decisions and patient
                    care entirely in your hands.&rdquo;
                  </blockquote>
                  <p className="text-xs font-medium text-[#777777]">
                    — Meyveda Clinician Enablement Commitment
                  </p>
                </div>
              </div>

              {/* Right Column: Full Image Showcase */}
              <div className="lg:col-span-5 flex items-center justify-center py-4 lg:py-0">
                <div className="relative w-full max-w-[440px] lg:max-w-[480px] overflow-hidden rounded-3xl border border-[#EBE7DF] bg-white shadow-[0_12px_40px_-12px_rgba(230,114,48,0.12)] group transition-all duration-300 hover:border-[#E67230]/40 hover:shadow-[0_16px_48px_-12px_rgba(230,114,48,0.2)]">
                  <img
                    src={clinicianPartnerImg}
                    alt="Meyveda Clinician-First Partner"
                    className="w-full h-auto object-cover select-none transition-transform duration-500 group-hover:scale-102 block"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================================================================== */}
        {/* 4. OPERATIONS OPTIMIZED: POWERING THE FUTURE                       */}
        {/* ================================================================== */}
        <section className="border-b border-[#EBE7DF] bg-[#FAF9F6] py-14 sm:py-18">
          <div className="mx-auto max-w-[1320px] px-5 sm:px-8 lg:px-12">
            <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12">
              <p className="text-xs font-bold uppercase tracking-wider text-[#E67230] mb-2">
                OPERATIONS OPTIMIZED
              </p>
              <h2
                className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#111111] tracking-tight"
                style={{ fontFamily: 'var(--font-display), "Cormorant Garamond", Georgia, serif' }}
              >
                Powering the Future
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
              {OPERATIONS_LAYERS.map((layer) => (
                <div
                  key={layer.title}
                  className="rounded-2xl border border-[#EBE7DF] bg-white p-6 shadow-2xs transition-all duration-200 hover:border-[#E67230]/40 hover:-translate-y-0.5"
                >
                  <p className="text-base font-bold text-[#E67230] mb-1.5">
                    {layer.title}
                  </p>
                  <p className="text-sm font-medium text-[#111111] leading-relaxed">
                    {layer.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ================================================================== */}
        {/* 5. STRATEGIC DIRECTIVE: OUR VISION & MISSION                       */}
        {/* ================================================================== */}
        <section className="py-16 sm:py-24 border-b border-[#EBE7DF] bg-white">
          <div className="mx-auto max-w-[1320px] px-5 sm:px-8 lg:px-12">
            <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-14">
              <p className="text-xs font-bold uppercase tracking-wider text-[#E67230] mb-2.5">
                STRATEGIC DIRECTIVE
              </p>
              <h2
                className="text-balance text-3xl font-extrabold leading-[1.14] tracking-tight text-[#111111] sm:text-4xl lg:text-[42px]"
                style={{ fontFamily: 'var(--font-display), "Cormorant Garamond", Georgia, serif' }}
              >
                Our Vision &amp; Mission
              </h2>
              <p className="mt-3 text-base text-[#6B6B6B] leading-relaxed">
                Rooted in authentic classical texts, elevated by enterprise clinical engineering.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">
              {/* Vision Card */}
              <div className="rounded-2xl border border-[#EBE7DF] bg-[#FAF9F6] p-7 sm:p-9 transition-all duration-200 hover:border-[#E67230]/40 flex flex-col justify-between">
                <div>
                  <div className="flex size-12 items-center justify-center rounded-xl bg-white border border-[#EBE7DF] text-[#E67230] mb-6">
                    <Compass className="size-6" />
                  </div>

                  <span className="text-xs font-bold uppercase tracking-wider text-[#E67230] block mb-2">
                    Long-Term Aspiration
                  </span>

                  <h3
                    className="text-2xl sm:text-3xl font-bold text-[#111111] tracking-tight mb-4"
                    style={{ fontFamily: 'var(--font-display), "Cormorant Garamond", Georgia, serif' }}
                  >
                    Our Vision
                  </h3>

                  <p className="text-base sm:text-lg leading-relaxed text-[#555555]">
                    To build the sovereign operational infrastructure for global AYUSH, establishing
                    personalized, preventive, and root-cause traditional healing as an accessible primary
                    pillar of healthcare worldwide.
                  </p>
                </div>
              </div>

              {/* Mission Card */}
              <div className="rounded-2xl border border-[#EBE7DF] bg-[#FAF9F6] p-7 sm:p-9 transition-all duration-200 hover:border-[#E67230]/40 flex flex-col justify-between">
                <div>
                  <div className="flex size-12 items-center justify-center rounded-xl bg-white border border-[#EBE7DF] text-[#E67230] mb-6">
                    <Award className="size-6" />
                  </div>

                  <span className="text-xs font-bold uppercase tracking-wider text-[#E67230] block mb-2">
                    Actionable Mandate
                  </span>

                  <h3
                    className="text-2xl sm:text-3xl font-bold text-[#111111] tracking-tight mb-4"
                    style={{ fontFamily: 'var(--font-display), "Cormorant Garamond", Georgia, serif' }}
                  >
                    Our Mission
                  </h3>

                  <p className="text-base sm:text-lg leading-relaxed text-[#555555]">
                    To empower qualified AYUSH practitioners with modern, accessible clinical tools, connect
                    patients with transparent, protocol-based care, and ensure that every formulation
                    prescribed traces its lineage back to authenticated classical texts and strict laboratory
                    quality standards.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================================================================== */}
        {/* 6. MEASURABLE TRANSFORMATION (DELIVERABLES SHOWCASE)                */}
        {/* ================================================================== */}
        <section id="impact" className="py-16 sm:py-24 border-b border-[#EBE7DF] bg-[#FAF9F6]">
          <div className="mx-auto max-w-[1320px] px-5 sm:px-8 lg:px-12">
            <div className="max-w-3xl mb-10 sm:mb-12">
              <p className="mb-2.5 text-xs font-bold uppercase tracking-wider text-[#E67230]">
                MEASURABLE TRANSFORMATION
              </p>
              <h2
                className="text-balance text-3xl font-extrabold leading-[1.14] tracking-tight text-[#111111] sm:text-4xl lg:text-[42px]"
                style={{ fontFamily: 'var(--font-display), "Cormorant Garamond", Georgia, serif' }}
              >
                The Impact We Deliver
              </h2>
              <p className="mt-3 text-base sm:text-lg text-[#555555] leading-relaxed">
                Traditional medicine touches over a billion lives, yet qualified Vaidyas often shoulder
                operational friction that distracts from patient healing. Meyveda delivers measurable
                transformation across clinical practice and supply infrastructure.
              </p>
            </div>

            {/* Interactive Pillar Selector Tabs */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
              {IMPACT_PILLARS.map((pillar) => {
                const isSelected = activePillarId === pillar.id;
                const Icon = pillar.icon;
                return (
                  <button
                    key={pillar.id}
                    type="button"
                    onClick={() => setActivePillarId(pillar.id)}
                    className={`rounded-xl border p-4 sm:p-5 text-left transition-all duration-200 cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? "border-[#E67230] bg-white shadow-sm ring-1 ring-[#E67230]"
                        : "border-[#EBE7DF] bg-white/70 hover:bg-white hover:border-[#E67230]/40"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-mono text-xs font-bold text-[#E67230]">
                          {pillar.number}
                        </span>
                        <div
                          className={`size-8 rounded-lg flex items-center justify-center ${
                            isSelected
                              ? "bg-[#E67230] text-white"
                              : "bg-[#FAF9F6] text-[#777777] border border-[#EBE7DF]"
                          }`}
                        >
                          <Icon className="size-4" />
                        </div>
                      </div>
                      <h4 className="text-sm sm:text-base font-bold text-[#111111] leading-snug">
                        {pillar.title}
                      </h4>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Active Pillar Detail Card */}
            <div className="rounded-2xl border border-[#EBE7DF] bg-white p-7 sm:p-10 shadow-xs">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <div className="lg:col-span-8 space-y-5">
                  <div className="space-y-2">
                    <span className="font-mono text-xs font-bold text-[#E67230] uppercase tracking-wider">
                      Deliverable {activePillar.number} · {activePillar.tagline}
                    </span>
                    <h3
                      className="text-2xl sm:text-3xl font-extrabold text-[#111111] tracking-tight leading-tight"
                      style={{ fontFamily: 'var(--font-display), "Cormorant Garamond", Georgia, serif' }}
                    >
                      {activePillar.title}
                    </h3>
                  </div>

                  <p className="text-base sm:text-lg leading-relaxed text-[#555555]">
                    {activePillar.summary}
                  </p>

                  <div className="pt-2">
                    <p className="text-xs font-bold uppercase tracking-wider text-[#111111] mb-3">
                      Key Deliverables &amp; Safeguards
                    </p>
                    <ul className="space-y-2.5">
                      {activePillar.bullets.map((b, idx) => (
                        <li key={idx} className="flex items-start gap-2.5 text-sm text-[#444444]">
                          <CheckCircle2 className="size-4 text-[#E67230] shrink-0 mt-0.5" />
                          <span className="leading-relaxed">{b}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="lg:col-span-4 flex flex-col gap-4">
                  <div className="rounded-xl border border-[#EBE7DF] bg-[#FAF9F6] p-6 text-center space-y-2">
                    <div className="flex size-11 items-center justify-center rounded-xl bg-white border border-[#EBE7DF] text-[#E67230] mx-auto mb-2">
                      <ActiveIcon className="size-5.5" />
                    </div>
                    <span className="text-3xl sm:text-4xl font-extrabold text-[#E67230] font-serif block">
                      {activePillar.metricValue}
                    </span>
                    <p className="text-xs font-bold uppercase tracking-wider text-[#111111]">
                      {activePillar.metricLabel}
                    </p>
                    <p className="text-xs text-[#777777] pt-1">
                      Statutory assurance built into every layer of the Meyveda ecosystem.
                    </p>
                  </div>

                  <div className="rounded-xl border border-[#EBE7DF] bg-[#FAF9F6] p-5 text-center space-y-3">
                    <p className="text-xs font-bold text-[#111111]">
                      Ready to experience modern AYUSH practice management?
                    </p>
                    <Link
                      to="/register"
                      className="group relative inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-[#E67230] text-xs font-bold text-white shadow-[0_4px_16px_-4px_rgba(230,114,48,0.4)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#D15F1F] active:translate-y-0"
                    >
                      <span>Join as Practitioner</span>
                      <ArrowRight className="size-3.5 transition-transform duration-200 group-hover:translate-x-1" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================================================================== */}
        {/* 7. CALL TO ACTION BANNER                                           */}
        {/* ================================================================== */}
        <section className="border-t border-[#EBE7DF] bg-white py-16 sm:py-22">
          <div className="mx-auto max-w-[1080px] px-5 sm:px-8 text-center">
            <div className="rounded-2xl border border-[#EBE7DF] bg-[#FAF9F6] p-8 sm:p-12 lg:p-16 space-y-6">
              <p className="text-xs font-bold uppercase tracking-wider text-[#E67230]">
                START YOUR CLINICAL JOURNEY
              </p>

              <h2
                className="text-balance text-3xl sm:text-4xl lg:text-[42px] font-extrabold text-[#111111] tracking-tight leading-tight"
                style={{ fontFamily: 'var(--font-display), "Cormorant Garamond", Georgia, serif' }}
              >
                Reinvent Your AYUSH Practice Today
              </h2>

              <p className="mx-auto max-w-xl text-base sm:text-lg text-[#555555] leading-relaxed">
                Connect with verified colleagues, zero-inventory medicine supply, and ABDM-aligned digital tools.
                All operational friction stays with us — your patients stay with you.
              </p>

              <div className="flex flex-wrap items-center justify-center gap-3.5 pt-2">
                <Link
                  to="/register"
                  className="group relative inline-flex h-12 items-center justify-center gap-2 rounded-md bg-[#E67230] px-7 sm:px-8 text-sm sm:text-base font-bold text-white shadow-[0_4px_16px_-4px_rgba(230,114,48,0.4)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#D15F1F] hover:shadow-[0_8px_24px_-4px_rgba(230,114,48,0.5)] active:translate-y-0 active:shadow-sm"
                >
                  <span>Register as Practitioner</span>
                  <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-1" />
                </Link>

                <Link
                  to="/contact"
                  className="inline-flex h-12 items-center justify-center rounded-md border border-[#EBE7DF] bg-white px-7 sm:px-8 text-sm sm:text-base font-semibold text-[#111111] shadow-none transition-all duration-200 hover:border-[#E67230]/40 hover:bg-[#FAF9F6] hover:text-[#111111]"
                >
                  Contact Our Team
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* -------------------------------------------------------------------- */}
      {/* 8. FOOTER                                                            */}
      {/* -------------------------------------------------------------------- */}
      <LandingFooter />
    </div>
  );
}
export default AboutUsPage;
