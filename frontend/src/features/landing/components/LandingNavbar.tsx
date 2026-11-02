import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, ChevronDown, Menu, X, Newspaper } from "lucide-react";
import meyvedaLogo from "@/assets/meyvedalogo.png";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";

export interface LandingNavbarProps {
  onRegisterClick?: () => void;
  activePath?: string;
}

export const LANDING_NAV_LINKS = [
  { label: "For Doctors", href: "/" },
  { label: "About Us", href: "/about" },
  { label: "Community", href: "/#community" },
  { label: "Blog", href: "/blogs" },
  { label: "Contact Us", href: "/contact" },
];

export function LandingNavbar({ onRegisterClick, activePath }: LandingNavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [aboutDropdownOpen, setAboutDropdownOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith("/#") || href.startsWith("#")) {
      const anchor = href.replace(/^\/?#/, "");
      if (window.location.pathname === "/" || window.location.pathname === "") {
        e.preventDefault();
        const el = document.getElementById(anchor);
        if (el) {
          el.scrollIntoView({ behavior: "smooth" });
        }
      }
    }
  };

  const handleRegister = () => {
    if (onRegisterClick) {
      onRegisterClick();
    } else {
      navigate({ to: "/register" });
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b border-[#EBE7DF] bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex h-20 max-w-[1320px] items-center justify-between px-5 sm:h-22 sm:px-8 lg:px-12">
        {/* Brand Logo Link to Landing */}
        <Link
          to="/"
          aria-label="Meyveda — Home"
          className="inline-flex items-center rounded-sm transition-opacity hover:opacity-90"
        >
          <img
            src={meyvedaLogo}
            alt="Meyveda — Reinvent You"
            className="h-10 sm:h-12 lg:h-[50px] w-auto object-contain select-none"
            loading="eager"
          />
        </Link>

        {/* Center Navigation Links */}
        <nav aria-label="Main Navigation" className="hidden items-center gap-6 lg:flex xl:gap-8">
          {LANDING_NAV_LINKS.map((item) => {
            const isExternalAnchor = item.href.startsWith("/#") || item.href.startsWith("#");
            const isAbout = item.label === "About Us";
            const isAboutActive = activePath === "/about" || activePath === "/public-relations";

            // If item is About Us: render link with hover/click dropdown for Public Relations
            if (isAbout) {
              return (
                <div
                  key={item.label}
                  className="relative py-2"
                  onMouseEnter={() => setAboutDropdownOpen(true)}
                  onMouseLeave={() => setAboutDropdownOpen(false)}
                >
                  <a
                    href="/about"
                    className={`inline-flex items-center gap-1 text-[15px] font-semibold transition-colors ${
                      isAboutActive ? "text-[#E67230] font-bold" : "text-[#555555] hover:text-[#111111]"
                    }`}
                  >
                    <span>About Us</span>
                    <ChevronDown
                      className={`size-3.5 transition-transform duration-200 ${
                        aboutDropdownOpen ? "rotate-180 text-[#E67230]" : "text-[#888888]"
                      }`}
                    />
                  </a>

                  {/* Dropdown Menu */}
                  {aboutDropdownOpen && (
                    <div className="absolute left-0 top-full -mt-0.5 w-56 rounded-xl border border-[#EBE7DF] bg-white py-2 shadow-lg ring-1 ring-black/5 animate-in fade-in slide-in-from-top-1 duration-150">
                      <Link
                        to="/about"
                        className="flex flex-col px-4 py-2.5 hover:bg-[#FAF9F6] transition-colors"
                      >
                        <span className="text-sm font-bold text-[#111111]">About Meyveda</span>
                        <span className="text-xs text-[#777777]">Our mission, clinical charter & story</span>
                      </Link>

                      <div className="my-1 border-t border-[#F0ECE3]" />

                      <Link
                        to="/public-relations"
                        className="flex items-center gap-2.5 px-4 py-2.5 hover:bg-[#FAF9F6] hover:text-[#E67230] transition-colors group"
                      >
                        <Newspaper className="size-4 text-[#888888] group-hover:text-[#E67230]" />
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-[#111111] group-hover:text-[#E67230]">Public Relations</span>
                          <span className="text-xs text-[#777777]">Press releases & official announcements</span>
                        </div>
                      </Link>
                    </div>
                  )}
                </div>
              );
            }

            if (isExternalAnchor) {
              return (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={(e) => handleNavClick(e, item.href)}
                  className={`whitespace-nowrap py-2 text-[15px] font-semibold transition-colors ${
                    activePath === item.href ? "text-[#E67230]" : "text-[#555555] hover:text-[#111111]"
                  }`}
                >
                  {item.label}
                </a>
              );
            }

            return (
              <a
                key={item.label}
                href={item.href}
                className={`whitespace-nowrap py-2 text-[15px] font-semibold transition-colors ${
                  activePath === item.href ? "text-[#E67230] font-bold" : "text-[#555555] hover:text-[#111111]"
                }`}
              >
                {item.label}
              </a>
            );
          })}
        </nav>

        {/* Right CTA Area */}
        <div className="flex items-center gap-3 sm:gap-4">
          {isAuthenticated && user ? (
            <div className="flex items-center gap-2 sm:gap-3">
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#FAF9F6] border border-[#EBE7DF] hover:border-[#E67230]/40 transition-colors"
              >
                <span className="size-6 sm:size-7 rounded-full bg-[#E67230] text-white flex items-center justify-center text-xs font-bold">
                  {(user.doctor_profile?.full_name || user.email)[0]?.toUpperCase()}
                </span>
                <div className="hidden sm:block text-left">
                  <p className="text-xs font-bold text-[#111111] leading-tight line-clamp-1">
                    {user.doctor_profile?.full_name || user.email.split("@")[0]}
                  </p>
                  <p className="text-[10px] text-[#777777] font-semibold leading-tight capitalize">
                    {user.role} · Active
                  </p>
                </div>
              </Link>
              <Link
                to="/dashboard"
                className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#E67230] hover:bg-[#D15F1F] text-white text-xs font-bold transition-all shadow-xs"
              >
                <span>My Workspace</span>
                <ArrowRight className="size-3.5" />
              </Link>
              <button
                type="button"
                onClick={() => {
                  logout();
                  toast.info("Signed out of your session.");
                }}
                className="text-xs font-semibold text-[#666666] hover:text-[#E67230] px-2 py-1.5 transition-colors cursor-pointer"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <>
              <Link
                to="/login"
                className="inline-flex items-center justify-center rounded-md px-4 py-2.5 text-sm sm:text-[15px] font-bold text-[#111111] transition-colors hover:text-[#E67230]"
              >
                Sign In
              </Link>

              <div className="hidden sm:block">
                <button
                  type="button"
                  onClick={handleRegister}
                  className="group relative inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#E67230] px-5 text-sm sm:text-[15px] font-bold text-white shadow-[0_4px_16px_-4px_rgba(230,114,48,0.4)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#D15F1F] hover:shadow-[0_8px_24px_-4px_rgba(230,114,48,0.5)] active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E67230] focus-visible:ring-offset-2 cursor-pointer"
                >
                  <span>Early Bird Registration</span>
                  <ArrowRight className="size-4 shrink-0 transition-transform duration-200 group-hover:translate-x-0.5" />
                </button>
              </div>
            </>
          )}

          {/* Mobile hamburger menu toggle */}
          <button
            type="button"
            aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-navigation"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex size-10 items-center justify-center rounded-md border border-[#EBE7DF] bg-[#FAF9F6] text-[#111111] lg:hidden"
          >
            {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu Drawer */}
      {mobileMenuOpen && (
        <div
          id="mobile-navigation"
          className="border-b border-[#EBE7DF] bg-white px-5 py-6 lg:hidden"
        >
          <nav className="flex flex-col space-y-3.5">
            {LANDING_NAV_LINKS.map((item) => {
              const isExternalAnchor = item.href.startsWith("/#") || item.href.startsWith("#");
              const isAbout = item.label === "About Us";

              if (isAbout) {
                return (
                  <div key={item.label} className="flex flex-col space-y-2">
                    <a
                      href="/about"
                      onClick={() => setMobileMenuOpen(false)}
                      className="rounded-md px-2 py-1.5 text-base font-semibold text-[#111111] hover:bg-[#FAF9F6] hover:text-[#E67230]"
                    >
                      About Us
                    </a>
                    {/* Nested Public Relations sub-item */}
                    <Link
                      to="/public-relations"
                      onClick={() => setMobileMenuOpen(false)}
                      className="ml-4 flex items-center gap-2 rounded-md px-2 py-1 text-sm font-medium text-[#666666] hover:text-[#E67230]"
                    >
                      <Newspaper className="size-4 text-[#E67230]" />
                      <span>Public Relations</span>
                    </Link>
                  </div>
                );
              }

              if (isExternalAnchor) {
                return (
                  <a
                    key={item.label}
                    href={item.href}
                    onClick={(e) => {
                      handleNavClick(e, item.href);
                      setMobileMenuOpen(false);
                    }}
                    className="rounded-md px-2 py-1.5 text-base font-semibold text-[#111111] hover:bg-[#FAF9F6] hover:text-[#E67230]"
                  >
                    {item.label}
                  </a>
                );
              }
              return (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-md px-2 py-1.5 text-base font-semibold text-[#111111] hover:bg-[#FAF9F6] hover:text-[#E67230]"
                >
                  {item.label}
                </a>
              );
            })}
            <div className="pt-4 border-t border-[#EBE7DF] flex flex-col gap-2.5">
              {isAuthenticated && user ? (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2.5 p-2.5 rounded-lg bg-[#FAF9F6] border border-[#EBE7DF]">
                    <span className="size-8 rounded-full bg-[#E67230] text-white flex items-center justify-center text-xs font-bold">
                      {(user.doctor_profile?.full_name || user.email)[0]?.toUpperCase()}
                    </span>
                    <div className="text-left">
                      <p className="text-sm font-bold text-[#111111]">
                        {user.doctor_profile?.full_name || user.email}
                      </p>
                      <p className="text-xs text-[#666666] capitalize">{user.role} · Active</p>
                    </div>
                  </div>
                  <Link
                    to="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-2 rounded-lg bg-[#E67230] px-4 py-2.5 text-sm font-bold text-white shadow-xs"
                  >
                    <span>Go to Workspace</span>
                    <ArrowRight className="size-4" />
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                      toast.info("Signed out of your session.");
                    }}
                    className="rounded-md py-2 text-center text-xs font-semibold text-[#888888] hover:text-[#111111]"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="rounded-md px-2 py-2 text-center text-base font-bold text-[#111111] hover:bg-[#FAF9F6]"
                  >
                    Sign In
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleRegister();
                    }}
                    className="flex items-center justify-center gap-2 rounded-lg bg-[#E67230] px-4 py-3 text-base font-bold text-white shadow-xs"
                  >
                    <span>Early Bird Registration</span>
                    <ArrowRight className="size-4" />
                  </button>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}

export default LandingNavbar;
