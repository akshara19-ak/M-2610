import re

file_path = r'c:\Users\gowry\Downloads\MEYVEDA\m-2610\M-2610\frontend\src\features\landing\pages\LandingPage.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update MANAGED_SERVICES_DATA with enlarged, perfectly sized vector SVGs:
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
        viewBox="0 0 48 36"
        fill="none"
        stroke="#E67230"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-10 h-8 sm:w-12 sm:h-9 lg:w-14 lg:h-10 text-[#E67230]"
      >
        {/* Outer cloud */}
        <path d="M12 18a7 7 0 0 1 13.8-2.2A6 6 0 0 1 35 22a6 6 0 0 1-5.5 6H9A7 7 0 0 1 8.5 14c.7 0 1.4.1 2 .4" />
        {/* Server stack tier 1 */}
        <rect x="16" y="16" width="14" height="5" rx="1.5" />
        <circle cx="19.5" cy="18.5" r="0.8" fill="#E67230" />
        {/* Server stack tier 2 */}
        <rect x="16" y="23" width="14" height="5" rx="1.5" />
        <circle cx="19.5" cy="25.5" r="0.8" fill="#E67230" />
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
        viewBox="0 0 48 38"
        fill="none"
        stroke="#E67230"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-10 h-8 sm:w-12 sm:h-9 lg:w-14 lg:h-10 text-[#E67230]"
      >
        {/* Globe body */}
        <circle cx="20" cy="20" r="12" />
        <ellipse cx="20" cy="20" rx="5.5" ry="12" />
        <path d="M8 20h24" />
        {/* Orbit loop */}
        <path d="M10 29c5-4 13-10 24-12" />
        {/* Airplane */}
        <path d="M35 15l3 2-4.5 1.8-1.8 3.2-1.2-1.2.9-3.2-4-1.2 7.6-1.4Z" fill="#E67230" />
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
        viewBox="0 0 52 36"
        fill="none"
        stroke="#E67230"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-11 h-8 sm:w-13 sm:h-9 lg:w-15 lg:h-10 text-[#E67230]"
      >
        {/* Speed lines */}
        <path d="M4 12h5M2 17h7M5 22h5" />
        {/* Truck body */}
        <rect x="12" y="10" width="19" height="14" rx="2" />
        <path d="M31 15h7l4 5v4h-11" />
        {/* Wheels */}
        <circle cx="18" cy="25" r="3" fill="#FFFFFF" />
        <circle cx="35" cy="25" r="3" fill="#FFFFFF" />
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
        viewBox="0 0 48 36"
        fill="none"
        stroke="#E67230"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-10 h-8 sm:w-12 sm:h-9 lg:w-14 lg:h-10 text-[#E67230]"
      >
        {/* Bars */}
        <rect x="10" y="21" width="6" height="9" rx="1" />
        <rect x="20" y="15" width="6" height="15" rx="1" />
        <rect x="30" y="9" width="6" height="21" rx="1" />
        {/* Upward arrow */}
        <path d="M8 17l9-7 7 4 11-8" />
        <path d="M29 6h6v6" />
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
        viewBox="0 0 48 36"
        fill="none"
        stroke="#E67230"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-10 h-8 sm:w-12 sm:h-9 lg:w-14 lg:h-10 text-[#E67230]"
      >
        {/* Flask */}
        <path d="M16 6h9" />
        <path d="M18 6v6l-7 14a2 2 0 0 0 1.8 2.8h16.4a2 2 0 0 0 1.8-2.8L24 12V6" />
        <path d="M14 20h13" />
        {/* Plus sign on top right */}
        <path d="M33 7v7M29.5 10.5h7" />
      </svg>
    ),
  },
];
'''

content = content[:old_data_start] + new_data + content[old_data_end:]

# 2. Update Desktop tree circles:
# Remove pointer-events-none, remove select-none from circles, add select-text
old_desktop_block = '''              {/* Pure Elemental UI Circles matching Pic 2 (no focus highlight, static calm state) */}
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
              })}'''

new_desktop_block = '''              {/* Pure Elemental UI Circles matching Pic 2 (fully selectable text, enlarged neat symbols) */}
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

                    {/* Node Title (Selectable Text) */}
                    <h4 className="text-[10.5px] sm:text-[12px] lg:text-[13px] xl:text-[14px] font-extrabold text-[#111111] leading-[1.15] tracking-tight select-text">
                      {service.circleTitle}
                    </h4>

                    {/* Node Subtitle Description (Selectable Text) */}
                    <p className="mt-1 text-[7.5px] sm:text-[8.5px] lg:text-[9px] xl:text-[10px] font-normal text-[#555555] leading-[1.3] tracking-tight select-text">
                      {service.circleDesc}
                    </p>
                  </div>
                );
              })}'''

content = content.replace(old_desktop_block, new_desktop_block)

# 3. Update Mobile tree circles:
old_mobile_block = '''            {/* Pure Elemental UI Circles matching Pic 2 (calm static state, no focus ring) */}
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
            })}'''

new_mobile_block = '''            {/* Pure Elemental UI Circles matching Pic 2 (selectable text, enlarged neat symbols) */}
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

                  {/* Node Title (Selectable Text) */}
                  <h4 className="text-[9px] sm:text-[11.5px] font-extrabold text-[#111111] leading-[1.15] tracking-tight select-text">
                    {service.circleTitle}
                  </h4>

                  {/* Node Subtitle Description (Selectable Text) */}
                  <p className="mt-0.5 text-[7px] sm:text-[8.5px] font-normal text-[#555555] leading-[1.25] tracking-tight select-text">
                    {service.circleDesc}
                  </p>
                </div>
              );
            })}'''

content = content.replace(old_mobile_block, new_mobile_block)

with open(file_path, 'w', encoding='utf-8', newline='\r\n') as f:
    f.write(content)

print('Successfully updated selectable text and enlarged icons in LandingPage.tsx!')

