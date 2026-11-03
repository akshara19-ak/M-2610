import { Link } from "@tanstack/react-router";
import {
  ExternalLink,
  Facebook,
  Home,
  Instagram,
  Linkedin,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Send,
  Youtube,
} from "lucide-react";
import meyvedaLogo from "@/assets/meyvedalogo.png";

export function LandingFooter() {
  const scrollToTop = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer id="footer" className="bg-[#FAF9F6] border-t border-[#EBE7DF] pt-14 pb-10 text-[#111111]">
      <div className="mx-auto max-w-[1280px] px-5 sm:px-8 lg:px-12">
        {/* Main Footer 4-Column Grid */}
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-12 lg:gap-8 pb-12 border-b border-[#EBE7DF]">
          {/* Col 1 (Span 4): Logo, About & Corporate/CIN */}
          <div className="lg:col-span-4 space-y-4">
            <Link to="/" aria-label="Meyveda Home" className="inline-block">
              <img
                src={meyvedaLogo}
                alt="Meyveda — reinvent you"
                className="h-11 sm:h-13 lg:h-[54px] w-auto object-contain select-none transition-opacity hover:opacity-95"
              />
            </Link>
            <p className="text-sm leading-relaxed text-[#555555]">
              Meyveda is a proprietary digital operating system and Management Services Organization (MSO) dedicated exclusively to the AYUSH sector.
            </p>
            <div className="pt-2 text-xs text-[#666666] space-y-1">
              <p className="font-bold text-[#111111] uppercase tracking-wide">MEYVEDA AYUSH PRIVATE LIMITED</p>
              <p className="font-mono text-[#555555]">CIN: U86909TN2026PTC199470</p>
            </div>
          </div>

          {/* Col 2 (Span 3): Contact Information */}
          <div className="lg:col-span-3 space-y-3">
            <p className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#111111]">
              CONTACT
            </p>
            <ul className="space-y-3 text-xs sm:text-sm text-[#555555]">
              <li className="flex items-start gap-2.5">
                <MapPin className="size-4 text-[#E67230] shrink-0 mt-0.5" />
                <div>
                  <a
                    href="https://maps.google.com/?q=200+Feet+Radial+Rd%2C+Boopathy+Nagar%2C+Kovilambakkam%2C+Tambaram%2C+Tamil+Nadu+600117"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-[#E67230] transition-colors underline flex items-center gap-1"
                  >
                    <span>View on Google Maps</span>
                    <ExternalLink className="size-3 text-[#888888]" />
                  </a>
                  <p className="text-[11px] text-[#777777] mt-0.5">Chennai, Tamil Nadu, India</p>
                </div>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="size-4 text-[#E67230] shrink-0" />
                <a
                  href="mailto:CONTACT@MEYVEDA.COM"
                  className="hover:text-[#E67230] transition-colors font-medium"
                >
                  CONTACT@MEYVEDA.COM
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="size-4 text-[#E67230] shrink-0" />
                <a
                  href="tel:998-MEYVEDA"
                  className="hover:text-[#E67230] transition-colors font-medium"
                >
                  998-MEYVEDA
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3 (Span 2): Quick Links */}
          <div className="lg:col-span-2">
            <p className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#111111]">
              QUICK LINKS
            </p>
            <ul className="mt-3.5 space-y-2 text-xs sm:text-sm text-[#555555]">
              <li>
                <Link to="/about" className="hover:text-[#E67230] transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/blogs" className="hover:text-[#E67230] transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <a href="/#community" className="hover:text-[#E67230] transition-colors">
                  Community
                </a>
              </li>
              <li>
                <Link to="/public-relations" className="hover:text-[#E67230] transition-colors">
                  Public Relations
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4 (Span 3): Platform */}
          <div className="lg:col-span-3">
            <p className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#111111]">
              PLATFORM
            </p>
            <ul className="mt-3.5 space-y-2 text-xs sm:text-sm text-[#555555]">
              <li>
                <a href="/#knowledge" className="hover:text-[#E67230] transition-colors">
                  For Practitioners
                </a>
              </li>
              <li>
                <a href="/#core-vaidya" className="hover:text-[#E67230] transition-colors">
                  For Clinics &amp; Hospitals
                </a>
              </li>
              <li>
                <a href="/#pharma" className="hover:text-[#E67230] transition-colors">
                  For Ayush Manufacturers
                </a>
              </li>
              <li>
                <Link to="/cluster-franchise" className="hover:text-[#E67230] transition-colors">
                  Cluster Management Partners
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Social Communities, Messengers & Linktree Row */}
        <div className="py-8 border-b border-[#EBE7DF] flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          {/* Messengers: WhatsApp & Telegram & Linktree */}
          <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm">
            <a
              href="https://whatsapp.com/channel/0029Vb5lp2eICVfeN93oxw11"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-[#EBE7DF] bg-white px-3.5 py-2 font-medium text-[#111111] hover:border-[#25D366] hover:text-[#25D366] transition-colors shadow-2xs"
            >
              <MessageCircle className="size-4 text-[#25D366]" />
              <span>WhatsApp Community</span>
            </a>
            <a
              href="https://t.me/meyveda"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-[#EBE7DF] bg-white px-3.5 py-2 font-medium text-[#111111] hover:border-[#229ED9] hover:text-[#229ED9] transition-colors shadow-2xs"
            >
              <Send className="size-4 text-[#229ED9]" />
              <span>Telegram Community</span>
            </a>
            <a
              href="https://linktr.ee/meyveda"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#EBE7DF] bg-white px-3.5 py-2 font-medium text-[#111111] hover:border-[#E67230] hover:text-[#E67230] transition-colors shadow-2xs"
            >
              <span className="font-bold text-[#E67230]">linktr.ee</span>
              <span className="text-[#555555]">/meyveda</span>
              <ExternalLink className="size-3 text-[#888888] ml-0.5" />
            </a>
          </div>

          {/* Social Media Channels */}
          <div className="flex items-center gap-2.5">
            <a
              href="https://www.facebook.com/meyveda"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Meyveda on Facebook"
              className="flex size-9 items-center justify-center rounded-full border border-[#EBE7DF] bg-white text-[#555555] hover:text-[#1877F2] hover:border-[#1877F2]/40 hover:bg-[#FAF9F6] transition-all shadow-2xs"
            >
              <Facebook className="size-4" />
            </a>
            <a
              href="https://www.instagram.com/meyveda"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Meyveda on Instagram"
              className="flex size-9 items-center justify-center rounded-full border border-[#EBE7DF] bg-white text-[#555555] hover:text-[#E4405F] hover:border-[#E4405F]/40 hover:bg-[#FAF9F6] transition-all shadow-2xs"
            >
              <Instagram className="size-4" />
            </a>
            <a
              href="https://www.linkedin.com/company/meyveda"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Meyveda on LinkedIn"
              className="flex size-9 items-center justify-center rounded-full border border-[#EBE7DF] bg-white text-[#555555] hover:text-[#0A66C2] hover:border-[#0A66C2]/40 hover:bg-[#FAF9F6] transition-all shadow-2xs"
            >
              <Linkedin className="size-4" />
            </a>
            <a
              href="https://www.youtube.com/@Meyveda_reinvent_you"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Meyveda on YouTube"
              className="flex size-9 items-center justify-center rounded-full border border-[#EBE7DF] bg-white text-[#555555] hover:text-[#FF0000] hover:border-[#FF0000]/40 hover:bg-[#FAF9F6] transition-all shadow-2xs"
            >
              <Youtube className="size-4" />
            </a>
            <a
              href="https://x.com/Meyveda"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Meyveda on X (Twitter)"
              className="flex size-9 items-center justify-center rounded-full border border-[#EBE7DF] bg-white text-[#555555] hover:text-[#111111] hover:border-[#111111]/40 hover:bg-[#FAF9F6] transition-all shadow-2xs font-extrabold text-sm"
            >
              𝕏
            </a>
            <a
              href="https://www.threads.com/@meyveda"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Meyveda on Threads"
              className="flex size-9 items-center justify-center rounded-full border border-[#EBE7DF] bg-white text-[#555555] hover:text-[#111111] hover:border-[#111111]/40 hover:bg-[#FAF9F6] transition-all shadow-2xs font-bold text-xs"
            >
              @
            </a>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Grievance Links */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#666666]">
          <div>
            © 2026 meyveda ayush pvt ltd. All rights reserved.
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <Link to="/privacy" className="hover:text-[#E67230] transition-colors">
              Privacy Policy
            </Link>
            <span>|</span>
            <Link to="/terms" className="hover:text-[#E67230] transition-colors">
              Terms of Service
            </Link>
            <span>|</span>
            <Link to="/contact" className="hover:text-[#E67230] transition-colors">
              Support &amp; Grievance Desk
            </Link>
          </div>
          <a
            href="/#top"
            onClick={(e) => {
              if (window.location.pathname === "/" || window.location.pathname === "") {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: "smooth" });
              } else {
                window.location.href = "/#top";
              }
            }}
            className="inline-flex items-center justify-center size-8 rounded-full border border-[#EBE7DF] bg-white text-[#111111] hover:text-[#E67230] hover:border-[#E67230]/40 hover:bg-[#FAF9F6] transition-all shadow-2xs cursor-pointer"
            title="Back to Home Hero"
            aria-label="Back to Home Hero"
          >
            <Home className="size-3.5" />
          </a>
        </div>
      </div>
    </footer>
  );
}
