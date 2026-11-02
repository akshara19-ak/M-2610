import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  ClipboardList,
  Sparkles,
  CheckCircle2,
  Trophy,
  BarChart3,
  HelpCircle,
  ArrowRight,
  TrendingUp,
  Award,
  Users,
  Star,
  Check,
  RotateCcw,
  Sparkle,
  Stethoscope,
} from "lucide-react";
import { seo } from "@/lib/seo";
import { apiClient } from "@/services/apiClient";
import { toast } from "sonner";

export const Route = createFileRoute("/_ws/survey")({
  head: () =>
    seo(
      "Practitioner Survey & Industry Insights | Meyveda",
      "Participate in the Meyveda AYUSH clinical intelligence survey and unlock real-time peer analytics.",
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

interface SurveyData {
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
  const [survey, setSurvey] = useState<SurveyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [insights, setInsights] = useState<InsightsData | null>(null);
  const [activeTab, setActiveTab] = useState<"survey" | "insights">("survey");
  const [pointsEarned, setPointsEarned] = useState<number>(50);

  const doctorEmail = localStorage.getItem("meyveda_user_email") || "doctor@meyveda.com";
  const doctorName = localStorage.getItem("meyveda_user_name") || "Dr. Ramesh Vaidya";

  useEffect(() => {
    fetchActiveSurvey();
  }, []);

  const fetchActiveSurvey = async () => {
    setLoading(true);
    try {
      const data = await apiClient.get<SurveyData>("/content/surveys/active");
      setSurvey(data);
      if (data && data.reward_points) {
        setPointsEarned(data.reward_points);
      }
      // Check if user already submitted this survey locally or remotely
      const submittedSurveys = JSON.parse(localStorage.getItem("meyveda_submitted_surveys") || "[]");
      if (data && submittedSurveys.includes(data.id)) {
        setSubmitted(true);
        setActiveTab("insights");
        fetchInsights(data.id);
      }
    } catch (err: any) {
      console.error("Failed to fetch active survey:", err);
      toast.error("Unable to load the current clinical survey. Retrying...");
    } finally {
      setLoading(false);
    }
  };

  const fetchInsights = async (surveyId: string) => {
    try {
      const res = await apiClient.get<InsightsData>(`/content/surveys/insights/${surveyId}`);
      setInsights(res);
    } catch (err) {
      console.error("Failed to fetch survey insights:", err);
    }
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

  const calculateProgress = () => {
    if (!survey || !survey.questions || survey.questions.length === 0) return 0;
    const answeredCount = survey.questions.filter((q) => {
      const ans = answers[q.id];
      if (ans === undefined || ans === null || ans === "") return false;
      if (Array.isArray(ans) && ans.length === 0) return false;
      return true;
    }).length;
    return Math.round((answeredCount / survey.questions.length) * 100);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!survey) return;

    // Validate required questions
    for (const q of survey.questions) {
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
        survey_id: survey.id,
        doctor_email: doctorEmail,
        doctor_name: doctorName,
        answers: answers,
      };

      const res = await apiClient.post<any>("/content/surveys/submit", payload);
      const awarded = res.reward_points_awarded || survey.reward_points || 50;
      setPointsEarned(awarded);

      // Save submission ID locally to persist state across refreshes
      const submittedSurveys = JSON.parse(localStorage.getItem("meyveda_submitted_surveys") || "[]");
      if (!submittedSurveys.includes(survey.id)) {
        submittedSurveys.push(survey.id);
        localStorage.setItem("meyveda_submitted_surveys", JSON.stringify(submittedSurveys));
      }

      // Add points to local profile if available
      const currentPts = parseInt(localStorage.getItem("meyveda_doctor_reward_pts") || "0", 10);
      localStorage.setItem("meyveda_doctor_reward_pts", (currentPts + awarded).toString());

      toast.success(`🎉 Survey submitted! You earned +${awarded} Meyveda Reward Points.`);
      setSubmitted(true);
      setActiveTab("insights");
      fetchInsights(survey.id);
    } catch (err: any) {
      console.error("Survey submission failed:", err);
      toast.error(err.response?.data?.detail || "Submission failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const progress = calculateProgress();

  if (loading) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-4xl flex-col items-center justify-center p-8">
        <div className="size-12 animate-spin rounded-full border-4 border-[#E67230] border-t-transparent" />
        <p className="mt-4 text-sm font-semibold text-[#666666]">
          Loading clinical practitioner intelligence survey...
        </p>
      </div>
    );
  }

  if (!survey) {
    return (
      <div className="mx-auto max-w-4xl p-8 text-center">
        <div className="rounded-2xl border border-[#E5E0D5] bg-white p-10 shadow-xs">
          <HelpCircle className="mx-auto size-12 text-[#888888]" />
          <h2 className="mt-4 text-xl font-bold text-[#111111]">No Active Survey</h2>
          <p className="mt-1 text-sm text-[#666666]">
            The Meyveda Content & Clinical Desk currently has no open surveys. Please check back soon!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8 md:px-8">
      {/* -------------------------------------------------------------------- */}
      {/* 1. GAMIFIED HEADER & REWARD BANNER                                  */}
      {/* -------------------------------------------------------------------- */}
      <div className="relative overflow-hidden rounded-3xl border border-[#EBE7DF] bg-gradient-to-br from-[#FAF9F6] via-white to-[#FDF4EC] p-6 shadow-sm md:p-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E67230]/10 px-3 py-1 text-xs font-bold text-[#E67230]">
                <Sparkles className="size-3.5" />
                {survey.category || "AYUSH Clinical Practice"}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 border border-emerald-200">
                <Users className="size-3" />
                {survey.total_responses + (submitted ? 1 : 0)} Responses Recorded
              </span>
            </div>

            <h1 className="font-serif text-2xl font-bold tracking-tight text-[#111111] md:text-3xl">
              {survey.title}
            </h1>
            <p className="max-w-2xl text-xs leading-relaxed text-[#555555] md:text-sm">
              {survey.description}
            </p>
          </div>

          {/* Gamified Reward Badge */}
          <div className="flex shrink-0 items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50/70 p-4 shadow-2xs md:flex-col md:items-end md:text-right">
            <div className="flex size-11 items-center justify-center rounded-xl bg-amber-500 text-white shadow-xs">
              <Trophy className="size-6" />
            </div>
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-amber-900">
                Participation Reward
              </div>
              <div className="text-xl font-extrabold text-[#D15F1F]">
                +{pointsEarned} Points
              </div>
              <div className="text-[10px] text-amber-700/80">
                Meyveda Beta Perks & Priority Monograph
              </div>
            </div>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="mt-6 flex border-b border-[#E5E0D5] pt-2">
          <button
            onClick={() => setActiveTab("survey")}
            className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-bold transition-all ${
              activeTab === "survey"
                ? "border-[#E67230] text-[#E67230]"
                : "border-transparent text-[#666666] hover:text-[#111111]"
            }`}
          >
            <ClipboardList className="size-4" />
            <span>Survey Questionnaire</span>
            {submitted && (
              <span className="rounded-full bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700">
                Completed
              </span>
            )}
          </button>

          <button
            onClick={() => {
              setActiveTab("insights");
              fetchInsights(survey.id);
            }}
            className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-bold transition-all ${
              activeTab === "insights"
                ? "border-[#E67230] text-[#E67230]"
                : "border-transparent text-[#666666] hover:text-[#111111]"
            }`}
          >
            <BarChart3 className="size-4" />
            <span>Industry Insights & Peer Data</span>
            <span className="rounded-full bg-blue-100 px-1.5 py-0.5 text-[10px] font-bold text-blue-700">
              Live Graphs
            </span>
          </button>
        </div>
      </div>

      {/* -------------------------------------------------------------------- */}
      {/* 2. TAB A: QUESTIONNAIRE (GOOGLE FORMS STYLE)                          */}
      {/* -------------------------------------------------------------------- */}
      {activeTab === "survey" && (
        <div className="mt-6 space-y-6">
          {/* Completion Status Alert if already submitted */}
          {submitted ? (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/80 p-6 shadow-xs">
              <div className="flex items-start gap-4">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white">
                  <CheckCircle2 className="size-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-emerald-950">
                    Your Response Has Been Recorded!
                  </h3>
                  <p className="text-xs text-emerald-800 leading-relaxed">
                    Thank you, <span className="font-semibold">{doctorName}</span>. Your clinical input is helping shape the Meyveda AYUSH Practitioner Ecosystem. You have already received your{" "}
                    <span className="font-bold underline">+{pointsEarned} Reward Points</span>.
                  </p>
                  <div className="pt-3">
                    <button
                      onClick={() => {
                        setActiveTab("insights");
                        fetchInsights(survey.id);
                      }}
                      className="inline-flex items-center gap-2 rounded-lg bg-emerald-700 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-emerald-800 transition-colors"
                    >
                      <BarChart3 className="size-4" />
                      <span>View Industry Bar Graphs & Analysis</span>
                      <ArrowRight className="size-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Sticky Progress Indicator */}
              <div className="sticky top-20 z-10 rounded-xl border border-[#E5E0D5] bg-white/95 px-5 py-3 shadow-xs backdrop-blur-md">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-[#555555]">Completion Progress</span>
                  <span className="text-[#E67230]">{progress}% Complete</span>
                </div>
                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-[#EFECE6]">
                  <div
                    className="h-full bg-gradient-to-r from-[#E67230] to-[#F2994A] transition-all duration-300 ease-out"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              {/* Google Forms Questions Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                {survey.questions.map((q, idx) => (
                  <div
                    key={q.id || idx}
                    className="rounded-2xl border border-[#E5E0D5] bg-white p-6 shadow-2xs transition-all hover:border-[#D5CFC2]"
                  >
                    {/* Question Header */}
                    <div className="space-y-1">
                      <div className="flex items-start justify-between gap-3">
                        <label className="text-sm font-bold text-[#111111] md:text-base">
                          <span className="text-[#E67230] mr-1.5">{idx + 1}.</span>
                          {q.title}
                          {q.required && <span className="ml-1 text-red-500 font-bold">*</span>}
                        </label>
                        <span className="shrink-0 rounded bg-[#FAF4ED] px-2 py-0.5 text-[10px] font-bold text-[#A4521D] uppercase">
                          {q.type}
                        </span>
                      </div>
                      {q.helpText && (
                        <p className="text-xs text-[#777777] italic">{q.helpText}</p>
                      )}
                    </div>

                    {/* Question Input Renderers */}
                    <div className="mt-4 pt-2">
                      {/* TYPE 1: RADIO (Single Choice) */}
                      {q.type === "radio" && (
                        <div className="space-y-2.5">
                          {q.options.map((opt, optIdx) => {
                            const isSelected = answers[q.id] === opt;
                            return (
                              <label
                                key={optIdx}
                                onClick={() => handleOptionSelect(q.id, opt, false)}
                                className={`flex cursor-pointer items-center justify-between rounded-xl border p-3.5 text-xs transition-all ${
                                  isSelected
                                    ? "border-[#E67230] bg-[#FAF4ED] text-[#111111] font-semibold ring-1 ring-[#E67230]"
                                    : "border-[#E8E4DA] bg-white text-[#444444] hover:bg-[#FAF9F6] hover:border-[#D2CCC0]"
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  <div
                                    className={`flex size-4 items-center justify-center rounded-full border transition-all ${
                                      isSelected
                                        ? "border-[#E67230] bg-[#E67230] text-white"
                                        : "border-[#BDB7AB] bg-white"
                                    }`}
                                  >
                                    {isSelected && <div className="size-1.5 rounded-full bg-white" />}
                                  </div>
                                  <span>{opt}</span>
                                </div>
                              </label>
                            );
                          })}
                        </div>
                      )}

                      {/* TYPE 2: CHECKBOX (Multi Select) */}
                      {q.type === "checkbox" && (
                        <div className="space-y-2.5">
                          {q.options.map((opt, optIdx) => {
                            const current = (answers[q.id] as string[]) || [];
                            const isSelected = current.includes(opt);
                            return (
                              <label
                                key={optIdx}
                                onClick={() => handleOptionSelect(q.id, opt, true)}
                                className={`flex cursor-pointer items-center justify-between rounded-xl border p-3.5 text-xs transition-all ${
                                  isSelected
                                    ? "border-[#E67230] bg-[#FAF4ED] text-[#111111] font-semibold ring-1 ring-[#E67230]"
                                    : "border-[#E8E4DA] bg-white text-[#444444] hover:bg-[#FAF9F6] hover:border-[#D2CCC0]"
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  <div
                                    className={`flex size-4 items-center justify-center rounded-md border transition-all ${
                                      isSelected
                                        ? "border-[#E67230] bg-[#E67230] text-white"
                                        : "border-[#BDB7AB] bg-white"
                                    }`}
                                  >
                                    {isSelected && <Check className="size-3 stroke-[3]" />}
                                  </div>
                                  <span>{opt}</span>
                                </div>
                              </label>
                            );
                          })}
                        </div>
                      )}

                      {/* TYPE 3: RATING (1 to 5 Stars / Scale) */}
                      {q.type === "rating" && (
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 sm:gap-4">
                            {[1, 2, 3, 4, 5].map((num) => {
                              const isSelected = answers[q.id] === num.toString();
                              return (
                                <button
                                  type="button"
                                  key={num}
                                  onClick={() => handleRatingSelect(q.id, num)}
                                  className={`flex size-11 items-center justify-center rounded-xl border text-sm font-bold transition-all ${
                                    isSelected
                                      ? "border-[#E67230] bg-[#E67230] text-white shadow-sm ring-2 ring-[#E67230]/30"
                                      : "border-[#E5E0D5] bg-white text-[#555555] hover:border-[#E67230] hover:text-[#E67230]"
                                  }`}
                                >
                                  {num}
                                </button>
                              );
                            })}
                          </div>
                          <div className="flex justify-between text-[11px] text-[#888888] px-1 max-w-[280px]">
                            <span>1 = Low / Rarely</span>
                            <span>5 = Essential / High</span>
                          </div>
                        </div>
                      )}

                      {/* TYPE 4: TEXT / PARAGRAPH */}
                      {q.type === "text" && (
                        <div>
                          <textarea
                            rows={3}
                            placeholder="Share your clinical insight or feedback here..."
                            value={answers[q.id] || ""}
                            onChange={(e) => handleTextChange(q.id, e.target.value)}
                            className="w-full rounded-xl border border-[#E5E0D5] bg-[#FAF9F6] p-3 text-xs text-[#111111] focus:border-[#E67230] focus:bg-white focus:outline-none transition-all placeholder:text-[#999999]"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {/* Form Bottom Submission Bar */}
                <div className="flex flex-col items-center justify-between gap-4 rounded-2xl border border-[#E5E0D5] bg-white p-6 shadow-xs sm:flex-row">
                  <div className="text-center sm:text-left">
                    <p className="text-xs font-bold text-[#111111]">
                      Ready to submit your clinical answers?
                    </p>
                    <p className="text-[11px] text-[#777777]">
                      Awards <span className="font-bold text-[#E67230]">+{pointsEarned} Points</span> & immediately unlocks full peer analytics.
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-[#E67230] px-8 py-3 text-sm font-bold text-white shadow-md hover:bg-[#D15F1F] active:scale-[0.98] transition-all disabled:opacity-50"
                  >
                    {submitting ? (
                      <>
                        <div className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        <span>Recording Answers...</span>
                      </>
                    ) : (
                      <>
                        <span>Submit Survey & Unlock Analytics</span>
                        <ArrowRight className="size-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      )}

      {/* -------------------------------------------------------------------- */}
      {/* 3. TAB B: GAMIFIED INDUSTRY INSIGHTS & BAR GRAPHS                     */}
      {/* -------------------------------------------------------------------- */}
      {activeTab === "insights" && (
        <div className="mt-6 space-y-6">
          {/* Header Summary Card */}
          <div className="rounded-2xl border border-blue-200 bg-blue-50/60 p-6 shadow-xs">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-800">
                  <TrendingUp className="size-3.5" />
                  Live AYUSH Practitioner Insights
                </span>
                <h2 className="mt-2 text-xl font-bold text-[#111111]">
                  What Doctors & Vaidyas Actually Want
                </h2>
                <p className="mt-1 text-xs text-[#555555]">
                  Aggregated real-time data from verified practitioner survey participants across India.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="rounded-xl border border-blue-200 bg-white p-3 text-center shadow-2xs">
                  <div className="text-xl font-bold text-blue-700">
                    {insights?.total_responses || survey.total_responses || 1}
                  </div>
                  <div className="text-[10px] font-semibold text-[#777777] uppercase tracking-wider">
                    Total Vaidyas
                  </div>
                </div>

                <button
                  onClick={() => fetchInsights(survey.id)}
                  className="rounded-xl border border-[#E5E0D5] bg-white p-3 text-xs font-bold text-[#555555] hover:bg-[#FAF9F6] hover:text-[#111111]"
                  title="Refresh Graph Data"
                >
                  <RotateCcw className="size-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Question-by-Question Bar Graphs */}
          {insights && insights.question_insights && insights.question_insights.length > 0 ? (
            <div className="space-y-6">
              {insights.question_insights.map((qi, qIdx) => (
                <div
                  key={qi.question_id || qIdx}
                  className="rounded-2xl border border-[#E5E0D5] bg-white p-6 shadow-2xs"
                >
                  <div className="flex items-start justify-between gap-4 border-b border-[#F0ECE3] pb-3">
                    <div>
                      <h3 className="text-sm font-bold text-[#111111] md:text-base">
                        <span className="text-[#E67230] mr-1.5">Q{qIdx + 1}.</span>
                        {qi.question_title}
                      </h3>
                      <p className="text-[11px] text-[#777777] mt-0.5">
                        Format: <span className="uppercase font-semibold">{qi.question_type}</span> • Total Answers: {qi.total_votes}
                      </p>
                    </div>

                    <div className="shrink-0 rounded-lg bg-[#FAF4ED] px-2.5 py-1 text-xs font-bold text-[#E67230]">
                      {qi.total_votes} {qi.total_votes === 1 ? "Vote" : "Votes"}
                    </div>
                  </div>

                  {/* Render Visual Bar Charts for Radio, Checkbox, Rating */}
                  {qi.options && qi.options.length > 0 ? (
                    <div className="mt-5 space-y-4">
                      {qi.options.map((optItem, optIdx) => {
                        // Color styling variations
                        const colors = [
                          "from-[#E67230] to-[#F2994A]",
                          "from-blue-600 to-indigo-500",
                          "from-emerald-600 to-teal-500",
                          "from-purple-600 to-pink-500",
                          "from-amber-500 to-orange-400",
                        ];
                        const barColor = colors[optIdx % colors.length];

                        return (
                          <div key={optIdx} className="space-y-1.5">
                            <div className="flex items-center justify-between text-xs font-semibold text-[#222222]">
                              <span className="max-w-[75%] truncate" title={optItem.option}>
                                {optItem.option}
                              </span>
                              <span className="font-mono text-xs font-bold text-[#111111]">
                                {optItem.percentage}% ({optItem.count})
                              </span>
                            </div>

                            {/* Beautiful Animated Fill Bar */}
                            <div className="h-4 w-full overflow-hidden rounded-full bg-[#F4F1EA] p-0.5">
                              <div
                                className={`h-full rounded-full bg-gradient-to-r ${barColor} transition-all duration-700 ease-out`}
                                style={{ width: `${Math.max(optItem.percentage, 2)}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : qi.text_answers && qi.text_answers.length > 0 ? (
                    /* Text answers card feed */
                    <div className="mt-4 space-y-2">
                      <p className="text-xs font-bold text-[#666666]">
                        Practitioner Reflections ({qi.text_answers.length}):
                      </p>
                      <div className="max-h-48 space-y-2 overflow-y-auto pr-2">
                        {qi.text_answers.map((ans, aIdx) => (
                          <div
                            key={aIdx}
                            className="rounded-xl border border-[#EAE6DE] bg-[#FAF9F6] p-3 text-xs text-[#333333] italic leading-relaxed"
                          >
                            "{ans}"
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="mt-4 text-xs text-[#888888] italic">
                      No responses recorded for this question yet.
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-[#E5E0D5] bg-white p-8 text-center">
              <BarChart3 className="mx-auto size-10 text-[#A09A8F]" />
              <p className="mt-2 text-sm font-semibold text-[#111111]">
                Aggregation in progress...
              </p>
              <p className="text-xs text-[#777777]">
                Submit your survey above to populate immediate chart insights.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default SurveyPage;
