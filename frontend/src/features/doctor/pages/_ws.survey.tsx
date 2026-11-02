import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  HelpCircle,
  ArrowRight,
  ArrowLeft,
  Check,
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
        <div className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <p className="mt-3 text-xs font-medium text-muted-foreground">Loading surveys...</p>
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
                    placeholder="Type your response here..."
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
  // VIEW 2: RESULTS VIEW WITH CLEAN BAR GRAPHS
  // ---------------------------------------------------------------------------
  if (activeSurvey && viewMode === "results") {
    return (
      <div className="mx-auto w-full max-w-5xl px-4 py-8 md:px-8 space-y-6">
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
            {activeSurvey.title} — Results
          </h1>
          {activeSurvey.description && (
            <p className="text-sm text-muted-foreground leading-relaxed max-w-3xl">
              {activeSurvey.description}
            </p>
          )}
        </div>

        {loadingInsights ? (
          <div className="flex min-h-[40vh] items-center justify-center">
            <div className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : insights && insights.question_insights && insights.question_insights.length > 0 ? (
          <div className="space-y-4">
            {insights.question_insights.map((qi, qIdx) => (
              <div
                key={qi.question_id || qIdx}
                className="rounded-2xl border border-border bg-white p-6 shadow-soft space-y-3"
              >
                <h3 className="text-sm font-bold text-foreground">
                  <span className="text-primary mr-1.5">Q{qIdx + 1}.</span>
                  {qi.question_title}
                </h3>

                {qi.options && qi.options.length > 0 ? (
                  <div className="space-y-3 pt-1">
                    {qi.options.map((optItem, optIdx) => (
                      <div key={optIdx} className="space-y-1">
                        <div className="flex items-center justify-between text-xs text-foreground">
                          <span className="font-medium max-w-[80%] truncate">
                            {optItem.option}
                          </span>
                          <span className="font-mono text-[11px] text-muted-foreground font-semibold">
                            {optItem.percentage}% ({optItem.count})
                          </span>
                        </div>
                        <div className="h-2.5 w-full overflow-hidden rounded-full bg-[#F4F1EA]">
                          <div
                            className="h-full rounded-full bg-primary transition-all duration-500 ease-out"
                            style={{ width: `${optItem.percentage}%` }}
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
                        className="rounded-lg border border-border bg-muted/20 p-3 text-xs text-foreground leading-relaxed"
                      >
                        {ans}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground italic">No responses recorded yet.</p>
                )}
              </div>
            ))}
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
  // VIEW 3: CLEAN SURVEY LIST (NO TEMPLATE BOXES, NO LEFT ACCENTS, NO BADGES)
  // ---------------------------------------------------------------------------
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 md:px-8 space-y-6">
      {/* Top Header - Pure clean typography */}
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
          Surveys
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
          Participate in practitioner feedback surveys or view live peer results.
        </p>
      </div>

      {/* Surveys Catalog Grid */}
      {surveys.length === 0 ? (
        <div className="rounded-2xl border border-border bg-white p-12 text-center shadow-soft">
          <HelpCircle className="mx-auto size-10 text-muted-foreground/50" />
          <h2 className="mt-3 text-base font-bold text-foreground">No Surveys Available</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            There are currently no active surveys. Please check back later.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {surveys.map((survey) => {
            const isCompleted = completedSurveyIds.includes(survey.id);

            return (
              <div
                key={survey.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 rounded-2xl border border-border bg-white p-6 shadow-soft transition-colors hover:border-primary/40"
              >
                {/* Survey Title & Description */}
                <div className="space-y-1 flex-1">
                  <h2 className="text-base sm:text-lg font-bold text-foreground">
                    {survey.title}
                  </h2>
                  {survey.description && (
                    <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">
                      {survey.description}
                    </p>
                  )}
                </div>

                {/* Direct Action Button */}
                <div className="shrink-0">
                  {isCompleted ? (
                    <button
                      type="button"
                      onClick={() => handleViewResults(survey)}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-5 py-2.5 text-xs font-bold text-foreground hover:border-primary hover:text-primary transition-colors cursor-pointer"
                    >
                      <span>View Results</span>
                      <ArrowRight className="size-3.5" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleStartSurvey(survey)}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-5 py-2.5 text-xs font-bold text-white shadow-soft hover:bg-primary-dark transition-colors cursor-pointer"
                    >
                      <span>Start Survey</span>
                      <ArrowRight className="size-3.5" />
                    </button>
                  )}
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
