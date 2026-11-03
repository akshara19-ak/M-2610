import { useState, useEffect, useCallback } from "react";
import {
  RotateCw,
  Search,
  CheckCircle2,
  Clock,
  Eye,
  X,
  Sparkles,
  Calendar,
  AlertCircle,
  Stethoscope,
} from "lucide-react";
import { toast } from "sonner";
import { apiClient } from "@/services/apiClient";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export interface DoctorChallengeRecord {
  id: string;
  doctor_id?: string | null;
  doctor_name: string;
  doctor_email: string;
  doctor_phone?: string | null;
  license_number?: string | null;
  challenge: string;
  status: "New" | "In Review" | "Planned" | "Resolved";
  admin_notes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface DoctorChallengeStats {
  total: number;
  new_count: number;
  in_review_count: number;
  planned_count: number;
  resolved_count: number;
}

const STATUSES = ["All", "New", "In Review", "Planned", "Resolved"] as const;

export function LiveDoctorChallengesSection() {
  const [challenges, setChallenges] = useState<DoctorChallengeRecord[]>([]);
  const [stats, setStats] = useState<DoctorChallengeStats>({
    total: 0,
    new_count: 0,
    in_review_count: 0,
    planned_count: 0,
    resolved_count: 0,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");

  const [selectedChallenge, setSelectedChallenge] = useState<DoctorChallengeRecord | null>(null);
  const [modalStatus, setModalStatus] = useState<string>("New");
  const [modalNotes, setModalNotes] = useState<string>("");
  const [isUpdating, setIsUpdating] = useState(false);

  const loadChallenges = useCallback(async (showToast = false) => {
    if (showToast) setIsRefreshing(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "All") params.append("status", statusFilter);
      if (search.trim()) params.append("search", search.trim());
      params.append("limit", "100");

      const res = await apiClient.get<{
        items: DoctorChallengeRecord[];
        total: number;
        stats: DoctorChallengeStats;
      }>(`/challenges/admin/list?${params.toString()}`);

      setChallenges(res.items || []);
      if (res.stats) {
        setStats(res.stats);
      }
      if (showToast) {
        toast.success("Doctor challenges refreshed from live database.");
      }
    } catch (err: any) {
      console.error("Error fetching doctor challenges:", err);
      toast.error(err?.message || "Failed to load doctor challenges.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [statusFilter, search]);

  useEffect(() => {
    loadChallenges();
  }, [loadChallenges]);

  const handleOpenDetails = (item: DoctorChallengeRecord) => {
    setSelectedChallenge(item);
    setModalStatus(item.status);
    setModalNotes(item.admin_notes || "");
  };

  const handleSaveStatus = async () => {
    if (!selectedChallenge) return;
    setIsUpdating(true);
    try {
      const res = await apiClient.patch<DoctorChallengeRecord>(
        `/challenges/admin/${selectedChallenge.id}/status`,
        {
          status: modalStatus,
          admin_notes: modalNotes,
        }
      );
      toast.success(`Challenge status updated to '${modalStatus}'.`);
      setChallenges((prev) =>
        prev.map((c) => (c.id === res.id ? res : c))
      );
      setSelectedChallenge(res);
      loadChallenges(false);
    } catch (err: any) {
      toast.error(err?.message || "Failed to update challenge status.");
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusBadge = (st: string) => {
    switch (st) {
      case "New":
        return <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-700">New</span>;
      case "In Review":
        return <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800">In Review</span>;
      case "Planned":
        return <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-semibold text-purple-800">Planned</span>;
      case "Resolved":
        return <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">Resolved</span>;
      default:
        return <span className="inline-flex items-center gap-1 rounded-full bg-stone-100 px-2.5 py-0.5 text-xs font-semibold text-stone-700">{st}</span>;
    }
  };

  return (
    <section className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#EBE7DF] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-[#E67230]" />
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#111111]">
              Doctor Workflow Challenges
            </h2>
          </div>
          <p className="mt-1 text-sm text-[#666666]">
            Real-time practitioner feedback submitted via "Share Your Biggest Workflow Challenge" in Doctor Workspace.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => loadChallenges(true)}
            disabled={isRefreshing}
            className="border-[#D5D0C7] text-[#333333] hover:bg-[#FAF9F6] gap-2 cursor-pointer"
          >
            <RotateCw className={cn("size-3.5", isRefreshing && "animate-spin")} />
            Refresh
          </Button>
        </div>
      </div>

      {/* KPI Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-[#EBE7DF] bg-white p-4 shadow-xs">
          <p className="text-xs font-medium text-[#777777]">Total Challenges</p>
          <p className="mt-1 text-2xl font-extrabold text-[#111111]">{stats.total}</p>
        </div>
        <div className="rounded-2xl border border-blue-200 bg-blue-50/40 p-4 shadow-xs">
          <p className="text-xs font-semibold text-blue-700">New / Unaddressed</p>
          <p className="mt-1 text-2xl font-extrabold text-blue-900">{stats.new_count}</p>
        </div>
        <div className="rounded-2xl border border-amber-200 bg-amber-50/40 p-4 shadow-xs">
          <p className="text-xs font-semibold text-amber-800">In Review</p>
          <p className="mt-1 text-2xl font-extrabold text-amber-950">{stats.in_review_count}</p>
        </div>
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/40 p-4 shadow-xs">
          <p className="text-xs font-semibold text-emerald-800">Resolved / Built</p>
          <p className="mt-1 text-2xl font-extrabold text-emerald-950">{stats.resolved_count}</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#FAF9F6] p-3.5 rounded-2xl border border-[#EBE7DF]">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-[#888888]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by doctor name, email, license or challenge keyword..."
            className="w-full rounded-xl border border-[#D5D0C7] bg-white pl-9 pr-3.5 py-2 text-sm text-[#111111] placeholder:text-[#999999] focus:border-[#E67230] focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-[#D5D0C7] bg-white px-3 py-2 text-sm text-[#111111] focus:border-[#E67230] focus:outline-none cursor-pointer"
          >
            {STATUSES.map((st) => (
              <option key={st} value={st}>
                Status: {st}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Challenges Table */}
      <div className="overflow-hidden rounded-2xl border border-[#EBE7DF] bg-white shadow-xs">
        {isLoading ? (
          <div className="py-16 text-center text-sm text-[#777777]">
            <Clock className="size-6 mx-auto mb-2 text-[#E67230] animate-spin" />
            Loading submitted challenges...
          </div>
        ) : challenges.length === 0 ? (
          <div className="py-16 text-center text-sm text-[#777777]">
            <AlertCircle className="size-6 mx-auto mb-2 text-[#999999]" />
            No practitioner challenges found matching your filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-[#EBE7DF] bg-[#FAF9F6] text-xs font-semibold uppercase tracking-wider text-[#666666]">
                <tr>
                  <th className="py-3.5 px-4">Doctor / Clinician</th>
                  <th className="py-3.5 px-4">Challenge Summary</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Date Submitted</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EBE7DF]">
                {challenges.map((c) => (
                  <tr
                    key={c.id}
                    onClick={() => handleOpenDetails(c)}
                    className="hover:bg-[#FAF9F6]/80 cursor-pointer transition-colors"
                  >
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-[#111111] flex items-center gap-1.5">
                        <Stethoscope className="size-3.5 text-[#E67230]" />
                        {c.doctor_name}
                      </div>
                      <div className="text-xs text-[#777777]">{c.doctor_email}</div>
                      {c.license_number && (
                        <div className="text-[11px] font-mono text-[#888888]">
                          Reg: {c.license_number}
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 max-w-md">
                      <p className="line-clamp-2 text-[#222222] font-medium leading-relaxed">
                        {c.challenge}
                      </p>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {getStatusBadge(c.status)}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-[#777777] whitespace-nowrap">
                      {new Date(c.created_at).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenDetails(c);
                        }}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-[#D5D0C7] bg-white px-3 py-1.5 text-xs font-semibold text-[#333333] hover:bg-[#FAF9F6] transition-colors cursor-pointer"
                      >
                        <Eye className="size-3.5" />
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Details & Status Modal */}
      {selectedChallenge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-xl rounded-3xl border border-[#EBE7DF] bg-white p-6 sm:p-7 shadow-2xl">
            <div className="flex items-start justify-between border-b border-[#EBE7DF] pb-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#E67230]">
                  PRACTITIONER CHALLENGE DOSSIER
                </span>
                <h3 className="mt-1 text-xl font-bold text-[#111111]">
                  {selectedChallenge.doctor_name}
                </h3>
                <p className="text-xs text-[#777777]">{selectedChallenge.doctor_email}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedChallenge(null)}
                className="rounded-full p-1.5 text-[#777777] hover:bg-[#FAF9F6] hover:text-[#111111]"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="mt-5 space-y-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-[#555555]">
                  Challenge Narrative
                </label>
                <div className="mt-1.5 rounded-2xl border border-[#EBE7DF] bg-[#FAF9F6] p-4 text-sm text-[#111111] leading-relaxed whitespace-pre-wrap max-h-60 overflow-y-auto">
                  {selectedChallenge.challenge}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs text-[#555555] bg-stone-50 p-3 rounded-xl border border-stone-200">
                <div>
                  <span className="font-semibold text-stone-700">Medical Council Reg:</span>{" "}
                  {selectedChallenge.license_number || "Not provided"}
                </div>
                <div>
                  <span className="font-semibold text-stone-700">Phone:</span>{" "}
                  {selectedChallenge.doctor_phone || "Not recorded"}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-[#555555] block mb-1">
                  Update Status
                </label>
                <select
                  value={modalStatus}
                  onChange={(e) => setModalStatus(e.target.value)}
                  className="w-full rounded-xl border border-[#D5D0C7] bg-white px-3 py-2 text-sm text-[#111111] focus:border-[#E67230] focus:outline-none"
                >
                  <option value="New">New</option>
                  <option value="In Review">In Review</option>
                  <option value="Planned">Planned</option>
                  <option value="Resolved">Resolved</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-[#555555] block mb-1">
                  Admin / Engineering Roadmap Notes
                </label>
                <textarea
                  value={modalNotes}
                  onChange={(e) => setModalNotes(e.target.value)}
                  rows={3}
                  placeholder="Internal notes regarding feature planning, timeline, or direct clinician response..."
                  className="w-full rounded-xl border border-[#D5D0C7] bg-white p-3 text-sm text-[#111111] placeholder:text-[#999999] focus:border-[#E67230] focus:outline-none resize-none"
                />
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3 border-t border-[#EBE7DF] pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setSelectedChallenge(null)}
                className="cursor-pointer"
              >
                Close
              </Button>
              <Button
                type="button"
                onClick={handleSaveStatus}
                disabled={isUpdating}
                className="bg-[#E67230] hover:bg-[#D15F1F] text-white font-bold cursor-pointer"
              >
                {isUpdating ? "Saving..." : "Save Status"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

