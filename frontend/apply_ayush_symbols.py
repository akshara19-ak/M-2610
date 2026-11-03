import re

file_path = r'c:\Users\gowry\Downloads\MEYVEDA\m-2610\M-2610\frontend\src\features\landing\pages\LandingPage.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. New AYUSH_SYSTEMS with exact symbols from user reference Image 1:
# A: Mortar bowl with diagonal pestle and leaf inside bowl
# Y: Meditating figure in padmasana with arched 5-ray sunburst halo
# U: Round bulbous flask with cork stopper and leaf on bottom-right
# S: 3-petal blossom (upright center petal + 2 outer curved petals)
# H: Medicine jar with cap, pill globules inside, and two small leaves on right

new_ayush_systems = '''const AYUSH_SYSTEMS = [
  {
    letter: "A",
    restText: "yurveda",
    fullName: "Ayurveda",
    icon: (
      /* Ayurveda: Mortar & pestle with leafy sprout */
      <svg
        className="size-[22px] sm:size-[24px] lg:size-[26px]"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* Mortar bowl */}
        <path d="M4 12h16c0 4.5-3.5 7.5-8 7.5s-8-3-8-7.5Z" />
        <path d="M8.5 19.5h7" />
        {/* Pestle diagonally extending out */}
        <path d="M15.5 4.5l-4.5 7.5" />
        <circle cx="16.5" cy="3.5" r="1.2" fill="currentColor" />
        {/* Leaf branch on left */}
        <path d="M9.5 7.5c-2.5 0-3.5 2-3.5 4 2 0 4-1.5 3.5-4Z" />
        <path d="M7 11l2-2.5" />
      </svg>
    ),
  },
  {
    letter: "Y",
    restText: "oga and\\nNaturopathy",
    fullName: "Yoga and\\nNaturopathy",
    isTwoLine: true,
    icon: (
      /* Yoga & Naturopathy: Meditating figure with radiating sunburst aura */
      <svg
        className="size-[22px] sm:size-[24px] lg:size-[26px]"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* Radiating sunburst aura rays */}
        <path d="M12 2v2" />
        <path d="M7.5 4l1.2 1.5" />
        <path d="M16.5 4l-1.2 1.5" />
        <path d="M4.5 7.5l1.8.8" />
        <path d="M19.5 7.5l-1.8.8" />
        {/* Meditator head */}
        <circle cx="12" cy="7.5" r="2" />
        {/* Torso & arms in meditative posture */}
        <path d="M12 10.5v4" />
        <path d="M9 12.5l3 2 3-2" />
        {/* Crossed legs in full lotus (Padmasana) */}
        <path d="M5.5 18c1.5-1.5 4-2 6.5-2s5 .5 6.5 2c-2 1.5-4.5 2-6.5 2s-4.5-.5-6.5-2Z" />
      </svg>
    ),
  },
  {
    letter: "U",
    restText: "nani",
    fullName: "Unani",
    icon: (
      /* Unani: Flask / bottle with cork stopper and leaf on bottom-right */
      <svg
        className="size-[22px] sm:size-[24px] lg:size-[26px]"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* Cork stopper & bottle neck */}
        <path d="M10.5 3h3" />
        <path d="M11 3v2.5M13 3v2.5" />
        {/* Bulbous round vessel body */}
        <path d="M11 5.5c-2 1-4 3.5-4 6.5a6 6 0 0 0 9.8 4.6" />
        <path d="M13 5.5c1.8.9 3.5 3 3.9 5.5" />
        {/* Resting leaf at bottom right */}
        <path d="M15 14c-1.8 1.8-2 4.5 0 6 2.5 0 4-1.8 4.8-4-1.8-.5-3.5-.8-4.8-2Z" />
        <path d="M15.5 19.5l2.5-3" />
      </svg>
    ),
  },
  {
    letter: "S",
    restText: "iddha",
    fullName: "Siddha",
    icon: (
      /* Siddha: 3-petal lotus / blossom emblem */
      <svg
        className="size-[22px] sm:size-[24px] lg:size-[26px]"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* Center pointed upright petal */}
        <path d="M12 3c-2.5 3.5-2.5 8 0 13 2.5-5 2.5-9.5 0-13Z" />
        {/* Left outer petal */}
        <path d="M11 15c-4-1-6.5-4-6.5-8 3.5 0 6.5 2.5 7.5 6" />
        {/* Right outer petal */}
        <path d="M13 15c4-1 6.5-4 6.5-8-3.5 0-6.5 2.5-7.5 6" />
        {/* Base connection */}
        <path d="M10 18.5c1 .5 3 .5 4 0" />
      </svg>
    ),
  },
  {
    letter: "H",
    restText: "omoeopathy",
    fullName: "Homoeopathy",
    icon: (
      /* Homoeopathy: Medicine jar with globules and herbal sprig */
      <svg
        className="size-[22px] sm:size-[24px] lg:size-[26px]"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* Jar cap */}
        <rect x="7" y="3" width="7" height="2.5" rx="1" />
        {/* Jar body */}
        <path d="M7.5 5.5v1.5l-1.5 2v9a1.5 1.5 0 0 0 1.5 1.5h6a1.5 1.5 0 0 0 1.5-1.5v-9l-1.5-2v-1.5" />
        {/* Pellets / globules inside */}
        <circle cx="9.5" cy="13" r=".9" fill="currentColor" />
        <circle cx="12" cy="12" r=".9" fill="currentColor" />
        <circle cx="10" cy="16" r=".9" fill="currentColor" />
        <circle cx="12.5" cy="15.5" r=".9" fill="currentColor" />
        {/* Two small leaves on right */}
        <path d="M15 15.5c1.8-1 3.5-.5 3.5 1s-1.5 1.8-3 1.2" />
        <path d="M15 18c1.5 0 2.5 1.2 2 2-.8.8-2 .5-2.2-.8" />
      </svg>
    ),
  },
];'''

# Replace AYUSH_SYSTEMS:
start_marker = 'const AYUSH_SYSTEMS = ['
end_marker = 'const carouselFeatures = ['
start_pos = content.find(start_marker)
end_pos = content.find(end_marker)
content = content[:start_pos] + new_ayush_systems + '\n\n' + content[end_pos:]

# 2. Update the unhighlighted circle color in AyushSlideCarousel:
# Change bg-[#F3EFEA] to a light peach/orange tint matching the hero page:
# e.g. bg-[#FBEDE0] or bg-[#FCF0E2] with subtle border and text-[#111111]
old_circle_styling = '''              {/* Icon Circle (Enlarged, smoothly turns into bold black circle when focused) */}
              <div
                className={`size-[38px] sm:size-[42px] lg:size-[46px] rounded-full flex items-center justify-center shrink-0 transition-all duration-400 ease-out ${
                  isFocused
                    ? "bg-[#111111] text-[#E67230] shadow-md scale-105"
                    : "bg-[#F3EFEA] text-[#111111] hover:bg-[#EBE5DE]"
                }`}
              >'''

new_circle_styling = '''              {/* Icon Circle (Enlarged, smoothly turns into bold black circle when focused) */}
              <div
                className={`size-[38px] sm:size-[42px] lg:size-[46px] rounded-full flex items-center justify-center shrink-0 transition-all duration-400 ease-out ${
                  isFocused
                    ? "bg-[#111111] text-[#E67230] shadow-md scale-105"
                    : "bg-[#FBEDE0] text-[#111111] hover:bg-[#F8E2D0] border border-[#F5DCBE]/60 shadow-[0_2px_8px_rgba(230,114,48,0.06)]"
                }`}
              >'''

content = content.replace(old_circle_styling, new_circle_styling)

with open(file_path, 'w', encoding='utf-8', newline='\r\n') as f:
    f.write(content)

print('Successfully updated AYUSH symbols and circle styling!')

