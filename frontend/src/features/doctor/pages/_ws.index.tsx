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
  CheckCircle2,
} from "lucide-react";
import { VerificationBadge } from "@/components/ui-kit";
import { useStore, getState } from "@/lib/store";
import { seo } from "@/lib/seo";
import { apiClient } from "@/services/apiClient";
import { toast } from "sonner";
import { copyToClipboard } from "@/lib/clipboard";
import dhanvantari from "@/assets/Dhanvantari2.png";

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
    <div className="mx-auto w-full max-w-4xl px-4 py-8 md:px-8 md:py-10 space-y-8 text-[#111111]">
      {/* 1. Greeting & Early-Bird Welcome Header */}
      <section className="relative overflow-hidden rounded-2xl border border-[#EBE7DF] bg-white p-6 md:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="space-y-4 flex-1">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E67230]/10 px-3 py-1 text-xs font-semibold text-[#E67230]">
                <CheckCircle2 className="h-3.5 w-3.5" /> Early-Bird Access Confirmed
              </span>
              <VerificationBadge status={doctor.verification} />
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111111] tracking-tight">
              Greetings! Dr. {getDoctorDisplayName(doctor.name)}
            </h1>

            <p className="text-base text-[#444444] font-medium leading-relaxed">
              Your early-bird registration is confirmed. Welcome to the pioneer group redefining AYUSH digital infrastructure.
            </p>

            <p className="text-sm text-[#666666] leading-relaxed">
              We opened this early access to build Meyveda with you. Generic clinic software fails to capture the nuances of holistic care, so your real-time clinical insights will directly shape our dynamicPMS and automation tools before the public launch.
            </p>
          </div>

          {/* Lord Dhanvantari Icon */}
          <div className="relative flex shrink-0 items-center justify-center self-center md:self-start pointer-events-none select-none">
            <img
              src={dhanvantari}
              alt="Lord Dhanvantari"
              className="h-28 w-28 md:h-32 md:w-32 object-contain drop-shadow-sm"
              loading="eager"
            />
          </div>
        </div>
      </section>

      {/* 2. What Happens Next */}
      <section className="rounded-2xl border border-[#EBE7DF] bg-white p-6 md:p-8 shadow-sm space-y-6">
        <div>
          <h2 className="text-lg font-bold text-[#111111] tracking-tight">
            What Happens Next
          </h2>
          <p className="text-xs text-[#777777] mt-1">
            Our collaborative roadmap for the pioneer cohort
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Step 1: Co-Create */}
          <div className="rounded-xl border border-[#F0ECE1] bg-[#FAF9F6] p-5 space-y-2.5">
            <div className="flex items-center gap-2 text-[#E67230] font-bold text-sm">
              <Sparkles className="h-4 w-4" />
              <span>Co-Create</span>
            </div>
            <p className="text-xs text-[#555555] leading-relaxed">
              Answer brief prompts about your workflow bottlenecks to prioritize our engineering roadmap.
            </p>
          </div>

          {/* Step 2: Beta Access */}
          <div className="rounded-xl border border-[#F0ECE1] bg-[#FAF9F6] p-5 space-y-2.5">
            <div className="flex items-center gap-2 text-[#E67230] font-bold text-sm">
              <Layers className="h-4 w-4" />
              <span>Beta Access</span>
            </div>
            <p className="text-xs text-[#555555] leading-relaxed">
              Get first access to test the dynamicPMS environment and patient automations.
            </p>
          </div>

          {/* Step 3: The Builder’s Circle */}
          <div className="rounded-xl border border-[#F0ECE1] bg-[#FAF9F6] p-5 space-y-2.5">
            <div className="flex items-center gap-2 text-[#E67230] font-bold text-sm">
              <Users2 className="h-4 w-4" />
              <span>The Builder’s Circle</span>
            </div>
            <p className="text-xs text-[#555555] leading-relaxed">
              Join our private channel to shape features and collaborate with fellow AYUSH practitioners.
            </p>
          </div>
        </div>

        {/* Action CTAs */}
        <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <a
            href={whatsappCommunityUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#E67230] px-5 py-3 text-sm font-bold text-white shadow-sm hover:bg-[#D15F1F] transition-colors"
          >
            <Users2 className="h-4 w-4" />
            Join the Pioneer Community
          </a>

          <Link
            to="/survey"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#E67230] bg-white px-5 py-3 text-sm font-bold text-[#E67230] hover:bg-[#E67230]/5 transition-colors"
          >
            <ClipboardList className="h-4 w-4" />
            Share Your Biggest Workflow Challenge
          </Link>
        </div>
      </section>

      {/* 3. Social Media, WhatsApp & Telegram Group Links */}
      <section className="rounded-2xl border border-[#EBE7DF] bg-white p-6 md:p-8 shadow-sm space-y-4">
        <div>
          <h2 className="text-base font-bold text-[#111111]">
            Social Media & Practitioner Channels
          </h2>
          <p className="text-xs text-[#777777] mt-0.5">
            Connect with our core team and the pioneer practitioner network
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <a
            href={whatsappCommunityUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-4 rounded-xl border border-[#EBE7DF] bg-[#FAF9F6] hover:border-[#25D366] hover:bg-white transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-[#25D366]/10 text-[#25D366] flex items-center justify-center font-bold">
                <MessageCircle className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-[#111111] group-hover:text-[#25D366] transition-colors">
                  WhatsApp Community
                </p>
                <p className="text-xs text-[#777777]">Exclusive updates & practitioner discussions</p>
              </div>
            </div>
            <ExternalLink className="h-4 w-4 text-[#888888] group-hover:text-[#25D366] transition-colors" />
          </a>

          <a
            href={telegramCommunityUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-4 rounded-xl border border-[#EBE7DF] bg-[#FAF9F6] hover:border-[#0088cc] hover:bg-white transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-[#0088cc]/10 text-[#0088cc] flex items-center justify-center font-bold">
                <Send className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-[#111111] group-hover:text-[#0088cc] transition-colors">
                  Telegram Group
                </p>
                <p className="text-xs text-[#777777]">Direct builder channel & feature polls</p>
              </div>
            </div>
            <ExternalLink className="h-4 w-4 text-[#888888] group-hover:text-[#0088cc] transition-colors" />
          </a>
        </div>
      </section>

      {/* 4. Survey Link Section */}
      <section className="rounded-2xl border border-[#EBE7DF] bg-white p-6 md:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div className="flex items-start gap-4">
            <div className="h-11 w-11 rounded-xl bg-[#E67230]/10 text-[#E67230] flex items-center justify-center shrink-0">
              <ClipboardList className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-[#111111]">
                Practitioner Feedback & Workflow Survey
              </h3>
              <p className="text-xs text-[#666666] max-w-xl leading-relaxed">
                Your feedback directly impacts how Meyveda builds clinical toolkits, dispensing workflows, and diagnostic records.
              </p>
            </div>
          </div>

          <Link
            to="/survey"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#E67230] px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-[#D15F1F] transition-colors whitespace-nowrap self-start sm:self-auto"
          >
            Go to Survey <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </section>

      {/* 5. Referral Link Only (No Dashboard) */}
      <section className="rounded-2xl border border-[#EBE7DF] bg-white p-6 md:p-8 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-[#111111]">
              Your Referral Link
            </h3>
            <p className="text-xs text-[#777777] mt-0.5">
              Invite verified AYUSH colleagues (BAMS, BSMS, BNYS, BHMS, BUMS) to join early access.
            </p>
          </div>

          {/* Invite Code */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="text-xs text-[#777777] font-medium">Code:</span>
            <span className="rounded-lg border border-[#EBE7DF] bg-[#FAF9F6] px-3 py-1 font-mono text-sm font-bold text-[#E67230]">
              {inviteCode}
            </span>
            <button
              type="button"
              onClick={handleCopyCode}
              className="rounded-lg border border-[#EBE7DF] bg-white p-1.5 text-[#666666] hover:text-[#E67230] hover:border-[#E67230] transition-colors cursor-pointer"
              title="Copy code"
            >
              {copiedCode ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Copy Link Input & WhatsApp Share */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1">
          <input
            type="text"
            readOnly
            value={fullInviteUrl}
            className="w-full flex-1 rounded-xl border border-[#EBE7DF] bg-[#FAF9F6] px-3.5 py-2.5 font-mono text-xs text-[#222222] focus:outline-none select-all"
          />

          <div className="flex gap-2 shrink-0">
            <button
              type="button"
              onClick={handleCopyLink}
              className="flex items-center justify-center gap-1.5 rounded-xl bg-[#E67230] px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-[#D15F1F] transition-colors cursor-pointer"
            >
              {copiedLink ? (
                <>
                  <Check className="h-3.5 w-3.5" /> Copied
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" /> Copy Link
                </>
              )}
            </button>

            <a
              href={whatsappShareUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 rounded-xl bg-[#25D366] px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-[#1EBE5D] transition-colors cursor-pointer"
            >
              <MessageCircle className="h-3.5 w-3.5" /> Share on WhatsApp
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
