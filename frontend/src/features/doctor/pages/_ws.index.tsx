import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  Copy,
  Check,
  ArrowRight,
  ClipboardList,
  MessageCircle,
  ExternalLink,
  Send,
  Users2,
  Sparkles,
  Layers,
} from "lucide-react";
import { useStore, getState } from "@/lib/store";
import { seo } from "@/lib/seo";
import { apiClient } from "@/services/apiClient";
import { toast } from "sonner";
import { copyToClipboard } from "@/lib/clipboard";
import { Mascot } from "@/components/ui/mascot";

export const Route = createFileRoute("/_ws/")({
  beforeLoad: () => {
    if (typeof window === "undefined") return;
    const token = localStorage.getItem("meyveda_auth_token");
    const signedIn = getState().signedIn;
    if (!token && !signedIn) {
      throw redirect({ to: "/login", search: { portal: "doctor" }, replace: true });
    }
  },
  head: () =>
    seo(
      "Doctor Workspace | Meyveda",
      "Practitioner early-bird registration confirmed. AYUSH digital infrastructure pioneer group.",
    ),
  component: Home,
});

function getDoctorDisplayName(name?: string) {
  if (!name) return "Practitioner";
  const clean = name.replace(/^Dr\.?\s+/i, "").trim();
  return clean || "Practitioner";
}

export function Home() {
  const doctor = useStore((s) => s.doctor);

  const defaultCode = (doctor as any)?.inviteCode || "MSV77";
  const [inviteCode, setInviteCode] = useState<string>(defaultCode);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  useEffect(() => {
    let active = true;
    async function fetchReferralSummary() {
      try {
        const res = await apiClient.get<{
          invite_code: string;
          invite_url: string;
        }>("/referrals/my-summary");

        if (active && res) {
          if (res.invite_code) setInviteCode(res.invite_code);
        }
      } catch {
        if ((doctor as any)?.invite_code) {
          setInviteCode((doctor as any).invite_code);
        }
      }
    }
    fetchReferralSummary();
    return () => {
      active = false;
    };
  }, [doctor]);

  const origin = typeof window !== "undefined" ? window.location.origin : "http://localhost:5173";
  const fullInviteUrl = `${origin}/register?ref=${inviteCode}`;

  const handleCopyLink = async () => {
    const success = await copyToClipboard(fullInviteUrl);
    if (success) {
      setCopiedLink(true);
      toast.success("Invite link copied to clipboard!");
      setTimeout(() => setCopiedLink(false), 2500);
    } else {
      toast.error("Could not copy link to clipboard. Please copy manually.");
    }
  };

  const handleCopyCode = async () => {
    const success = await copyToClipboard(inviteCode);
    if (success) {
      setCopiedCode(true);
      toast.success(`Invite code ${inviteCode} copied!`);
      setTimeout(() => setCopiedCode(false), 2500);
    } else {
      toast.error("Could not copy code to clipboard. Please copy manually.");
    }
  };

  const shareText = encodeURIComponent(
    `Namaste Doctor, I invite you to join Meyveda — verified AYUSH clinical network & research repository. Register with my invite code ${inviteCode}: ${fullInviteUrl}`,
  );
  const whatsappShareUrl = `https://api.whatsapp.com/send?text=${shareText}`;

  // Community links (Telegram & WhatsApp Community channel)
  const whatsappCommunityUrl = "https://chat.whatsapp.com/";
  const telegramCommunityUrl = "https://t.me/";

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 md:px-8 md:py-12 space-y-10 text-[#111111]">
      {/* 1. Greeting & Early-Bird Welcome Header */}
      <section className="relative overflow-hidden rounded-3xl border border-[#EBE7DF] bg-white p-7 md:p-10 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="space-y-4 flex-1">
            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-[#111111] tracking-tight">
                Greetings! Dr. {getDoctorDisplayName(doctor.name)}
              </h1>
              <p className="text-sm text-[#777777] mt-1.5 font-medium">
                Verification status:{" "}
                <span className={doctor.verification === "Verified" ? "text-emerald-700 font-bold" : "text-[#D15F1F] font-bold"}>
                  {doctor.verification || "Pending Verification"}
                </span>
              </p>
            </div>

            <p className="text-lg sm:text-xl text-[#333333] font-semibold leading-relaxed max-w-3xl">
              Your early-bird registration is confirmed. Welcome to the pioneer group redefining AYUSH digital infrastructure.
            </p>

            <p className="text-base text-[#555555] leading-relaxed max-w-3xl">
              We opened this early access to build Meyveda with you. Generic clinic software fails to capture the nuances of holistic care, so your real-time clinical insights will directly shape our dynamicPMS and automation tools before the public launch.
            </p>
          </div>

          {/* Interactive Doctor Mascot */}
          <div className="relative flex shrink-0 items-center justify-center self-center pointer-events-none select-none">
            <Mascot
              directions="/mascots/meyveda-doctor-directions.webp"
              reactions="/mascots/meyveda-doctor-reactions.webp"
              size={180}
              label="Meyveda AYUSH Doctor Mascot"
              className="select-none drop-shadow-md pointer-events-auto"
            />
          </div>
        </div>
      </section>

      {/* 2. What Happens Next */}
      <section className="rounded-3xl border border-[#EBE7DF] bg-white p-7 md:p-10 shadow-sm space-y-7">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#111111] tracking-tight">
            What Happens Next
          </h2>
          <p className="text-sm text-[#777777] mt-1">
            Our collaborative roadmap for the pioneer cohort
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Step 1: Co-Create */}
          <div className="rounded-2xl border border-[#F0ECE1] bg-[#FAF9F6] p-6 space-y-3">
            <div className="text-[#E67230] font-bold text-base">
              <span>Co-Create</span>
            </div>
            <p className="text-sm text-[#555555] leading-relaxed">
              Answer brief prompts about your workflow bottlenecks to prioritize our engineering roadmap.
            </p>
          </div>

          {/* Step 2: Beta Access */}
          <div className="rounded-2xl border border-[#F0ECE1] bg-[#FAF9F6] p-6 space-y-3">
            <div className="text-[#E67230] font-bold text-base">
              <span>Beta Access</span>
            </div>
            <p className="text-sm text-[#555555] leading-relaxed">
              Get first access to test the dynamicPMS environment and patient automations.
            </p>
          </div>

          {/* Step 3: The Builder’s Circle */}
          <div className="rounded-2xl border border-[#F0ECE1] bg-[#FAF9F6] p-6 space-y-3">
            <div className="text-[#E67230] font-bold text-base">
              <span>The Builder’s Circle</span>
            </div>
            <p className="text-sm text-[#555555] leading-relaxed">
              Join our private channel to shape features and collaborate with fellow AYUSH practitioners.
            </p>
          </div>
        </div>

        {/* Action CTAs: Share Survey, WhatsApp Community, Telegram Group */}
        <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-4 flex-wrap">
          <Link
            to="/survey"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#E67230] px-6 py-3.5 text-base font-bold text-white shadow-sm hover:bg-[#D15F1F] transition-colors"
          >
            Share Your Biggest Workflow Challenge
          </Link>

          <a
            href={whatsappCommunityUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#25D366] px-6 py-3.5 text-base font-bold text-white shadow-sm hover:bg-[#1EBE5D] transition-colors"
          >
            <MessageCircle className="h-5 w-5" />
            WhatsApp Community
          </a>

          <a
            href={telegramCommunityUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0088cc] px-6 py-3.5 text-base font-bold text-white shadow-sm hover:bg-[#0077b5] transition-colors"
          >
            <Send className="h-5 w-5" />
            Telegram Group
          </a>
        </div>
      </section>

      {/* 3. Survey Link Section */}
      <section className="rounded-3xl border border-[#EBE7DF] bg-white p-7 md:p-10 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-[#111111]">
              Practitioner Feedback & Workflow Survey
            </h3>
            <p className="text-sm text-[#666666] max-w-xl leading-relaxed">
              Your feedback directly impacts how Meyveda builds clinical toolkits, dispensing workflows, and diagnostic records.
            </p>
          </div>

          <Link
            to="/survey"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#E67230] px-6 py-3 text-sm font-bold text-white shadow-sm hover:bg-[#D15F1F] transition-colors whitespace-nowrap self-start sm:self-auto"
          >
            Go to Survey <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* 5. Referral Link Only (No Dashboard) */}
      <section className="rounded-3xl border border-[#EBE7DF] bg-white p-7 md:p-10 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-[#111111]">
              Your Referral Link
            </h3>
            <p className="text-sm text-[#777777] mt-1">
              Invite verified AYUSH colleagues (BAMS, BSMS, BNYS, BHMS, BUMS) to join early access.
            </p>
          </div>

          {/* Invite Code */}
          <div className="flex items-center gap-2.5 self-start sm:self-auto">
            <span className="text-sm text-[#777777] font-medium">Code:</span>
            <span className="rounded-xl border border-[#EBE7DF] bg-[#FAF9F6] px-4 py-1.5 font-mono text-base font-bold text-[#E67230]">
              {inviteCode}
            </span>
            <button
              type="button"
              onClick={handleCopyCode}
              className="rounded-xl border border-[#EBE7DF] bg-white p-2 text-[#666666] hover:text-[#E67230] hover:border-[#E67230] transition-colors cursor-pointer"
              title="Copy code"
            >
              {copiedCode ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Copy Link Input & WhatsApp Share */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1">
          <input
            type="text"
            readOnly
            value={fullInviteUrl}
            className="w-full flex-1 rounded-xl border border-[#EBE7DF] bg-[#FAF9F6] px-4 py-3 font-mono text-sm text-[#222222] focus:outline-none select-all"
          />

          <div className="flex gap-3 shrink-0">
            <button
              type="button"
              onClick={handleCopyLink}
              className="flex items-center justify-center gap-2 rounded-xl bg-[#E67230] px-5 py-3 text-sm font-bold text-white shadow-sm hover:bg-[#D15F1F] transition-colors cursor-pointer"
            >
              {copiedLink ? (
                <>
                  <Check className="h-4 w-4" /> Copied
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" /> Copy Link
                </>
              )}
            </button>

            <a
              href={whatsappShareUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 rounded-xl bg-[#25D366] px-5 py-3 text-sm font-bold text-white shadow-sm hover:bg-[#1EBE5D] transition-colors cursor-pointer"
            >
              <MessageCircle className="h-4 w-4" /> Share on WhatsApp
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
