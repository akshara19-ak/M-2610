import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  UserPlus,
  Copy,
  Check,
  Search,
  MessageCircle,
  Download,
  QrCode,
  Users,
  Award,
  CheckCircle2,
  Clock,
  Send,
  User,
} from "lucide-react";
import QRCode from "qrcode";
import { toast } from "sonner";
import { useStore, setState, type DoctorReferral, type ReferralStatus } from "@/lib/store";
import { seo } from "@/lib/seo";
import { apiClient } from "@/services/apiClient";
import { copyToClipboard } from "@/lib/clipboard";
import {
  sanitizeMobileInput,
  validateIndianMobile,
  validateAuthenticEmail,
} from "@/lib/validation";

export interface ReferralsSearchParams {
  tab?: "overview" | "history" | undefined;
  status?: string | undefined;
  q?: string | undefined;
}

export const Route = createFileRoute("/_ws/referrals")({
  validateSearch: (s: Record<string, unknown>): ReferralsSearchParams => ({
    tab: s["tab"] === "history" ? "history" : "overview",
    status: typeof s["status"] === "string" ? s["status"] : undefined,
    q: typeof s["q"] === "string" ? s["q"] : undefined,
  }),
  head: () =>
    seo(
      "Doctor Referrals & Early Access | Meyveda",
      "Invite qualified AYUSH practitioners to the Meyveda peer clinical network and track early access onboarding.",
    ),
  component: ReferralsPage,
});

export const REFERRAL_STATUSES: readonly ReferralStatus[] = [
  "Invitation Sent",
  "Registered",
  "Council Verified",
  "Access Active",
  "Expired",
] as const;

export function ReferralsPage() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const doctor = useStore((s) => s.doctor);
  const referrals = useStore((s) => s.referrals);
  const referralAccount = useStore((s) => s.referralAccount);

  const activeTab = search.tab === "history" ? "history" : "overview";
  const statusFilter = search.status || "All";
  const q = search.q || "";

  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>("");

  // Invite Form state
  const [inviteName, setInviteName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteMobile, setInviteMobile] = useState("");
  const [inviteQualification, setInviteQualification] = useState("BAMS");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<{
    name?: string;
    email?: string;
    mobile?: string;
    qualification?: string;
  }>({});

  const [inviteSuccessInfo, setInviteSuccessInfo] = useState<{
    id: string;
    name: string;
    email: string;
    mobile: string;
    qualification: string;
    inviteCode: string;
    registrationUrl: string;
  } | null>(null);

  const defaultCode = (doctor as any)?.inviteCode || "MSV77";
  const [inviteCode, setInviteCode] = useState<string>(defaultCode);
  const [verifiedCount, setVerifiedCount] = useState<number>(0);

  const origin = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";
  const fullInviteUrl = `${origin}/register?ref=${inviteCode}`;

  // Fetch summary from backend
  useEffect(() => {
    let active = true;
    async function fetchReferralSummary() {
      try {
        const res = await apiClient.get<{
          invite_code: string;
          invite_url: string;
          referral_count: number;
          total_rewards: number;
        }>("/referrals/my-summary");

        if (active && res) {
          if (res.invite_code) setInviteCode(res.invite_code);
          if (res.referral_count !== undefined) setVerifiedCount(res.referral_count);
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

  // Generate QR Code for fullInviteUrl
  useEffect(() => {
    if (!fullInviteUrl) return;
    QRCode.toDataURL(fullInviteUrl, {
      width: 280,
      margin: 1.5,
      color: {
        dark: "#111111",
        light: "#FFFFFF",
      },
    })
      .then((url) => setQrCodeDataUrl(url))
      .catch((err) => console.error("QR Code error:", err));
  }, [fullInviteUrl]);

  const updateSearch = (patch: Partial<ReferralsSearchParams>) => {
    (navigate as any)({
      search: (prev: any) => ({
        ...(typeof prev === "object" && prev ? prev : {}),
        ...patch,
      }),
    });
  };

  const handleCopyLink = async () => {
    const success = await copyToClipboard(fullInviteUrl);
    if (success) {
      setCopiedLink(true);
      toast.success("Invite link copied to clipboard!");
      setTimeout(() => setCopiedLink(false), 2500);
    } else {
      toast.error("Could not copy link to clipboard.");
    }
  };

  const handleCopyCode = async () => {
    const success = await copyToClipboard(inviteCode);
    if (success) {
      setCopiedCode(true);
      toast.success(`Invite code ${inviteCode} copied!`);
      setTimeout(() => setCopiedCode(false), 2500);
    } else {
      toast.error("Could not copy code to clipboard.");
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

  // Handle invite submission
  const handleSendInvite = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: { name?: string; email?: string; mobile?: string } = {};

    if (!inviteName.trim() || inviteName.trim().length < 3) {
      errors.name = "Enter your colleague's valid full professional name.";
    }

    const emailValidation = validateAuthenticEmail(inviteEmail);
    if (!emailValidation.valid) {
      errors.email = emailValidation.error || "Enter a valid authentic email.";
    }

    const mobileValidation = validateIndianMobile(inviteMobile);
    if (!mobileValidation.valid) {
      errors.mobile = mobileValidation.error || "Enter a valid 10-digit Indian mobile number.";
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      toast.error("Please correct the form errors before submitting.");
      return;
    }

    setIsSubmitting(true);
    apiClient
      .post<{ id: string; invited_name: string; invited_email: string }>("/referrals/send", {
        name: inviteName.trim(),
        email: inviteEmail.trim().toLowerCase(),
        mobile: inviteMobile.trim(),
        qualification: inviteQualification.trim(),
      })
      .then((res) => {
        setIsSubmitting(false);
        const record: DoctorReferral = {
          id: res.id || `ref-${Date.now()}`,
          invitedName: inviteName.trim(),
          invitedEmail: inviteEmail.trim().toLowerCase(),
          invitedSpecialty: inviteQualification.trim(),
          invitedCouncil: "State Council Verification Pending",
          dateInvited: new Date().toISOString().split("T")[0],
          status: "Invitation Sent",
          statusUpdatedDate: new Date().toISOString().split("T")[0],
          isDemoSample: false,
        };

        setState((s) => ({
          referrals: [record, ...s.referrals.filter((r) => r.id !== res.id)],
        }));

        setInviteSuccessInfo({
          id: record.id,
          name: record.invitedName || inviteName.trim(),
          email: record.invitedEmail,
          mobile: inviteMobile.trim(),
          qualification: inviteQualification.trim(),
          inviteCode: inviteCode,
          registrationUrl: fullInviteUrl,
        });

        setInviteName("");
        setInviteEmail("");
        setInviteMobile("");
        setInviteQualification("BAMS");

        toast.success("Invitation dispatched successfully!");
      })
      .catch((err: any) => {
        setIsSubmitting(false);
        const detailMsg = err?.response?.data?.detail || err?.message;
        if (typeof detailMsg === "string" && detailMsg.toLowerCase().includes("already refered")) {
          toast.error("Already refered by fellow");
        } else {
          toast.error(detailMsg || "Failed to submit referral. Please try again.");
        }
      });
  };

  // Filtered referrals for history tab
  const filteredReferrals = referrals.filter((r) => {
    if (statusFilter !== "All" && r.status !== statusFilter) return false;
    if (!q) return true;
    const query = q.trim().toLowerCase();
    const haystack = `${r.invitedName || ""} ${r.invitedEmail || ""} ${r.invitedSpecialty || ""} ${r.status || ""}`.toLowerCase();
    return haystack.includes(query);
  });

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 md:px-8 md:py-12 space-y-8 text-[#111111]">
      {/* 1. Header Typography */}
      <div className="space-y-2">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
          Referrals &amp; Early Access
        </h1>
        <p className="text-base text-muted-foreground leading-relaxed max-w-3xl">
          Invite verified AYUSH colleagues (BAMS, BSMS, BNYS, BHMS, BUMS) to join early access with your exclusive practitioner code and direct QR code.
        </p>
      </div>

      {/* 2. Navigation Tabs */}
      <div className="flex items-center gap-3 border-b border-border pb-4">
        <button
          type="button"
          onClick={() => updateSearch({ tab: "overview" })}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-colors cursor-pointer ${
            activeTab === "overview"
              ? "bg-[#E67230] text-white shadow-xs"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
          }`}
        >
          <span>Invite &amp; Overview</span>
        </button>

        

        <button
          type="button"
          onClick={() => updateSearch({ tab: "history" })}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-colors cursor-pointer ${
            activeTab === "history"
              ? "bg-[#E67230] text-white shadow-xs"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
          }`}
        >
          <span>Referral Records</span>
          <span
            className={`rounded-full px-2 py-0.5 text-xs ${
              activeTab === "history" ? "bg-white/20 text-white" : "bg-muted text-muted-foreground font-semibold"
            }`}
          >
            {referrals.length}
          </span>
        </button>
      </div>

      {/* TAB 1: OVERVIEW & QR CODE */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Top Row: Left = Metrics & QR Card, Right = Quick Colleague Invite Box */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left 7 Columns: Metrics Counters & QR Referral Link */}
            <div className="lg:col-span-7 space-y-6">
              {/* Metrics Overview Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div className="rounded-2xl border border-[#EBE7DF] bg-white p-5 shadow-xs space-y-1">
                  <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
                    Invited Colleagues
                  </span>
                  <div className="text-2xl font-extrabold text-[#111111]">
                    {(referralAccount.totalInvited ?? 0) || referrals.length}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Colleagues nominated
                  </p>
                </div>

                <div className="rounded-2xl border border-[#EBE7DF] bg-white p-5 shadow-xs space-y-1">
                  <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
                    Registrations
                  </span>
                  <div className="text-2xl font-extrabold text-[#E67230]">
                    {verifiedCount}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Practitioners onboarded
                  </p>
                </div>

                <div className="rounded-2xl border border-[#EBE7DF] bg-white p-5 shadow-xs space-y-1">
                  <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
                    Access Points
                  </span>
                  <div className="text-2xl font-extrabold text-[#111111]">
                    {referralAccount.referralPoints ?? 0} pts
                  </div>
                  <p className="text-xs text-muted-foreground">
                    10 pts / verified colleague
                  </p>
                </div>
              </div>

              {/* Unique Referral Invite Link & QR Code Card */}
              <section className="rounded-3xl border border-[#EBE7DF] bg-white p-6 sm:p-7 shadow-xs space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#EBE7DF] pb-4">
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold text-[#111111]">
                      Your Referral Link &amp; QR Code
                    </h2>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Colleagues can scan directly or register with your code.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <span className="text-xs text-muted-foreground font-medium">Code:</span>
                    <span className="rounded-xl border border-[#EBE7DF] bg-[#FAF9F6] px-3 py-1 font-mono text-sm font-bold text-[#E67230]">
                      {inviteCode}
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyCode}
                      className="rounded-xl border border-[#EBE7DF] bg-white p-1.5 text-[#666666] hover:text-[#E67230] hover:border-[#E67230] transition-colors cursor-pointer"
                      title="Copy code"
                    >
                      {copiedCode ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Link and QR Row */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 items-center">
                  <div className="sm:col-span-7 space-y-3.5">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-[#111111]">
                        Direct Registration Link:
                      </label>
                      <input
                        type="text"
                        readOnly
                        value={fullInviteUrl}
                        className="w-full rounded-xl border border-[#EBE7DF] bg-[#FAF9F6] px-3.5 py-2 font-mono text-xs text-[#222222] focus:outline-none select-all"
                      />
                    </div>

                    <div className="flex flex-wrap gap-2 pt-1">
                      <button
                        type="button"
                        onClick={handleCopyLink}
                        className="flex items-center justify-center gap-1.5 rounded-xl bg-[#E67230] px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#D15F1F] transition-colors cursor-pointer"
                      >
                        {copiedLink ? (
                          <>
                            <Check className="h-3.5 w-3.5" /> Copied Link
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
                        className="flex items-center justify-center gap-1.5 rounded-xl bg-[#25D366] px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#1EBE5D] transition-colors cursor-pointer"
                      >
                        <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
                      </a>

                      {qrCodeDataUrl && (
                        <button
                          type="button"
                          onClick={handleDownloadQr}
                          className="flex items-center justify-center gap-1.5 rounded-xl border border-[#EBE7DF] bg-white px-3.5 py-2 text-xs font-bold text-[#111111] hover:border-[#E67230] hover:text-[#E67230] transition-colors cursor-pointer"
                        >
                          <Download className="h-3.5 w-3.5" /> QR
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="sm:col-span-5 flex flex-col items-center justify-center p-3.5 rounded-2xl border border-[#EBE7DF] bg-[#FAF9F6]">
                    <div className="rounded-xl bg-white p-2 shadow-xs border border-[#EBE7DF]">
                      {qrCodeDataUrl ? (
                        <img
                          src={qrCodeDataUrl}
                          alt={`Meyveda Referral QR Code for ${inviteCode}`}
                          className="w-32 h-32 object-contain"
                        />
                      ) : (
                        <div className="w-32 h-32 flex items-center justify-center text-[10px] text-muted-foreground">
                          Generating QR...
                        </div>
                      )}
                    </div>
                    <p className="text-[11px] font-bold text-[#111111] mt-2">
                      Scan to Register
                    </p>
                  </div>
                </div>
              </section>
            </div>

            {/* Right 5 Columns: Compact Straightforward Invite Box in Top Right */}
            <div className="lg:col-span-5">
              <section className="rounded-3xl border border-[#EBE7DF] bg-white p-6 sm:p-7 shadow-xs space-y-4">
                <div className="border-b border-[#EBE7DF] pb-3 space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="flex h-2 w-2 rounded-full bg-[#E67230]" />
                    <h2 className="text-base sm:text-lg font-bold text-[#111111]">
                      Invite a Colleague
                    </h2>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Dispatch an official invite with your code &amp; 1-click link.
                  </p>
                </div>

                {inviteSuccessInfo ? (
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4 space-y-3.5">
                    <div className="flex items-center gap-2 text-emerald-700">
                      <CheckCircle2 className="h-4 w-4" />
                      <h3 className="text-xs font-bold">Invitation Dispatched!</h3>
                    </div>

                    <div className="space-y-0.5 text-xs text-[#333333]">
                      <p>Recipient: <strong>{inviteSuccessInfo.name}</strong></p>
                      <p className="text-muted-foreground">{inviteSuccessInfo.email}</p>
                      <p className="text-muted-foreground font-mono">+91 {inviteSuccessInfo.mobile}</p>
                    </div>

                    <div className="flex flex-col gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setInviteSuccessInfo(null)}
                        className="w-full rounded-xl bg-[#E67230] py-2 text-xs font-bold text-white shadow-xs hover:bg-[#D15F1F] transition-colors cursor-pointer"
                      >
                        Invite Another Colleague
                      </button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSendInvite} className="space-y-3">
                    {/* 1. Name */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-[#111111] block">
                        1. Colleague's Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={inviteName}
                        onChange={(e) => {
                          setInviteName(e.target.value);
                          if (formErrors.name) setFormErrors((p) => ({ ...p, name: undefined }));
                        }}
                        placeholder="e.g. Dr. Rajesh K. Varma"
                        className="w-full rounded-xl border border-[#EBE7DF] bg-[#FAF9F6] px-3.5 py-2 text-xs text-[#111111] focus:border-[#E67230] focus:bg-white focus:outline-none placeholder:text-muted-foreground"
                      />
                      {formErrors.name && (
                        <p className="text-[11px] text-red-500 font-medium">{formErrors.name}</p>
                      )}
                    </div>

                    {/* 2. Email */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-[#111111] block">
                        2. Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        value={inviteEmail}
                        onChange={(e) => {
                          setInviteEmail(e.target.value);
                          if (formErrors.email) setFormErrors((p) => ({ ...p, email: undefined }));
                        }}
                        placeholder="e.g. dr.rajesh@clinic.com"
                        className="w-full rounded-xl border border-[#EBE7DF] bg-[#FAF9F6] px-3.5 py-2 text-xs text-[#111111] focus:border-[#E67230] focus:bg-white focus:outline-none placeholder:text-muted-foreground"
                      />
                      {formErrors.email && (
                        <p className="text-[11px] text-red-500 font-medium">{formErrors.email}</p>
                      )}
                    </div>

                    {/* 3. Mobile */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-[#111111] block">
                        3. Mobile Number *
                      </label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-xs font-bold text-muted-foreground select-none pointer-events-none">
                          +91
                        </span>
                        <input
                          type="tel"
                          maxLength={10}
                          required
                          value={inviteMobile}
                          onChange={(e) => {
                            const val = sanitizeMobileInput(e.target.value);
                            setInviteMobile(val);
                            if (formErrors.mobile) setFormErrors((p) => ({ ...p, mobile: undefined }));
                          }}
                          placeholder="98765 43210"
                          className="w-full rounded-xl border border-[#EBE7DF] bg-[#FAF9F6] pl-10 pr-3 py-2 font-mono text-xs text-[#111111] focus:border-[#E67230] focus:bg-white focus:outline-none placeholder:text-muted-foreground"
                        />
                      </div>
                      {formErrors.mobile && (
                        <p className="text-[11px] text-red-500 font-medium">{formErrors.mobile}</p>
                      )}
                    </div>

                    <div className="pt-2 flex items-center justify-between gap-2 border-t border-[#EBE7DF]">
                      <button
                        type="button"
                        onClick={() => {
                          setInviteName("");
                          setInviteEmail("");
                          setInviteMobile("");
                          setFormErrors({});
                        }}
                        className="text-xs font-semibold text-muted-foreground hover:text-foreground cursor-pointer py-1"
                      >
                        Clear
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#E67230] px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#D15F1F] transition-colors disabled:opacity-50 cursor-pointer"
                      >
                        <Send className="h-3.5 w-3.5" />
                        {isSubmitting ? "Sending..." : "Send Invitation"}
                      </button>
                    </div>
                  </form>
                )}
              </section>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: REFERRAL RECORDS TABLE */}
      {activeTab === "history" && (
        <section className="rounded-3xl border border-[#EBE7DF] bg-white p-7 md:p-10 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-xl sm:text-2xl font-bold text-[#111111]">
              Referral Records &amp; Verification Status
            </h2>

            {/* Search Input */}
            <div className="relative max-w-sm w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                value={q}
                onChange={(e) => updateSearch({ q: e.target.value })}
                placeholder="Search colleagues..."
                className="w-full rounded-xl border border-[#EBE7DF] bg-[#FAF9F6] pl-10 pr-4 py-2.5 text-xs text-[#111111] focus:border-[#E67230] focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          {filteredReferrals.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#EBE7DF] p-10 text-center space-y-2">
              <Users className="mx-auto h-8 w-8 text-muted-foreground opacity-50" />
              <p className="text-sm font-bold text-[#111111]">No Referral Records Found</p>
              <p className="text-xs text-muted-foreground max-w-md mx-auto">
                Colleagues who register using your referral invite link or QR code will appear here automatically.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-[#EBE7DF]">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#EBE7DF] bg-[#FAF9F6] font-bold text-muted-foreground">
                    <th className="px-5 py-3.5">Colleague / Invitee</th>
                    <th className="px-5 py-3.5">Specialty &amp; Council</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5">Date Dispatched</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EBE7DF]">
                  {filteredReferrals.map((r) => (
                    <tr key={r.id} className="hover:bg-[#FAF9F6]/80 transition-colors">
                      <td className="px-5 py-4 space-y-0.5">
                        <div className="font-bold text-[#111111] text-sm">
                          {r.invitedName || "Ayurvedic Physician"}
                        </div>
                        <div className="text-muted-foreground font-mono text-xs">
                          {r.invitedEmail}
                        </div>
                      </td>

                      <td className="px-5 py-4 space-y-0.5">
                        <div className="font-medium text-[#111111]">
                          {r.invitedSpecialty || "General Ayurveda"}
                        </div>
                        <div className="text-muted-foreground text-xs">
                          {r.invitedCouncil || "State Council Verification Pending"}
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-bold text-emerald-700 border border-emerald-500/20">
                          <CheckCircle2 className="h-3 w-3" />
                          {r.status}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-muted-foreground whitespace-nowrap">
                        {r.dateInvited}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}
    </div>
  );
}

export default ReferralsPage;
