import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  HelpCircle,
  ArrowRight,
  ArrowLeft,
  Check,
  ClipboardList,
  Sparkles,
  CheckCircle2,
  BarChart3,
  Flame,
  Award,
} from "lucide-react";
import { seo } from "@/lib/seo";
import { apiClient } from "@/services/apiClient";
import { toast } from "sonner";

export const Route = createFileRoute("/_ws/survey")({
  head: () =>
    seo(
      "Practitioner Surveys | Meyveda",
      "Participate in Meyveda clinical surveys and view live peer results.",
    ),
  component: SurveyPage,
});

interface Question {
  id: string;
  title: string;
  type: "radio" | "checkbox" | "rating" | "text";
  options: string[];
  required: boolean;
  helpText?: string;
}

interface SurveyItem {
  id: string;
  title: string;
  description: string;
  category: string;
  reward_points: number;
  status: string;
  questions: Question[];
  total_responses: number;
}

interface QuestionInsight {
  question_id: string;
  question_title: string;
  question_type: string;
  total_votes: number;
  options: {
    option: string;
    count: number;
    percentage: number;
  }[];
  text_answers?: string[];
}

interface InsightsData {
  survey_id: string;
  title: string;
  reward_points: number;
  total_responses: number;
  question_insights: QuestionInsight[];
}

export function SurveyPage() {
  const [surveys, setSurveys] = useState<SurveyItem[]>([]);
  const [completedSurveyIds, setCompletedSurveyIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Active view state
  const [activeSurvey, setActiveSurvey] = useState<SurveyItem | null>(null);
  const [viewMode, setViewMode] = useState<"fill" | "results" | null>(null);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [submitting, setSubmitting] = useState(false);
  const [insights, setInsights] = useState<InsightsData | null>(null);
  const [loadingInsights, setLoadingInsights] = useState(false);

  const doctorEmail = localStorage.getItem("meyveda_user_email") || "doctor@practice.com";
  const doctorName = localStorage.getItem("meyveda_user_name") || "Dr. Ramesh Vaidya";

  useEffect(() => {
    loadSurveysAndStatus();
  }, []);

  const loadSurveysAndStatus = async () => {
    setLoading(true);
    try {
      const [surveyList, completedIds] = await Promise.all([
        apiClient.get<SurveyItem[]>("/content/surveys/list").catch(() => []),
        apiClient
          .get<string[]>(`/content/surveys/my-completed?doctor_email=${encodeURIComponent(doctorEmail)}`)
          .catch(() => []),
      ]);

      const localCompleted: string[] = JSON.parse(
        localStorage.getItem("meyveda_submitted_surveys") || "[]",
      );
      const mergedCompleted = Array.from(new Set([...(completedIds || []), ...localCompleted]));

      setSurveys(Array.isArray(surveyList) ? surveyList : []);
      setCompletedSurveyIds(mergedCompleted);
    } catch (err) {
      console.error("Failed to load surveys:", err);
      toast.error("Could not load surveys.");
    } finally {
      setLoading(false);
    }
  };

  const handleStartSurvey = (survey: SurveyItem) => {
    setActiveSurvey(survey);
    setViewMode("fill");
    setAnswers({});
  };

  const handleViewResults = async (survey: SurveyItem) => {
    setActiveSurvey(survey);
    setViewMode("results");
    setLoadingInsights(true);
    try {
      const res = await apiClient.get<InsightsData>(`/content/surveys/insights/${survey.id}`);
      setInsights(res);
    } catch (err) {
      console.error("Failed to load survey results:", err);
      toast.error("Could not load survey results.");
    } finally {
      setLoadingInsights(false);
    }
  };

  const handleBackToList = () => {
    setActiveSurvey(null);
    setViewMode(null);
    setAnswers({});
    setInsights(null);
    loadSurveysAndStatus();
  };

  const handleOptionSelect = (questionId: string, option: string, isCheckbox: boolean) => {
    if (isCheckbox) {
      const current = (answers[questionId] as string[]) || [];
      if (current.includes(option)) {
        setAnswers({ ...answers, [questionId]: current.filter((item) => item !== option) });
      } else {
        setAnswers({ ...answers, [questionId]: [...current, option] });
      }
    } else {
      setAnswers({ ...answers, [questionId]: option });
    }
  };

  const handleRatingSelect = (questionId: string, rating: number) => {
    setAnswers({ ...answers, [questionId]: rating.toString() });
  };

  const handleTextChange = (questionId: string, text: string) => {
    setAnswers({ ...answers, [questionId]: text });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSurvey) return;

    for (const q of activeSurvey.questions) {
      if (q.required) {
        const ans = answers[q.id];
        if (ans === undefined || ans === null || ans === "" || (Array.isArray(ans) && ans.length === 0)) {
          toast.error(`Please answer required question: "${q.title}"`);
          return;
        }
      }
    }

    setSubmitting(true);
    try {
      const payload = {
        survey_id: activeSurvey.id,
        doctor_email: doctorEmail,
        doctor_name: doctorName,
        answers: answers,
      };

      await apiClient.post("/content/surveys/submit", payload);

      const localCompleted: string[] = JSON.parse(
        localStorage.getItem("meyveda_submitted_surveys") || "[]",
      );
      if (!localCompleted.includes(activeSurvey.id)) {
        localCompleted.push(activeSurvey.id);
        localStorage.setItem("meyveda_submitted_surveys", JSON.stringify(localCompleted));
      }
      setCompletedSurveyIds((prev) => Array.from(new Set([...prev, activeSurvey.id])));

      toast.success("Survey submitted successfully!");
      handleViewResults(activeSurvey);
    } catch (err: any) {
      console.error("Survey submission failed:", err);
      toast.error(err.response?.data?.detail || "Submission failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto flex min-h-[50vh] max-w-5xl flex-col items-center justify-center p-8">
        <div className="size-10 animate-spin rounded-full border-3 border-[#E67230] border-t-transparent" />
        <p className="mt-3 text-sm font-semibold text-[#666666]">Loading surveys...</p>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // VIEW 1: ACTIVE SURVEY QUESTIONNAIRE
  // ---------------------------------------------------------------------------
  if (activeSurvey && viewMode === "fill") {
    return (
      <div className="mx-auto w-full max-w-5xl px-4 py-8 md:px-8 space-y-6">
        <button
          type="button"
          onClick={handleBackToList}
          className="inline-flex items-center gap-2 rounded-lg border border-[#E5E0D5] bg-white px-3.5 py-2 text-xs font-bold text-[#555555] hover:border-[#E67230] hover:text-[#E67230] transition-all cursor-pointer shadow-2xs"
        >
          <ArrowLeft className="size-3.5" />
          <span>Back to All Surveys</span>
        </button>

        <div className="relative overflow-hidden rounded-2xl border-2 border-[#E67230]/30 bg-gradient-to-br from-[#FFFDF9] via-white to-[#FDF4EC] p-6 sm:p-8 shadow-sm">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E67230]/10 px-3 py-1 text-xs font-bold text-[#E67230]">
              <Sparkles className="size-3.5" />
              Clinical Survey Questionnaire
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111111] tracking-tight">
              {activeSurvey.title}
            </h1>
            {activeSurvey.description && (
              <p className="text-sm text-[#555555] leading-relaxed max-w-3xl">
                {activeSurvey.description}
              </p>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {activeSurvey.questions.map((q, idx) => (
            <div
              key={q.id || idx}
              className="rounded-2xl border border-[#E5E0D5] bg-white p-6 sm:p-7 shadow-xs hover:border-[#E67230]/40 transition-colors space-y-4"
            >
              <div className="space-y-1">
                <label className="text-base font-extrabold text-[#111111] flex items-start gap-2">
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[#FAF4ED] text-xs font-black text-[#E67230] border border-[#E67230]/30">
                    {idx + 1}
                  </span>
                  <span>
                    {q.title}
                    {q.required && <span className="ml-1 text-red-500 font-bold">*</span>}
                  </span>
                </label>
                {q.helpText && (
                  <p className="text-xs text-[#777777] pl-8">{q.helpText}</p>
                )}
              </div>

              {/* RADIO */}
              {q.type === "radio" && (
                <div className="space-y-2.5 pt-1 pl-0 sm:pl-8">
                  {q.options.map((opt, optIdx) => {
                    const isSelected = answers[q.id] === opt;
                    return (
                      <label
                        key={optIdx}
                        onClick={() => handleOptionSelect(q.id, opt, false)}
                        className={`flex cursor-pointer items-center gap-3.5 rounded-xl border p-4 text-xs sm:text-sm transition-all ${
                          isSelected
                            ? "border-[#E67230] bg-[#FFFBF8] text-[#111111] font-semibold ring-1 ring-[#E67230] shadow-2xs"
                            : "border-[#EBE7DF] bg-[#FAF9F6] text-[#444444] hover:bg-white hover:border-[#D5CFC2]"
                        }`}
                      >
                        <div
                          className={`flex size-4.5 shrink-0 items-center justify-center rounded-full border transition-all ${
                            isSelected
                              ? "border-[#E67230] bg-[#E67230] text-white"
                              : "border-[#BDB7AB] bg-white"
                          }`}
                        >
                          {isSelected && <div className="size-1.5 rounded-full bg-white" />}
                        </div>
                        <span>{opt}</span>
                      </label>
                    );
                  })}
                </div>
              )}

              {/* CHECKBOX */}
              {q.type === "checkbox" && (
                <div className="space-y-2.5 pt-1 pl-0 sm:pl-8">
                  {q.options.map((opt, optIdx) => {
                    const current = (answers[q.id] as string[]) || [];
                    const isSelected = current.includes(opt);
                    return (
                      <label
                        key={optIdx}
                        onClick={() => handleOptionSelect(q.id, opt, true)}
                        className={`flex cursor-pointer items-center gap-3.5 rounded-xl border p-4 text-xs sm:text-sm transition-all ${
                          isSelected
                            ? "border-[#E67230] bg-[#FFFBF8] text-[#111111] font-semibold ring-1 ring-[#E67230] shadow-2xs"
                            : "border-[#EBE7DF] bg-[#FAF9F6] text-[#444444] hover:bg-white hover:border-[#D5CFC2]"
                        }`}
                      >
                        <div
                          className={`flex size-4.5 shrink-0 items-center justify-center rounded-md border transition-all ${
                            isSelected
                              ? "border-[#E67230] bg-[#E67230] text-white"
                              : "border-[#BDB7AB] bg-white"
                          }`}
                        >
                          {isSelected && <Check className="size-3.5 stroke-[3]" />}
                        </div>
                        <span>{opt}</span>
                      </label>
                    );
                  })}
                </div>
              )}

              {/* RATING */}
              {q.type === "rating" && (
                <div className="pt-2 pl-0 sm:pl-8">
                  <div className="flex items-center gap-2.5 sm:gap-3">
                    {[1, 2, 3, 4, 5].map((num) => {
                      const isSelected = answers[q.id] === num.toString();
                      return (
                        <button
                          type="button"
                          key={num}
                          onClick={() => handleRatingSelect(q.id, num)}
                          className={`flex size-12 items-center justify-center rounded-xl border text-sm font-black transition-all cursor-pointer ${
                            isSelected
                              ? "border-[#E67230] bg-[#E67230] text-white shadow-sm ring-2 ring-[#E67230]/20"
                              : "border-[#E5E0D5] bg-[#FAF9F6] text-[#555555] hover:border-[#E67230] hover:text-[#E67230] hover:bg-white"
                          }`}
                        >
                          {num}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TEXT */}
              {q.type === "text" && (
                <div className="pt-1 pl-0 sm:pl-8">
                  <textarea
                    rows={3}
                    placeholder="Type your clinical reflection or note here..."
                    value={answers[q.id] || ""}
                    onChange={(e) => handleTextChange(q.id, e.target.value)}
                    className="w-full rounded-xl border border-[#E5E0D5] bg-[#FAF9F6] p-3.5 text-xs sm:text-sm text-[#111111] focus:border-[#E67230] focus:bg-white focus:outline-none placeholder:text-[#999999]"
                  />
                </div>
              )}
            </div>
          ))}

          <div className="flex items-center justify-between pt-3">
            <button
              type="button"
              onClick={handleBackToList}
              className="text-xs font-bold text-[#777777] hover:text-[#111111] cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#E67230] px-9 py-3.5 text-sm font-bold text-white shadow-md hover:bg-[#D15F1F] active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer"
            >
              {submitting ? (
                <span>Submitting Answers...</span>
              ) : (
                <>
                  <span>Submit Survey</span>
                  <ArrowRight className="size-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // VIEW 2: RESULTS VIEW WITH HIGH-CONTRAST MEYVEDA ORANGE BAR CHARTS
  // ---------------------------------------------------------------------------
  if (activeSurvey && viewMode === "results") {
    return (
      <div className="mx-auto w-full max-w-5xl px-4 py-8 md:px-8 space-y-6">
        <button
          type="button"
          onClick={handleBackToList}
          className="inline-flex items-center gap-2 rounded-lg border border-[#E5E0D5] bg-white px-3.5 py-2 text-xs font-bold text-[#555555] hover:border-[#E67230] hover:text-[#E67230] transition-all cursor-pointer shadow-2xs"
        >
          <ArrowLeft className="size-3.5" />
          <span>Back to All Surveys</span>
        </button>

        <div className="relative overflow-hidden rounded-2xl border-2 border-[#E67230]/30 bg-gradient-to-br from-[#FFFDF9] via-white to-[#FDF4EC] p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E67230]/10 px-3 py-1 text-xs font-bold text-[#E67230]">
                <BarChart3 className="size-3.5" />
                Aggregated Survey Results
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111111] tracking-tight">
                {activeSurvey.title}
              </h1>
              {activeSurvey.description && (
                <p className="text-sm text-[#555555] leading-relaxed max-w-2xl">
                  {activeSurvey.description}
                </p>
              )}
            </div>

            <div className="shrink-0 flex items-center gap-3">
              <div className="rounded-xl border border-[#E5E0D5] bg-white px-4 py-2.5 text-center shadow-2xs">
                <div className="text-xl font-black text-[#E67230]">
                  {insights?.total_responses ?? activeSurvey.total_responses}
                </div>
                <div className="text-[10px] font-bold text-[#888888] uppercase tracking-wider">
                  Total Doctors
                </div>
              </div>
            </div>
          </div>
        </div>

        {loadingInsights ? (
          <div className="flex min-h-[40vh] items-center justify-center">
            <div className="size-10 animate-spin rounded-full border-3 border-[#E67230] border-t-transparent" />
          </div>
        ) : insights && insights.question_insights && insights.question_insights.length > 0 ? (
          <div className="space-y-5">
            {insights.question_insights.map((qi, qIdx) => (
              <div
                key={qi.question_id || qIdx}
                className="rounded-2xl border border-[#E5E0D5] bg-white p-6 sm:p-7 shadow-xs space-y-4"
              >
                <div className="flex items-start justify-between gap-4 border-b border-[#F4EFE6] pb-3">
                  <h3 className="text-base font-bold text-[#111111]">
                    <span className="text-[#E67230] mr-2">Q{qIdx + 1}.</span>
                    {qi.question_title}
                  </h3>
                  <span className="shrink-0 rounded-full bg-[#FAF4ED] px-2.5 py-0.5 text-xs font-bold text-[#E67230]">
                    {qi.total_votes} {qi.total_votes === 1 ? "Vote" : "Votes"}
                  </span>
                </div>

                {qi.options && qi.options.length > 0 ? (
                  <div className="space-y-3.5 pt-2">
                    {qi.options.map((optItem, optIdx) => (
                      <div key={optIdx} className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs sm:text-sm font-semibold text-[#222222]">
                          <span className="max-w-[75%] truncate" title={optItem.option}>
                            {optItem.option}
                          </span>
                          <span className="font-mono text-xs font-bold text-[#111111]">
                            {optItem.percentage}% ({optItem.count})
                          </span>
                        </div>
                        {/* Meyveda Brand Vivid Orange Fill Bar */}
                        <div className="h-3.5 w-full overflow-hidden rounded-full bg-[#FAF4ED] p-0.5 border border-[#F0E6D8]">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-[#E67230] to-[#F2994A] transition-all duration-700 ease-out shadow-2xs"
                            style={{ width: `${Math.max(optItem.percentage, 2)}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : qi.text_answers && qi.text_answers.length > 0 ? (
                  <div className="space-y-2 pt-1">
                    {qi.text_answers.map((ans, aIdx) => (
                      <div
                        key={aIdx}
                        className="rounded-xl border border-[#EBE7DF] bg-[#FAF9F6] p-3.5 text-xs sm:text-sm text-[#333333] leading-relaxed italic"
                      >
                        "{ans}"
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-[#888888] italic">No responses recorded yet.</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-[#E5E0D5] bg-white p-10 text-center">
            <p className="text-sm font-semibold text-[#777777]">
              No responses recorded yet.
            </p>
          </div>
        )}
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // VIEW 3: RICH BRANDED SURVEY CARDS (BIGGER, ORANGE ACCENTED, HIGH VISIBILITY)
  // ---------------------------------------------------------------------------
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 md:px-8 space-y-8">
      {/* Top Banner Header */}
      <div className="relative overflow-hidden rounded-3xl border-2 border-[#E67230]/25 bg-gradient-to-br from-[#FFFDF9] via-white to-[#FDF4EC] p-7 md:p-9 shadow-sm">
        <div className="space-y-2 max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#E67230]/10 px-3.5 py-1 text-xs font-black tracking-wide text-[#E67230] uppercase">
            <Sparkles className="size-3.5" />
            Practitioner Intelligence Desk
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-[#111111]">
            Clinical & Formulary Surveys
          </h1>
          <p className="text-sm sm:text-base text-[#555555] leading-relaxed">
            Share your clinical experience, classical pharmacy requirements, and diagnostic preferences. View live peer patterns to understand how Vaidyas practice across India.
          </p>
        </div>
      </div>

      {/* Surveys Catalog Grid */}
      {surveys.length === 0 ? (
        <div className="rounded-3xl border border-[#E5E0D5] bg-white p-14 text-center shadow-xs">
          <ClipboardList className="mx-auto size-12 text-[#BDB7AB]" />
          <h2 className="mt-4 text-lg font-bold text-[#111111]">No Open Surveys</h2>
          <p className="mt-1 text-xs sm:text-sm text-[#777777]">
            The Meyveda Clinical Desk currently has no open surveys. Please check back soon!
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {surveys.map((survey) => {
            const isCompleted = completedSurveyIds.includes(survey.id);

            return (
              <div
                key={survey.id}
                className="group relative overflow-hidden rounded-2xl border-2 border-[#EBE7DF] bg-white p-7 sm:p-8 shadow-xs hover:border-[#E67230] hover:shadow-md transition-all duration-200"
              >
                {/* Left Orange Decorative Border Highlight */}
                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#E67230] transition-all group-hover:w-2.5" />

                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pl-2 sm:pl-3">
                  {/* Survey Details */}
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FAF4ED] px-3 py-1 text-xs font-bold text-[#E67230] border border-[#E67230]/25">
                        <ClipboardList className="size-3.5" />
                        {survey.questions?.length || 0} Questions
                      </span>

                      {isCompleted ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="size-3.5" />
                          Completed
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700 border border-amber-200">
                          <Flame className="size-3.5 text-amber-600" />
                          Open for Input
                        </span>
                      )}
                    </div>

                    <h2 className="text-xl sm:text-2xl font-black text-[#111111] tracking-tight group-hover:text-[#E67230] transition-colors">
                      {survey.title}
                    </h2>

                    {survey.description && (
                      <p className="text-xs sm:text-sm text-[#555555] leading-relaxed line-clamp-2 max-w-3xl">
                        {survey.description}
                      </p>
                    )}
                  </div>

                  {/* Action Button */}
                  <div className="shrink-0 pt-2 lg:pt-0">
                    {isCompleted ? (
                      <button
                        type="button"
                        onClick={() => handleViewResults(survey)}
                        className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl border-2 border-[#E67230] bg-[#FFFBF8] px-6 py-3.5 text-xs sm:text-sm font-bold text-[#E67230] hover:bg-[#E67230] hover:text-white transition-all duration-150 cursor-pointer shadow-2xs group-hover:shadow-xs active:scale-[0.98]"
                      >
                        <BarChart3 className="size-4" />
                        <span>View Results</span>
                        <ArrowRight className="size-4" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleStartSurvey(survey)}
                        className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-[#E67230] px-7 py-3.5 text-xs sm:text-sm font-black text-white shadow-sm hover:bg-[#D15F1F] active:scale-[0.98] transition-all duration-150 cursor-pointer"
                      >
                        <span>Start Survey</span>
                        <ArrowRight className="size-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default SurveyPage;
