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
  Download,
  QrCode,
  Loader2,
  HelpCircle,
  X,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import QRCode from "qrcode";
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
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>("");

  // Workflow challenge modal state
  const [challengeModalOpen, setChallengeModalOpen] = useState(false);
  const [challengeTitle, setChallengeTitle] = useState("");
  const [challengeDescription, setChallengeDescription] = useState("");
  const [challengeCategory, setChallengeCategory] = useState("EMR & Clinical Documentation");
  const [submittingChallenge, setSubmittingChallenge] = useState(false);

  const handleOpenChallengeModal = () => {
    setChallengeTitle("");
    setChallengeDescription("");
    setChallengeModalOpen(true);
  };

  const handleSubmitChallenge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!challengeTitle.trim() || challengeTitle.trim().length < 3) {
      toast.error("Please provide a short summary of your challenge.");
      return;
    }
    if (!challengeDescription.trim() || challengeDescription.trim().length < 10) {
      toast.error("Please explain your challenge in at least 10 characters.");
      return;
    }

    setSubmittingChallenge(true);
    try {
      const doctorName = (doctor as any)?.name || (doctor as any)?.full_name || "Practitioner";
      const doctorEmail = (doctor as any)?.email || "doctor@meyveda.com";
      const doctorPhone = (doctor as any)?.mobile || (doctor as any)?.phone || "+91 9986398332";

      await apiClient.post("/contact", {
        full_name: doctorName.startsWith("Dr.") ? doctorName : `Dr. ${doctorName}`,
        email: doctorEmail,
        phone: doctorPhone,
        category: "Doctor Workflow Challenge",
        subject: `[Workflow Challenge - ${challengeCategory}] ${challengeTitle.trim()}`,
        message: challengeDescription.trim(),
      });

      toast.success("Thank you! Your workflow challenge has been submitted.", {
        description: "Our engineering and clinical product team will review this to prioritize upcoming features.",
      });
      setChallengeModalOpen(false);
      setChallengeTitle("");
      setChallengeDescription("");
    } catch (err: any) {
      toast.error(err?.message || "Failed to submit challenge. Please try again.");
    } finally {
      setSubmittingChallenge(false);
    }
  };

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

  // Generate QR Code for fullInviteUrl
  useEffect(() => {
    if (!fullInviteUrl) return;
    QRCode.toDataURL(fullInviteUrl, {
      width: 260,
      margin: 1.5,
      color: {
        dark: "#111111",
        light: "#FFFFFF",
      },
    })
      .then((url) => setQrCodeDataUrl(url))
      .catch((err) => console.error("QR Code error:", err));
  }, [fullInviteUrl]);

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

  const handleDownloadQr = () => {
    if (!qrCodeDataUrl) return;
    const a = document.createElement("a");
    a.href = qrCodeDataUrl;
    a.download = `meyveda-invite-qr-${inviteCode}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast.success("QR Code downloaded!");
  };

  const shareText = encodeURIComponent(
    `Namaste Doctor, I invite you to join Meyveda — verified AYUSH clinical network & research repository. Register with my invite code ${inviteCode}: ${fullInviteUrl}`,
  );
  const whatsappShareUrl = `https://api.whatsapp.com/send?text=${shareText}`;

  // Community links (Telegram & WhatsApp Community channel)
  const whatsappCommunityUrl = "https://www.whatsapp.com/channel/0029Vb5lp2eICVfeN93oxw11";
  const telegramCommunityUrl = "https://t.me/meyveda";

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
          <button
            type="button"
            onClick={handleOpenChallengeModal}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#E67230] px-6 py-3.5 text-base font-bold text-white shadow-sm hover:bg-[#D15F1F] transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
          >
            <Sparkles className="size-4" />
            <span>Share Your Biggest Workflow Challenge</span>
          </button>

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

      {/* 5. Referral Link & QR Code */}
      <section className="rounded-3xl border border-[#EBE7DF] bg-white p-7 md:p-10 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EBE7DF] pb-5">
          <div>
            <h3 className="text-xl font-bold text-[#111111]">
              Your Referral Link &amp; QR Code
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

        {/* Split layout: Link and Actions on Left, QR Code on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center pt-1">
          {/* Left Column: Input and Action buttons */}
          <div className="lg:col-span-8 space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-[#111111]">Direct Registration URL:</label>
              <input
                type="text"
                readOnly
                value={fullInviteUrl}
                className="w-full rounded-xl border border-[#EBE7DF] bg-[#FAF9F6] px-4 py-3 font-mono text-sm text-[#222222] focus:outline-none select-all"
              />
            </div>

            <div className="flex flex-wrap gap-3 pt-1">
              <button
                type="button"
                onClick={handleCopyLink}
                className="flex items-center justify-center gap-2 rounded-xl bg-[#E67230] px-5 py-3 text-sm font-bold text-white shadow-sm hover:bg-[#D15F1F] transition-colors cursor-pointer"
              >
                {copiedLink ? (
                  <>
                    <Check className="h-4 w-4" /> Copied Link
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

              {qrCodeDataUrl && (
                <button
                  type="button"
                  onClick={handleDownloadQr}
                  className="flex items-center justify-center gap-2 rounded-xl border border-[#EBE7DF] bg-white px-5 py-3 text-sm font-bold text-[#111111] hover:border-[#E67230] hover:text-[#E67230] transition-colors cursor-pointer"
                >
                  <Download className="h-4 w-4" /> Download QR
                </button>
              )}
            </div>

            <p className="text-xs text-[#777777] leading-relaxed pt-1">
              Colleagues can scan the QR code using any smartphone camera or tap the direct link to register with your referral code.
            </p>
          </div>

          {/* Right Column: QR Code Display Card */}
          <div className="lg:col-span-4 flex flex-col items-center justify-center p-5 rounded-2xl border border-[#EBE7DF] bg-[#FAF9F6]">
            <div className="rounded-2xl bg-white p-3.5 shadow-sm border border-[#EBE7DF]">
              {qrCodeDataUrl ? (
                <img
                  src={qrCodeDataUrl}
                  alt={`Meyveda Referral QR Code for ${inviteCode}`}
                  className="w-40 h-40 sm:w-44 sm:h-44 object-contain"
                />
              ) : (
                <div className="w-40 h-40 flex items-center justify-center text-xs text-muted-foreground">
                  Generating QR...
                </div>
              )}
            </div>

            <div className="text-center mt-2.5">
              <p className="text-xs font-bold text-[#111111] flex items-center justify-center gap-1.5">
                <QrCode className="h-3.5 w-3.5 text-[#E67230]" />
                Scan to Register
              </p>
              <p className="text-[11px] text-muted-foreground">Code: {inviteCode}</p>
            </div>
          </div>
        </div>
      </section>
      {/* Dialog Popup for Workflow Challenge */}
      <Dialog open={challengeModalOpen} onOpenChange={setChallengeModalOpen}>
        <DialogContent className="max-w-lg p-6 sm:p-7 rounded-3xl bg-white border border-[#EBE7DF] shadow-2xl">
          <DialogHeader className="space-y-1.5 text-left">
            <div className="flex items-center gap-2 text-[#E67230] font-bold text-xs uppercase tracking-wider">
              <Sparkles className="size-4" />
              <span>Co-Create With Meyveda</span>
            </div>
            <DialogTitle className="text-xl sm:text-2xl font-bold text-[#111111]">
              Share Your Workflow Challenge
            </DialogTitle>
            <DialogDescription className="text-sm text-[#666666] leading-relaxed">
              Tell our product engineers what slows down your daily AYUSH clinical practice. Your feedback is sent directly to the Admin Desk to shape our development roadmap.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmitChallenge} className="mt-4 space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#333333] mb-1.5">
                Area of Practice / Workflow
              </label>
              <select
                value={challengeCategory}
                onChange={(e) => setChallengeCategory(e.target.value)}
                className="w-full rounded-xl border border-[#D5D0C7] bg-[#FAF9F6] px-3.5 py-2.5 text-sm text-[#111111] focus:border-[#E67230] focus:outline-none focus:ring-1 focus:ring-[#E67230]"
              >
                <option value="EMR & Clinical Documentation">EMR & Clinical Documentation (Nadi/Prakriti/Case Sheet)</option>
                <option value="Pharmacy & Formulation Procurement">Pharmacy & Formulation Procurement</option>
                <option value="Patient Scheduling & Follow-ups">Patient Scheduling, Adherence & Tele-consultations</option>
                <option value="Insurance, NHCX & Cashless Claims">Insurance, NHCX & Cashless Claims</option>
                <option value="Multi-Clinic Asset Management">Multi-Clinic & Asset Management</option>
                <option value="Research, Protocol & Journal Archiving">Research, Protocol & Case Series Archiving</option>
                <option value="Other Operational Bottleneck">Other Operational Bottleneck</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#333333] mb-1.5">
                Challenge Headline *
              </label>
              <input
                type="text"
                value={challengeTitle}
                onChange={(e) => setChallengeTitle(e.target.value)}
                placeholder="e.g. Too much manual typing during Nadi Pariksha notes"
                className="w-full rounded-xl border border-[#D5D0C7] bg-[#FAF9F6] px-3.5 py-2.5 text-sm text-[#111111] placeholder:text-[#999999] focus:border-[#E67230] focus:outline-none focus:ring-1 focus:ring-[#E67230]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#333333] mb-1.5">
                Detailed Description *
              </label>
              <textarea
                value={challengeDescription}
                onChange={(e) => setChallengeDescription(e.target.value)}
                rows={4}
                placeholder="Describe what happens currently, how much time it consumes, and what ideal solution would save you hours every week..."
                className="w-full rounded-xl border border-[#D5D0C7] bg-[#FAF9F6] px-3.5 py-2.5 text-sm text-[#111111] placeholder:text-[#999999] focus:border-[#E67230] focus:outline-none focus:ring-1 focus:ring-[#E67230] resize-none"
                required
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setChallengeModalOpen(false)}
                className="rounded-xl border border-[#EBE7DF] px-4 py-2.5 text-sm font-semibold text-[#555555] hover:bg-[#FAF9F6] transition-colors"
                disabled={submittingChallenge}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submittingChallenge}
                className="inline-flex items-center gap-2 rounded-xl bg-[#E67230] px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-[#D15F1F] transition-colors disabled:opacity-60 cursor-pointer"
              >
                {submittingChallenge ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <Send className="size-4" />
                    <span>Submit Challenge</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default Home;
