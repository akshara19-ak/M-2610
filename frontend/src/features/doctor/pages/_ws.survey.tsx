import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  HelpCircle,
  ArrowRight,
  ArrowLeft,
  Check,
  CheckCircle2,
  BarChart3,
  UserCheck,
} from "lucide-react";
import { seo } from "@/lib/seo";
import { apiClient } from "@/services/apiClient";
import { toast } from "sonner";
import { useStore } from "@/lib/store";

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
  created_at?: string;
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
  const doctor = useStore((s) => s.doctor);
  const [surveys, setSurveys] = useState<SurveyItem[]>([]);
  const [completedSurveyIds, setCompletedSurveyIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Tab filter: 'new' (unanswered) vs 'old' (completed/answered)
  const [activeTab, setActiveTab] = useState<"new" | "old">("new");

  // Active view state
  const [activeSurvey, setActiveSurvey] = useState<SurveyItem | null>(null);
  const [viewMode, setViewMode] = useState<"fill" | "results" | null>(null);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [submitting, setSubmitting] = useState(false);
  const [insights, setInsights] = useState<InsightsData | null>(null);
  const [loadingInsights, setLoadingInsights] = useState(false);
  const [mySubmittedAnswers, setMySubmittedAnswers] = useState<Record<string, any>>({});

  const doctorEmail = (doctor as any)?.email || localStorage.getItem("meyveda_user_email") || "doctor@practice.com";
  const doctorName = doctor?.name || localStorage.getItem("meyveda_user_name") || "Verified Practitioner";

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

  const handleViewResults = async (survey: SurveyItem, existingAnswers?: Record<string, any>) => {
    setActiveSurvey(survey);
    setViewMode("results");
    setLoadingInsights(true);

    // If answers were passed in directly from form submission, use them
    if (existingAnswers) {
      setMySubmittedAnswers(existingAnswers);
    } else {
      // Otherwise, check localStorage first or fetch from server
      const localMap: Record<string, any> = JSON.parse(
        localStorage.getItem(`meyveda_survey_ans_${survey.id}`) || "{}"
      );
      if (Object.keys(localMap).length > 0) {
        setMySubmittedAnswers(localMap);
      }
    }

    try {
      const [insightsRes, answersRes] = await Promise.all([
        apiClient.get<InsightsData>(`/content/surveys/insights/${survey.id}`),
        apiClient
          .get<{ answers?: Record<string, any> }>(
            `/content/surveys/my-answers/${survey.id}?doctor_email=${encodeURIComponent(doctorEmail)}`
          )
          .catch(() => ({ answers: {} })),
      ]);

      setInsights(insightsRes);
      if (answersRes?.answers && Object.keys(answersRes.answers).length > 0) {
        setMySubmittedAnswers(answersRes.answers);
        localStorage.setItem(`meyveda_survey_ans_${survey.id}`, JSON.stringify(answersRes.answers));
      }
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
    setMySubmittedAnswers({});
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
      localStorage.setItem(`meyveda_survey_ans_${activeSurvey.id}`, JSON.stringify(answers));

      setCompletedSurveyIds((prev) => Array.from(new Set([...prev, activeSurvey.id])));

      toast.success("Survey submitted successfully! Viewing results comparison.");
      handleViewResults(activeSurvey, answers);
    } catch (err: any) {
      console.error("Survey submission failed:", err);
      toast.error(err.response?.data?.detail || "Submission failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // Helper function to check if the current doctor picked this option
  const isDoctorSelection = (qId: string, optionText: string, qType: string) => {
    const userAns = mySubmittedAnswers[qId];
    if (userAns === undefined || userAns === null) return false;

    if (qType === "checkbox" && Array.isArray(userAns)) {
      return userAns.includes(optionText);
    }
    if (qType === "rating") {
      return userAns.toString() === optionText || optionText.startsWith(userAns.toString());
    }
    return userAns.toString() === optionText;
  };

  // Filter surveys by New vs Old (Completed)
  const newSurveys = surveys.filter((s) => !completedSurveyIds.includes(s.id));
  const oldSurveys = surveys.filter((s) => completedSurveyIds.includes(s.id));

  if (loading) {
    return (
      <div className="mx-auto flex min-h-[50vh] max-w-5xl flex-col items-center justify-center p-8">
        <div className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <p className="mt-3 text-xs font-medium text-muted-foreground">Loading surveys...</p>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // VIEW 1: ACTIVE SURVEY QUESTIONNAIRE (Q&A)
  // ---------------------------------------------------------------------------
  if (activeSurvey && viewMode === "fill") {
    return (
      <div className="mx-auto w-full max-w-4xl px-4 py-8 md:px-8 space-y-6">
        <button
          type="button"
          onClick={handleBackToList}
          className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        >
          <ArrowLeft className="size-3.5" />
          <span>Back to Surveys</span>
        </button>

        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {activeSurvey.title}
          </h1>
          {activeSurvey.description && (
            <p className="text-sm text-muted-foreground leading-relaxed max-w-3xl">
              {activeSurvey.description}
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {activeSurvey.questions.map((q, idx) => (
            <div
              key={q.id || idx}
              className="rounded-2xl border border-border bg-white p-6 shadow-soft space-y-3"
            >
              <div className="space-y-0.5">
                <label className="text-sm font-bold text-foreground">
                  <span className="text-primary mr-1.5">{idx + 1}.</span>
                  {q.title}
                  {q.required && <span className="ml-1 text-red-500 font-bold">*</span>}
                </label>
                {q.helpText && (
                  <p className="text-xs text-muted-foreground">{q.helpText}</p>
                )}
              </div>

              {/* RADIO */}
              {q.type === "radio" && (
                <div className="space-y-2 pt-1">
                  {q.options.map((opt, optIdx) => {
                    const isSelected = answers[q.id] === opt;
                    return (
                      <label
                        key={optIdx}
                        onClick={() => handleOptionSelect(q.id, opt, false)}
                        className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3.5 text-xs transition-colors ${
                          isSelected
                            ? "border-primary bg-primary-soft text-foreground font-semibold"
                            : "border-border bg-card text-foreground hover:bg-muted/40"
                        }`}
                      >
                        <div
                          className={`flex size-4 shrink-0 items-center justify-center rounded-full border ${
                            isSelected
                              ? "border-primary bg-primary text-white"
                              : "border-muted-foreground/40 bg-white"
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
                <div className="space-y-2 pt-1">
                  {q.options.map((opt, optIdx) => {
                    const current = (answers[q.id] as string[]) || [];
                    const isSelected = current.includes(opt);
                    return (
                      <label
                        key={optIdx}
                        onClick={() => handleOptionSelect(q.id, opt, true)}
                        className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3.5 text-xs transition-colors ${
                          isSelected
                            ? "border-primary bg-primary-soft text-foreground font-semibold"
                            : "border-border bg-card text-foreground hover:bg-muted/40"
                        }`}
                      >
                        <div
                          className={`flex size-4 shrink-0 items-center justify-center rounded-md border ${
                            isSelected
                              ? "border-primary bg-primary text-white"
                              : "border-muted-foreground/40 bg-white"
                          }`}
                        >
                          {isSelected && <Check className="size-3 stroke-[3]" />}
                        </div>
                        <span>{opt}</span>
                      </label>
                    );
                  })}
                </div>
              )}

              {/* RATING */}
              {q.type === "rating" && (
                <div className="pt-1">
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((num) => {
                      const isSelected = answers[q.id] === num.toString();
                      return (
                        <button
                          type="button"
                          key={num}
                          onClick={() => handleRatingSelect(q.id, num)}
                          className={`flex size-10 items-center justify-center rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                            isSelected
                              ? "border-primary bg-primary text-white shadow-xs"
                              : "border-border bg-card text-foreground hover:border-primary hover:text-primary"
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
                <div className="pt-1">
                  <textarea
                    rows={3}
                    placeholder="Type your clinical feedback here..."
                    value={answers[q.id] || ""}
                    onChange={(e) => handleTextChange(q.id, e.target.value)}
                    className="w-full rounded-xl border border-border bg-card p-3 text-xs text-foreground focus:border-primary focus:bg-white focus:outline-none placeholder:text-muted-foreground"
                  />
                </div>
              )}
            </div>
          ))}

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={handleBackToList}
              className="text-xs font-semibold text-muted-foreground hover:text-foreground cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-8 py-3 text-xs font-bold text-white shadow-soft hover:bg-primary-dark transition-all disabled:opacity-50 cursor-pointer"
            >
              {submitting ? (
                <span>Submitting...</span>
              ) : (
                <>
                  <span>Submit & View Comparison</span>
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
  // VIEW 2: RESULTS VIEW WITH PEER % COMPARISON AND PERSONAL ANSWER HIGHLIGHT
  // ---------------------------------------------------------------------------
  if (activeSurvey && viewMode === "results") {
    const hasMyAnswers = Object.keys(mySubmittedAnswers).length > 0;

    return (
      <div className="mx-auto w-full max-w-4xl px-4 py-8 md:px-8 space-y-6">
        <button
          type="button"
          onClick={handleBackToList}
          className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        >
          <ArrowLeft className="size-3.5" />
          <span>Back to Surveys</span>
        </button>

        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              {activeSurvey.title} — Live Peer Results
            </h1>
          </div>
          {activeSurvey.description && (
            <p className="text-sm text-muted-foreground leading-relaxed max-w-3xl">
              {activeSurvey.description}
            </p>
          )}

          {hasMyAnswers && (
            <p className="text-xs text-muted-foreground pt-1 flex items-center gap-1.5 font-medium">
              <span className="inline-block size-2 rounded-full bg-[#E67230]" />
              Highlighted with <strong className="text-primary font-bold">Your Response</strong> indicates your chosen answers compared to peer practitioner percentages.
            </p>
          )}
        </div>

        {loadingInsights ? (
          <div className="flex min-h-[40vh] items-center justify-center">
            <div className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : insights && insights.question_insights && insights.question_insights.length > 0 ? (
          <div className="space-y-5">
            {insights.question_insights.map((qi, qIdx) => {
              const myTextAnswer = mySubmittedAnswers[qi.question_id];

              return (
                <div
                  key={qi.question_id || qIdx}
                  className="rounded-2xl border border-border bg-white p-6 shadow-soft space-y-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-sm font-bold text-foreground">
                      <span className="text-primary mr-1.5">Q{qIdx + 1}.</span>
                      {qi.question_title}
                    </h3>
                    <span className="text-[11px] font-medium text-muted-foreground shrink-0">
                      {qi.total_votes} {qi.total_votes === 1 ? "response" : "responses"}
                    </span>
                  </div>

                  {qi.options && qi.options.length > 0 ? (
                    <div className="space-y-3 pt-1">
                      {qi.options.map((optItem, optIdx) => {
                        const isSelectedByMe = isDoctorSelection(
                          qi.question_id,
                          optItem.option,
                          qi.question_type
                        );

                        return (
                          <div
                            key={optIdx}
                            className={`p-3 rounded-xl border transition-all ${
                              isSelectedByMe
                                ? "border-[#E67230] bg-[#FFF8F3]"
                                : "border-transparent bg-transparent"
                            }`}
                          >
                            <div className="flex items-center justify-between text-xs mb-1.5">
                              <div className="flex items-center gap-2 max-w-[80%]">
                                <span className={`font-medium ${isSelectedByMe ? "font-bold text-[#111111]" : "text-foreground"}`}>
                                  {optItem.option}
                                </span>
                                {isSelectedByMe && (
                                  <span className="inline-flex items-center gap-1 rounded-full bg-[#E67230] text-white px-2 py-0.5 text-[10px] font-bold">
                                    <Check className="size-2.5 stroke-[3]" /> Your Selection
                                  </span>
                                )}
                              </div>
                              <span className="font-mono text-xs font-bold text-foreground shrink-0">
                                {optItem.percentage}% <span className="text-muted-foreground font-normal text-[11px]">({optItem.count})</span>
                              </span>
                            </div>

                            {/* Bar Graph */}
                            <div className="h-3 w-full overflow-hidden rounded-full bg-[#F4F1EA]">
                              <div
                                className={`h-full rounded-full transition-all duration-500 ease-out ${
                                  isSelectedByMe ? "bg-[#E67230]" : "bg-[#D15F1F]/70"
                                }`}
                                style={{ width: `${optItem.percentage}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : qi.text_answers && qi.text_answers.length > 0 ? (
                    <div className="space-y-2 pt-1">
                      {myTextAnswer && (
                        <div className="rounded-xl border border-[#E67230] bg-[#FFF8F3] p-3 text-xs text-foreground space-y-1">
                          <span className="text-[10px] font-bold text-[#E67230] uppercase tracking-wider block">
                            Your Clinical Answer
                          </span>
                          <p className="font-medium text-foreground">{myTextAnswer}</p>
                        </div>
                      )}

                      <div className="space-y-1.5 pt-1">
                        <span className="text-[11px] font-semibold text-muted-foreground">
                          All Colleague Responses:
                        </span>
                        {qi.text_answers.map((ans, aIdx) => (
                          <div
                            key={aIdx}
                            className="rounded-lg border border-border bg-muted/20 p-3 text-xs text-foreground leading-relaxed"
                          >
                            {ans}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground italic">No responses recorded yet.</p>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-border bg-white p-8 text-center">
            <p className="text-xs font-semibold text-muted-foreground">
              No results recorded yet.
            </p>
          </div>
        )}
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // VIEW 3: SURVEY DASHBOARD (NEW VS OLD TABS)
  // ---------------------------------------------------------------------------
  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8 md:px-8 space-y-6">
      {/* Top Header */}
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
          Surveys
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
          Participate in practitioner feedback surveys or view live peer results and answer comparisons.
        </p>
      </div>

      {/* Tabs: New vs Old */}
      <div className="flex items-center gap-2 border-b border-border pb-3">
        <button
          type="button"
          onClick={() => setActiveTab("new")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
            activeTab === "new"
              ? "bg-[#E67230] text-white shadow-xs"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
          }`}
        >
          <span>New Q&A</span>
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] ${
              activeTab === "new" ? "bg-white/20 text-white" : "bg-muted text-muted-foreground font-semibold"
            }`}
          >
            {newSurveys.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("old")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
            activeTab === "old"
              ? "bg-[#E67230] text-white shadow-xs"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
          }`}
        >
          <span>Old (Completed)</span>
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] ${
              activeTab === "old" ? "bg-white/20 text-white" : "bg-muted text-muted-foreground font-semibold"
            }`}
          >
            {oldSurveys.length}
          </span>
        </button>
      </div>

      {/* Tab 1: NEW (Uncompleted surveys) */}
      {activeTab === "new" && (
        <div className="space-y-4">
          {newSurveys.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-white p-10 text-center space-y-2">
              <CheckCircle2 className="mx-auto size-8 text-emerald-600" />
              <p className="text-sm font-bold text-foreground">You are all caught up!</p>
              <p className="text-xs text-muted-foreground max-w-md mx-auto">
                You have completed all active practitioner questionnaires. Switch to the <strong>Old (Completed)</strong> tab to view live peer comparison results.
              </p>
            </div>
          ) : (
            newSurveys.map((survey) => (
              <div
                key={survey.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 rounded-2xl border border-border bg-white p-6 shadow-soft transition-colors hover:border-primary/40"
              >
                <div className="space-y-1 flex-1">
                  <h2 className="text-base sm:text-lg font-bold text-foreground">
                    {survey.title}
                  </h2>
                  {survey.description && (
                    <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">
                      {survey.description}
                    </p>
                  )}
                  <p className="text-[11px] text-muted-foreground pt-1">
                    {survey.questions.length} questions • Answer to unlock peer insights
                  </p>
                </div>

                <div className="shrink-0">
                  <button
                    type="button"
                    onClick={() => handleStartSurvey(survey)}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-5 py-2.5 text-xs font-bold text-white shadow-soft hover:bg-primary-dark transition-colors cursor-pointer"
                  >
                    <span>Start Survey</span>
                    <ArrowRight className="size-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 2: OLD (Completed surveys with view results & comparison) */}
      {activeTab === "old" && (
        <div className="space-y-4">
          {oldSurveys.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-white p-10 text-center space-y-2">
              <BarChart3 className="mx-auto size-8 text-muted-foreground/60" />
              <p className="text-sm font-bold text-foreground">No completed surveys yet</p>
              <p className="text-xs text-muted-foreground max-w-md mx-auto">
                Once you complete a survey in the <strong>New Q&A</strong> tab, you will be able to view how other doctors answered and compare selections here.
              </p>
            </div>
          ) : (
            oldSurveys.map((survey) => (
              <div
                key={survey.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 rounded-2xl border border-border bg-white p-6 shadow-soft transition-colors hover:border-primary/40"
              >
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <h2 className="text-base sm:text-lg font-bold text-foreground">
                      {survey.title}
                    </h2>
                    <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                      <CheckCircle2 className="size-3.5" /> Answered
                    </span>
                  </div>
                  {survey.description && (
                    <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">
                      {survey.description}
                    </p>
                  )}
                  <p className="text-[11px] text-muted-foreground pt-1">
                    {survey.total_responses} doctor responses recorded
                  </p>
                </div>

                <div className="shrink-0">
                  <button
                    type="button"
                    onClick={() => handleViewResults(survey)}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-5 py-2.5 text-xs font-bold text-foreground hover:border-primary hover:text-primary transition-colors cursor-pointer"
                  >
                    <BarChart3 className="size-3.5 text-primary" />
                    <span>View Results Comparison</span>
                    <ArrowRight className="size-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default SurveyPage;
