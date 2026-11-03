import re

file_path = r'c:\Users\gowry\Downloads\MEYVEDA\m-2610\M-2610\frontend\src\features\landing\pages\LandingPage.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update MANAGED_SERVICES_DATA:
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
    tag: "SHARED INFRASTRUCTURE",
    leftPercent: 49.57,
    topPercent: 16.69,
    sizePercent: 17.85,
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
    tag: "GLOBAL REACH & MVT",
    leftPercent: 28.71,
    topPercent: 31.30,
    sizePercent: 17.63,
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
    tag: "LOGISTICS & CLAIMS",
    leftPercent: 24.62,
    topPercent: 61.16,
    sizePercent: 19.35,
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
    tag: "MSO BACKBONE & SCALE",
    leftPercent: 70.54,
    topPercent: 31.30,
    sizePercent: 17.63,
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
    tag: "RESEARCH & INNOVATION",
    leftPercent: 75.70,
    topPercent: 61.32,
    sizePercent: 17.85,
  },
];

'''

content = content[:old_data_start] + new_data + content[old_data_end:]

# 2. Update Desktop tree container:
# Remove the old SVG foliage overlay so the nodes in tree.png are fully crisp and unobstructed
desktop_tree_marker = '{/* Authentic Organic Tree Artwork */}'
dt_marker_pos = content.find(desktop_tree_marker)
dt_hotspots_marker = '{/* 5 Seamless Interactive Hotspots */}'
dt_hotspots_pos = content.find(dt_hotspots_marker, dt_marker_pos)

desktop_tree_block = '''{/* Authentic Organic Tree Artwork with Embedded Circular Nodes */}
              <img
                src={treePng}
                alt="Managed Services Growth Tree"
                className="w-full h-full object-contain pointer-events-none drop-shadow-[0_8px_30px_rgba(0,0,0,0.04)]"
              />

              '''

content = content[:dt_marker_pos] + desktop_tree_block + content[dt_hotspots_pos:]

# 3. Update Desktop Hotspots to have clear interactive feedback (active glowing rings/pulse)
dt_hotspots_end = content.find('</div>\n          </div>\n        </div>\n\n        {/* ================================================================= */}\n        {/* TABLET & MOBILE (< lg)')
new_dt_hotspots = '''{/* 5 Seamless Interactive Hotspots matching Pic 2 Nodes */}
              {MANAGED_SERVICES_DATA.map((service, index) => {
                const isSelected = currentIndex === index;
                return (
                  <button
                    key={service.id}
                    type="button"
                    id={`managed-tree-node-${service.id}`}
                    aria-label={`View details for ${service.title}`}
                    aria-pressed={isSelected}
                    onClick={() => setCurrentIndex(index)}
                    onMouseEnter={() => {
                      setCurrentIndex(index);
                      setIsHovered(true);
                    }}
                    onMouseLeave={() => setIsHovered(false)}
                    onFocus={() => setCurrentIndex(index)}
                    style={{
                      left: `${service.leftPercent}%`,
                      top: `${service.topPercent}%`,
                      width: `${service.sizePercent}%`,
                    }}
                    className={`absolute -translate-x-1/2 -translate-y-1/2 z-30 aspect-square rounded-full cursor-pointer transition-all duration-300 p-0 focus:outline-none ${
                      isSelected
                        ? "ring-4 ring-[#E67230]/80 ring-offset-2 ring-offset-[#FAF9F6] shadow-[0_8px_24px_rgba(230,114,48,0.35)] scale-[1.03]"
                        : "ring-0 hover:ring-2 hover:ring-[#E67230]/50 hover:scale-[1.02]"
                    }`}
                  >
                    <span className="sr-only">{service.title}</span>
                  </button>
                );
              })}
'''

content_before_hotspots = content[:content.find('{/* 5 Seamless Interactive Hotspots matching Pic 2 Nodes */}', dt_marker_pos) if content.find('{/* 5 Seamless Interactive Hotspots matching Pic 2 Nodes */}', dt_marker_pos) != -1 else content.find('{/* 5 Seamless Interactive Hotspots */}', dt_marker_pos)]
content = content_before_hotspots + new_dt_hotspots + content[dt_hotspots_end:]

# 4. Update Mobile tree container:
mb_tree_marker = '{/* Tree Artwork */}'
mb_marker_pos = content.find(mb_tree_marker)
mb_hotspots_marker = '{/* 5 Seamless Interactive Touch/Click Hotspots on Tree Artwork */}'
mb_hotspots_pos = content.find(mb_hotspots_marker, mb_marker_pos)

mobile_tree_block = '''{/* Tree Artwork with Embedded Circular Nodes */}
            <img
              src={treePng}
              alt="Managed Services Growth Tree"
              className="w-full h-full object-contain pointer-events-none drop-shadow-[0_8px_30px_rgba(0,0,0,0.04)]"
            />

            '''

content = content[:mb_marker_pos] + mobile_tree_block + content[mb_hotspots_pos:]

# 5. Update Mobile Hotspots
mb_hotspots_end = content.find('</div>\n\n          {/* 3. Interactive Information Card with Slide Indicators */}')
new_mb_hotspots = '''{/* 5 Seamless Interactive Touch/Click Hotspots matching Pic 2 Nodes */}
            {MANAGED_SERVICES_DATA.map((service, index) => {
              const isSelected = currentIndex === index;
              return (
                <button
                  key={service.id}
                  type="button"
                  id={`managed-tree-node-mobile-${service.id}`}
                  aria-label={`Select ${service.title}`}
                  aria-pressed={isSelected}
                  onClick={() => setCurrentIndex(index)}
                  style={{
                    left: `${service.leftPercent}%`,
                    top: `${service.topPercent}%`,
                    width: `${service.sizePercent}%`,
                  }}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 z-30 aspect-square rounded-full cursor-pointer transition-all duration-300 p-0 focus:outline-none ${
                    isSelected
                      ? "ring-4 ring-[#E67230]/80 ring-offset-2 ring-offset-[#FAF9F6] shadow-[0_8px_24px_rgba(230,114,48,0.35)] scale-[1.03]"
                      : "ring-0 hover:ring-2 hover:ring-[#E67230]/50"
                  }`}
                >
                  <span className="sr-only">{service.title}</span>
                </button>
              );
            })}
'''

content_before_mb_hotspots = content[:content.find('{/* 5 Seamless Interactive Touch/Click Hotspots on Tree Artwork */}', mb_marker_pos)]
content = content_before_mb_hotspots + new_mb_hotspots + content[mb_hotspots_end:]

with open(file_path, 'w', encoding='utf-8', newline='\r\n') as f:
    f.write(content)

print('Successfully applied all changes to LandingPage.tsx!')

