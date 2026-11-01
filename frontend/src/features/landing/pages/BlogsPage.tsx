import { LandingNavbar } from "../components/LandingNavbar";
import { LandingFooter } from "../components/LandingFooter";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowRight,
  Home,
  Clock,
  BookOpen,
} from "lucide-react";
import meyvedaLogo from "@/assets/meyvedalogo.png";
import { apiClient } from "@/services/apiClient";

interface BlogPostItem {
  id: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  author_name: string;
  author_role: string;
  reading_time: string;
  status: string;
  created_at?: string;
}

export function BlogsPage() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<BlogPostItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBlogs() {
      try {
        setLoading(true);
        const data = await apiClient.get<BlogPostItem[]>("/content/blogs");
        if (Array.isArray(data) && data.length > 0) {
          setPosts(data);
        } else {
          setPosts([
            {
              id: "blog-1",
              title: "Modernizing Clinical Nadi Pariksha: Integrating Classical Pulse Diagnostics with Longitudinal Vitals",
              slug: "modernizing-clinical-nadi-pariksha-classical-pulse",
              author_name: "Dr. Ramesh Vaidya, BAMS",
              author_role: "Chief Ayurvedic Consultant",
              reading_time: "5 min read",
              summary: "How systematic recording of Tridosha imbalances and Rogi-Roga Pariksha transforms subjective pulse analysis into verifiable clinical evidence.",
              content: "Classical Ayurveda places Nadi Pariksha (pulse examination) at the pinnacle of the Ashtavidha Pariksha. However, in contemporary practice, transmitting and tracking these diagnostic insights across multi-session treatments requires structured documentation.\n\nIn this clinical guide, we explore how standardized Prakriti-Vikriti digital indexing preserves the tactile nuance of pulse dynamics while creating verifiable longitudinal health records for integrative follow-ups.",
              status: "published",
              created_at: new Date().toISOString(),
            },
            {
              id: "blog-2",
              title: "Classical Pharmacology & Heavy Metal Safety: Vetting Rasa Shastra Formulations Under GMP Standards",
              slug: "classical-pharmacology-heavy-metal-safety-rasa-shastra",
              author_name: "Meyveda Editorial & Quality Board",
              author_role: "Department of Pharmaceutical Quality",
              reading_time: "6 min read",
              summary: "An analysis of Shodhana and Marana purification cycles, AAS testing protocols, and ensuring patient trust in classical herbo-mineral preparations.",
              content: "Herbo-mineral formulations in Ayurveda, developed through centuries of Rasa Shastra expertise, require exacting purification (Shodhana) and calcination (Marana) processes.\n\nWhen produced under strict Good Manufacturing Practices (GMP) and verified through Atomic Absorption Spectroscopy (AAS), Bhasmas demonstrate optimal bioavailability and strict adherence to statutory safety limits.",
              status: "published",
              created_at: new Date().toISOString(),
            },
            {
              id: "blog-3",
              title: "The Digital Vaidya: Navigating ABDM-HPR Compliance & Sovereign Practice Ownership",
              slug: "the-digital-vaidya-navigating-abdm-hpr-compliance",
              author_name: "Dr. Akshara V., BAMS, MD (Ayu)",
              author_role: "Health Informatics Specialist",
              reading_time: "4 min read",
              summary: "Demystifying Healthcare Professional Registry (HPR) enrollment, statutory compliance, and digital prescription validity under National Health Authority standards.",
              content: "The Ayushman Bharat Digital Mission (ABDM) has introduced a transformative leap for AYUSH practitioners. By linking state medical council credentials to a verified Healthcare Professional Registry (HPR) ID, doctors gain sovereign ownership of their digital identity.\n\nThis guide walks through the key statutory advantages, from digital signature compliance to direct integration with national health claim gateways.",
              status: "published",
              created_at: new Date().toISOString(),
            },
          ]);
        }
      } catch (err) {
        console.warn("Could not load remote blogs, using fallback data:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchBlogs();
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-[#FAF9F6] text-[#111111] antialiased selection:bg-[#E67230]/20 selection:text-[#E67230]">
      {/* -------------------------------------------------------------------- */}
      {/* 1. HEADER & BRAND NAVIGATION BAR                                     */}
      {/* -------------------------------------------------------------------- */}
      <LandingNavbar activePath="/blogs" />

      {/* -------------------------------------------------------------------- */}
      {/* 2. COMPACT TITLE & CLEAN BLOG BOXES                                  */}
      {/* -------------------------------------------------------------------- */}
      <main className="flex-1 py-10 sm:py-12">
        <div className="mx-auto max-w-[1216px] px-5 sm:px-8 lg:px-12">
          {/* Direct, clean title */}
          <div className="flex items-center justify-between border-b border-[#EBE7DF] pb-5">
            <h1
              className="text-3xl sm:text-4xl font-bold tracking-tight text-[#111111]"
              style={{ fontFamily: 'var(--font-display), "Cormorant Garamond", Georgia, serif' }}
            >
              Blogs
            </h1>
            <span className="text-xs sm:text-sm font-medium text-[#777777]">
              {posts.length} {posts.length === 1 ? "post" : "posts"}
            </span>
          </div>

          {/* Grid of Clean Blog Boxes (Clicking redirects to dedicated page) */}
          {posts.length === 0 ? (
            <div className="my-12 rounded-xl border border-dashed border-[#DCD6CA] bg-white p-12 text-center">
              <BookOpen className="mx-auto size-10 text-[#AAAAAA]" />
              <h3 className="mt-3 text-base font-bold text-[#111111]">No blogs found</h3>
            </div>
          ) : (
            <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => (
                <div
                  key={post.id}
                  onClick={() =>
                    navigate({
                      to: "/blogs/$slug",
                      params: { slug: post.slug },
                    })
                  }
                  className="group flex flex-col justify-between rounded-xl border border-[#EBE7DF] bg-white p-6 shadow-2xs transition-all duration-200 hover:-translate-y-1 hover:border-[#E67230]/40 hover:shadow-md cursor-pointer"
                >
                  <div>
                    {/* Clean Reading Time Only (No badges, no unwanted clutter) */}
                    <div className="flex items-center justify-between text-xs text-[#888888]">
                      <span className="flex items-center gap-1.5 font-medium">
                        <Clock className="size-3 text-[#E67230]" />
                        {post.reading_time}
                      </span>
                    </div>

                    {/* Title */}
                    <h2 className="mt-3.5 text-lg sm:text-xl font-bold text-[#111111] leading-snug line-clamp-2 group-hover:text-[#E67230] transition-colors">
                      {post.title}
                    </h2>

                    {/* Summary */}
                    <p className="mt-3 text-sm leading-relaxed text-[#555555] line-clamp-3">
                      {post.summary}
                    </p>
                  </div>

                  {/* Clean Bottom Bar */}
                  <div className="mt-6 border-t border-[#F0ECE1] pt-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-[#666666]">
                        {post.author_name}
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-[#E67230] group-hover:translate-x-1 transition-transform">
                        Read Blog
                        <ArrowRight className="size-3" />
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* -------------------------------------------------------------------- */}
      {/* 3. FOOTER                                                            */}
      {/* -------------------------------------------------------------------- */}
      <LandingFooter />
    </div>
  );
}
