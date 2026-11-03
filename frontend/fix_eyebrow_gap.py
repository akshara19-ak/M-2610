import re

file_path = r'c:\Users\gowry\Downloads\MEYVEDA\m-2610\M-2610\frontend\src\features\landing\pages\LandingPage.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the hero header lockup:
old_lockup = '''            {/* Hero Header Lockup: Eyebrow + Brand Graphic Headline (stands out by 0.1-0.2cm ~5px to the left, fitting precisely within the blue lines) */}
            <div className="-ml-[5px] sm:-ml-[6px] md:-ml-[7px]">
              {/* Section Eyebrow (Reduced in proportion to headline) */}
              <p className="mb-2 pl-[1px] text-[12.5px] sm:text-[13.5px] lg:text-[14px] font-bold uppercase tracking-wider text-[#E67230]">
                Dear <strong className="font-bold text-[#E65C24]">AYUSH</strong> Practitioners
              </p>

              {/* Headline with Brand Graphic (Scaled to fit neatly within the blue boundary lines) */}
              <h1
                id="hero-title"
                className="relative h-[40px] sm:h-[46px] lg:h-[52px] xl:h-[54px]"
              >
                <span className="sr-only">REINVENT YOUR</span>
                <img
                  src={reinventYourLogo}
                  alt="REINVENT YOUR"
                  width={2144}
                  height={387}
                  className="absolute -top-[7px] sm:-top-[9px] lg:-top-[10px] left-0 h-[64px] sm:h-[74px] lg:h-[82px] xl:h-[86px] w-auto max-w-full object-contain object-left pointer-events-none select-none"
                  loading="eager"
                  decoding="async"
                />
              </h1>
            </div>'''

new_lockup = '''            {/* Hero Header Lockup: Eyebrow + Brand Graphic Headline (aligned with exact gap and alignment matching Image 2) */}
            <div className="-ml-[5px] sm:-ml-[6px] md:-ml-[7px]">
              {/* Section Eyebrow */}
              <p className="mb-3.5 sm:mb-4 lg:mb-4.5 pl-[1px] text-[12.5px] sm:text-[13.5px] lg:text-[14px] font-bold uppercase tracking-wider text-[#E67230] leading-none">
                Dear <strong className="font-bold text-[#E65C24]">AYUSH</strong> Practitioners
              </p>

              {/* Headline with Brand Graphic */}
              <h1
                id="hero-title"
                className="relative h-[44px] sm:h-[50px] lg:h-[56px] xl:h-[58px]"
              >
                <span className="sr-only">REINVENT YOUR</span>
                <img
                  src={reinventYourLogo}
                  alt="REINVENT YOUR"
                  width={2144}
                  height={387}
                  className="absolute top-0 left-0 h-[56px] sm:h-[64px] lg:h-[72px] xl:h-[76px] w-auto max-w-full object-contain object-left pointer-events-none select-none"
                  loading="eager"
                  decoding="async"
                />
              </h1>
            </div>'''

assert old_lockup in content, "old_lockup not found"
content = content.replace(old_lockup, new_lockup)

with open(file_path, 'w', encoding='utf-8', newline='\r\n') as f:
    f.write(content)

print('Successfully updated hero header lockup spacing and alignment!')

