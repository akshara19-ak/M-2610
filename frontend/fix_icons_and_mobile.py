import re

file_path = r'c:\Users\gowry\Downloads\MEYVEDA\m-2610\M-2610\frontend\src\features\landing\pages\LandingPage.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update MANAGED_SERVICES_DATA with the exact vector designs from Pic 2:
old_data_start = content.find('const MANAGED_SERVICES_DATA: ManagedServiceNode[] = [')
old_data_end = content.find('export function ManagedServicesTreeSection() {')

new_data = '''const MANAGED_SERVICES_DATA: ManagedServiceNode[] = [
  {
    id: "iaas",
    number: "01",
    title: "IaaS",
    description:
      "Instant infrastructure for healthcare & business needs. Deployable, plug-and-play co-working physical spaces and tele-health to bypass heavy initial capital expenditures.",
    gradient: "linear-gradient(135deg, #F98F4B 0%, #E67230 50%, #C95618 100%)",
    glow: "0 12px 32px -4px rgba(252, 118, 33, 0.45)",
    border: "#FC7621",
    borderColor: "#E67230",
    tag: "SHARED INFRASTRUCTURE",
    leftPercent: 49.57,
    topPercent: 16.69,
    sizePercent: 17.85,
    circleTitle: "IaaS",
    circleDesc: (
      <>
        Instant infrastructure
        <br />
        for healthcare &amp;
        <br />
        business needs.
      </>
    ),
    circleIcon: (
      /* Cloud Server with 3-tier database stack */
      <svg
        viewBox="0 0 32 24"
        fill="none"
        stroke="#E67230"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-[28%] max-w-[34px] min-w-[18px] h-auto text-[#E67230] shrink-0"
      >
        {/* Cloud outline */}
        <path d="M7 14.5a4.5 4.5 0 0 1 8.5-1.8A4 4 0 0 1 23 15.5a3.8 3.8 0 0 1-3 3.5H7.5a4.5 4.5 0 0 1-.5-4.5Z" />
        {/* 3 Server Stack Slots */}
        <rect x="11.5" y="11" width="9" height="2.2" rx="0.6" />
        <rect x="11.5" y="13.8" width="9" height="2.2" rx="0.6" />
        <rect x="11.5" y="16.6" width="9" height="2.2" rx="0.6" />
        {/* Status dots */}
        <circle cx="13" cy="12.1" r="0.4" fill="#E67230" stroke="none" />
        <circle cx="13" cy="14.9" r="0.4" fill="#E67230" stroke="none" />
        <circle cx="13" cy="17.7" r="0.4" fill="#E67230" stroke="none" />
      </svg>
    ),
  },
  {
    id: "global-opportunities",
    number: "02",
    title: "Global Opportunities",
    description:
      "Expand your reach with MVT worldwide. Centralized marketplace driving patient acquisition locally and internationally via Medical Value Travel (MVT).",
    gradient: "linear-gradient(135deg, #F37E38 0%, #D86423 50%, #B84E14 100%)",
    glow: "0 12px 32px -4px rgba(241, 198, 160, 0.45)",
    border: "#F1C6A0",
    borderColor: "#E5C5B0",
    tag: "GLOBAL REACH & MVT",
    leftPercent: 28.71,
    topPercent: 31.30,
    sizePercent: 17.63,
    circleTitle: "Global Opportunities",
    circleDesc: (
      <>
        Expand your reach
        <br />
        with MVT worldwide.
      </>
    ),
    circleIcon: (
      /* Globe with orbit & airplane */
      <svg
        viewBox="0 0 32 26"
        fill="none"
        stroke="#E67230"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-[28%] max-w-[34px] min-w-[18px] h-auto text-[#E67230] shrink-0"
      >
        {/* Globe body */}
        <circle cx="14" cy="14" r="7.5" />
        <ellipse cx="14" cy="14" rx="3.5" ry="7.5" />
        <path d="M6.5 14h15" />
        {/* Orbital ellipse */}
        <path d="M6 18.5c2-2.5 7-6.5 15-7" />
        {/* Airplane */}
        <path d="M22 8l2.5 1.5-3 1.2-1.2 2-.8-.7.6-2-2.2-.8 4.1-1.2Z" fill="#E67230" stroke="none" />
      </svg>
    ),
  },
  {
    id: "operating-support-system",
    number: "03",
    title: "Operating Support System",
    description:
      "Seamless logistics & claim management. Frictionless NHCX cashless claim settlements, corporate camp engines, and complete end-to-end operational backing.",
    gradient: "linear-gradient(135deg, #F98F4B 0%, #E67230 50%, #C95618 100%)",
    glow: "0 12px 32px -4px rgba(227, 96, 28, 0.45)",
    border: "#E3601C",
    borderColor: "#E67230",
    tag: "LOGISTICS & CLAIMS",
    leftPercent: 24.62,
    topPercent: 61.16,
    sizePercent: 19.35,
    circleTitle: (
      <>
        Operating Suport
        <br />
        System
      </>
    ),
    circleDesc: (
      <>
        Seamless logistics &amp;
        <br />
        claim management.
      </>
    ),
    circleIcon: (
      /* Delivery truck with motion speed lines */
      <svg
        viewBox="0 0 34 24"
        fill="none"
        stroke="#E67230"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-[30%] max-w-[36px] min-w-[20px] h-auto text-[#E67230] shrink-0"
      >
        {/* Speed lines */}
        <path d="M2 8.5h4M1 12h5M3 15.5h3" />
        {/* Truck body */}
        <rect x="8.5" y="6.5" width="12" height="9.5" rx="1" />
        <path d="M20.5 9.5h4.5l2.5 3v3.5h-7" />
        {/* Wheels */}
        <circle cx="12.5" cy="16.5" r="1.8" fill="#FFFFFF" />
        <circle cx="23.5" cy="16.5" r="1.8" fill="#FFFFFF" />
      </svg>
    ),
  },
  {
    id: "mso-backbone",
    number: "04",
    title: "MSO back bone",
    description:
      "Scale smarter with our MSO support. Financial command center, regulatory compliance, and administrative infrastructure for hub-and-spoke expansion.",
    gradient: "linear-gradient(135deg, #DD6724 0%, #BE561A 50%, #9F400F 100%)",
    glow: "0 12px 32px -4px rgba(252, 165, 54, 0.45)",
    border: "#FCA536",
    borderColor: "#E67230",
    tag: "MSO BACKBONE & SCALE",
    leftPercent: 70.54,
    topPercent: 31.30,
    sizePercent: 17.63,
    circleTitle: "MSO back bone",
    circleDesc: (
      <>
        Scale smarter with
        <br />
        our MSO support.
      </>
    ),
    circleIcon: (
      /* Bar chart with rising trend arrow */
      <svg
        viewBox="0 0 32 24"
        fill="none"
        stroke="#E67230"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-[28%] max-w-[34px] min-w-[18px] h-auto text-[#E67230] shrink-0"
      >
        {/* Bars */}
        <rect x="7" y="14" width="3.5" height="6" rx="0.6" />
        <rect x="13.5" y="10" width="3.5" height="10" rx="0.6" />
        <rect x="20" y="6" width="3.5" height="14" rx="0.6" />
        {/* Zigzag arrow */}
        <path d="M5.5 12l5.5-4.5 4 3 6.5-5.5" />
        <path d="M18.5 5h4v4" />
      </svg>
    ),
  },
  {
    id: "innovation-expansion",
    number: "05",
    title: "innovation & expansion",
    description:
      "Research, innovate & grow with us. Clinical trial management (CTMS), brand incubation, and mentorship programs for launching groundbreaking AYUSH therapies.",
    gradient: "linear-gradient(135deg, #DD6724 0%, #BE561A 50%, #9F400F 100%)",
    glow: "0 12px 32px -4px rgba(237, 194, 157, 0.45)",
    border: "#EDC29D",
    borderColor: "#E5C5B0",
    tag: "RESEARCH & INNOVATION",
    leftPercent: 75.70,
    topPercent: 61.32,
    sizePercent: 17.85,
    circleTitle: (
      <>
        innovation &amp;
        <br />
        expansion
      </>
    ),
    circleDesc: (
      <>
        Research, innovate &amp;
        <br />
        grow with us.
      </>
    ),
    circleIcon: (
      /* Conical flask with plus sign */
      <svg
        viewBox="0 0 32 24"
        fill="none"
        stroke="#E67230"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-[28%] max-w-[34px] min-w-[18px] h-auto text-[#E67230] shrink-0"
      >
        {/* Flask */}
        <path d="M12 4h6M13.5 4v3l-5 10a1.2 1.2 0 0 0 1.1 1.8h11.8a1.2 1.2 0 0 0 1.1-1.8L18.5 7V4" />
        <path d="M10.5 14h11" />
        {/* Plus sign */}
        <path d="M23 4.5v3.5M21.2 6.2h3.6" />
      </svg>
    ),
  },
];
'''

content = content[:old_data_start] + new_data + content[old_data_end:]

# 2. Update Desktop tree container:
# Ensure perfect circular shape, no oval distortion, fluid typography
old_dt = '''              {/* Pure Elemental UI Circles matching Pic 2 (fully selectable text, enlarged neat symbols) */}
              {MANAGED_SERVICES_DATA.map((service, index) => {
                return (
                  <div
                    key={service.id}
                    id={`managed-tree-node-${service.id}`}
                    style={{
                      left: `${service.leftPercent}%`,
                      top: `${service.topPercent}%`,
                      width: `${service.sizePercent}%`,
                      borderWidth: service.borderColor === "#E67230" ? "3.5px" : "3px",
                      borderColor: service.borderColor,
                    }}
                    className="absolute -translate-x-1/2 -translate-y-1/2 z-30 aspect-square rounded-full bg-white shadow-[0_8px_24px_rgba(0,0,0,0.07)] flex flex-col items-center justify-center text-center px-2 py-2 select-text pointer-events-auto transition-transform duration-300 cursor-default"
                  >
                    {/* Doodle / Vector Symbol (Enlarged, comfortably visible) */}
                    <div className="flex items-center justify-center mb-1.5 shrink-0 select-none">
                      {service.circleIcon}
                    </div>

                    {/* Node Title (Selectable Text, perfectly fitted without congestion) */}
                    <h4 className="text-[9px] sm:text-[10px] lg:text-[11.2px] xl:text-[12px] font-extrabold text-[#111111] leading-[1.14] tracking-tight select-text">
                      {service.circleTitle}
                    </h4>

                    {/* Node Subtitle Description (Selectable Text, comfortable breathing room) */}
                    <p className="mt-1 text-[6.8px] sm:text-[7.6px] lg:text-[8.2px] xl:text-[9px] font-normal text-[#555555] leading-[1.28] tracking-tight select-text px-1">
                      {service.circleDesc}
                    </p>
                  </div>
                );
              })}'''

new_dt = '''              {/* Pure Elemental UI Circles matching Pic 2 (strictly circular, responsive typography, authentic doodles) */}
              {MANAGED_SERVICES_DATA.map((service, index) => {
                return (
                  <div
                    key={service.id}
                    id={`managed-tree-node-${service.id}`}
                    style={{
                      left: `${service.leftPercent}%`,
                      top: `${service.topPercent}%`,
                      width: `${service.sizePercent}%`,
                      borderWidth: service.borderColor === "#E67230" ? "3.5px" : "3px",
                      borderColor: service.borderColor,
                    }}
                    className="absolute -translate-x-1/2 -translate-y-1/2 z-30 aspect-square rounded-full bg-white shadow-[0_8px_24px_rgba(0,0,0,0.07)] flex flex-col items-center justify-center text-center p-[4%] overflow-hidden select-text pointer-events-auto cursor-default box-border"
                  >
                    {/* Doodle / Vector Symbol */}
                    <div className="flex items-center justify-center mb-[4%] shrink-0 select-none">
                      {service.circleIcon}
                    </div>

                    {/* Node Title */}
                    <h4 className="text-[9px] sm:text-[10px] lg:text-[11px] xl:text-[12px] font-extrabold text-[#111111] leading-[1.12] tracking-tight select-text line-clamp-2">
                      {service.circleTitle}
                    </h4>

                    {/* Node Subtitle Description */}
                    <p className="mt-[3%] text-[6.5px] sm:text-[7.2px] lg:text-[7.8px] xl:text-[8.5px] font-normal text-[#555555] leading-[1.25] tracking-tight select-text line-clamp-3">
                      {service.circleDesc}
                    </p>
                  </div>
                );
              })}'''

content = content.replace(old_dt, new_dt)

# 3. Update Mobile tree container:
# Critical fix for oval distortion:
# - Fix aspect ratio constraint on container and child elements
# - Set strict aspect-square with overflow-hidden and scaled padding/fonts so it NEVER overflows into an oval
old_mb = '''            {/* Pure Elemental UI Circles matching Pic 2 (selectable text, enlarged neat symbols) */}
            {MANAGED_SERVICES_DATA.map((service, index) => {
              return (
                <div
                  key={service.id}
                  id={`managed-tree-node-mobile-${service.id}`}
                  style={{
                    left: `${service.leftPercent}%`,
                    top: `${service.topPercent}%`,
                    width: `${service.sizePercent}%`,
                    borderWidth: service.borderColor === "#E67230" ? "3px" : "2.5px",
                    borderColor: service.borderColor,
                  }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 z-30 aspect-square rounded-full bg-white shadow-[0_6px_18px_rgba(0,0,0,0.07)] flex flex-col items-center justify-center text-center px-1 py-1.5 select-text pointer-events-auto cursor-default"
                >
                  {/* Doodle / Vector Symbol (Enlarged, comfortably visible) */}
                  <div className="flex items-center justify-center mb-0.5 shrink-0 select-none">
                    {service.circleIcon}
                  </div>

                  {/* Node Title (Selectable Text, comfortable scale) */}
                  <h4 className="text-[7.8px] sm:text-[10px] font-extrabold text-[#111111] leading-[1.14] tracking-tight select-text">
                    {service.circleTitle}
                  </h4>

                  {/* Node Subtitle Description (Selectable Text, clean margin) */}
                  <p className="mt-0.5 text-[6.2px] sm:text-[7.5px] font-normal text-[#555555] leading-[1.22] tracking-tight select-text px-0.5">
                    {service.circleDesc}
                  </p>
                </div>
              );
            })}'''

new_mb = '''            {/* Pure Elemental UI Circles matching Pic 2 (strictly circular on mobile, no oval distortion) */}
            {MANAGED_SERVICES_DATA.map((service, index) => {
              return (
                <div
                  key={service.id}
                  id={`managed-tree-node-mobile-${service.id}`}
                  style={{
                    left: `${service.leftPercent}%`,
                    top: `${service.topPercent}%`,
                    width: `${service.sizePercent}%`,
                    borderWidth: service.borderColor === "#E67230" ? "2.5px" : "2px",
                    borderColor: service.borderColor,
                  }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 z-30 aspect-square rounded-full bg-white shadow-[0_4px_14px_rgba(0,0,0,0.08)] flex flex-col items-center justify-center text-center p-[3%] overflow-hidden select-text pointer-events-auto cursor-default box-border"
                >
                  {/* Doodle / Vector Symbol */}
                  <div className="flex items-center justify-center mb-[2%] shrink-0 select-none">
                    {service.circleIcon}
                  </div>

                  {/* Node Title */}
                  <h4 className="text-[6.5px] sm:text-[8.5px] font-extrabold text-[#111111] leading-[1.1] tracking-tight select-text line-clamp-2">
                    {service.circleTitle}
                  </h4>

                  {/* Node Subtitle Description */}
                  <p className="mt-[2%] text-[5px] sm:text-[6.8px] font-normal text-[#555555] leading-[1.18] tracking-tight select-text line-clamp-3">
                    {service.circleDesc}
                  </p>
                </div>
              );
            })}'''

content = content.replace(old_mb, new_mb)

with open(file_path, 'w', encoding='utf-8', newline='\r\n') as f:
    f.write(content)

print('Successfully updated icons and mobile circle layout in LandingPage.tsx!')

