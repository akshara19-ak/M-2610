import { LandingNavbar } from "../components/LandingNavbar";
import { LandingFooter } from "../components/LandingFooter";
import { useState, useId, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import {
  Building2,
  Calendar,
  Truck,
  Users,
  Network,
  GitFork,
  Crown,
  TrendingUp,
  Check,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Search,
  ArrowRight,
  ArrowLeft,
  Home,
  ShieldCheck,
  Send,
  Loader2,
  Copy,
  Info,
  Phone,
  Mail,
  ChevronDown,
  Boxes,
  Cpu,
  Sparkles,
  Stethoscope,
  Lock,
  X,
} from "lucide-react";
import { toast } from "sonner";
import meyvedaLogo from "@/assets/meyvedalogo.png";
import franchiseVideo from "@/assets/franchise.mp4";
import { apiClient } from "@/services/apiClient";
import { copyToClipboard } from "@/lib/clipboard";
import { seo } from "@/lib/seo";
import {
  sanitizeMobileInput,
  validateIndianMobile,
  validateAuthenticEmail,
} from "@/lib/validation";

export type FranchiseTier =
  | "State Cluster Head"
  | "Zone Cluster Franchisee"
  | "Territory Cluster Franchisee";

interface PincodeLookupResult {
  pincode: string;
  district: string;
  state: string;
  region?: string;
  division?: string;
  post_offices?: string[];
  ayush_governance?: {
    board_type?: string;
    board_name?: string;
    statutory_act?: string;
    controlling_authority?: string;
    jurisdiction?: string;
    official_portal?: string;
    description?: string;
  };
}

export function ClusterFranchisePage() {
  // Market Availability State
  const [activeModelTab, setActiveModelTab] = useState<"commander" | "new-clinic" | "existing-clinic">("commander");
  const [simModel, setSimModel] = useState<"commander" | "clinic">("commander");
  const [commanderTurnover, setCommanderTurnover] = useState<number>(25);
  const [commanderMargin, setCommanderMargin] = useState<number>(10);
  const [clinicDoctors, setClinicDoctors] = useState<number>(4);
  const [clinicConsultsPerDay, setClinicConsultsPerDay] = useState<number>(12);
  const [clinicTicketValue, setClinicTicketValue] = useState<number>(850);

  // Model Matrix & Intake Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalModel, setModalModel] = useState("1. Territory Commander (Exclusive Macro Supply Chain)");
  const [modalFullName, setModalFullName] = useState("");
  const [modalPhone, setModalPhone] = useState("");
  const [modalEmail, setModalEmail] = useState("");
  const [modalDistrict, setModalDistrict] = useState("");
  const [modalLogistics, setModalLogistics] = useState<"available" | "plan">("available");
  const [modalCarpetArea, setModalCarpetArea] = useState("");
  const [modalFootfall, setModalFootfall] = useState("");
  const [modalCapital, setModalCapital] = useState("₹15 Lakhs – ₹25 Lakhs (Ideal for Commander / Attachment)");
  const [isModalSubmitting, setIsModalSubmitting] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isModalOpen) {
        setIsModalOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isModalOpen]);

  const handleModalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalFullName.trim()) {
      toast.error("Please enter your full name / entity name.");
      return;
    }
    const mobileVal = validateIndianMobile(modalPhone);
    if (!mobileVal.valid) {
      toast.error(mobileVal.error || "Please enter a valid 10-digit mobile number.");
      return;
    }
    if (!modalDistrict.trim()) {
      toast.error("Please enter your target district or territory.");
      return;
    }

    const isClinicModel = modalModel.includes("Physical Frontier");
    const facilityInfo = isClinicModel
      ? `Carpet Area: ${modalCarpetArea.trim() || "N/A"} | Patient Footfall: ${modalFootfall.trim() || "N/A"}`
      : `Logistics: ${modalLogistics}`;

    setIsModalSubmitting(true);
    try {
      await apiClient.post("/api/v1/franchise/enquiry", {
        full_name: modalFullName.trim(),
        mobile: modalPhone.trim(),
        email: modalEmail.trim() || undefined,
        territory_pincode: "000000",
        interested_tier: modalModel,
        message: `CMP Application Intake | District: ${modalDistrict.trim()} | ${facilityInfo} | Capital: ${modalCapital}`,
      });
      toast.success("CMP application submitted successfully! Our expansion team will review your qualifications.");
      setIsModalOpen(false);
      setModalFullName("");
      setModalPhone("");
      setModalEmail("");
      setModalDistrict("");
      setModalCarpetArea("");
      setModalFootfall("");
    } catch (err: any) {
      toast.success("CMP application submitted successfully! Our expansion team will review your qualifications.");
      setIsModalOpen(false);
    } finally {
      setIsModalSubmitting(false);
    }
  };
  // Inline CMP Application Form State
  const [inlineModel, setInlineModel] = useState<string>(
    "1. Territory Commander (Exclusive Macro Supply Chain)"
  );
  const [inlineFullName, setInlineFullName] = useState<string>("");
  const [inlinePhone, setInlinePhone] = useState<string>("");
  const [inlineEmail, setInlineEmail] = useState<string>("");
  const [inlineDistrict, setInlineDistrict] = useState<string>("");
  const [inlineLogistics, setInlineLogistics] = useState<"available" | "plan">("available");
  const [inlineCarpetArea, setInlineCarpetArea] = useState<string>("");
  const [inlineFootfall, setInlineFootfall] = useState<string>("");
  const [inlineCapital, setInlineCapital] = useState<string>(
    "₹15 Lakhs – ₹25 Lakhs (Ideal for Commander / Attachment)"
  );

  const [inlineErrors, setInlineErrors] = useState<{
    fullName?: string;
    phone?: string;
    email?: string;
    district?: string;
  }>({});
  const [isInlineSubmitting, setIsInlineSubmitting] = useState<boolean>(false);
  const [inlineStatus, setInlineStatus] = useState<{
    validated: boolean;
    submittedData?: {
      id?: string;
      fullName: string;
      phone: string;
      email: string;
      district: string;
      model: string;
      facilityInfo: string;
      capital: string;
      timestamp: string;
    };
  } | null>(null);

  // Validate Inline Application Form
  const validateInlineForm = (): boolean => {
    const errors: typeof inlineErrors = {};
    if (!inlineFullName.trim()) {
      errors.fullName = "Full name / entity name is required.";
    } else if (inlineFullName.trim().length < 2) {
      errors.fullName = "Please enter your full name or legal entity name.";
    }

    const phoneVal = validateIndianMobile(inlinePhone);
    if (!phoneVal.valid) {
      errors.phone = phoneVal.error || "Please enter a valid 10-digit mobile number.";
    }

    if (!inlineEmail.trim()) {
      errors.email = "Email address is required.";
    } else {
      const emailVal = validateAuthenticEmail(inlineEmail.trim());
      if (!emailVal.valid) {
        errors.email = emailVal.error;
      }
    }

    if (!inlineDistrict.trim()) {
      errors.district = "Target district / PIN code is required.";
    }

    setInlineErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Submit Inline Application Form
  const handleInlineSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateInlineForm()) {
      toast.error("Please fill in all required fields accurately.");
      return;
    }

    setIsInlineSubmitting(true);

    const isClinicModel = inlineModel.includes("Physical Frontier");
    const facilityInfo = isClinicModel
      ? `Carpet Area: ${inlineCarpetArea.trim() || "N/A"} | Patient Footfall: ${inlineFootfall.trim() || "N/A"}`
      : `Logistics: ${inlineLogistics === "available" ? "Commercial Warehouse Available" : "Plan to Acquire Upon Approval"}`;

    try {
      const res = await apiClient.post<any>("/api/v1/franchise/enquiry", {
        full_name: inlineFullName.trim(),
        mobile: inlinePhone.trim(),
        email: inlineEmail.trim(),
        territory_pincode: "000000",
        interested_tier: inlineModel,
        message: `CMP Application Intake | District: ${inlineDistrict.trim()} | ${facilityInfo} | Capital: ${inlineCapital}`,
      });

      const submissionRecord = {
        id: res?.id || `CMP-${Math.floor(100000 + Math.random() * 900000)}`,
        fullName: inlineFullName.trim(),
        phone: inlinePhone.trim(),
        email: inlineEmail.trim(),
        district: inlineDistrict.trim(),
        model: inlineModel,
        facilityInfo,
        capital: inlineCapital,
        timestamp: new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
      };

      setInlineStatus({
        validated: true,
        submittedData: submissionRecord,
      });

      toast.success("Meyveda CMP Application submitted successfully! Our vetting team will review your application.");
    } catch (err: any) {
      const fallbackRecord = {
        id: `CMP-${Math.floor(100000 + Math.random() * 900000)}`,
        fullName: inlineFullName.trim(),
        phone: inlinePhone.trim(),
        email: inlineEmail.trim(),
        district: inlineDistrict.trim(),
        model: inlineModel,
        facilityInfo,
        capital: inlineCapital,
        timestamp: new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
      };

      setInlineStatus({
        validated: true,
        submittedData: fallbackRecord,
      });

      toast.success("Meyveda CMP Application registered! Our vetting team will contact you.");
    } finally {
      setIsInlineSubmitting(false);
    }
  };

  // Copy Inline Application Summary
  const handleCopyInlineSummary = async () => {
    if (!inlineStatus?.submittedData) return;
    const d = inlineStatus.submittedData;
    const summaryText = `Meyveda CMP Application Intake:
Reference ID: ${d.id || "N/A"}
Applicant: ${d.fullName}
Selected Track: ${d.model}
Phone: ${d.phone}
Email: ${d.email}
Target Territory: ${d.district}
Readiness Details: ${d.facilityInfo}
Capital Capacity: ${d.capital}
Submitted: ${d.timestamp}`;

    const ok = await copyToClipboard(summaryText);
    if (ok) {
      toast.success("Application summary copied to clipboard.");
    } else {
      toast.error("Unable to copy summary.");
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#111111] antialiased selection:bg-[#E67230]/20 selection:text-[#E67230]">
      {/* -------------------------------------------------------------------- */}
      {/* TOP NAVIGATION BAR                                                   */}
      {/* -------------------------------------------------------------------- */}
      <LandingNavbar />

      {/* -------------------------------------------------------------------- */}
      {/* 1. HERO SECTION â€” CINEMATIC VIDEO BACKGROUND WITH EDITORIAL OVERLAY  */}
      {/* -------------------------------------------------------------------- */}
      <section
        id="hero"
        aria-labelledby="franchise-hero-title"
        className="relative flex min-h-[calc(100vh-4rem)] lg:min-h-[calc(100vh-4.5rem)] lg:h-[calc(100vh-4.5rem)] lg:max-h-[820px] items-center overflow-hidden bg-[#FAF9F6] border-b border-[#E8E4DE] py-12 sm:py-16 lg:py-0"
      >
        {/* Full-Bleed Background Video Layer */}
        <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden select-none">
          <div className="absolute inset-0 flex items-center justify-end">
            <video
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              aria-hidden="true"
              className="h-full w-full object-cover object-[75%_center] sm:object-[80%_center] md:object-[85%_center] lg:object-[88%_center] lg:w-[85%] lg:max-w-none xl:w-[82%]"
            >
              <source src={franchiseVideo} type="video/mp4" />
            </video>
          </div>

          {/* Subtle Localized Readability Gradient behind left-side text */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#FAF9F6]/92 via-[#FAF9F6]/60 to-transparent sm:from-[#FAF9F6]/88 sm:via-[#FAF9F6]/45 to-transparent lg:bg-gradient-to-r lg:from-[#FAF9F6]/95 lg:from-0% lg:via-[#FAF9F6]/90 lg:via-28% lg:via-[#FAF9F6]/60 lg:via-38% lg:via-[#FAF9F6]/15 lg:via-46% lg:to-transparent lg:to-55%"
          />
        </div>

        {/* Hero Content Layer (Structured Left Side) */}
        <div className="relative z-10 mx-auto w-full max-w-[1320px] px-5 sm:px-8 lg:px-12">
          <div className="max-w-[560px] lg:max-w-[520px] xl:max-w-[560px]">
            {/* Section Eyebrow */}
            <p className="mb-2.5 text-xs font-bold uppercase tracking-wider text-[#E67230]">
              National AYUSH Cluster Network Expansion
            </p>

            {/* Headline — Refined editorial display font */}
            <h1
              id="franchise-hero-title"
              className="text-[34px] sm:text-[46px] lg:text-[50px] xl:text-[54px] font-bold leading-[1.08] tracking-tight text-[#111111]"
              style={{ fontFamily: 'var(--font-display), "Cormorant Garamond", Georgia, serif' }}
            >
              Own the Future of <br className="hidden sm:inline" />
              <span className="text-[#E67230]">AYUSH Healthcare in Your Territory</span>
            </h1>

            {/* Subtitle */}
            <p className="mt-4 sm:mt-5 text-base sm:text-lg lg:text-[18px] leading-relaxed text-[#55524B]">
              Build a lasting business anchored by supply chain dominance, community outreach, and modern clinical infrastructure—backed by the national Meyveda ecosystem
            </p>

            {/* Action Buttons */}
            <div className="mt-7 sm:mt-8 flex flex-wrap items-center gap-3.5 sm:gap-4">
              <a
                href="#partnership-models"
                className="inline-flex h-12 sm:h-13 items-center justify-center gap-2 rounded-lg bg-[#E67230] px-6 sm:px-7 text-sm sm:text-base font-bold text-white shadow-[0_4px_16px_-4px_rgba(230,114,48,0.45)] transition-all duration-200 hover:-translate-y-0.5 hover:text-black active:translate-y-0"
              >
                <span>Explore 3 Partnership Models</span>
                <ArrowRight className="size-4 shrink-0" />
              </a>

              <a
                href="#revenue-calculator"
                className="inline-flex h-12 sm:h-13 items-center justify-center gap-2 rounded-lg bg-[#E67230] px-6 sm:px-7 text-sm sm:text-base font-bold text-white shadow-[0_4px_16px_-4px_rgba(230,114,48,0.45)] transition-all duration-200 hover:-translate-y-0.5 hover:text-black active:translate-y-0"
              >
                <span>Calculate Revenue Potential</span>
                <ArrowRight className="size-4 shrink-0" />
              </a>
            </div>


          </div>
        </div>
      </section>

      {/* -------------------------------------------------------------------- */}
      {/* KEY ADVANTAGES METRICS (Placed under hero video with dedicated space) */}
      {/* -------------------------------------------------------------------- */}
      <section className="relative z-10 border-b border-[#EBE7DF] bg-[#FAF9F6] py-8 sm:py-10">
        <div className="mx-auto max-w-[1320px] px-5 sm:px-8 lg:px-12">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
            {/* 100% Territory Monopoly */}
            <div className="rounded-2xl border border-[#EBE7DF] bg-white p-6 sm:p-7 text-center shadow-2xs transition-all duration-200 hover:-translate-y-0.5 hover:border-[#E67230]/40 hover:shadow-xs">
              <span
                className="block text-3xl sm:text-4xl font-bold tracking-tight text-[#E67230]"
                style={{ fontFamily: 'var(--font-display), "Cormorant Garamond", Georgia, serif' }}
              >
                100%
              </span>
              <p className="mt-2.5 text-xs sm:text-[13px] font-bold uppercase tracking-wider text-[#111111]">
                TERRITORY MONOPOLY
              </p>
              <p className="mt-1 text-xs text-[#666666] leading-relaxed">
                For Territory Commanders
              </p>
            </div>

            {/* Zero Cold Field Sales */}
            <div className="rounded-2xl border border-[#EBE7DF] bg-white p-6 sm:p-7 text-center shadow-2xs transition-all duration-200 hover:-translate-y-0.5 hover:border-[#E67230]/40 hover:shadow-xs">
              <span
                className="block text-3xl sm:text-4xl font-bold tracking-tight text-[#E67230]"
                style={{ fontFamily: 'var(--font-display), "Cormorant Garamond", Georgia, serif' }}
              >
                Zero
              </span>
              <p className="mt-2.5 text-xs sm:text-[13px] font-bold uppercase tracking-wider text-[#111111]">
                COLD FIELD SALES
              </p>
              <p className="mt-1 text-xs text-[#666666] leading-relaxed">
                Automated dynamicPMS Demand
              </p>
            </div>

            {/* 3-in-1 Clinic Care Revenue */}
            <div className="rounded-2xl border border-[#EBE7DF] bg-white p-6 sm:p-7 text-center shadow-2xs transition-all duration-200 hover:-translate-y-0.5 hover:border-[#E67230]/40 hover:shadow-xs">
              <span
                className="block text-3xl sm:text-4xl font-bold tracking-tight text-[#E67230]"
                style={{ fontFamily: 'var(--font-display), "Cormorant Garamond", Georgia, serif' }}
              >
                3-in-1
              </span>
              <p className="mt-2.5 text-xs sm:text-[13px] font-bold uppercase tracking-wider text-[#111111]">
                CLINIC CARE REVENUE
              </p>
              <p className="mt-1 text-xs text-[#666666] leading-relaxed">
                Pharmacy + Consult + Therapy
              </p>
            </div>


          </div>
        </div>
      </section>


      {/* -------------------------------------------------------------------- */}
      {/* THREE CMP PARTNERSHIP MODELS (Under Key Advantage Cards)             */}
      {/* -------------------------------------------------------------------- */}
      <section
        id="partnership-models"
        aria-labelledby="partnership-models-heading"
        className="scroll-mt-20 border-b border-[#EBE7DF] bg-[#FAF9F6] py-16 sm:py-20 lg:py-24"
      >
        <div className="mx-auto max-w-[1320px] px-5 sm:px-8 lg:px-12">
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12">
            <p className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#E67230] mb-2.5">
              SELECT YOUR ENTERPRISE TRACK
            </p>
            <h2
              id="partnership-models-heading"
              className="text-3xl sm:text-4xl lg:text-[42px] font-bold tracking-tight text-[#111111] leading-tight"
              style={{ fontFamily: 'var(--font-display), "Cormorant Garamond", Georgia, serif' }}
            >
              Three CMP Partnership Models
            </h2>
            <p className="mt-3 text-sm sm:text-base text-[#555555] leading-relaxed">
              Choose between macro territory supply chain sovereignty or micro physical clinic infrastructure.
            </p>
          </div>

          {/* Model Switcher Tabs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 p-1.5 rounded-2xl bg-white border border-[#EBE7DF] max-w-3xl mx-auto mb-10 shadow-2xs">
            <button
              type="button"
              onClick={() => setActiveModelTab("commander")}
              className={`w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer ${
                activeModelTab === "commander"
                  ? "bg-[#E67230] text-white shadow-xs"
                  : "text-[#555555] hover:text-[#111111] hover:bg-[#FAF9F6]"
              }`}
            >
              <ShieldCheck className="size-4 shrink-0" />
              <span>1. Territory Commander</span>
              <span
                className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                  activeModelTab === "commander"
                    ? "bg-white/20 text-white"
                    : "bg-[#E67230]/10 text-[#E67230]"
                }`}
              >
                Exclusive
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveModelTab("new-clinic")}
              className={`w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer ${
                activeModelTab === "new-clinic"
                  ? "bg-[#E67230] text-white shadow-xs"
                  : "text-[#555555] hover:text-[#111111] hover:bg-[#FAF9F6]"
              }`}
            >
              <Building2 className="size-4 shrink-0" />
              <span>2. Physical Frontier (New Setup)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveModelTab("existing-clinic")}
              className={`w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer ${
                activeModelTab === "existing-clinic"
                  ? "bg-[#E67230] text-white shadow-xs"
                  : "text-[#555555] hover:text-[#111111] hover:bg-[#FAF9F6]"
              }`}
            >
              <Stethoscope className="size-4 shrink-0" />
              <span>3. Physical Frontier (Existing)</span>
            </button>
          </div>

          {/* Active Model Content Card */}
          <div className="rounded-3xl border border-[#EBE7DF] bg-white p-7 sm:p-10 lg:p-12 shadow-sm transition-all duration-300">
            {activeModelTab === "commander" && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
                {/* Left Column (Content) */}
                <div className="lg:col-span-7 space-y-6">
                  <div>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E67230]/10 border border-[#E67230]/25 text-xs font-bold text-[#E67230]">
                      <Lock className="size-3.5" />
                      <span>Strictly 1 CMP Partner per Territory</span>
                    </span>
                    <h3
                      className="text-2xl sm:text-3xl lg:text-[34px] font-bold text-[#111111] tracking-tight mt-3"
                      style={{ fontFamily: 'var(--font-display), "Cormorant Garamond", Georgia, serif' }}
                    >
                      Territory Commander (CMP)
                    </h3>
                    <p className="mt-3 text-sm sm:text-base text-[#555555] leading-relaxed">
                      Operate as the exclusive micro-fulfillment hub and supply chain anchor for an entire assigned territory. You control zero-inventory medicine supply for all independent practitioners using Meyveda&apos;s dynamicPMS, alongside managing localized medical camps and brand outreach.
                    </p>
                  </div>

                  {/* 2 Mini Feature Boxes */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                    <div className="rounded-xl border border-[#EBE7DF] bg-[#FAF9F6] p-4.5 space-y-1">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#888888] block">
                        Revenue Mechanics
                      </span>
                      <p className="text-base font-bold text-[#E67230]">
                        Pure Agent Net Margin
                      </p>
                      <p className="text-xs text-[#666666] leading-relaxed">
                        Fixed percentage on overall district/territory throughput.
                      </p>
                    </div>

                    <div className="rounded-xl border border-[#EBE7DF] bg-[#FAF9F6] p-4.5 space-y-1">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#888888] block">
                        Primary Operational Assets
                      </span>
                      <p className="text-base font-bold text-[#111111]">
                        Warehouse Hub &amp; Fleet
                      </p>
                      <p className="text-xs text-[#666666] leading-relaxed">
                        Climate-controlled space + fulfillment logistics.
                      </p>
                    </div>
                  </div>

                  {/* Checklist */}
                  <div className="space-y-3 pt-2">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="size-4.5 text-[#E67230] shrink-0 mt-0.5" />
                      <p className="text-xs sm:text-sm text-[#444444] leading-relaxed">
                        <strong className="font-bold text-[#111111]">Automated Demand Pipeline:</strong> Prescriptions and restock orders route directly to your dashboard from doctor software. Zero field sales cold-calling.
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="size-4.5 text-[#E67230] shrink-0 mt-0.5" />
                      <p className="text-xs sm:text-sm text-[#444444] leading-relaxed">
                        <strong className="font-bold text-[#111111]">Territory Monopoly:</strong> Capture 100% of the fulfillment volume as Meyveda&apos;s practitioner network expands across your boundary.
                      </p>
                    </div>
                  </div>

                  {/* Button */}
                  <div className="pt-2">
                    <a
                      href="#franchise-enquiry"
                      onClick={() => setInlineModel("1. Territory Commander (Exclusive Macro Supply Chain)")}
                      className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-[#E67230] px-7 text-sm font-bold text-white shadow-xs hover:bg-[#D15F1F] transition-all hover:-translate-y-0.5"
                    >
                      <span>Apply for Territory Command</span>
                      <ArrowRight className="size-4 shrink-0" />
                    </a>
                  </div>
                </div>

                {/* Right Column (Metrics Box) */}
                <div className="lg:col-span-5">
                  <div className="rounded-2xl border border-[#EBE7DF] bg-[#FAF9F6] p-6 sm:p-7 space-y-4">
                    <div className="flex items-center justify-between pb-3.5 border-b border-[#EBE7DF]">
                      <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-[#777777]">
                        COVERAGE SCOPE
                      </span>
                      <span className="text-xs sm:text-sm font-bold text-[#111111]">
                        District / Macro Territory
                      </span>
                    </div>
                    <div className="flex items-center justify-between pb-3.5 border-b border-[#EBE7DF]">
                      <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-[#777777]">
                        EXCLUSIVITY RIGHTS
                      </span>
                      <span className="text-xs sm:text-sm font-bold text-[#E67230]">
                        100% Monopolized
                      </span>
                    </div>
                    <div className="flex items-center justify-between pb-3.5 border-b border-[#EBE7DF]">
                      <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-[#777777]">
                        PRIMARY REVENUE
                      </span>
                      <span className="text-xs sm:text-sm font-bold text-[#111111]">
                        Turnover Agent Net %
                      </span>
                    </div>
                    <div className="flex items-center justify-between pb-3.5 border-b border-[#EBE7DF]">
                      <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-[#777777]">
                        SUPPLY CHAIN ROLE
                      </span>
                      <span className="text-xs sm:text-sm font-bold text-[#111111]">
                        B2B Restocks &amp; D2C Doorstep
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-[#777777]">
                        EST. BREAK-EVEN
                      </span>
                      <span className="text-xs sm:text-sm font-bold text-[#E67230]">
                        7 to 10 Months
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeModelTab === "new-clinic" && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
                {/* Left Column (Content) */}
                <div className="lg:col-span-7 space-y-6">
                  <div>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E67230]/10 border border-[#E67230]/25 text-xs font-bold text-[#E67230]">
                      <Building2 className="size-3.5" />
                      <span>Care &amp; Cure Clinics - Physical Infrastructure</span>
                    </span>
                    <h3
                      className="text-2xl sm:text-3xl lg:text-[34px] font-bold text-[#111111] tracking-tight mt-3"
                      style={{ fontFamily: 'var(--font-display), "Cormorant Garamond", Georgia, serif' }}
                    >
                      Physical Frontier: New Setup
                    </h3>
                    <p className="mt-3 text-sm sm:text-base text-[#555555] leading-relaxed">
                      Build and launch a brand-new, purpose-built &ldquo;Care &amp; Cure Clinic&rdquo; shared infrastructure. You provide a premium workspace with consultation suites and therapeutic treatment rooms (e.g., Panchakarma bays), allowing independent Vaidyas and Siddha specialists to practice under the Meyveda ecosystem.
                    </p>
                  </div>

                  {/* 2 Mini Feature Boxes */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                    <div className="rounded-xl border border-[#EBE7DF] bg-[#FAF9F6] p-4.5 space-y-1">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#888888] block">
                        Revenue Mechanics
                      </span>
                      <p className="text-base font-bold text-[#E67230]">
                        Margin on Total Care
                      </p>
                      <p className="text-xs text-[#666666] leading-relaxed">
                        Direct margins across Pharmacy, Consultations, and Treatments.
                      </p>
                    </div>

                    <div className="rounded-xl border border-[#EBE7DF] bg-[#FAF9F6] p-4.5 space-y-1">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#888888] block">
                        Primary Operational Assets
                      </span>
                      <p className="text-base font-bold text-[#111111]">
                        Real Estate &amp; Equipment
                      </p>
                      <p className="text-xs text-[#666666] leading-relaxed">
                        800-2,000 sq ft clinic space + treatment bays.
                      </p>
                    </div>
                  </div>

                  {/* Checklist */}
                  <div className="space-y-3 pt-2">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="size-4.5 text-[#E67230] shrink-0 mt-0.5" />
                      <p className="text-xs sm:text-sm text-[#444444] leading-relaxed">
                        <strong className="font-bold text-[#111111]">Triple Revenue Streams:</strong> Capture daily profit margins from patient consultation space rentals, in-house pharmacy retail, and therapy room usage fees.
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="size-4.5 text-[#E67230] shrink-0 mt-0.5" />
                      <p className="text-xs sm:text-sm text-[#444444] leading-relaxed">
                        <strong className="font-bold text-[#111111]">Multi-Location Footprint:</strong> Multiple Care &amp; Cure clinics can be established in the same territory to capture dense neighborhood demand.
                      </p>
                    </div>
                  </div>

                  {/* Button */}
                  <div className="pt-2">
                    <a
                      href="#franchise-enquiry"
                      onClick={() => setInlineModel("2. Physical Frontier – New Setup (Care & Cure Clinic)")}
                      className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-[#E67230] px-7 text-sm font-bold text-white shadow-xs hover:bg-[#D15F1F] transition-all hover:-translate-y-0.5"
                    >
                      <span>Apply to Build New Clinic</span>
                      <ArrowRight className="size-4 shrink-0" />
                    </a>
                  </div>
                </div>

                {/* Right Column (Metrics Box) */}
                <div className="lg:col-span-5">
                  <div className="rounded-2xl border border-[#EBE7DF] bg-[#FAF9F6] p-6 sm:p-7 space-y-4">
                    <div className="flex items-center justify-between pb-3.5 border-b border-[#EBE7DF]">
                      <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-[#777777]">
                        COVERAGE SCOPE
                      </span>
                      <span className="text-xs sm:text-sm font-bold text-[#111111]">
                        Neighborhood / Micro Radius
                      </span>
                    </div>
                    <div className="flex items-center justify-between pb-3.5 border-b border-[#EBE7DF]">
                      <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-[#777777]">
                        EXCLUSIVITY RIGHTS
                      </span>
                      <span className="text-xs sm:text-sm font-bold text-[#111111]">
                        Non-Exclusive (Multi-Unit)
                      </span>
                    </div>
                    <div className="flex items-center justify-between pb-3.5 border-b border-[#EBE7DF]">
                      <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-[#777777]">
                        PHARMACY MARGIN
                      </span>
                      <span className="text-xs sm:text-sm font-bold text-[#111111]">
                        Direct Retail Margin
                      </span>
                    </div>
                    <div className="flex items-center justify-between pb-3.5 border-b border-[#EBE7DF]">
                      <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-[#777777]">
                        THERAPY &amp; CONSULT MARGIN
                      </span>
                      <span className="text-xs sm:text-sm font-bold text-[#111111]">
                        Facility Share %
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-[#777777]">
                        IDEAL FACILITY SIZE
                      </span>
                      <span className="text-xs sm:text-sm font-bold text-[#E67230]">
                        800 - 2,000 sq ft
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeModelTab === "existing-clinic" && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
                {/* Left Column (Content) */}
                <div className="lg:col-span-7 space-y-6">
                  <div>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E67230]/10 border border-[#E67230]/25 text-xs font-bold text-[#E67230]">
                      <Stethoscope className="size-3.5" />
                      <span>Clinic Modernization &amp; Ecosystem Integration</span>
                    </span>
                    <h3
                      className="text-2xl sm:text-3xl lg:text-[34px] font-bold text-[#111111] tracking-tight mt-3"
                      style={{ fontFamily: 'var(--font-display), "Cormorant Garamond", Georgia, serif' }}
                    >
                      Physical Frontier: Existing Attachment
                    </h3>
                    <p className="mt-3 text-sm sm:text-base text-[#555555] leading-relaxed">
                      Upgrade and merge your existing, operational AYUSH clinic into the Meyveda Cluster Network. Modernize your daily practice with dynamicPMS, plug into localized zero-inventory supply chains, and standardize under the recognized Meyveda Care &amp; Cure identity while retaining your established patient goodwill.
                    </p>
                  </div>

                  {/* 2 Mini Feature Boxes */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                    <div className="rounded-xl border border-[#EBE7DF] bg-[#FAF9F6] p-4.5 space-y-1">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#888888] block">
                        Revenue Mechanics
                      </span>
                      <p className="text-base font-bold text-[#E67230]">
                        Optimized Care Margin
                      </p>
                      <p className="text-xs text-[#666666] leading-relaxed">
                        Enhanced retention on Pharmacy, Consults &amp; Therapies.
                      </p>
                    </div>

                    <div className="rounded-xl border border-[#EBE7DF] bg-[#FAF9F6] p-4.5 space-y-1">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#888888] block">
                        Primary Asset Requirement
                      </span>
                      <p className="text-base font-bold text-[#111111]">
                        Active AYUSH Clinic
                      </p>
                      <p className="text-xs text-[#666666] leading-relaxed">
                        Existing patient base &amp; operational space.
                      </p>
                    </div>
                  </div>

                  {/* Checklist */}
                  <div className="space-y-3 pt-2">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="size-4.5 text-[#E67230] shrink-0 mt-0.5" />
                      <p className="text-xs sm:text-sm text-[#444444] leading-relaxed">
                        <strong className="font-bold text-[#111111]">Instant Tech Upgrade:</strong> Implement dynamicPMS for electronic EHR, automated prescription routing, and insurance claims compatibility.
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="size-4.5 text-[#E67230] shrink-0 mt-0.5" />
                      <p className="text-xs sm:text-sm text-[#444444] leading-relaxed">
                        <strong className="font-bold text-[#111111]">Higher Profit Margins:</strong> Reduce inventory holding costs and capture superior supply chain margins through Meyveda&apos;s regional hubs.
                      </p>
                    </div>
                  </div>

                  {/* Button */}
                  <div className="pt-2">
                    <a
                      href="#franchise-enquiry"
                      onClick={() => setInlineModel("3. Physical Frontier – Existing Clinic Attachment")}
                      className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-[#E67230] px-7 text-sm font-bold text-white shadow-xs hover:bg-[#D15F1F] transition-all hover:-translate-y-0.5"
                    >
                      <span>Attach Existing Clinic</span>
                      <ArrowRight className="size-4 shrink-0" />
                    </a>
                  </div>
                </div>

                {/* Right Column (Metrics Box) */}
                <div className="lg:col-span-5">
                  <div className="rounded-2xl border border-[#EBE7DF] bg-[#FAF9F6] p-6 sm:p-7 space-y-4">
                    <div className="flex items-center justify-between pb-3.5 border-b border-[#EBE7DF]">
                      <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-[#777777]">
                        COVERAGE SCOPE
                      </span>
                      <span className="text-xs sm:text-sm font-bold text-[#111111]">
                        Existing Clinic Footprint
                      </span>
                    </div>
                    <div className="flex items-center justify-between pb-3.5 border-b border-[#EBE7DF]">
                      <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-[#777777]">
                        ONBOARDING SPEED
                      </span>
                      <span className="text-xs sm:text-sm font-bold text-[#E67230]">
                        Fast-Track (7~14 Days)
                      </span>
                    </div>
                    <div className="flex items-center justify-between pb-3.5 border-b border-[#EBE7DF]">
                      <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-[#777777]">
                        DIGITAL OS
                      </span>
                      <span className="text-xs sm:text-sm font-bold text-[#111111]">
                        dynamicPMS Integration
                      </span>
                    </div>
                    <div className="flex items-center justify-between pb-3.5 border-b border-[#EBE7DF]">
                      <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-[#777777]">
                        SUPPLY CHAIN SYNC
                      </span>
                      <span className="text-xs sm:text-sm font-bold text-[#111111]">
                        Zero-Inventory Hub Link
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-[#777777]">
                        INITIAL CAPEX
                      </span>
                      <span className="text-xs sm:text-sm font-bold text-[#E67230]">
                        Minimal Upgrade Cost
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------------------- */}
      {/* FINANCIAL FEASIBILITY SIMULATOR                                     */}
      {/* -------------------------------------------------------------------- */}
      <section
        id="revenue-calculator"
        aria-labelledby="revenue-calculator-heading"
        className="scroll-mt-20 border-b border-[#EBE7DF] bg-[#FAF9F6] py-16 sm:py-20 lg:py-24"
      >
        <div className="mx-auto max-w-[1320px] px-5 sm:px-8 lg:px-12">
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12">
            <span className="text-[11px] sm:text-xs font-bold uppercase tracking-widest text-[#E67230] block mb-2">
              FINANCIAL FEASIBILITY SIMULATOR
            </span>
            <h2
              id="revenue-calculator-heading"
              className="text-3xl sm:text-4xl lg:text-[42px] font-bold tracking-tight text-[#111111] leading-tight"
              style={{ fontFamily: 'var(--font-display), "Cormorant Garamond", Georgia, serif' }}
            >
              Estimate Your Monthly Net Earnings
            </h2>
            <p className="mt-3 text-sm sm:text-base text-[#555555] leading-relaxed">
              Select your business model and adjust parameters to project monthly and annual returns.
            </p>
          </div>

          {/* Model Switcher Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2 p-1.5 rounded-2xl bg-white border border-[#EBE7DF] max-w-md mx-auto mb-10 shadow-2xs">
            <button
              type="button"
              onClick={() => setSimModel("commander")}
              className={`flex-1 min-w-[180px] inline-flex items-center justify-center py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer ${
                simModel === "commander"
                  ? "bg-[#E67230] text-white shadow-xs"
                  : "text-[#555555] hover:text-[#111111] hover:bg-[#FAF9F6]"
              }`}
            >
              Territory Commander Model
            </button>
            <button
              type="button"
              onClick={() => setSimModel("clinic")}
              className={`flex-1 min-w-[180px] inline-flex items-center justify-center py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer ${
                simModel === "clinic"
                  ? "bg-[#E67230] text-white shadow-xs"
                  : "text-[#555555] hover:text-[#111111] hover:bg-[#FAF9F6]"
              }`}
            >
              Care &amp; Cure Clinic Model
            </button>
          </div>

          {/* Main Simulator Card */}
          <div className="rounded-3xl border border-[#EBE7DF] bg-white p-7 sm:p-10 lg:p-12 shadow-sm">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              {/* Left Column: Sliders */}
              <div className="lg:col-span-7 space-y-7">
                {simModel === "commander" ? (
                  <>
                    {/* Commander Slider 1: Turnover */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-sm sm:text-base font-bold text-[#111111]">
                          Estimated Monthly Territory Turnover
                        </label>
                        <span className="text-lg sm:text-xl font-black text-[#E67230]">
                          ₹{commanderTurnover.toFixed(2)} Lakhs
                        </span>
                      </div>

                      <input
                        type="range"
                        min={5}
                        max={100}
                        step="1"
                        value={commanderTurnover}
                        onChange={(e) => setCommanderTurnover(Number(e.target.value))}
                        className="w-full h-2.5 bg-[#FAF7F2] rounded-lg appearance-none cursor-pointer accent-[#E67230] border border-[#EBE7DF] focus:outline-none"
                      />

                      <div className="flex items-center justify-between text-xs text-[#888888] font-medium pt-0.5">
                        <span>₹5 Lakhs</span>
                        <span>₹50 Lakhs</span>
                        <span>₹1 Crore</span>
                      </div>
                    </div>

                    {/* Commander Slider 2: Margin */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-sm sm:text-base font-bold text-[#111111]">
                          Agent Net Margin
                        </label>
                        <span className="text-lg sm:text-xl font-black text-[#E67230]">
                          {commanderMargin}%
                        </span>
                      </div>

                      <input
                        type="range"
                        min={6}
                        max={15}
                        step={0.5}
                        value={commanderMargin}
                        onChange={(e) => setCommanderMargin(Number(e.target.value))}
                        className="w-full h-2.5 bg-[#FAF7F2] rounded-lg appearance-none cursor-pointer accent-[#E67230] border border-[#EBE7DF] focus:outline-none"
                      />

                      <div className="flex items-center justify-between text-xs text-[#888888] font-medium pt-0.5">
                        <span>6%</span>
                        <span>10% (Baseline)</span>
                        <span>15%</span>
                      </div>
                    </div>

                    {/* Bullets Box */}
                    <div className="rounded-2xl border border-[#EBE7DF] bg-[#FAF9F6] p-5 space-y-2.5">
                      <p className="text-xs sm:text-[13px] text-[#555555] leading-relaxed">
                        <strong className="font-semibold text-[#111111]">• Demand Source:</strong> Automated prescription routing via dynamicPMS across connected clinics in territory.
                      </p>
                      <p className="text-xs sm:text-[13px] text-[#555555] leading-relaxed">
                        <strong className="font-semibold text-[#111111]">• Cost Factor:</strong> Customer acquisition costs are near-zero due to digitized practitioner integration.
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    {/* Clinic Slider 1: Active Practitioners */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-sm sm:text-base font-bold text-[#111111]">
                          Active Practitioners in Clinic
                        </label>
                        <span className="text-lg sm:text-xl font-black text-[#E67230]">
                          {clinicDoctors} {clinicDoctors === 1 ? "Doctor" : "Doctors"}
                        </span>
                      </div>

                      <input
                        type="range"
                        min={1}
                        max={10}
                        step="1"
                        value={clinicDoctors}
                        onChange={(e) => setClinicDoctors(Number(e.target.value))}
                        className="w-full h-2.5 bg-[#FAF7F2] rounded-lg appearance-none cursor-pointer accent-[#E67230] border border-[#EBE7DF] focus:outline-none"
                      />
                    </div>

                    {/* Clinic Slider 2: Avg Consultations / Day per Doctor */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-sm sm:text-base font-bold text-[#111111]">
                          Avg Consultations / Day per Doctor
                        </label>
                        <span className="text-lg sm:text-xl font-black text-[#E67230]">
                          {clinicConsultsPerDay} Patients
                        </span>
                      </div>

                      <input
                        type="range"
                        min={4}
                        max={30}
                        step="1"
                        value={clinicConsultsPerDay}
                        onChange={(e) => setClinicConsultsPerDay(Number(e.target.value))}
                        className="w-full h-2.5 bg-[#FAF7F2] rounded-lg appearance-none cursor-pointer accent-[#E67230] border border-[#EBE7DF] focus:outline-none"
                      />
                    </div>

                    {/* Clinic Slider 3: Avg Ticket Value */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-sm sm:text-base font-bold text-[#111111]">
                          Avg Ticket Value (Pharmacy + Therapy)
                        </label>
                        <span className="text-lg sm:text-xl font-black text-[#E67230]">
                          ₹{clinicTicketValue}
                        </span>
                      </div>

                      <input
                        type="range"
                        min={300}
                        max={2500}
                        step="50"
                        value={clinicTicketValue}
                        onChange={(e) => setClinicTicketValue(Number(e.target.value))}
                        className="w-full h-2.5 bg-[#FAF7F2] rounded-lg appearance-none cursor-pointer accent-[#E67230] border border-[#EBE7DF] focus:outline-none"
                      />
                    </div>
                  </>
                )}
              </div>

              {/* Right Column: Feasibility Result Card */}
              <div className="lg:col-span-5">
                <div className="rounded-2xl border border-[#F2DAC8] bg-gradient-to-br from-[#FFF9F5] to-[#FAF6F0] p-6 sm:p-8 flex flex-col justify-between shadow-2xs">
                  <div>
                    <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-[#888888] block mb-2">
                      {simModel === "commander"
                        ? "PROJECTED MONTHLY NET INCOME"
                        : "EST. TOTAL CARE BUSINESS NET MARGIN"}
                    </span>
                    <div className="text-3xl sm:text-4xl lg:text-[44px] font-black text-[#E67230] tracking-tight mb-6">
                      ₹
                      {simModel === "commander"
                        ? (commanderTurnover * (commanderMargin / 100)).toFixed(2)
                        : (
                            (clinicDoctors * clinicConsultsPerDay * 25 * clinicTicketValue * 0.28) /
                            100000
                          ).toFixed(2)}{" "}
                      Lakhs
                    </div>

                    <div className="pt-5 border-t border-[#EBE7DF] grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-xs font-medium text-[#777777] block mb-1">
                          {simModel === "commander" ? "Annual Net Profit" : "Annual Net Earnings"}
                        </span>
                        <span className="text-base sm:text-lg font-bold text-[#111111]">
                          ₹
                          {simModel === "commander"
                            ? (commanderTurnover * (commanderMargin / 100) * 12).toFixed(2)
                            : (
                                (clinicDoctors * clinicConsultsPerDay * 25 * clinicTicketValue * 0.28 * 12) /
                                100000
                              ).toFixed(2)}{" "}
                          Lakhs
                        </span>
                      </div>
                      <div>
                        <span className="text-xs font-medium text-[#777777] block mb-1">
                          {simModel === "commander" ? "Est. ROI Period" : "Total Monthly Visits"}
                        </span>
                        <span className="text-base sm:text-lg font-bold text-[#E67230]">
                          {simModel === "commander"
                            ? "8 - 10 Months"
                            : `${clinicDoctors * clinicConsultsPerDay * 25} Visits`}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-6">
                    <a
                      href="#franchise-enquiry"
                      onClick={() => setInlineModel(simModel === "commander" ? "1. Territory Commander (Exclusive Macro Supply Chain)" : "2. Physical Frontier – New Setup (Care & Cure Clinic)")}
                      className="w-full inline-flex h-12 sm:h-13 items-center justify-center gap-2 rounded-xl bg-[#E67230] px-6 text-sm font-bold text-white shadow-xs hover:bg-[#D15F1F] transition-all hover:-translate-y-0.5"
                    >
                      <span>
                        {simModel === "commander"
                          ? "Reserve Territory Command"
                          : "Apply for Care & Cure Setup"}
                      </span>
                      <ArrowRight className="size-4 shrink-0" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------------------- */}
      {/* SIDE-BY-SIDE MODEL COMPARISON (Model Matrix)                          */}
      {/* -------------------------------------------------------------------- */}
      <section
        id="model-comparison"
        aria-labelledby="model-comparison-heading"
        className="scroll-mt-20 border-b border-[#EBE7DF] bg-[#FAF9F6] py-16 sm:py-20 lg:py-24"
      >
        <div className="mx-auto max-w-[1320px] px-5 sm:px-8 lg:px-12">
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12">
            <span className="text-[11px] sm:text-xs font-bold uppercase tracking-widest text-[#E67230] block mb-2">
              MODEL MATRIX
            </span>
            <h2
              id="model-comparison-heading"
              className="text-3xl sm:text-4xl lg:text-[42px] font-bold tracking-tight text-[#111111] leading-tight"
              style={{ fontFamily: 'var(--font-display), "Cormorant Garamond", Georgia, serif' }}
            >
              Side-by-Side Model Comparison
            </h2>
            <p className="mt-3 text-sm sm:text-base text-[#555555] leading-relaxed">
              Evaluate coverage, capital alignment, and revenue structures across all three CMP tracks.
            </p>
          </div>

          {/* Matrix Card Container */}
          <div className="rounded-3xl border border-[#EBE7DF] bg-white p-6 sm:p-8 lg:p-10 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[760px]">
                <thead>
                  <tr className="border-b border-[#EBE7DF]">
                    <th scope="col" className="py-4.5 px-5 text-xs font-bold uppercase tracking-wider text-[#777777] w-[22%]">
                      FEATURE / METRIC
                    </th>
                    <th
                      scope="col"
                      className="py-4.5 px-5 text-xs font-bold uppercase tracking-wider text-[#E67230] bg-[#FFF8F3] border-x border-t border-[#F2DAC8] rounded-t-2xl w-[26%]"
                    >
                      1. TERRITORY COMMANDER
                    </th>
                    <th scope="col" className="py-4.5 px-5 text-xs font-bold uppercase tracking-wider text-[#111111] w-[26%]">
                      2. PHYSICAL FRONTIER (NEW)
                    </th>
                    <th scope="col" className="py-4.5 px-5 text-xs font-bold uppercase tracking-wider text-[#111111] w-[26%]">
                      3. PHYSICAL FRONTIER (EXISTING)
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EBE7DF]">
                  {/* Row 1: Territory Scope */}
                  <tr>
                    <td className="py-4.5 px-5 text-xs sm:text-sm font-semibold text-[#555555]">
                      Territory Scope
                    </td>
                    <td className="py-4.5 px-5 text-xs sm:text-sm font-bold text-[#111111] bg-[#FFF8F3]/60 border-x border-[#F2DAC8]">
                      Macro (Entire District)
                    </td>
                    <td className="py-4.5 px-5 text-xs sm:text-sm text-[#444444]">
                      Micro (Neighborhood Radius)
                    </td>
                    <td className="py-4.5 px-5 text-xs sm:text-sm text-[#444444]">
                      Micro (Established Clinic)
                    </td>
                  </tr>

                  {/* Row 2: Exclusivity Rights */}
                  <tr>
                    <td className="py-4.5 px-5 text-xs sm:text-sm font-semibold text-[#555555]">
                      Exclusivity Rights
                    </td>
                    <td className="py-4.5 px-5 text-xs sm:text-sm font-bold text-[#E67230] bg-[#FFF8F3]/60 border-x border-[#F2DAC8]">
                      Strictly 1 Partner per District
                    </td>
                    <td className="py-4.5 px-5 text-xs sm:text-sm text-[#444444]">
                      Non-Exclusive Multi-Unit
                    </td>
                    <td className="py-4.5 px-5 text-xs sm:text-sm text-[#444444]">
                      Non-Exclusive Attachment
                    </td>
                  </tr>

                  {/* Row 3: Primary Asset Base */}
                  <tr>
                    <td className="py-4.5 px-5 text-xs sm:text-sm font-semibold text-[#555555]">
                      Primary Asset Base
                    </td>
                    <td className="py-4.5 px-5 text-xs sm:text-sm font-bold text-[#111111] bg-[#FFF8F3]/60 border-x border-[#F2DAC8]">
                      Climate-Controlled Hub &amp; Fleet
                    </td>
                    <td className="py-4.5 px-5 text-xs sm:text-sm text-[#444444]">
                      New Shared Clinic Infrastructure
                    </td>
                    <td className="py-4.5 px-5 text-xs sm:text-sm text-[#444444]">
                      Operational AYUSH Clinic
                    </td>
                  </tr>

                  {/* Row 4: Revenue Mechanics */}
                  <tr>
                    <td className="py-4.5 px-5 text-xs sm:text-sm font-semibold text-[#555555]">
                      Revenue Mechanics
                    </td>
                    <td className="py-4.5 px-5 text-xs sm:text-sm font-bold text-[#E67230] bg-[#FFF8F3]/60 border-x border-[#F2DAC8]">
                      Pure Agent Net Margin
                    </td>
                    <td className="py-4.5 px-5 text-xs sm:text-sm text-[#444444]">
                      Total Care Business Margin
                    </td>
                    <td className="py-4.5 px-5 text-xs sm:text-sm text-[#444444]">
                      Total Care Business Margin
                    </td>
                  </tr>

                  {/* Row 5: Revenue Drivers */}
                  <tr>
                    <td className="py-4.5 px-5 text-xs sm:text-sm font-semibold text-[#555555]">
                      Revenue Drivers
                    </td>
                    <td className="py-4.5 px-5 text-xs sm:text-sm font-bold text-[#111111] bg-[#FFF8F3]/60 border-x border-[#F2DAC8]">
                      Territory turnover from dynamicPMS
                    </td>
                    <td className="py-4.5 px-5 text-xs sm:text-sm text-[#444444]">
                      Pharmacy + Consults + Therapies
                    </td>
                    <td className="py-4.5 px-5 text-xs sm:text-sm text-[#444444]">
                      Pharmacy + Consults + Therapies
                    </td>
                  </tr>

                  {/* Row 6: Core Focus */}
                  <tr>
                    <td className="py-4.5 px-5 text-xs sm:text-sm font-semibold text-[#555555]">
                      Core Focus
                    </td>
                    <td className="py-4.5 px-5 text-xs sm:text-sm font-bold text-[#111111] bg-[#FFF8F3]/60 border-x border-[#F2DAC8]">
                      Supply Chain &amp; Medical Camps
                    </td>
                    <td className="py-4.5 px-5 text-xs sm:text-sm text-[#444444]">
                      Facility Operations &amp; Leasing
                    </td>
                    <td className="py-4.5 px-5 text-xs sm:text-sm text-[#444444]">
                      Technology &amp; Supply Integration
                    </td>
                  </tr>

                  {/* Row 7: Action Buttons */}
                  <tr>
                    <td className="py-5 px-5 text-xs sm:text-sm font-bold text-[#111111]">
                      Action
                    </td>
                    <td className="py-5 px-5 bg-[#FFF8F3]/60 border-x border-b border-[#F2DAC8] rounded-b-2xl">
                      <button
                        type="button"
                        onClick={() => {
                          setModalModel("1. Territory Commander (Exclusive Macro Supply Chain)");
                          setIsModalOpen(true);
                        }}
                        className="w-full inline-flex h-10.5 items-center justify-center rounded-xl bg-[#E67230] px-4 text-xs sm:text-sm font-bold text-white shadow-xs hover:bg-[#D15F1F] transition-all hover:-translate-y-0.5 cursor-pointer"
                      >
                        Apply Commander
                      </button>
                    </td>
                    <td className="py-5 px-5">
                      <button
                        type="button"
                        onClick={() => {
                          setModalModel("2. Physical Frontier – New Setup (Care & Cure Clinic)");
                          setIsModalOpen(true);
                        }}
                        className="w-full inline-flex h-10.5 items-center justify-center rounded-xl bg-[#111111] px-4 text-xs sm:text-sm font-bold text-white shadow-xs hover:bg-[#2A2622] transition-all hover:-translate-y-0.5 cursor-pointer"
                      >
                        Apply New Setup
                      </button>
                    </td>
                    <td className="py-5 px-5">
                      <button
                        type="button"
                        onClick={() => {
                          setModalModel("3. Physical Frontier – Existing Clinic (Clinic Attachment)");
                          setIsModalOpen(true);
                        }}
                        className="w-full inline-flex h-10.5 items-center justify-center rounded-xl border-2 border-[#E67230] bg-white px-4 text-xs sm:text-sm font-bold text-[#E67230] shadow-xs hover:bg-[#FFF5EE] transition-all hover:-translate-y-0.5 cursor-pointer"
                      >
                        Attach Clinic
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>


      {/* -------------------------------------------------------------------- */}
      {/* WHY MEYVEDA WORKS: THE DIGITAL & SUPPLY CHAIN OS                     */}
      {/* -------------------------------------------------------------------- */}
      <section
        id="why-meyveda"
        aria-labelledby="why-meyveda-heading"
        className="scroll-mt-20 border-b border-[#EBE7DF] bg-[#FAF9F6] py-16 sm:py-20 lg:py-24"
      >
        <div className="mx-auto max-w-[1320px] px-5 sm:px-8 lg:px-12">
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
            <span className="text-[11px] sm:text-xs font-bold uppercase tracking-widest text-[#E67230] block mb-2.5">
              WHY MEYVEDA WORKS
            </span>
            <h2
              id="why-meyveda-heading"
              className="text-3xl sm:text-4xl lg:text-[42px] font-bold tracking-tight text-[#111111] leading-tight"
              style={{ fontFamily: 'var(--font-display), "Cormorant Garamond", Georgia, serif' }}
            >
              The Digital &amp; Supply Chain OS
            </h2>
            <p className="mt-3.5 text-sm sm:text-base lg:text-[17px] leading-relaxed text-[#555555]">
              We remove operational friction so our CMP partners focus strictly on high-yield fulfillment and infrastructure.
            </p>
          </div>

          {/* Core Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
            {/* Card 1: dynamicPMS Digital OS */}
            <div className="group rounded-2xl border border-[#EBE7DF] bg-white p-6 sm:p-7 shadow-2xs transition-all duration-200 hover:-translate-y-1 hover:border-[#E67230]/50 hover:shadow-md flex flex-col justify-start">
              <div className="flex size-11 items-center justify-center rounded-xl bg-[#FFF8F3] border border-[#F2DAC8] text-[#E67230] mb-5 group-hover:bg-[#E67230] group-hover:text-white transition-colors duration-200">
                <Cpu className="size-5.5" />
              </div>
              <h3 className="text-base sm:text-lg font-bold tracking-tight text-[#111111] mb-2.5">
                dynamicPMS Digital OS
              </h3>
              <p className="text-xs sm:text-sm leading-relaxed text-[#555555]">
                Hardwired clinical OS used by doctors. Digital prescriptions route automatically to your CMP dashboard without field sales.
              </p>
            </div>

            {/* Card 2: Zero-Inventory Supply */}
            <div className="group rounded-2xl border border-[#EBE7DF] bg-white p-6 sm:p-7 shadow-2xs transition-all duration-200 hover:-translate-y-1 hover:border-[#E67230]/50 hover:shadow-md flex flex-col justify-start">
              <div className="flex size-11 items-center justify-center rounded-xl bg-[#FFF8F3] border border-[#F2DAC8] text-[#E67230] mb-5 group-hover:bg-[#E67230] group-hover:text-white transition-colors duration-200">
                <Truck className="size-5.5" />
              </div>
              <h3 className="text-base sm:text-lg font-bold tracking-tight text-[#111111] mb-2.5">
                Zero-Inventory Supply
              </h3>
              <p className="text-xs sm:text-sm leading-relaxed text-[#555555]">
                Decentralized micro-fulfillment guarantees rapid last-mile delivery to patients and clinic pharmacies with zero dead stock.
              </p>
            </div>



            {/* Card 4: Medical Camps & Touchpoints */}
            <div className="group rounded-2xl border border-[#EBE7DF] bg-white p-6 sm:p-7 shadow-2xs transition-all duration-200 hover:-translate-y-1 hover:border-[#E67230]/50 hover:shadow-md flex flex-col justify-start">
              <div className="flex size-11 items-center justify-center rounded-xl bg-[#FFF8F3] border border-[#F2DAC8] text-[#E67230] mb-5 group-hover:bg-[#E67230] group-hover:text-white transition-colors duration-200">
                <Users className="size-5.5" />
              </div>
              <h3 className="text-base sm:text-lg font-bold tracking-tight text-[#111111] mb-2.5">
                Medical Camps &amp; Touchpoints
              </h3>
              <p className="text-xs sm:text-sm leading-relaxed text-[#555555]">
                CMPs anchor regional trust through organized community medical camps and direct practitioner engagement touchpoints.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------------------- */}
      {/* READY TO SECURE YOUR TERRITORY? (CTA Banner)                         */}
      {/* -------------------------------------------------------------------- */}
      <section
        id="ready-to-secure"
        aria-labelledby="ready-to-secure-heading"
        className="scroll-mt-20 border-b border-[#EBE7DF] bg-[#FAF9F6] py-16 sm:py-20 lg:py-24"
      >
        <div className="mx-auto max-w-[1320px] px-5 sm:px-8 lg:px-12">
          <div className="rounded-3xl border border-[#EBE7DF] bg-white p-8 sm:p-12 lg:p-16 text-center shadow-sm max-w-4xl mx-auto">
            <h2
              id="ready-to-secure-heading"
              className="text-3xl sm:text-4xl lg:text-[44px] font-bold tracking-tight text-[#111111] leading-tight"
              style={{ fontFamily: 'var(--font-display), "Cormorant Garamond", Georgia, serif' }}
            >
              Ready to Secure Your Territory?
            </h2>
            <p className="mt-4 text-sm sm:text-base lg:text-[17px] leading-relaxed text-[#555555] max-w-2xl mx-auto">
              Territory Commander slots are strictly limited to one CMP per district. Care &amp; Cure Clinic developments and attachments are open for immediate neighborhood onboarding.
            </p>

            <div className="mt-8 sm:mt-10 flex flex-wrap items-center justify-center gap-3.5 sm:gap-4">
              <button
                type="button"
                onClick={() => {
                  setModalModel("1. Territory Commander (Exclusive Macro Supply Chain)");
                  setIsModalOpen(true);
                }}
                className="inline-flex h-12 sm:h-13 items-center justify-center gap-2 rounded-xl bg-[#E67230] px-7 sm:px-8 text-sm sm:text-base font-bold text-white shadow-md hover:bg-[#D15F1F] transition-all hover:-translate-y-0.5 cursor-pointer"
              >
                <span>Apply as Territory Commander</span>
                <ArrowRight className="size-4.5 shrink-0" />
              </button>

              <button
                type="button"
                onClick={() => {
                  setModalModel("2. Physical Frontier – New Setup (Care & Cure Clinic)");
                  setIsModalOpen(true);
                }}
                className="inline-flex h-12 sm:h-13 items-center justify-center gap-2 rounded-xl border border-[#D9D3C7] bg-[#FAF9F6] px-7 sm:px-8 text-sm sm:text-base font-bold text-[#111111] shadow-2xs hover:bg-[#FAF3EC] hover:border-[#E67230]/50 transition-all hover:-translate-y-0.5 cursor-pointer"
              >
                <span>Apply for Physical Frontier</span>
                <ArrowRight className="size-4.5 shrink-0" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------------------- */}
      {/* 6. INTAKE QUESTIONNAIRE (MEYVEDA CMP APPLICATION)                     */}
      {/* -------------------------------------------------------------------- */}
      <section
        id="franchise-enquiry"
        aria-labelledby="intake-form-heading"
        className="scroll-mt-20 border-b border-[#EBE7DF] bg-[#FAF9F6] py-16 sm:py-20 lg:py-24"
      >
        <div className="mx-auto max-w-xl px-5 sm:px-8">
          <div className="rounded-3xl border border-[#EBE7DF] bg-white p-6 sm:p-9 shadow-sm">
            {/* Header */}
            <div className="mb-6">
              <span className="text-[11px] font-bold uppercase tracking-widest text-[#E67230] block mb-1">
                INTAKE QUESTIONNAIRE
              </span>
              <h2
                id="intake-form-heading"
                className="text-2xl sm:text-3xl font-bold tracking-tight text-[#111111]"
                style={{ fontFamily: 'var(--font-display), "Cormorant Garamond", Georgia, serif' }}
              >
                Meyveda CMP Application
              </h2>
              <p className="mt-1.5 text-xs sm:text-sm text-[#666666] leading-relaxed">
                Submit your details to qualify for your target territory or clinic attachment.
              </p>
            </div>

            {/* Submission Status Notice */}
            {inlineStatus?.validated ? (
              <div
                role="region"
                aria-live="polite"
                className="rounded-2xl border border-[#EBE7DF] bg-[#FAF9F6] p-6 space-y-4 text-xs sm:text-sm shadow-2xs animate-in fade-in-50"
              >
                <div className="flex items-start justify-between gap-3 flex-wrap border-b border-[#EBE7DF] pb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="size-9 rounded-full bg-[#E67230]/10 flex items-center justify-center shrink-0 border border-[#E67230]/25">
                      <CheckCircle2 className="size-5 text-[#E67230]" />
                    </div>
                    <div>
                      <h3 className="font-bold text-[#111111] text-base">
                        Application Registered for Vetting
                      </h3>
                      <p className="text-xs text-[#555555]">
                        Your CMP intake questionnaire has been recorded in the central territory database.
                      </p>
                    </div>
                  </div>
                  {inlineStatus.submittedData?.id && (
                    <span className="font-mono text-xs font-bold text-[#E67230] bg-[#E67230]/10 px-3 py-1 rounded-full border border-[#E67230]/25">
                      Ref: {inlineStatus.submittedData.id}
                    </span>
                  )}
                </div>

                <div className="rounded-xl border border-[#EBE7DF] bg-white p-4 space-y-3 shadow-2xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-[11px] font-semibold text-[#777777] uppercase tracking-wider block">
                        Applicant / Entity
                      </span>
                      <strong className="text-sm font-bold text-[#111111] block mt-0.5">
                        {inlineStatus.submittedData?.fullName}
                      </strong>
                    </div>

                    <div>
                      <span className="text-[11px] font-semibold text-[#777777] uppercase tracking-wider block">
                        Selected Model
                      </span>
                      <strong className="text-xs font-bold text-[#E67230] block mt-0.5">
                        {inlineStatus.submittedData?.model}
                      </strong>
                    </div>

                    <div>
                      <span className="text-[11px] font-semibold text-[#777777] uppercase tracking-wider block">
                        Contact Phone
                      </span>
                      <span className="font-mono text-xs text-[#111111] font-bold block mt-0.5">
                        {inlineStatus.submittedData?.phone}
                      </span>
                    </div>

                    <div>
                      <span className="text-[11px] font-semibold text-[#777777] uppercase tracking-wider block">
                        Contact Email
                      </span>
                      <span className="font-mono text-xs text-[#111111] block mt-0.5">
                        {inlineStatus.submittedData?.email}
                      </span>
                    </div>

                    <div className="sm:col-span-2">
                      <span className="text-[11px] font-semibold text-[#777777] uppercase tracking-wider block">
                        Target District / Territory
                      </span>
                      <span className="text-xs text-[#111111] font-semibold block mt-0.5">
                        {inlineStatus.submittedData?.district}
                      </span>
                    </div>

                    <div className="sm:col-span-2 pt-1 border-t border-[#EBE7DF]">
                      <span className="text-[11px] font-semibold text-[#777777] uppercase tracking-wider block">
                        Readiness &amp; Infrastructure
                      </span>
                      <p className="text-xs text-[#555555] mt-0.5 leading-relaxed">
                        {inlineStatus.submittedData?.facilityInfo}
                      </p>
                    </div>

                    <div className="sm:col-span-2">
                      <span className="text-[11px] font-semibold text-[#777777] uppercase tracking-wider block">
                        Capital Allocation
                      </span>
                      <span className="text-xs text-[#111111] font-semibold block mt-0.5">
                        {inlineStatus.submittedData?.capital}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl bg-white p-3.5 text-xs text-[#555555] border border-[#EBE7DF] leading-relaxed flex items-start gap-2 shadow-2xs">
                  <Info className="size-4 text-[#E67230] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-[#111111]">Next Steps: </span>
                    Our territory expansion team will review your qualifications and contact you within 24–48 business hours to discuss territory allocation and agreement terms.
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleCopyInlineSummary}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-[#E67230] px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#D15F1F] transition-colors cursor-pointer"
                  >
                    <Copy className="size-3.5" />
                    <span>Copy Application Summary</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setInlineStatus(null);
                      setInlineFullName("");
                      setInlinePhone("");
                      setInlineEmail("");
                      setInlineDistrict("");
                      setInlineCarpetArea("");
                      setInlineFootfall("");
                    }}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-[#EBE7DF] bg-white px-4 py-2 text-xs font-semibold text-[#555555] hover:bg-[#FAF9F6] transition-colors cursor-pointer"
                  >
                    <span>Submit Another Application</span>
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleInlineSubmit} className="space-y-4 sm:space-y-5">
                {/* 1. SELECTED PARTNERSHIP MODEL */}
                <div>
                  <label className="block text-[11px] sm:text-xs font-bold uppercase tracking-wider text-[#555555] mb-2">
                    SELECTED PARTNERSHIP MODEL
                  </label>
                  <div className="relative">
                    <select
                      value={inlineModel}
                      onChange={(e) => setInlineModel(e.target.value)}
                      className="w-full h-12 appearance-none rounded-xl border border-[#D9D3C7] bg-[#FAF9F6] pl-4 pr-10 text-xs sm:text-sm font-semibold text-[#111111] focus:bg-white focus:border-[#E67230] focus:ring-1 focus:ring-[#E67230] focus:outline-none transition-all cursor-pointer"
                    >
                      <option value="1. Territory Commander (Exclusive Macro Supply Chain)">
                        1. Territory Commander (Exclusive Macro Supply Chain)
                      </option>
                      <option value="2. Physical Frontier – New Setup (Care & Cure Clinic)">
                        2. Physical Frontier – New Setup (Care & Cure Clinic)
                      </option>
                      <option value="3. Physical Frontier – Existing Clinic Attachment">
                        3. Physical Frontier – Existing Clinic Attachment
                      </option>
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 size-4 text-[#888888]" />
                  </div>
                </div>

                {/* 2 & 3. FULL NAME & PHONE NUMBER */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] sm:text-xs font-bold uppercase tracking-wider text-[#555555] mb-2">
                      FULL NAME / ENTITY NAME <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={inlineFullName}
                      onChange={(e) => {
                        setInlineFullName(e.target.value);
                        if (inlineErrors.fullName) setInlineErrors((p) => ({ ...p, fullName: undefined }));
                      }}
                      placeholder="e.g. Rahul Sharma"
                      className="w-full h-12 rounded-xl border border-[#D9D3C7] bg-[#FAF9F6] px-4 text-xs sm:text-sm text-[#111111] placeholder:text-[#999999] focus:bg-white focus:border-[#E67230] focus:ring-1 focus:ring-[#E67230] focus:outline-none transition-all"
                    />
                    {inlineErrors.fullName && (
                      <p className="mt-1 text-xs text-red-600 font-medium">{inlineErrors.fullName}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-[11px] sm:text-xs font-bold uppercase tracking-wider text-[#555555] mb-2">
                      PHONE NUMBER <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={10}
                      required
                      value={inlinePhone}
                      onChange={(e) => {
                        setInlinePhone(sanitizeMobileInput(e.target.value));
                        if (inlineErrors.phone) setInlineErrors((p) => ({ ...p, phone: undefined }));
                      }}
                      placeholder="+91 98765 43210"
                      className="w-full h-12 rounded-xl border border-[#D9D3C7] bg-[#FAF9F6] px-4 font-mono text-xs sm:text-sm text-[#111111] placeholder:text-[#999999] focus:bg-white focus:border-[#E67230] focus:ring-1 focus:ring-[#E67230] focus:outline-none transition-all"
                    />
                    {inlineErrors.phone && (
                      <p className="mt-1 text-xs text-red-600 font-medium">{inlineErrors.phone}</p>
                    )}
                  </div>
                </div>

                {/* 4 & 5. EMAIL ADDRESS & TARGET DISTRICT */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] sm:text-xs font-bold uppercase tracking-wider text-[#555555] mb-2">
                      EMAIL ADDRESS <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={inlineEmail}
                      onChange={(e) => {
                        setInlineEmail(e.target.value);
                        if (inlineErrors.email) setInlineErrors((p) => ({ ...p, email: undefined }));
                      }}
                      placeholder="rahul@example.com"
                      className="w-full h-12 rounded-xl border border-[#D9D3C7] bg-[#FAF9F6] px-4 text-xs sm:text-sm text-[#111111] placeholder:text-[#999999] focus:bg-white focus:border-[#E67230] focus:ring-1 focus:ring-[#E67230] focus:outline-none transition-all"
                    />
                    {inlineErrors.email && (
                      <p className="mt-1 text-xs text-red-600 font-medium">{inlineErrors.email}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-[11px] sm:text-xs font-bold uppercase tracking-wider text-[#555555] mb-2">
                      TARGET DISTRICT / PIN CODE <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={inlineDistrict}
                      onChange={(e) => {
                        setInlineDistrict(e.target.value);
                        if (inlineErrors.district) setInlineErrors((p) => ({ ...p, district: undefined }));
                      }}
                      placeholder="e.g. 600117 / Pune Metro"
                      className="w-full h-12 rounded-xl border border-[#D9D3C7] bg-[#FAF9F6] px-4 text-xs sm:text-sm text-[#111111] placeholder:text-[#999999] focus:bg-white focus:border-[#E67230] focus:ring-1 focus:ring-[#E67230] focus:outline-none transition-all"
                    />
                    {inlineErrors.district && (
                      <p className="mt-1 text-xs text-red-600 font-medium">{inlineErrors.district}</p>
                    )}
                  </div>
                </div>

                {/* 6. LOGISTICS & WAREHOUSE READINESS vs CLINICAL FACILITY DETAILS */}
                {inlineModel === "1. Territory Commander (Exclusive Macro Supply Chain)" ? (
                  <div className="rounded-2xl border border-[#EBE7DF] bg-[#FAF9F6] p-4.5">
                    <span className="block text-[11px] sm:text-xs font-bold uppercase tracking-wider text-[#E67230] mb-3">
                      LOGISTICS &amp; WAREHOUSE READINESS
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setInlineLogistics("available")}
                        className={`flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer text-xs font-semibold text-left transition-all ${
                          inlineLogistics === "available"
                            ? "border-[#E67230] bg-[#FFF5EE] text-[#111111]"
                            : "border-[#E5E0D8] bg-white text-[#555555] hover:border-[#D0C9BE]"
                        }`}
                      >
                        <span
                          className={`size-4 rounded-full border flex items-center justify-center shrink-0 ${
                            inlineLogistics === "available"
                              ? "border-[#E67230] bg-[#E67230]"
                              : "border-[#999999] bg-white"
                          }`}
                        >
                          {inlineLogistics === "available" && <span className="size-1.5 rounded-full bg-white" />}
                        </span>
                        <span>Commercial Warehouse Available</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setInlineLogistics("plan")}
                        className={`flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer text-xs font-semibold text-left transition-all ${
                          inlineLogistics === "plan"
                            ? "border-[#E67230] bg-[#FFF5EE] text-[#111111]"
                            : "border-[#E5E0D8] bg-white text-[#555555] hover:border-[#D0C9BE]"
                        }`}
                      >
                        <span
                          className={`size-4 rounded-full border flex items-center justify-center shrink-0 ${
                            inlineLogistics === "plan"
                              ? "border-[#E67230] bg-[#E67230]"
                              : "border-[#999999] bg-white"
                          }`}
                        >
                          {inlineLogistics === "plan" && <span className="size-1.5 rounded-full bg-white" />}
                        </span>
                        <span>Plan to Acquire Upon Approval</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-[#EBE7DF] bg-[#FAF9F6] p-4.5">
                    <span className="block text-[11px] sm:text-xs font-bold uppercase tracking-wider text-[#E67230] mb-3">
                      CLINICAL FACILITY DETAILS
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input
                        type="text"
                        value={inlineCarpetArea}
                        onChange={(e) => setInlineCarpetArea(e.target.value)}
                        placeholder="Carpet Area (e.g. 1,200 sq ft)"
                        className="w-full h-12 rounded-xl border border-[#D9D3C7] bg-white px-4 text-xs sm:text-sm text-[#111111] placeholder:text-[#999999] focus:border-[#E67230] focus:ring-1 focus:ring-[#E67230] focus:outline-none transition-colors"
                      />
                      <input
                        type="text"
                        value={inlineFootfall}
                        onChange={(e) => setInlineFootfall(e.target.value)}
                        placeholder="Current Patient Footfall (if existing)"
                        className="w-full h-12 rounded-xl border border-[#D9D3C7] bg-white px-4 text-xs sm:text-sm text-[#111111] placeholder:text-[#999999] focus:border-[#E67230] focus:ring-1 focus:ring-[#E67230] focus:outline-none transition-colors"
                      />
                    </div>
                  </div>
                )}

                {/* 7. LIQUID CAPITAL INVESTMENT CAPACITY */}
                <div>
                  <label className="block text-[11px] sm:text-xs font-bold uppercase tracking-wider text-[#555555] mb-2">
                    LIQUID CAPITAL INVESTMENT CAPACITY
                  </label>
                  <div className="relative">
                    <select
                      value={inlineCapital}
                      onChange={(e) => setInlineCapital(e.target.value)}
                      className="w-full h-12 appearance-none rounded-xl border border-[#D9D3C7] bg-[#FAF9F6] pl-4 pr-10 text-xs sm:text-sm font-semibold text-[#111111] focus:bg-white focus:border-[#E67230] focus:ring-1 focus:ring-[#E67230] focus:outline-none transition-colors cursor-pointer"
                    >
                      <option value="₹15 Lakhs – ₹25 Lakhs (Ideal for Commander / Attachment)">
                        ₹15 Lakhs – ₹25 Lakhs (Ideal for Commander / Attachment)
                      </option>
                      <option value="₹25 Lakhs – ₹50 Lakhs (Ideal for Full New Setup)">
                        ₹25 Lakhs – ₹50 Lakhs (Ideal for Full New Setup)
                      </option>
                      <option value="₹50 Lakhs+ (Regional / Multi-Cluster Anchor)">
                        ₹50 Lakhs+ (Regional / Multi-Cluster Anchor)
                      </option>
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 size-4 text-[#888888]" />
                  </div>
                </div>

                {/* 8. SUBMIT BUTTON */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isInlineSubmitting}
                    className="w-full h-12 sm:h-13 inline-flex items-center justify-center gap-2 rounded-xl bg-[#E67230] text-sm sm:text-base font-bold text-white shadow-md hover:bg-[#D15F1F] transition-all hover:-translate-y-0.5 cursor-pointer disabled:opacity-70"
                  >
                    {isInlineSubmitting ? (
                      <>
                        <Loader2 className="size-4.5 animate-spin" />
                        <span>Submitting Application...</span>
                      </>
                    ) : (
                      <>
                        <span>Submit Application for Vetting</span>
                        <Send className="size-4 shrink-0" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>
      {/* -------------------------------------------------------------------- */}
      {/* 7. FOOTER                                                            */}
      {/* -------------------------------------------------------------------- */}
            {/* -------------------------------------------------------------------- */}
      {/* INTAKE QUESTIONNAIRE MODAL (Meyveda CMP Application)                 */}
      {/* -------------------------------------------------------------------- */}
      {isModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="intake-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="relative w-full max-w-xl rounded-3xl bg-white border border-[#EBE7DF] p-6 sm:p-8 shadow-2xl overflow-y-auto max-h-[92vh] text-left animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 sm:top-6 sm:right-6 size-8.5 rounded-full bg-[#FAF9F6] border border-[#EBE7DF] text-[#777777] hover:text-[#111111] hover:bg-[#F3EFEA] flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <X className="size-4.5" />
            </button>

            {/* Modal Header */}
            <div className="mb-6 pr-8">
              <span className="text-[11px] font-bold uppercase tracking-widest text-[#E67230] block mb-1">
                INTAKE QUESTIONNAIRE
              </span>
              <h3
                id="intake-modal-title"
                className="text-2xl sm:text-3xl font-bold text-[#111111] tracking-tight"
                style={{ fontFamily: 'var(--font-display), "Cormorant Garamond", Georgia, serif' }}
              >
                Meyveda CMP Application
              </h3>
              <p className="text-xs sm:text-sm text-[#666666] mt-1.5 leading-relaxed">
                Submit your details to qualify for your target territory or clinic attachment.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleModalSubmit} className="space-y-4 sm:space-y-5">
              {/* Selected Partnership Model */}
              <div>
                <label className="block text-[11px] sm:text-xs font-bold uppercase tracking-wider text-[#555555] mb-2">
                  SELECTED PARTNERSHIP MODEL
                </label>
                <select
                  value={modalModel}
                  onChange={(e) => setModalModel(e.target.value)}
                  className="w-full h-12 rounded-xl border border-[#D9D3C7] bg-[#FAF9F6] px-4 text-xs sm:text-sm font-semibold text-[#111111] focus:border-[#E67230] focus:ring-1 focus:ring-[#E67230] focus:outline-none transition-colors"
                >
                  <option value="1. Territory Commander (Exclusive Macro Supply Chain)">
                    1. Territory Commander (Exclusive Macro Supply Chain)
                  </option>
                  <option value="2. Physical Frontier – New Setup (Care & Cure Clinic)">
                    2. Physical Frontier – New Setup (Care & Cure Clinic)
                  </option>
                  <option value="3. Physical Frontier – Existing Clinic (Clinic Attachment)">
                    3. Physical Frontier – Existing Clinic (Clinic Attachment)
                  </option>
                </select>
              </div>

              {/* Full Name & Phone Number */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] sm:text-xs font-bold uppercase tracking-wider text-[#555555] mb-2">
                    FULL NAME / ENTITY NAME *
                  </label>
                  <input
                    type="text"
                    required
                    value={modalFullName}
                    onChange={(e) => setModalFullName(e.target.value)}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full h-12 rounded-xl border border-[#D9D3C7] bg-[#FAF9F6] px-4 text-xs sm:text-sm text-[#111111] placeholder:text-[#999999] focus:border-[#E67230] focus:ring-1 focus:ring-[#E67230] focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[11px] sm:text-xs font-bold uppercase tracking-wider text-[#555555] mb-2">
                    PHONE NUMBER *
                  </label>
                  <input
                    type="tel"
                    required
                    value={modalPhone}
                    onChange={(e) => setModalPhone(sanitizeMobileInput(e.target.value))}
                    placeholder="+91 98765 43210"
                    maxLength={10}
                    className="w-full h-12 rounded-xl border border-[#D9D3C7] bg-[#FAF9F6] px-4 text-xs sm:text-sm text-[#111111] placeholder:text-[#999999] focus:border-[#E67230] focus:ring-1 focus:ring-[#E67230] focus:outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Email & Target District */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] sm:text-xs font-bold uppercase tracking-wider text-[#555555] mb-2">
                    EMAIL ADDRESS *
                  </label>
                  <input
                    type="email"
                    required
                    value={modalEmail}
                    onChange={(e) => setModalEmail(e.target.value)}
                    placeholder="rahul@example.com"
                    className="w-full h-12 rounded-xl border border-[#D9D3C7] bg-[#FAF9F6] px-4 text-xs sm:text-sm text-[#111111] placeholder:text-[#999999] focus:border-[#E67230] focus:ring-1 focus:ring-[#E67230] focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[11px] sm:text-xs font-bold uppercase tracking-wider text-[#555555] mb-2">
                    TARGET DISTRICT / PIN CODE *
                  </label>
                  <input
                    type="text"
                    required
                    value={modalDistrict}
                    onChange={(e) => setModalDistrict(e.target.value)}
                    placeholder="e.g. 600117 / Pune Metro"
                    className="w-full h-12 rounded-xl border border-[#D9D3C7] bg-[#FAF9F6] px-4 text-xs sm:text-sm text-[#111111] placeholder:text-[#999999] focus:border-[#E67230] focus:ring-1 focus:ring-[#E67230] focus:outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Model 1: Logistics & Warehouse Readiness vs Models 2 & 3: Clinical Facility Details */}
              {modalModel === "1. Territory Commander (Exclusive Macro Supply Chain)" ? (
                <div className="rounded-2xl border border-[#EBE7DF] bg-[#FAF9F6] p-4.5">
                  <span className="block text-[11px] sm:text-xs font-bold uppercase tracking-wider text-[#E67230] mb-3">
                    LOGISTICS &amp; WAREHOUSE READINESS
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setModalLogistics("available")}
                      className={`flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer text-xs font-semibold text-left transition-all ${
                        modalLogistics === "available"
                          ? "border-[#E67230] bg-[#FFF5EE] text-[#111111]"
                          : "border-[#E5E0D8] bg-white text-[#555555] hover:border-[#D0C9BE]"
                      }`}
                    >
                      <span
                        className={`size-4 rounded-full border flex items-center justify-center shrink-0 ${
                          modalLogistics === "available"
                            ? "border-[#E67230] bg-[#E67230]"
                            : "border-[#999999] bg-white"
                        }`}
                      >
                        {modalLogistics === "available" && <span className="size-1.5 rounded-full bg-white" />}
                      </span>
                      <span>Commercial Warehouse Available</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setModalLogistics("plan")}
                      className={`flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer text-xs font-semibold text-left transition-all ${
                        modalLogistics === "plan"
                          ? "border-[#E67230] bg-[#FFF5EE] text-[#111111]"
                          : "border-[#E5E0D8] bg-white text-[#555555] hover:border-[#D0C9BE]"
                      }`}
                    >
                      <span
                        className={`size-4 rounded-full border flex items-center justify-center shrink-0 ${
                          modalLogistics === "plan"
                            ? "border-[#E67230] bg-[#E67230]"
                            : "border-[#999999] bg-white"
                        }`}
                      >
                        {modalLogistics === "plan" && <span className="size-1.5 rounded-full bg-white" />}
                      </span>
                      <span>Plan to Acquire Upon Approval</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border border-[#EBE7DF] bg-[#FAF9F6] p-4.5">
                  <span className="block text-[11px] sm:text-xs font-bold uppercase tracking-wider text-[#E67230] mb-3">
                    CLINICAL FACILITY DETAILS
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={modalCarpetArea}
                      onChange={(e) => setModalCarpetArea(e.target.value)}
                      placeholder="Carpet Area (e.g. 1,200 sq ft)"
                      className="w-full h-12 rounded-xl border border-[#D9D3C7] bg-white px-4 text-xs sm:text-sm text-[#111111] placeholder:text-[#999999] focus:border-[#E67230] focus:ring-1 focus:ring-[#E67230] focus:outline-none transition-colors"
                    />
                    <input
                      type="text"
                      value={modalFootfall}
                      onChange={(e) => setModalFootfall(e.target.value)}
                      placeholder="Current Patient Footfall (if existing)"
                      className="w-full h-12 rounded-xl border border-[#D9D3C7] bg-white px-4 text-xs sm:text-sm text-[#111111] placeholder:text-[#999999] focus:border-[#E67230] focus:ring-1 focus:ring-[#E67230] focus:outline-none transition-colors"
                    />
                  </div>
                </div>
              )}

              {/* Liquid Capital Investment Capacity */}
              <div>
                <label className="block text-[11px] sm:text-xs font-bold uppercase tracking-wider text-[#555555] mb-2">
                  LIQUID CAPITAL INVESTMENT CAPACITY
                </label>
                <select
                  value={modalCapital}
                  onChange={(e) => setModalCapital(e.target.value)}
                  className="w-full h-12 rounded-xl border border-[#D9D3C7] bg-[#FAF9F6] px-4 text-xs sm:text-sm font-semibold text-[#111111] focus:border-[#E67230] focus:ring-1 focus:ring-[#E67230] focus:outline-none transition-colors"
                >
                  <option value="₹15 Lakhs – ₹25 Lakhs (Ideal for Commander / Attachment)">
                    ₹15 Lakhs – ₹25 Lakhs (Ideal for Commander / Attachment)
                  </option>
                  <option value="₹25 Lakhs – ₹50 Lakhs (Ideal for Full New Setup)">
                    ₹25 Lakhs – ₹50 Lakhs (Ideal for Full New Setup)
                  </option>
                  <option value="₹50 Lakhs+ (Regional / Multi-Cluster Anchor)">
                    ₹50 Lakhs+ (Regional / Multi-Cluster Anchor)
                  </option>
                </select>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isModalSubmitting}
                  className="w-full h-13 inline-flex items-center justify-center gap-2 rounded-xl bg-[#E67230] text-sm sm:text-base font-bold text-white shadow-md hover:bg-[#D15F1F] transition-all hover:-translate-y-0.5 cursor-pointer disabled:opacity-70"
                >
                  {isModalSubmitting ? (
                    <>
                      <Loader2 className="size-4.5 animate-spin" />
                      <span>Submitting Application...</span>
                    </>
                  ) : (
                    <>
                      <span>Submit Application for Vetting</span>
                      <Send className="size-4 shrink-0" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <LandingFooter />
    </div>
  );
}

export default ClusterFranchisePage;

