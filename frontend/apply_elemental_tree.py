import re

file_path = r'c:\Users\gowry\Downloads\MEYVEDA\m-2610\M-2610\frontend\src\features\landing\pages\LandingPage.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update import: replace treePng from '@/assets/tree.png' with Tree_branch.png
content = content.replace(
    'import treePng from "@/assets/tree.png";',
    'import treeBranchPng from "@/assets/Tree_branch.png";'
)

# 2. Update ManagedServiceNode interface to include icon, titleLines, descLines, borderColor
old_interface = '''interface ManagedServiceNode {
  id: string;
  number: string;
  title: string;
  description: string;
  gradient: string;
  glow: string;
  border: string;
  tag: string;
  leftPercent: number;
  topPercent: number;
  sizePercent: number;
}'''

new_interface = '''interface ManagedServiceNode {
  id: string;
  number: string;
  title: string;
  description: string;
  gradient: string;
  glow: string;
  border: string;
  borderColor: string;
  tag: string;
  leftPercent: number;
  topPercent: number;
  sizePercent: number;
  circleTitle: React.ReactNode;
  circleDesc: React.ReactNode;
  circleIcon: React.ReactNode;
}'''

content = content.replace(old_interface, new_interface)

# 3. Update MANAGED_SERVICES_DATA with the exact vector icons, titles, and descriptions
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
      /* Cloud Server / Database */
      <svg
        viewBox="0 0 28 20"
        fill="none"
        stroke="#E67230"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-[38%] h-auto max-h-[32px] text-[#E67230]"
      >
        {/* Outer cloud */}
        <path d="M7 8a4 4 0 0 1 7.8-1.2A3.5 3.5 0 0 1 20 10.5 3.5 3.5 0 0 1 17 15H5a4 4 0 0 1-.5-8c.4 0 .8 0 1.2.2" />
        {/* Server stack tier 1 */}
        <rect x="9" y="8" width="8" height="3" rx="0.8" />
        <circle cx="11" cy="9.5" r="0.4" fill="#E67230" />
        {/* Server stack tier 2 */}
        <rect x="9" y="12" width="8" height="3" rx="0.8" />
        <circle cx="11" cy="13.5" r="0.4" fill="#E67230" />
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
      /* Globe with airplane orbit */
      <svg
        viewBox="0 0 28 22"
        fill="none"
        stroke="#E67230"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-[38%] h-auto max-h-[32px] text-[#E67230]"
      >
        {/* Globe body */}
        <circle cx="11" cy="11.5" r="7.5" />
        <ellipse cx="11" cy="11.5" rx="3.5" ry="7.5" />
        <path d="M3.5 11.5h15" />
        {/* Orbit loop */}
        <path d="M5.5 17c3-2.5 8.5-6.5 15-8" />
        {/* Airplane */}
        <path d="M21 7.5l2 1.5-2.8 1.2-1.2 2-.8-.8.6-2-2.5-.8 4.7-1.1Z" fill="#E67230" />
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
      /* Delivery van / truck with speed dashes */
      <svg
        viewBox="0 0 28 20"
        fill="none"
        stroke="#E67230"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-[42%] h-auto max-h-[34px] text-[#E67230]"
      >
        {/* Speed lines */}
        <path d="M2 7h3M1 10h4M3 13h3" />
        {/* Truck body */}
        <rect x="7" y="6" width="11" height="8" rx="1" />
        <path d="M18 9h4l2 3v2h-6" />
        {/* Wheels */}
        <circle cx="11" cy="15" r="1.8" fill="#FFFFFF" />
        <circle cx="20.5" cy="15" r="1.8" fill="#FFFFFF" />
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
        viewBox="0 0 28 20"
        fill="none"
        stroke="#E67230"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-[38%] h-auto max-h-[32px] text-[#E67230]"
      >
        {/* Bars */}
        <rect x="6" y="12" width="3.5" height="5" rx="0.5" />
        <rect x="11.5" y="9" width="3.5" height="8" rx="0.5" />
        <rect x="17" y="5.5" width="3.5" height="11.5" rx="0.5" />
        {/* Upward arrow */}
        <path d="M4.5 10l5.5-4.5 4 2.5 6.5-5" />
        <path d="M17 3h3.5v3.5" />
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
      /* Conical flask / beaker with plus sign */
      <svg
        viewBox="0 0 28 20"
        fill="none"
        stroke="#E67230"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-[38%] h-auto max-h-[32px] text-[#E67230]"
      >
        {/* Flask */}
        <path d="M9.5 3h5" />
        <path d="M10.5 3v3.5l-4.5 8.5a1.2 1.2 0 0 0 1.1 1.8h9.8a1.2 1.2 0 0 0 1.1-1.8L13.5 6.5V3" />
        <path d="M8 12.5h8" />
        {/* Plus sign on top right */}
        <path d="M19 4v4M17 6h4" />
      </svg>
    ),
  },
];
'''

content = content[:old_data_start] + new_data + content[old_data_end:]

# 4. Update desktop tree container to render pure UI elemental circles on top of Tree_branch.png
# No focus circle (no ring-4, no selected highlight), uniform calm design, automatic sliding on left remains.
desktop_tree_start = content.find('{/* RIGHT COLUMN: Authentic Organic Tree with Natural Wind-Blown Foliage */}')
desktop_tree_end = content.find('{/* ================================================================= */}\n        {/* TABLET & MOBILE (< lg)')

new_desktop_tree = '''{/* RIGHT COLUMN: Authentic Organic Tree with Pure Elemental UI Circles */}
          <div
            className="lg:col-span-7 flex justify-center items-center py-0"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <div className="relative w-full aspect-[1536/1024] flex items-center justify-center select-none overflow-visible scale-105 xl:scale-110 transition-transform duration-500">
              {/* Authentic Organic Tree Artwork: Tree_branch.png */}
              <img
                src={treeBranchPng}
                alt="Managed Services Growth Tree"
                className="w-full h-full object-contain pointer-events-none drop-shadow-[0_8px_30px_rgba(0,0,0,0.03)]"
              />

              {/* Pure Elemental UI Circles matching Pic 2 (no focus highlight, static calm state) */}
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
                    className="absolute -translate-x-1/2 -translate-y-1/2 z-30 aspect-square rounded-full bg-white shadow-[0_8px_24px_rgba(0,0,0,0.07)] flex flex-col items-center justify-center text-center px-1.5 py-2 pointer-events-none transition-transform duration-300"
                  >
                    {/* Doodle / Vector Symbol */}
                    <div className="flex items-center justify-center mb-1 shrink-0">
                      {service.circleIcon}
                    </div>

                    {/* Node Title */}
                    <h4 className="text-[10px] sm:text-[11.5px] lg:text-[12.5px] xl:text-[13.5px] font-extrabold text-[#111111] leading-[1.12] tracking-tight">
                      {service.circleTitle}
                    </h4>

                    {/* Node Subtitle Description */}
                    <p className="mt-1 text-[7px] sm:text-[8px] lg:text-[8.5px] xl:text-[9.5px] font-normal text-[#555555] leading-[1.25] tracking-tight line-clamp-3">
                      {service.circleDesc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        '''

content = content[:desktop_tree_start] + new_desktop_tree + content[desktop_tree_end:]

# 5. Update mobile tree container similarly
mobile_tree_start = content.find('{/* 2. Complete Tree Illustration with All 5 Circular Nodes */}')
mobile_tree_end = content.find('{/* 3. Interactive Information Card with Slide Indicators */}')

new_mobile_tree = '''{/* 2. Complete Tree Illustration with Pure Elemental UI Circles */}
          <div
            className="relative w-full max-w-[680px] mx-auto aspect-[1536/1024] flex items-center justify-center select-none my-4 sm:my-6 overflow-visible"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            {/* Tree Artwork: Tree_branch.png */}
            <img
              src={treeBranchPng}
              alt="Managed Services Growth Tree"
              className="w-full h-full object-contain pointer-events-none drop-shadow-[0_8px_30px_rgba(0,0,0,0.03)]"
            />

            {/* Pure Elemental UI Circles matching Pic 2 (calm static state, no focus ring) */}
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
                  className="absolute -translate-x-1/2 -translate-y-1/2 z-30 aspect-square rounded-full bg-white shadow-[0_6px_18px_rgba(0,0,0,0.07)] flex flex-col items-center justify-center text-center px-1 py-1.5 pointer-events-none"
                >
                  {/* Doodle / Vector Symbol */}
                  <div className="flex items-center justify-center mb-0.5 shrink-0">
                    {service.circleIcon}
                  </div>

                  {/* Node Title */}
                  <h4 className="text-[8.5px] sm:text-[11px] font-extrabold text-[#111111] leading-[1.12] tracking-tight">
                    {service.circleTitle}
                  </h4>

                  {/* Node Subtitle Description */}
                  <p className="mt-0.5 text-[6.5px] sm:text-[8px] font-normal text-[#555555] leading-[1.2] tracking-tight line-clamp-3">
                    {service.circleDesc}
                  </p>
                </div>
              );
            })}
          </div>

          '''

content = content[:mobile_tree_start] + new_mobile_tree + content[mobile_tree_end:]

with open(file_path, 'w', encoding='utf-8', newline='\r\n') as f:
    f.write(content)

print('Successfully applied elemental UI tree update to LandingPage.tsx!')

