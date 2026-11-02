import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  ClipboardList,
  CheckCircle2,
  BarChart3,
  HelpCircle,
  ArrowRight,
  RotateCcw,
  Check,
} from "lucide-react";
import { seo } from "@/lib/seo";
import { apiClient } from "@/services/apiClient";
import { toast } from "sonner";

export const Route = createFileRoute("/_ws/survey")({
  head: () =>
    seo(
      "Practitioner Survey | Meyveda",
      "Participate in the Meyveda AYUSH clinical survey and view peer insights.",
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

      const submittedSurveys = JSON.parse(localStorage.getItem("meyveda_submitted_surveys") || "[]");
      if (data && submittedSurveys.includes(data.id)) {
        setSubmitted(true);
        setActiveTab("insights");
        fetchInsights(data.id);
      }
    } catch (err: any) {
      console.error("Failed to fetch active survey:", err);
      toast.error("Unable to load the current survey.");
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!survey) return;

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

      await apiClient.post("/content/surveys/submit", payload);

      const submittedSurveys = JSON.parse(localStorage.getItem("meyveda_submitted_surveys") || "[]");
      if (!submittedSurveys.includes(survey.id)) {
        submittedSurveys.push(survey.id);
        localStorage.setItem("meyveda_submitted_surveys", JSON.stringify(submittedSurveys));
      }

      toast.success("Survey submitted successfully!");
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

  if (loading) {
    return (
      <div className="mx-auto flex min-h-[50vh] max-w-4xl flex-col items-center justify-center p-8">
        <div className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <p className="mt-3 text-xs font-medium text-muted-foreground">Loading survey...</p>
      </div>
    );
  }

  if (!survey) {
    return (
      <div className="mx-auto max-w-3xl p-6 text-center">
        <div className="rounded-2xl border border-border bg-card p-10 shadow-soft">
          <HelpCircle className="mx-auto size-10 text-muted-foreground/60" />
          <h2 className="mt-3 text-lg font-bold text-foreground">No Active Survey</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            There are currently no active surveys available.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-6 md:px-8 space-y-6">
      {/* 1. Standard Minimal Header Card */}
      <div className="rounded-2xl border border-border bg-white p-6 shadow-soft">
        <div className="space-y-1.5">
          <h1 className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight">
            {survey.title}
          </h1>
          {survey.description && (
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              {survey.description}
            </p>
          )}
        </div>

        {/* Tab switch */}
        <div className="mt-6 flex border-b border-border">
          <button
            type="button"
            onClick={() => setActiveTab("survey")}
            className={`flex items-center gap-2 border-b-2 px-4 py-2 text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "survey"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <ClipboardList className="size-4" />
            <span>Survey</span>
            {submitted && (
              <span className="rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold">
                Submitted
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab("insights");
              fetchInsights(survey.id);
            }}
            className={`flex items-center gap-2 border-b-2 px-4 py-2 text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "insights"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <BarChart3 className="size-4" />
            <span>Results & Insights</span>
          </button>
        </div>
      </div>

      {/* 2. TAB A: QUESTIONNAIRE FORM */}
      {activeTab === "survey" && (
        <div className="space-y-6">
          {submitted ? (
            <div className="rounded-2xl border border-emerald-200 bg-white p-6 shadow-soft space-y-3">
              <div className="flex items-center gap-3 text-emerald-700 font-bold text-sm">
                <CheckCircle2 className="size-5" />
                <span>Response Submitted</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Thank you for your responses. You can view the aggregated results in the Results & Insights tab.
              </p>
              <div>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("insights");
                    fetchInsights(survey.id);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-bold text-white hover:bg-primary-dark transition-colors cursor-pointer"
                >
                  <span>View Results</span>
                  <ArrowRight className="size-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {survey.questions.map((q, idx) => (
                <div
                  key={q.id || idx}
                  className="rounded-2xl border border-border bg-white p-6 shadow-soft space-y-4"
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

                  {/* Render Question Inputs */}
                  <div className="pt-1">
                    {/* TYPE 1: RADIO */}
                    {q.type === "radio" && (
                      <div className="space-y-2">
                        {q.options.map((opt, optIdx) => {
                          const isSelected = answers[q.id] === opt;
                          return (
                            <label
                              key={optIdx}
                              onClick={() => handleOptionSelect(q.id, opt, false)}
                              className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 text-xs transition-colors ${
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

                    {/* TYPE 2: CHECKBOX */}
                    {q.type === "checkbox" && (
                      <div className="space-y-2">
                        {q.options.map((opt, optIdx) => {
                          const current = (answers[q.id] as string[]) || [];
                          const isSelected = current.includes(opt);
                          return (
                            <label
                              key={optIdx}
                              onClick={() => handleOptionSelect(q.id, opt, true)}
                              className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 text-xs transition-colors ${
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

                    {/* TYPE 3: RATING */}
                    {q.type === "rating" && (
                      <div className="space-y-2">
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

                    {/* TYPE 4: TEXT */}
                    {q.type === "text" && (
                      <textarea
                        rows={3}
                        placeholder="Type your response here..."
                        value={answers[q.id] || ""}
                        onChange={(e) => handleTextChange(q.id, e.target.value)}
                        className="w-full rounded-xl border border-border bg-card p-3 text-xs text-foreground focus:border-primary focus:bg-white focus:outline-none placeholder:text-muted-foreground"
                      />
                    )}
                  </div>
                </div>
              ))}

              <div className="flex justify-end pt-2">
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
          )}
        </div>
      )}

      {/* 3. TAB B: RESULTS & INSIGHTS (CLEAN BAR GRAPHS) */}
      {activeTab === "insights" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-foreground">
              Survey Results
            </h2>
            <button
              type="button"
              onClick={() => fetchInsights(survey.id)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-white px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              title="Refresh results"
            >
              <RotateCcw className="size-3.5" />
              <span>Refresh</span>
            </button>
          </div>

          {insights && insights.question_insights && insights.question_insights.length > 0 ? (
            <div className="space-y-4">
              {insights.question_insights.map((qi, qIdx) => (
                <div
                  key={qi.question_id || qIdx}
                  className="rounded-2xl border border-border bg-white p-6 shadow-soft space-y-4"
                >
                  <div className="space-y-0.5">
                    <h3 className="text-sm font-bold text-foreground">
                      <span className="text-primary mr-1.5">Q{qIdx + 1}.</span>
                      {qi.question_title}
                    </h3>
                  </div>

                  {/* Clean Bar Charts */}
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

                          {/* Meyveda Brand Primary Orange Bar */}
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
              <BarChart3 className="mx-auto size-8 text-muted-foreground/50" />
              <p className="mt-2 text-xs font-semibold text-muted-foreground">
                No results recorded yet.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default SurveyPage;
