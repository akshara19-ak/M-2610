import { useState, useEffect } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  FileText,
  Newspaper,
  BookOpen,
  Plus,
  Edit2,
  Trash2,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  LogOut,
  Eye,
  Search,
  Sparkles,
  Shield,
  Layers,
  ArrowUpRight,
  Clock,
  Calendar,
  X,
  RefreshCw,
  ClipboardList,
  BarChart3,
  CheckSquare,
  Radio,
  Star,
  ListPlus,
  Trophy,
  HelpCircle,
  Check,
  TrendingUp,
  Users,
} from "lucide-react";
import meyvedaLogo from "@/assets/meyvedalogo.png";
import { apiClient } from "@/services/apiClient";
import { toast } from "sonner";

interface PRItem {
  id: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  media_source: string;
  media_source_url?: string | null;
  category: string;
  cover_image_url?: string | null;
  published_date: string;
  is_featured: boolean;
  status: string;
  created_at?: string;
  updated_at?: string;
}

interface SurveyQuestion {
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
  questions: SurveyQuestion[];
  created_by_email: string;
  response_count: number;
  created_at?: string;
  updated_at?: string;
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

interface SurveyAnalytics {
  survey_id: string;
  title: string;
  reward_points: number;
  total_responses: number;
  question_insights: QuestionInsight[];
  recent_responses?: any[];
}

interface BlogItem {
  id: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  author_name: string;
  author_role: string;
  category: string;
  cover_image_url?: string | null;
  reading_time: string;
  tags?: string[] | null;
  is_featured: boolean;
  status: string;
  created_at?: string;
  updated_at?: string;
}

interface OverviewData {
  metrics: {
    total_pr: number;
    total_blogs: number;
    total_items: number;
    published_count: number;
    draft_count: number;
  };
  prs: PRItem[];
  blogs: BlogItem[];
}

export function ContentManagerPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"pr" | "blogs" | "surveys">("pr");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [data, setData] = useState<OverviewData>({
    metrics: {
      total_pr: 0,
      total_blogs: 0,
      total_items: 0,
      published_count: 0,
      draft_count: 0,
    },
    prs: [],
    blogs: [],
  });

  const [searchQuery, setSearchQuery] = useState("");

  // Modals
  const [prModalOpen, setPrModalOpen] = useState(false);
  const [editingPr, setEditingPr] = useState<PRItem | null>(null);

  const [blogModalOpen, setBlogModalOpen] = useState(false);
  const [editingBlog, setEditingBlog] = useState<BlogItem | null>(null);

// Survey states
  const [surveys, setSurveys] = useState<SurveyItem[]>([]);
  const [surveyModalOpen, setSurveyModalOpen] = useState(false);
  const [editingSurvey, setEditingSurvey] = useState<SurveyItem | null>(null);
  const [surveyAnalyticsModalOpen, setSurveyAnalyticsModalOpen] = useState(false);
  const [activeAnalytics, setActiveAnalytics] = useState<SurveyAnalytics | null>(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);

  // Google Forms Survey Builder Form State
  const [surveyForm, setSurveyForm] = useState({
    title: "Practitioner Clinical Intelligence and Practice Survey",
    description: "Help refine AYUSH formulation guidelines, clinical monographs, and drug interaction research.",
    category: "AYUSH Clinical Practice",
    reward_points: 50,
    status: "active",
    questions: [
      {
        id: "q_need_1",
        title: "Which primary clinical challenge requires the most immediate assistance in your daily practice?",
        type: "radio" as const,
        options: [
          "Standardized, batch-tested authentic classical medicines",
          "Predictable patient adherence and repeat refill compliance",
          "Rapid clinical monograph and drug-drug herb interaction references",
          "Transparent, ethical AYUSH digital prescription toolkit"
        ],
        required: true,
        helpText: "Select the single most pressing operational or clinical bottleneck."
      },
      {
        id: "q_need_2",
        title: "What critical services should Meyveda prioritize for your clinic desk?",
        type: "checkbox" as const,
        options: [
          "Direct manufacturer lab testing certificates (COA and Heavy Metal assays)",
          "Formulary sample access and trial dispensing kits",
          "Integrated digital clinic notes and Ayur-pharmacopeia search",
          "Peer case exchange and clinical discussions with fellow Vaidyas"
        ],
        required: true,
        helpText: "Select all areas you wish to see supported first."
      },
      {
        id: "q_need_3",
        title: "How critical is verified heavy metal and microbiology certification on every formulation batch?",
        type: "rating" as const,
        options: ["1", "2", "3", "4", "5"],
        required: true,
        helpText: "Scale from 1 (Not Critical) to 5 (Absolute Requirement)"
      },
      {
        id: "q_need_4",
        title: "What is one specific classical formulation or clinical workflow you wish was easier to access?",
        type: "text" as const,
        options: [],
        required: false,
        helpText: "Share any specific classical Taila, Gritha, Bhasma or clinical documentation hurdle."
      }
    ] as SurveyQuestion[]
  });

  const [deleteConfirm, setDeleteConfirm] = useState<{
    type: "pr" | "blog" | "survey";
    id: string;
    title: string;
  } | null>(null);

  // Form states: PR
  const [prForm, setPrForm] = useState({
    title: "",
    slug: "",
    category: "Press Release",
    media_source: "Meyveda Media Desk",
    media_source_url: "",
    published_date: new Date().toISOString().split("T")[0],
    summary: "",
    content: "",
    status: "published",
    is_featured: false,
  });

  // Form states: Blog
  const [blogForm, setBlogForm] = useState({
    title: "",
    slug: "",
    author_name: "Meyveda Clinical Desk",
    author_role: "AYUSH Clinical Research",
    category: "Clinical Practice",
    reading_time: "5 min read",
    tags: "",
    summary: "",
    content: "",
    status: "published",
    is_featured: false,
  });

  const userRole = localStorage.getItem("meyveda_user_role") || "";
  const userEmail = localStorage.getItem("meyveda_user_email") || "content@meyveda.com";

  // Check auth
  useEffect(() => {
    const token = localStorage.getItem("meyveda_auth_token");
    const role = (localStorage.getItem("meyveda_user_role") || "").toLowerCase();
    if (!token && role !== "content_manager" && role !== "admin") {
      toast.error("Please sign in to access the Content Management Desk.");
      navigate({ to: "/login" });
    }
  }, [navigate]);

  const loadData = async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);

    try {
      const res = await apiClient.get<OverviewData>("/content/manage/all");
      setData(res);
      // Load Surveys for Content Manager
      try {
        const surveyRes = await apiClient.get<SurveyItem[]>("/content/surveys/manage/all");
        setSurveys(surveyRes);
      } catch (sErr) {
        console.warn("Surveys fetch warning:", sErr);
      }

    } catch (err: any) {
      console.warn("Failed to load /content/manage/all, loading public endpoints:", err);
      // Fallback: load public PR and blogs
      try {
        const [prs, blogs] = await Promise.all([
          apiClient.get<PRItem[]>("/content/pr").catch(() => []),
          apiClient.get<BlogItem[]>("/content/blogs").catch(() => []),
        ]);
        const prList = Array.isArray(prs) ? prs : [];
        const blogList = Array.isArray(blogs) ? blogs : [];
        setData({
          metrics: {
            total_pr: prList.length,
            total_blogs: blogList.length,
            total_items: prList.length + blogList.length,
            published_count: prList.length + blogList.length,
            draft_count: 0,
          },
          prs: prList,
          blogs: blogList,
        });
      } catch (innerErr) {
        toast.error("Could not load content catalog.");
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSignOut = () => {
    localStorage.removeItem("meyveda_auth_token");
    localStorage.removeItem("meyveda_user_role");
    localStorage.removeItem("meyveda_user_email");
    toast.success("Signed out of Content Management Desk.");
    window.location.href = "/login";
  };

  // --- Survey Operations (Google Forms Style Builder) ---

  const openNewSurveyModal = () => {
    setEditingSurvey(null);
    setSurveyForm({
      title: "AYUSH Practitioner Clinical Requirements Survey",
      description: "Gather feedback on dispensing preferences, clinical tools, and classical pharmacy standards.",
      category: "AYUSH Clinical Practice",
      reward_points: 50,
      status: "active",
      questions: [
        {
          id: `q_${Date.now()}_1`,
          title: "What is the biggest challenge you face with AYUSH medicine sourcing?",
          type: "radio",
          options: ["Inconsistent quality / lack of lab reports", "High costs & unverified stock", "Patient trust and adherence", "Lack of dosage clarity"],
          required: true,
          helpText: "Choose the primary barrier in clinical practice."
        },
        {
          id: `q_${Date.now()}_2`,
          title: "Which digital desk features would you find most valuable?",
          type: "checkbox",
          options: ["Fast Ayur-pharmacopeia search", "Automated refill reminders for patients", "Direct heavy-metal batch COA download", "Interactive dosage converter"],
          required: true,
          helpText: "Select all that apply."
        }
      ]
    });
    setSurveyModalOpen(true);
  };

  const openEditSurveyModal = (item: SurveyItem) => {
    setEditingSurvey(item);
    setSurveyForm({
      title: item.title,
      description: item.description,
      category: item.category,
      reward_points: item.reward_points,
      status: item.status,
      questions: item.questions || []
    });
    setSurveyModalOpen(true);
  };

  const handleAddQuestion = () => {
    const newQ: SurveyQuestion = {
      id: `q_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      title: "Untitled Question",
      type: "radio",
      options: ["Option 1", "Option 2"],
      required: true,
      helpText: ""
    };
    setSurveyForm(prev => ({
      ...prev,
      questions: [...prev.questions, newQ]
    }));
  };

  const handleRemoveQuestion = (idx: number) => {
    setSurveyForm(prev => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== idx)
    }));
  };

  const handleUpdateQuestion = (idx: number, field: keyof SurveyQuestion, value: any) => {
    setSurveyForm(prev => {
      const updated = [...prev.questions];
      const cur = { ...updated[idx], [field]: value };
      if (field === "type") {
        if (value === "radio" || value === "checkbox") {
          if (!cur.options || cur.options.length === 0) cur.options = ["Option 1", "Option 2"];
        } else if (value === "rating") {
          cur.options = ["1", "2", "3", "4", "5"];
        } else if (value === "text") {
          cur.options = [];
        }
      }
      updated[idx] = cur;
      return { ...prev, questions: updated };
    });
  };

  const handleAddOption = (qIdx: number) => {
    setSurveyForm(prev => {
      const updated = [...prev.questions];
      const q = updated[qIdx];
      const newOption = `Option ${(q.options?.length || 0) + 1}`;
      updated[qIdx] = {
        ...q,
        options: [...(q.options || []), newOption]
      };
      return { ...prev, questions: updated };
    });
  };

  const handleUpdateOption = (qIdx: number, optIdx: number, val: string) => {
    setSurveyForm(prev => {
      const updated = [...prev.questions];
      const q = updated[qIdx];
      const opts = [...(q.options || [])];
      opts[optIdx] = val;
      updated[qIdx] = { ...q, options: opts };
      return { ...prev, questions: updated };
    });
  };

  const handleRemoveOption = (qIdx: number, optIdx: number) => {
    setSurveyForm(prev => {
      const updated = [...prev.questions];
      const q = updated[qIdx];
      const opts = [...(q.options || [])].filter((_, i) => i !== optIdx);
      updated[qIdx] = { ...q, options: opts };
      return { ...prev, questions: updated };
    });
  };

  const handleSaveSurvey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!surveyForm.title.trim()) {
      toast.error("Please enter a survey title.");
      return;
    }
    if (surveyForm.questions.length === 0) {
      toast.error("Please add at least one survey question.");
      return;
    }

    try {
      if (editingSurvey) {
        await apiClient.put(`/content/surveys/manage/${editingSurvey.id}`, surveyForm);
        toast.success("Survey updated successfully!");
      } else {
        await apiClient.post("/content/surveys/manage/create", surveyForm);
        toast.success("New Google Forms style survey published!");
      }
      setSurveyModalOpen(false);
      loadData(true);
    } catch (err: any) {
      console.error("Failed to save survey:", err);
      toast.error(err.response?.data?.detail || "Failed to save survey.");
    }
  };

  const openAnalyticsModal = async (surveyItem: SurveyItem) => {
    setLoadingAnalytics(true);
    setSurveyAnalyticsModalOpen(true);
    try {
      const res = await apiClient.get<SurveyAnalytics>(`/content/surveys/insights/${surveyItem.id}`);
      setActiveAnalytics(res);
    } catch (err) {
      console.error("Failed to load survey analytics:", err);
      toast.error("Could not load survey analytics.");
    } finally {
      setLoadingAnalytics(false);
    }
  };

  // --- PR Operations ---

  const openNewPrModal = () => {
    setEditingPr(null);
    setPrForm({
      title: "",
      slug: "",
      category: "Press Release",
      media_source: "Meyveda Media Desk",
      media_source_url: "",
      published_date: new Date().toISOString().split("T")[0],
      summary: "",
      content: "",
      status: "published",
      is_featured: false,
    });
    setPrModalOpen(true);
  };

  const openEditPrModal = (item: PRItem) => {
    setEditingPr(item);
    setPrForm({
      title: item.title,
      slug: item.slug,
      category: item.category,
      media_source: item.media_source,
      media_source_url: item.media_source_url || "",
      published_date: item.published_date,
      summary: item.summary,
      content: item.content,
      status: item.status,
      is_featured: item.is_featured,
    });
    setPrModalOpen(true);
  };

  const handleSavePr = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prForm.title.trim() || !prForm.summary.trim() || !prForm.content.trim()) {
      toast.error("Title, summary, and content are required.");
      return;
    }

    try {
      if (editingPr) {
        await apiClient.put(`/content/pr/${editingPr.id}`, prForm);
        toast.success("Press release updated successfully!");
      } else {
        await apiClient.post("/content/pr", prForm);
        toast.success("New press release published!");
      }
      setPrModalOpen(false);
      loadData(true);
    } catch (err: any) {
      toast.error(err?.message || "Failed to save press release.");
    }
  };

  const handleTogglePrStatus = async (item: PRItem) => {
    const newStatus = item.status === "published" ? "draft" : "published";
    try {
      await apiClient.put(`/content/pr/${item.id}`, { status: newStatus });
      toast.success(`Press release marked as ${newStatus}.`);
      loadData(true);
    } catch (err: any) {
      toast.error("Failed to toggle status.");
    }
  };

  // --- Blog Operations ---

  const openNewBlogModal = () => {
    setEditingBlog(null);
    setBlogForm({
      title: "",
      slug: "",
      author_name: "Meyveda Clinical Desk",
      author_role: "AYUSH Clinical Research",
      category: "Clinical Practice",
      reading_time: "5 min read",
      tags: "",
      summary: "",
      content: "",
      status: "published",
      is_featured: false,
    });
    setBlogModalOpen(true);
  };

  const openEditBlogModal = (item: BlogItem) => {
    setEditingBlog(item);
    setBlogForm({
      title: item.title,
      slug: item.slug,
      author_name: item.author_name,
      author_role: item.author_role,
      category: item.category,
      reading_time: item.reading_time,
      tags: item.tags ? item.tags.join(", ") : "",
      summary: item.summary,
      content: item.content,
      status: item.status,
      is_featured: item.is_featured,
    });
    setBlogModalOpen(true);
  };

  const handleSaveBlog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!blogForm.title.trim() || !blogForm.summary.trim() || !blogForm.content.trim()) {
      toast.error("Title, summary, and content are required.");
      return;
    }

    const payload = {
      ...blogForm,
      tags: blogForm.tags
        ? blogForm.tags.split(",").map((t) => t.trim()).filter(Boolean)
        : [],
    };

    try {
      if (editingBlog) {
        await apiClient.put(`/content/blogs/${editingBlog.id}`, payload);
        toast.success("Blog post updated successfully!");
      } else {
        await apiClient.post("/content/blogs", payload);
        toast.success("New blog post published!");
      }
      setBlogModalOpen(false);
      loadData(true);
    } catch (err: any) {
      toast.error(err?.message || "Failed to save blog post.");
    }
  };

  const handleToggleBlogStatus = async (item: BlogItem) => {
    const newStatus = item.status === "published" ? "draft" : "published";
    try {
      await apiClient.put(`/content/blogs/${item.id}`, { status: newStatus });
      toast.success(`Blog post marked as ${newStatus}.`);
      loadData(true);
    } catch (err: any) {
      toast.error("Failed to toggle status.");
    }
  };

  // --- Delete confirmation execution ---

  const handleExecuteDelete = async () => {
    if (!deleteConfirm) return;
    try {
      if (deleteConfirm.type === "pr") {
        await apiClient.delete(`/content/pr/${deleteConfirm.id}`);
        toast.success("Press release deleted.");
      } else {
        await apiClient.delete(`/content/blogs/${deleteConfirm.id}`);
        toast.success("Blog post deleted.");
      }
      setDeleteConfirm(null);
      loadData(true);
    } catch (err: any) {
      toast.error(err?.message || "Failed to delete item.");
    }
  };

  // Filtered lists
  const filteredPrs = data.prs.filter(
    (p) =>
      !searchQuery.trim() ||
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.media_source.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredBlogs = data.blogs.filter(
    (b) =>
      !searchQuery.trim() ||
      b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.author_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#F7F5F0] text-[#111111]">
      {/* -------------------------------------------------------------------- */}
      {/* 1. TOP CMS HEADER                                                    */}
      {/* -------------------------------------------------------------------- */}
      <header className="sticky top-0 z-40 border-b border-[#E5E0D5] bg-white shadow-2xs">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <Link to="/" className="inline-flex items-center">
              <img
                src={meyvedaLogo}
                alt="Meyveda Logo"
                className="h-8 w-auto object-contain"
              />
            </Link>
            <div className="h-5 w-px bg-[#E5E0D5]" />
            <span className="flex items-center gap-1.5 rounded-full bg-[#FAF4ED] px-3 py-1 text-xs font-bold text-[#E67230]">
              <Shield className="size-3.5" />
              Content Management Desk
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/public-relations"
              target="_blank"
              className="hidden sm:inline-flex items-center gap-1 text-xs font-semibold text-[#555555] hover:text-[#E67230]"
            >
              <span>View PR Page</span>
              <ArrowUpRight className="size-3.5" />
            </Link>
            <Link
              to="/blogs"
              target="_blank"
              className="hidden sm:inline-flex items-center gap-1 text-xs font-semibold text-[#555555] hover:text-[#E67230]"
            >
              <span>View Blogs</span>
              <ArrowUpRight className="size-3.5" />
            </Link>
            <Link
              to="/survey"
              target="_blank"
              className="hidden sm:inline-flex items-center gap-1 text-xs font-bold text-[#E67230] hover:text-[#D15F1F]"
            >
              <Sparkles className="size-3.5" />
              <span>Live Doctor Survey</span>
              <ArrowUpRight className="size-3.5" />
            </Link>

            <button
              onClick={() => loadData(true)}
              className="inline-flex size-8 items-center justify-center rounded-md border border-[#E5E0D5] text-[#555555] hover:bg-[#FAF9F6] hover:text-[#111111]"
              title="Refresh Content"
            >
              <RefreshCw className={`size-3.5 ${refreshing ? "animate-spin text-[#E67230]" : ""}`} />
            </button>

            <div className="text-right text-xs">
              <p className="font-bold text-[#111111]">{userEmail}</p>
              <p className="text-[10px] text-[#888888]">Role: content_manager</p>
            </div>

            <button
              onClick={handleSignOut}
              className="inline-flex items-center gap-1 rounded-md border border-[#E5E0D5] bg-white px-3 py-1.5 text-xs font-bold text-[#777777] hover:border-red-300 hover:bg-red-50 hover:text-red-600 transition-colors"
            >
              <LogOut className="size-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* -------------------------------------------------------------------- */}
      {/* 2. NOTICE & PERMISSION BAR                                           */}
      {/* -------------------------------------------------------------------- */}
      <div className="border-b border-[#EBE7DF] bg-[#FAF4ED] px-4 py-2.5 text-center text-xs text-[#7A3E1D]">
        <span className="font-bold">Content Editor Permissions Active:</span> You have dedicated privileges to create, edit, publish, and delete Public Relations releases and AYUSH Clinical Blog posts.
      </div>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* ------------------------------------------------------------------ */}
        {/* 3. METRIC KPI CARDS                                                */}
        {/* ------------------------------------------------------------------ */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:gap-6">
          <div className="rounded-xl border border-[#E5E0D5] bg-white p-5 shadow-2xs">
            <div className="flex items-center justify-between text-xs text-[#888888]">
              <span>Total Content</span>
              <Layers className="size-4 text-[#E67230]" />
            </div>
            <p className="mt-2 text-2xl font-bold text-[#111111]">
              {data.metrics.total_items}
            </p>
            <p className="mt-1 text-[11px] text-[#666666]">
              PR Releases + Blog Posts
            </p>
          </div>

          <div className="rounded-xl border border-[#E5E0D5] bg-white p-5 shadow-2xs">
            <div className="flex items-center justify-between text-xs text-[#888888]">
              <span>Published</span>
              <CheckCircle2 className="size-4 text-emerald-600" />
            </div>
            <p className="mt-2 text-2xl font-bold text-emerald-700">
              {data.metrics.published_count}
            </p>
            <p className="mt-1 text-[11px] text-emerald-600">
              Active on Public Site
            </p>
          </div>

          <div className="rounded-xl border border-[#E5E0D5] bg-white p-5 shadow-2xs">
            <div className="flex items-center justify-between text-xs text-[#888888]">
              <span>Drafts</span>
              <AlertCircle className="size-4 text-amber-500" />
            </div>
            <p className="mt-2 text-2xl font-bold text-amber-600">
              {data.metrics.draft_count}
            </p>
            <p className="mt-1 text-[11px] text-amber-600">
              Work in Progress
            </p>
          </div>

          <div className="rounded-xl border border-[#E5E0D5] bg-white p-5 shadow-2xs">
            <div className="flex items-center justify-between text-xs text-[#888888]">
              <span>Catalog Split</span>
              <FileText className="size-4 text-blue-600" />
            </div>
            <p className="mt-2 text-lg font-bold text-[#111111]">
              {data.metrics.total_pr} PR / {data.metrics.total_blogs} Blogs
            </p>
            <p className="mt-1 text-[11px] text-[#666666]">
              Dual Content Streams
            </p>
          </div>
        </div>

        {/* ------------------------------------------------------------------ */}
        {/* 4. TABS & CONTROLS                                                 */}
        {/* ------------------------------------------------------------------ */}
        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-b border-[#E5E0D5] pb-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab("pr")}
              className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold transition-all ${
                activeTab === "pr"
                  ? "bg-[#111111] text-white shadow-sm"
                  : "bg-white text-[#555555] border border-[#E5E0D5] hover:bg-[#FAF9F6]"
              }`}
            >
              <Newspaper className="size-4" />
              <span>Public Relations ({data.prs.length})</span>
            </button>

            <button
              onClick={() => setActiveTab("blogs")}
              className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold transition-all ${
                activeTab === "blogs"
                  ? "bg-[#111111] text-white shadow-sm"
                  : "bg-white text-[#555555] border border-[#E5E0D5] hover:bg-[#FAF9F6]"
              }`}
            >
              <BookOpen className="size-4" />
              <span>Clinical Blogs ({data.blogs.length})</span>
            </button>

            <button
              onClick={() => setActiveTab("surveys")}
              className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold transition-all ${
                activeTab === "surveys"
                  ? "bg-[#111111] text-white shadow-sm"
                  : "bg-white text-[#555555] border border-[#E5E0D5] hover:bg-[#FAF9F6]"
              }`}
            >
              <BarChart3 className="size-4 text-[#E67230]" />
              <span>Clinical Surveys ({surveys.length})</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 size-4 text-[#888888]" />
              <input
                type="text"
                placeholder="Search titles, categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-56 rounded-md border border-[#E5E0D5] bg-white py-1.5 pl-9 pr-3 text-xs text-[#111111] focus:border-[#E67230] focus:outline-none"
              />
            </div>

            {activeTab === "pr" && (
              <button
                onClick={openNewPrModal}
                className="inline-flex items-center gap-1.5 rounded-md bg-[#E67230] px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-[#D15F1F] transition-colors"
              >
                <Plus className="size-4" />
                <span>New Press Release</span>
              </button>
            )}
            {activeTab === "blogs" && (
              <button
                onClick={openNewBlogModal}
                className="inline-flex items-center gap-1.5 rounded-md bg-[#E67230] px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-[#D15F1F] transition-colors"
              >
                <Plus className="size-4" />
                <span>New Blog Post</span>
              </button>
            )}
            {activeTab === "surveys" && (
              <button
                onClick={openNewSurveyModal}
                className="inline-flex items-center gap-1.5 rounded-md bg-[#E67230] px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-[#D15F1F] transition-colors"
              >
                <Plus className="size-4" />
                <span>Create Survey (Form Builder)</span>
              </button>
            )}
          </div>
        </div>

        {/* ------------------------------------------------------------------ */}
        {/* 5. TAB CONTENT: PUBLIC RELATIONS                                   */}
        {/* ------------------------------------------------------------------ */}
        {activeTab === "pr" && (
          <div className="mt-6">
            {filteredPrs.length === 0 ? (
              <div className="rounded-xl border border-dashed border-[#DCD6CA] bg-white p-12 text-center">
                <Newspaper className="mx-auto size-10 text-[#AAAAAA]" />
                <p className="mt-3 text-sm font-bold text-[#111111]">No press releases found</p>
                <button
                  onClick={openNewPrModal}
                  className="mt-4 inline-flex items-center gap-1 rounded-md bg-[#E67230] px-4 py-2 text-xs font-bold text-white hover:bg-[#D15F1F]"
                >
                  <Plus className="size-3.5" />
                  <span>Create First Press Release</span>
                </button>
              </div>
            ) : (
              <div className="overflow-hidden rounded-xl border border-[#E5E0D5] bg-white shadow-2xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="border-b border-[#E5E0D5] bg-[#FAF9F6] text-[#555555]">
                      <tr>
                        <th className="py-3.5 pl-6 pr-3 font-semibold">Title & Excerpt</th>
                        <th className="px-3 py-3.5 font-semibold">Category</th>
                        <th className="px-3 py-3.5 font-semibold">Media Source</th>
                        <th className="px-3 py-3.5 font-semibold">Date</th>
                        <th className="px-3 py-3.5 font-semibold">Status</th>
                        <th className="py-3.5 pl-3 pr-6 text-right font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F0ECE1]">
                      {filteredPrs.map((item) => (
                        <tr key={item.id} className="hover:bg-[#FAF9F6]/80 transition-colors">
                          <td className="py-4 pl-6 pr-3">
                            <div className="max-w-md">
                              <p className="font-bold text-[#111111] line-clamp-1">{item.title}</p>
                              <p className="mt-0.5 text-[#666666] line-clamp-1">{item.summary}</p>
                              <p className="mt-1 font-mono text-[10px] text-[#999999]">slug: /{item.slug}</p>
                            </div>
                          </td>
                          <td className="px-3 py-4">
                            <span className="rounded-full bg-[#FAF4ED] px-2.5 py-0.5 font-semibold text-[#E67230]">
                              {item.category}
                            </span>
                          </td>
                          <td className="px-3 py-4 text-[#555555]">
                            {item.media_source}
                          </td>
                          <td className="px-3 py-4 text-[#666666]">
                            {item.published_date}
                          </td>
                          <td className="px-3 py-4">
                            <button
                              onClick={() => handleTogglePrStatus(item)}
                              className={`rounded-full px-2.5 py-0.5 font-bold transition-all ${
                                item.status === "published"
                                  ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                                  : "bg-amber-50 text-amber-700 hover:bg-amber-100"
                              }`}
                              title="Click to toggle publish/draft"
                            >
                              {item.status === "published" ? "Published" : "Draft"}
                            </button>
                          </td>
                          <td className="py-4 pl-3 pr-6 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => openEditPrModal(item)}
                                className="rounded p-1.5 text-[#555555] hover:bg-[#FAF4ED] hover:text-[#E67230]"
                                title="Edit"
                              >
                                <Edit2 className="size-4" />
                              </button>
                              <button
                                onClick={() =>
                                  setDeleteConfirm({
                                    type: "pr",
                                    id: item.id,
                                    title: item.title,
                                  })
                                }
                                className="rounded p-1.5 text-[#555555] hover:bg-red-50 hover:text-red-600"
                                title="Delete"
                              >
                                <Trash2 className="size-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* 6. TAB CONTENT: BLOGS                                              */}
        {/* ------------------------------------------------------------------ */}
        {activeTab === "blogs" && (
          <div className="mt-6">
            {filteredBlogs.length === 0 ? (
              <div className="rounded-xl border border-dashed border-[#DCD6CA] bg-white p-12 text-center">
                <BookOpen className="mx-auto size-10 text-[#AAAAAA]" />
                <p className="mt-3 text-sm font-bold text-[#111111]">No blog posts found</p>
                <button
                  onClick={openNewBlogModal}
                  className="mt-4 inline-flex items-center gap-1 rounded-md bg-[#E67230] px-4 py-2 text-xs font-bold text-white hover:bg-[#D15F1F]"
                >
                  <Plus className="size-3.5" />
                  <span>Create First Blog Post</span>
                </button>
              </div>
            ) : (
              <div className="overflow-hidden rounded-xl border border-[#E5E0D5] bg-white shadow-2xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="border-b border-[#E5E0D5] bg-[#FAF9F6] text-[#555555]">
                      <tr>
                        <th className="py-3.5 pl-6 pr-3 font-semibold">Title & Summary</th>
                        <th className="px-3 py-3.5 font-semibold">Author</th>
                        <th className="px-3 py-3.5 font-semibold">Reading Time</th>
                        <th className="px-3 py-3.5 font-semibold">Status</th>
                        <th className="py-3.5 pl-3 pr-6 text-right font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F0ECE1]">
                      {filteredBlogs.map((item) => (
                        <tr key={item.id} className="hover:bg-[#FAF9F6]/80 transition-colors">
                          <td className="py-4 pl-6 pr-3">
                            <div className="max-w-md">
                              <p className="font-bold text-[#111111] line-clamp-1">{item.title}</p>
                              <p className="mt-0.5 text-[#666666] line-clamp-1">{item.summary}</p>
                              <p className="mt-1 font-mono text-[10px] text-[#999999]">slug: /{item.slug}</p>
                            </div>
                          </td>
                          <td className="px-3 py-4 text-[#555555]">
                            <p className="font-semibold text-[#111111]">{item.author_name}</p>
                            <p className="text-[10px] text-[#888888]">{item.author_role}</p>
                          </td>
                          <td className="px-3 py-4 text-[#666666]">
                            {item.reading_time}
                          </td>
                          <td className="px-3 py-4">
                            <button
                              onClick={() => handleToggleBlogStatus(item)}
                              className={`rounded-full px-2.5 py-0.5 font-bold transition-all ${
                                item.status === "published"
                                  ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                                  : "bg-amber-50 text-amber-700 hover:bg-amber-100"
                              }`}
                              title="Click to toggle publish/draft"
                            >
                              {item.status === "published" ? "Published" : "Draft"}
                            </button>
                          </td>
                          <td className="py-4 pl-3 pr-6 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => openEditBlogModal(item)}
                                className="rounded p-1.5 text-[#555555] hover:bg-[#FAF4ED] hover:text-[#E67230]"
                                title="Edit"
                              >
                                <Edit2 className="size-4" />
                              </button>
                              <button
                                onClick={() =>
                                  setDeleteConfirm({
                                    type: "blog",
                                    id: item.id,
                                    title: item.title,
                                  })
                                }
                                className="rounded p-1.5 text-[#555555] hover:bg-red-50 hover:text-red-600"
                                title="Delete"
                              >
                                <Trash2 className="size-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* TAB 3: CLINICAL SURVEYS & GOOGLE FORMS DESK                        */}
        {/* ------------------------------------------------------------------ */}
        {activeTab === "surveys" && (
          <div className="mt-6 space-y-4">
            <div className="flex flex-col gap-2 rounded-2xl border border-[#E5E0D5] bg-white p-5 shadow-2xs sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-base font-bold text-[#111111] flex items-center gap-2">
                  <BarChart3 className="size-5 text-[#E67230]" />
                  Practitioner Feedback & Google Forms Survey Builder
                </h3>
                <p className="text-xs text-[#666666] mt-0.5">
                  Content Managers can design multi-format questionnaires, configure gamification points, and analyze live doctor response bar graphs.
                </p>
              </div>
              <button
                onClick={openNewSurveyModal}
                className="inline-flex items-center gap-2 rounded-lg bg-[#E67230] px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-[#D15F1F] transition-all"
              >
                <Plus className="size-4" />
                <span>Build New Survey</span>
              </button>
            </div>

            {surveys.length === 0 ? (
              <div className="rounded-xl border border-[#E5E0D5] bg-white p-12 text-center">
                <BarChart3 className="mx-auto size-12 text-[#999999]" />
                <h4 className="mt-3 text-sm font-bold text-[#111111]">No Surveys Created Yet</h4>
                <p className="mt-1 text-xs text-[#666666]">
                  Click the button above to build an interactive Google Forms style clinical survey.
                </p>
              </div>
            ) : (
              <div className="overflow-hidden rounded-xl border border-[#E5E0D5] bg-white shadow-2xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="border-b border-[#E5E0D5] bg-[#FAF9F6] text-[#777777]">
                      <tr>
                        <th className="px-4 py-3 font-semibold">Survey Title</th>
                        <th className="px-4 py-3 font-semibold">Category</th>
                        <th className="px-4 py-3 font-semibold">Questions</th>
                        <th className="px-4 py-3 font-semibold">Gamified Reward</th>
                        <th className="px-4 py-3 font-semibold">Doctor Responses</th>
                        <th className="px-4 py-3 font-semibold">Status</th>
                        <th className="px-4 py-3 text-right font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#EBE7DF]">
                      {surveys.map((item) => (
                        <tr key={item.id} className="hover:bg-[#FAF9F6] transition-colors">
                          <td className="px-4 py-3 font-bold text-[#111111]">
                            <p className="max-w-md truncate" title={item.title}>{item.title}</p>
                            <p className="text-[11px] font-normal text-[#777777] line-clamp-1">{item.description}</p>
                          </td>
                          <td className="px-4 py-3">
                            <span className="rounded-full bg-[#FAF4ED] px-2.5 py-0.5 text-[11px] font-semibold text-[#A4521D]">
                              {item.category}
                            </span>
                          </td>
                          <td className="px-4 py-3 font-mono font-bold text-[#111111]">
                            {item.questions?.length || 0} Questions
                          </td>
                          <td className="px-4 py-3">
                            <span className="inline-flex items-center gap-1 font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                              <Trophy className="size-3" />
                              +{item.reward_points} pts
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => openAnalyticsModal(item)}
                              className="inline-flex items-center gap-1.5 font-bold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-md transition-colors"
                            >
                              <Users className="size-3.5" />
                              <span>{item.response_count} Responses</span>
                              <BarChart3 className="size-3.5 ml-0.5" />
                            </button>
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                                item.status === "active"
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                  : "bg-gray-100 text-gray-700"
                              }`}
                            >
                              {item.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => openAnalyticsModal(item)}
                                className="rounded p-1.5 text-blue-600 hover:bg-blue-50"
                                title="View Bar Graphs & Insights"
                              >
                                <BarChart3 className="size-4" />
                              </button>
                              <button
                                onClick={() => openEditSurveyModal(item)}
                                className="rounded p-1.5 text-[#555555] hover:bg-[#FAF4ED] hover:text-[#E67230]"
                                title="Edit Form"
                              >
                                <Edit2 className="size-4" />
                              </button>
                              <button
                                onClick={() =>
                                  setDeleteConfirm({
                                    type: "survey",
                                    id: item.id,
                                    title: item.title,
                                  })
                                }
                                className="rounded p-1.5 text-[#555555] hover:bg-red-50 hover:text-red-600"
                                title="Delete Survey"
                              >
                                <Trash2 className="size-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* -------------------------------------------------------------------- */}
      {/* GOOGLE FORMS STYLE SURVEY BUILDER MODAL                              */}
      {/* -------------------------------------------------------------------- */}
      {surveyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="relative max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white p-6 sm:p-8 shadow-2xl">
            <button
              onClick={() => setSurveyModalOpen(false)}
              className="absolute right-6 top-6 rounded-full p-2 text-[#777777] hover:bg-[#FAF9F6] hover:text-[#111111]"
            >
              <X className="size-5" />
            </button>

            {/* Google Form Style Header */}
            <div className="border-b border-[#E5E0D5] pb-5">
              <div className="flex items-center gap-2">
                <div className="flex size-9 items-center justify-center rounded-lg bg-[#E67230] text-white">
                  <ClipboardList className="size-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-[#111111]">
                    {editingSurvey ? "Edit Clinical Survey Form" : "Google Forms Style Survey Builder"}
                  </h2>
                  <p className="text-xs text-[#666666]">
                    Configure multi-format questions (Radio, Checkbox, Rating, Text) and gamification rewards for AYUSH practitioners.
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSaveSurvey} className="mt-6 space-y-6">
              {/* Form Metadata Section */}
              <div className="rounded-xl border border-[#EBE7DF] bg-[#FAF9F6] p-5 space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className="text-xs font-bold text-[#111111]">Survey Title *</label>
                    <input
                      type="text"
                      required
                      value={surveyForm.title}
                      onChange={(e) => setSurveyForm({ ...surveyForm, title: e.target.value })}
                      placeholder="e.g. Practitioner Clinical Intelligence & Formulary Usage Survey"
                      className="mt-1 w-full rounded-lg border border-[#D5CFBF] bg-white p-2.5 text-xs text-[#111111] focus:border-[#E67230] focus:outline-none"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-xs font-bold text-[#111111]">Description & Clinical Context *</label>
                    <textarea
                      rows={2}
                      required
                      value={surveyForm.description}
                      onChange={(e) => setSurveyForm({ ...surveyForm, description: e.target.value })}
                      placeholder="Explain to Vaidyas why this clinical feedback is requested and how it will improve AYUSH standards."
                      className="mt-1 w-full rounded-lg border border-[#D5CFBF] bg-white p-2.5 text-xs text-[#111111] focus:border-[#E67230] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-[#111111]">Clinical Category</label>
                    <input
                      type="text"
                      value={surveyForm.category}
                      onChange={(e) => setSurveyForm({ ...surveyForm, category: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-[#D5CFBF] bg-white p-2.5 text-xs text-[#111111] focus:border-[#E67230] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-[#111111]">Gamified Reward Points (per completion)</label>
                    <div className="mt-1 flex items-center gap-2">
                      <input
                        type="number"
                        min={10}
                        max={500}
                        value={surveyForm.reward_points}
                        onChange={(e) => setSurveyForm({ ...surveyForm, reward_points: parseInt(e.target.value) || 50 })}
                        className="w-full rounded-lg border border-[#D5CFBF] bg-white p-2.5 text-xs font-bold text-amber-700 focus:border-[#E67230] focus:outline-none"
                      />
                      <span className="text-xs font-semibold text-amber-600 shrink-0">Points</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Questions List (Google Form Cards) */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-[#111111]">
                    Survey Questions ({surveyForm.questions.length})
                  </h3>
                  <button
                    type="button"
                    onClick={handleAddQuestion}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-[#E67230] bg-[#FAF4ED] px-3 py-1.5 text-xs font-bold text-[#E67230] hover:bg-[#E67230] hover:text-white transition-colors"
                  >
                    <Plus className="size-3.5" />
                    <span>Add Question Card</span>
                  </button>
                </div>

                {surveyForm.questions.map((q, qIdx) => (
                  <div
                    key={q.id || qIdx}
                    className="relative rounded-xl border-2 border-[#E5E0D5] bg-white p-5 shadow-xs space-y-4 transition-all hover:border-[#D0C9BA]"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-2 flex-1">
                        <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[#111111] text-[11px] font-bold text-white">
                          {qIdx + 1}
                        </span>
                        <input
                          type="text"
                          value={q.title}
                          onChange={(e) => handleUpdateQuestion(qIdx, "title", e.target.value)}
                          placeholder="Question Title / Prompt"
                          className="w-full rounded-lg border border-[#E5E0D5] bg-[#FAF9F6] p-2 text-xs font-bold text-[#111111] focus:border-[#E67230] focus:bg-white focus:outline-none"
                        />
                      </div>

                      {/* Question Type Selector */}
                      <div className="flex items-center gap-2">
                        <select
                          value={q.type}
                          onChange={(e) => handleUpdateQuestion(qIdx, "type", e.target.value)}
                          className="rounded-lg border border-[#E5E0D5] bg-white px-3 py-2 text-xs font-bold text-[#111111] focus:border-[#E67230] focus:outline-none"
                        >
                          <option value="radio">Multiple Choice (Radio)</option>
                          <option value="checkbox">Checkboxes (Multi-select)</option>
                          <option value="rating">Linear Rating Scale (1 to 5)</option>
                          <option value="text">Paragraph / Written Text</option>
                        </select>

                        <button
                          type="button"
                          onClick={() => handleRemoveQuestion(qIdx)}
                          className="rounded-lg p-2 text-[#888888] hover:bg-red-50 hover:text-red-600"
                          title="Remove Question"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </div>

                    {/* Question Help Text */}
                    <div>
                      <input
                        type="text"
                        value={q.helpText || ""}
                        onChange={(e) => handleUpdateQuestion(qIdx, "helpText", e.target.value)}
                        placeholder="Optional subtitle / clinical guidance hint"
                        className="w-full rounded-md border border-[#EAE6DE] bg-white px-2.5 py-1 text-[11px] text-[#666666] focus:border-[#E67230] focus:outline-none"
                      />
                    </div>

                    {/* Options Editor for Radio & Checkbox */}
                    {(q.type === "radio" || q.type === "checkbox") && (
                      <div className="pl-6 space-y-2 border-l-2 border-[#EAE6DE]">
                        <label className="text-[11px] font-bold text-[#666666] uppercase tracking-wider">
                          Options
                        </label>
                        {q.options?.map((opt, optIdx) => (
                          <div key={optIdx} className="flex items-center gap-2">
                            <span className="text-xs text-[#888888]">
                              {q.type === "radio" ? "○" : "□"}
                            </span>
                            <input
                              type="text"
                              value={opt}
                              onChange={(e) => handleUpdateOption(qIdx, optIdx, e.target.value)}
                              className="w-full rounded-md border border-[#E5E0D5] px-2.5 py-1.5 text-xs text-[#222222] focus:border-[#E67230] focus:outline-none"
                            />
                            {q.options.length > 2 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveOption(qIdx, optIdx)}
                                className="text-[#999999] hover:text-red-600"
                              >
                                <X className="size-3.5" />
                              </button>
                            )}
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => handleAddOption(qIdx)}
                          className="text-xs font-bold text-[#E67230] hover:underline pt-1 inline-flex items-center gap-1"
                        >
                          <Plus className="size-3" />
                          <span>Add Option</span>
                        </button>
                      </div>
                    )}

                    {q.type === "rating" && (
                      <div className="pl-6 border-l-2 border-[#EAE6DE] text-xs text-[#777777]">
                        Rating Scale preview: <span className="font-bold text-[#111111]">1, 2, 3, 4, 5 Stars / Scale</span>
                      </div>
                    )}

                    {q.type === "text" && (
                      <div className="pl-6 border-l-2 border-[#EAE6DE] text-xs text-[#777777] italic">
                        Open-ended clinical narrative response box.
                      </div>
                    )}

                    {/* Required Toggle */}
                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#F2EEE6]">
                      <label className="flex items-center gap-2 text-xs font-semibold text-[#555555] cursor-pointer">
                        <input
                          type="checkbox"
                          checked={q.required}
                          onChange={(e) => handleUpdateQuestion(qIdx, "required", e.target.checked)}
                          className="accent-[#E67230] size-3.5"
                        />
                        <span>Required Answer</span>
                      </label>
                    </div>
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 border-t border-[#E5E0D5] pt-5">
                <button
                  type="button"
                  onClick={() => setSurveyModalOpen(false)}
                  className="rounded-lg border border-[#E5E0D5] px-5 py-2 text-xs font-bold text-[#666666] hover:bg-[#FAF9F6]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-[#E67230] px-6 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-[#D15F1F] transition-all"
                >
                  {editingSurvey ? "Update Survey" : "Publish Form"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------------- */}
      {/* BAR GRAPH INSIGHTS & ANALYTICS MODAL                                  */}
      {/* -------------------------------------------------------------------- */}
      {surveyAnalyticsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="relative max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white p-6 sm:p-8 shadow-2xl">
            <button
              onClick={() => setSurveyAnalyticsModalOpen(false)}
              className="absolute right-6 top-6 rounded-full p-2 text-[#777777] hover:bg-[#FAF9F6] hover:text-[#111111]"
            >
              <X className="size-5" />
            </button>

            <div className="border-b border-[#E5E0D5] pb-5">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-800">
                <TrendingUp className="size-3.5" />
                Aggregated Doctor Demand Analytics
              </span>
              <h2 className="mt-2 text-xl font-bold text-[#111111]">
                {activeAnalytics?.title || "Survey Question Insights"}
              </h2>
              <p className="text-xs text-[#666666] mt-0.5">
                Total Doctor Participants: <span className="font-bold text-[#111111]">{activeAnalytics?.total_responses || 0}</span> • Reward Granted: <span className="font-bold text-amber-700">+{activeAnalytics?.reward_points || 50} pts</span>
              </p>
            </div>

            {loadingAnalytics ? (
              <div className="flex min-h-[300px] items-center justify-center">
                <div className="size-10 animate-spin rounded-full border-4 border-[#E67230] border-t-transparent" />
              </div>
            ) : activeAnalytics && activeAnalytics.question_insights ? (
              <div className="mt-6 space-y-6">
                {activeAnalytics.question_insights.map((qi, idx) => (
                  <div key={idx} className="rounded-xl border border-[#E5E0D5] bg-[#FAF9F6] p-5 shadow-2xs">
                    <div className="flex items-start justify-between gap-3 border-b border-[#EBE7DF] pb-2.5">
                      <div>
                        <h4 className="text-xs font-bold text-[#111111] sm:text-sm">
                          <span className="text-[#E67230] mr-1">Q{idx + 1}.</span> {qi.question_title}
                        </h4>
                        <p className="text-[11px] text-[#777777]">
                          Type: <span className="uppercase font-semibold">{qi.question_type}</span> • Total Votes: {qi.total_votes}
                        </p>
                      </div>
                    </div>

                    {/* Bar chart rendering */}
                    {qi.options && qi.options.length > 0 ? (
                      <div className="mt-4 space-y-3">
                        {qi.options.map((opt, oIdx) => (
                          <div key={oIdx} className="space-y-1">
                            <div className="flex justify-between text-xs font-semibold text-[#222222]">
                              <span className="max-w-[75%] truncate" title={opt.option}>{opt.option}</span>
                              <span className="font-mono font-bold text-[#111111]">{opt.percentage}% ({opt.count})</span>
                            </div>
                            <div className="h-3.5 w-full overflow-hidden rounded-full bg-[#E8E4DA] p-0.5">
                              <div
                                className="h-full rounded-full bg-gradient-to-r from-[#E67230] to-[#F2994A] transition-all duration-500"
                                style={{ width: `${Math.max(opt.percentage, 2)}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : qi.text_answers && qi.text_answers.length > 0 ? (
                      <div className="mt-3 space-y-2">
                        <p className="text-xs font-bold text-[#666666]">Doctor Responses ({qi.text_answers.length}):</p>
                        <div className="max-h-40 space-y-1.5 overflow-y-auto">
                          {qi.text_answers.map((ans, aIdx) => (
                            <div key={aIdx} className="rounded-md border border-[#E2DDD3] bg-white p-2.5 text-xs text-[#333333] italic">
                              "{ans}"
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <p className="mt-3 text-xs text-[#888888] italic">No responses recorded yet.</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-8 text-center text-xs text-[#888888]">No analytics data available for this survey.</p>
            )}
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------------- */}
      {/* 7. MODAL: ADD / EDIT PRESS RELEASE                                   */}
      {/* -------------------------------------------------------------------- */}
      {prModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="relative max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white p-6 sm:p-8 shadow-2xl">
            <button
              onClick={() => setPrModalOpen(false)}
              className="absolute right-5 top-5 rounded-full p-1.5 text-[#888888] hover:bg-[#FAF9F6] hover:text-[#111111]"
            >
              <X className="size-5" />
            </button>

            <h2 className="text-xl font-bold text-[#111111]">
              {editingPr ? "Edit Press Release" : "Publish New Press Release"}
            </h2>
            <p className="mt-1 text-xs text-[#666666]">
              Announcements will appear live on the public `/public-relations` newsroom.
            </p>

            <form onSubmit={handleSavePr} className="mt-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[#333333]">Title *</label>
                <input
                  type="text"
                  required
                  value={prForm.title}
                  onChange={(e) => setPrForm({ ...prForm, title: e.target.value })}
                  placeholder="e.g. Meyveda Expands AYUSH Clinical Desk Coverage..."
                  className="mt-1 w-full rounded-md border border-[#E5E0D5] p-2.5 text-xs text-[#111111] focus:border-[#E67230] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block font-semibold text-[#333333]">Category</label>
                  <select
                    value={prForm.category}
                    onChange={(e) => setPrForm({ ...prForm, category: e.target.value })}
                    className="mt-1 w-full rounded-md border border-[#E5E0D5] p-2.5 text-xs text-[#111111] focus:border-[#E67230] focus:outline-none"
                  >
                    <option>Press Release</option>
                    <option>Media Coverage</option>
                    <option>Statutory Milestone</option>
                    <option>Partnership Announcement</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#333333]">Media Source</label>
                  <input
                    type="text"
                    value={prForm.media_source}
                    onChange={(e) => setPrForm({ ...prForm, media_source: e.target.value })}
                    placeholder="e.g. Meyveda Media Desk, The Hindu..."
                    className="mt-1 w-full rounded-md border border-[#E5E0D5] p-2.5 text-xs text-[#111111] focus:border-[#E67230] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block font-semibold text-[#333333]">Publication Date</label>
                  <input
                    type="date"
                    value={prForm.published_date}
                    onChange={(e) => setPrForm({ ...prForm, published_date: e.target.value })}
                    className="mt-1 w-full rounded-md border border-[#E5E0D5] p-2.5 text-xs text-[#111111] focus:border-[#E67230] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#333333]">External Press Link (Optional)</label>
                  <input
                    type="url"
                    value={prForm.media_source_url}
                    onChange={(e) => setPrForm({ ...prForm, media_source_url: e.target.value })}
                    placeholder="https://example.com/press-article"
                    className="mt-1 w-full rounded-md border border-[#E5E0D5] p-2.5 text-xs text-[#111111] focus:border-[#E67230] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#333333]">Summary / Excerpt *</label>
                <textarea
                  required
                  rows={2}
                  value={prForm.summary}
                  onChange={(e) => setPrForm({ ...prForm, summary: e.target.value })}
                  placeholder="Short 1-2 sentence overview for news card previews..."
                  className="mt-1 w-full rounded-md border border-[#E5E0D5] p-2.5 text-xs text-[#111111] focus:border-[#E67230] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#333333]">Full Content *</label>
                <textarea
                  required
                  rows={6}
                  value={prForm.content}
                  onChange={(e) => setPrForm({ ...prForm, content: e.target.value })}
                  placeholder="Full text of the announcement. Paragraphs separated by blank lines..."
                  className="mt-1 w-full rounded-md border border-[#E5E0D5] p-2.5 text-xs text-[#111111] focus:border-[#E67230] focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={prForm.status === "published"}
                    onChange={(e) =>
                      setPrForm({
                        ...prForm,
                        status: e.target.checked ? "published" : "draft",
                      })
                    }
                    className="size-4 rounded text-[#E67230] focus:ring-[#E67230]"
                  />
                  <span className="font-semibold text-[#333333]">Publish immediately</span>
                </label>
              </div>

              <div className="mt-6 flex items-center justify-end gap-3 border-t border-[#E5E0D5] pt-4">
                <button
                  type="button"
                  onClick={() => setPrModalOpen(false)}
                  className="rounded-md border border-[#E5E0D5] px-4 py-2 font-semibold text-[#555555] hover:bg-[#FAF9F6]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-md bg-[#E67230] px-5 py-2 font-bold text-white hover:bg-[#D15F1F]"
                >
                  {editingPr ? "Update Release" : "Publish Release"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------------- */}
      {/* 8. MODAL: ADD / EDIT BLOG POST                                       */}
      {/* -------------------------------------------------------------------- */}
      {blogModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="relative max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white p-6 sm:p-8 shadow-2xl">
            <button
              onClick={() => setBlogModalOpen(false)}
              className="absolute right-5 top-5 rounded-full p-1.5 text-[#888888] hover:bg-[#FAF9F6] hover:text-[#111111]"
            >
              <X className="size-5" />
            </button>

            <h2 className="text-xl font-bold text-[#111111]">
              {editingBlog ? "Edit Blog Post" : "Author New Blog Post"}
            </h2>
            <p className="mt-1 text-xs text-[#666666]">
              Blogs will appear live on the public `/blogs` portal.
            </p>

            <form onSubmit={handleSaveBlog} className="mt-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[#333333]">Blog Title *</label>
                <input
                  type="text"
                  required
                  value={blogForm.title}
                  onChange={(e) => setBlogForm({ ...blogForm, title: e.target.value })}
                  placeholder="e.g. Standardizing Prakriti Diagnostics: Bridging Nadi Pariksha..."
                  className="mt-1 w-full rounded-md border border-[#E5E0D5] p-2.5 text-xs text-[#111111] focus:border-[#E67230] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block font-semibold text-[#333333]">Author Name</label>
                  <input
                    type="text"
                    value={blogForm.author_name}
                    onChange={(e) => setBlogForm({ ...blogForm, author_name: e.target.value })}
                    placeholder="e.g. Dr. Ramesh Vaidya, BAMS"
                    className="mt-1 w-full rounded-md border border-[#E5E0D5] p-2.5 text-xs text-[#111111] focus:border-[#E67230] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#333333]">Author Role / Title</label>
                  <input
                    type="text"
                    value={blogForm.author_role}
                    onChange={(e) => setBlogForm({ ...blogForm, author_role: e.target.value })}
                    placeholder="e.g. Senior Ayurvedic Physician & Informatics Lead"
                    className="mt-1 w-full rounded-md border border-[#E5E0D5] p-2.5 text-xs text-[#111111] focus:border-[#E67230] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block font-semibold text-[#333333]">Reading Time</label>
                  <input
                    type="text"
                    value={blogForm.reading_time}
                    onChange={(e) => setBlogForm({ ...blogForm, reading_time: e.target.value })}
                    placeholder="e.g. 5 min read"
                    className="mt-1 w-full rounded-md border border-[#E5E0D5] p-2.5 text-xs text-[#111111] focus:border-[#E67230] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#333333]">Tags (comma separated)</label>
                  <input
                    type="text"
                    value={blogForm.tags}
                    onChange={(e) => setBlogForm({ ...blogForm, tags: e.target.value })}
                    placeholder="e.g. Kayachikitsa, ABDM, Nadi"
                    className="mt-1 w-full rounded-md border border-[#E5E0D5] p-2.5 text-xs text-[#111111] focus:border-[#E67230] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#333333]">Summary / Abstract *</label>
                <textarea
                  required
                  rows={2}
                  value={blogForm.summary}
                  onChange={(e) => setBlogForm({ ...blogForm, summary: e.target.value })}
                  placeholder="Short abstract summarizing key clinical findings..."
                  className="mt-1 w-full rounded-md border border-[#E5E0D5] p-2.5 text-xs text-[#111111] focus:border-[#E67230] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#333333]">Blog Content *</label>
                <textarea
                  required
                  rows={6}
                  value={blogForm.content}
                  onChange={(e) => setBlogForm({ ...blogForm, content: e.target.value })}
                  placeholder="Full blog body. Blank lines indicate separate paragraphs..."
                  className="mt-1 w-full rounded-md border border-[#E5E0D5] p-2.5 text-xs text-[#111111] focus:border-[#E67230] focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={blogForm.status === "published"}
                    onChange={(e) =>
                      setBlogForm({
                        ...blogForm,
                        status: e.target.checked ? "published" : "draft",
                      })
                    }
                    className="size-4 rounded text-[#E67230] focus:ring-[#E67230]"
                  />
                  <span className="font-semibold text-[#333333]">Publish immediately</span>
                </label>
              </div>

              <div className="mt-6 flex items-center justify-end gap-3 border-t border-[#E5E0D5] pt-4">
                <button
                  type="button"
                  onClick={() => setBlogModalOpen(false)}
                  className="rounded-md border border-[#E5E0D5] px-4 py-2 font-semibold text-[#555555] hover:bg-[#FAF9F6]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-md bg-[#E67230] px-5 py-2 font-bold text-white hover:bg-[#D15F1F]"
                >
                  {editingBlog ? "Update Blog" : "Publish Blog"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------------- */}
      {/* 9. MODAL: DELETE CONFIRMATION                                        */}
      {/* -------------------------------------------------------------------- */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl">
            <h3 className="text-base font-bold text-[#111111]">Confirm Deletion</h3>
            <p className="mt-2 text-xs leading-relaxed text-[#666666]">
              Are you sure you want to permanently delete: <br />
              <strong className="text-[#111111]">"{deleteConfirm.title}"</strong>?
              This action cannot be undone.
            </p>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="rounded-md border border-[#E5E0D5] px-4 py-2 text-xs font-semibold text-[#555555] hover:bg-[#FAF9F6]"
              >
                Cancel
              </button>
              <button
                onClick={handleExecuteDelete}
                className="rounded-md bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-700"
              >
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

