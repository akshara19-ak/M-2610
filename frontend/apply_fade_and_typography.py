import re

file_path = r'c:\Users\gowry\Downloads\MEYVEDA\m-2610\M-2610\frontend\src\features\landing\pages\LandingPage.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update treeBranchPng image styling:
# Add opacity-85 (85% transparency like Canva feature) to fade tree and match page color palette
content = content.replace(
    'src={treeBranchPng}\n                alt="Managed Services Growth Tree"\n                className="w-full h-full object-contain pointer-events-none drop-shadow-[0_8px_30px_rgba(0,0,0,0.03)]"',
    'src={treeBranchPng}\n                alt="Managed Services Growth Tree"\n                className="w-full h-full object-contain pointer-events-none opacity-85 drop-shadow-[0_8px_30px_rgba(0,0,0,0.03)]"'
)

content = content.replace(
    'src={treeBranchPng}\n              alt="Managed Services Growth Tree"\n              className="w-full h-full object-contain pointer-events-none drop-shadow-[0_8px_30px_rgba(0,0,0,0.03)]"',
    'src={treeBranchPng}\n              alt="Managed Services Growth Tree"\n              className="w-full h-full object-contain pointer-events-none opacity-85 drop-shadow-[0_8px_30px_rgba(0,0,0,0.03)]"'
)

# 2. Adjust icon size to be balanced: w-9 h-7 sm:w-10 sm:h-8 lg:w-11 lg:h-8.5
content = content.replace(
    'className="w-10 h-8 sm:w-12 sm:h-9 lg:w-14 lg:h-10 text-[#E67230]"',
    'className="w-8 h-6 sm:w-9 sm:h-7 lg:w-10 lg:h-8 text-[#E67230]"'
)
content = content.replace(
    'className="w-11 h-8 sm:w-13 sm:h-9 lg:w-15 lg:h-10 text-[#E67230]"',
    'className="w-9 h-6 sm:w-10 sm:h-7 lg:w-11 lg:h-8 text-[#E67230]"'
)

# 3. Fine-tune Desktop font sizes:
# Title: text-[9px] sm:text-[10.5px] lg:text-[11.5px] xl:text-[12.5px]
# Desc: text-[6.8px] sm:text-[7.6px] lg:text-[8px] xl:text-[8.8px]
old_dt_node = '''                    {/* Node Title (Selectable Text) */}
                    <h4 className="text-[10.5px] sm:text-[12px] lg:text-[13px] xl:text-[14px] font-extrabold text-[#111111] leading-[1.15] tracking-tight select-text">
                      {service.circleTitle}
                    </h4>

                    {/* Node Subtitle Description (Selectable Text) */}
                    <p className="mt-1 text-[7.5px] sm:text-[8.5px] lg:text-[9px] xl:text-[10px] font-normal text-[#555555] leading-[1.3] tracking-tight select-text">
                      {service.circleDesc}
                    </p>'''

new_dt_node = '''                    {/* Node Title (Selectable Text, perfectly fitted without congestion) */}
                    <h4 className="text-[9px] sm:text-[10px] lg:text-[11.2px] xl:text-[12px] font-extrabold text-[#111111] leading-[1.14] tracking-tight select-text">
                      {service.circleTitle}
                    </h4>

                    {/* Node Subtitle Description (Selectable Text, comfortable breathing room) */}
                    <p className="mt-1 text-[6.8px] sm:text-[7.6px] lg:text-[8.2px] xl:text-[9px] font-normal text-[#555555] leading-[1.28] tracking-tight select-text px-1">
                      {service.circleDesc}
                    </p>'''

content = content.replace(old_dt_node, new_dt_node)

# 4. Fine-tune Mobile font sizes:
old_mb_node = '''                  {/* Node Title (Selectable Text) */}
                  <h4 className="text-[9px] sm:text-[11.5px] font-extrabold text-[#111111] leading-[1.15] tracking-tight select-text">
                    {service.circleTitle}
                  </h4>

                  {/* Node Subtitle Description (Selectable Text) */}
                  <p className="mt-0.5 text-[7px] sm:text-[8.5px] font-normal text-[#555555] leading-[1.25] tracking-tight select-text">
                    {service.circleDesc}
                  </p>'''

new_mb_node = '''                  {/* Node Title (Selectable Text, comfortable scale) */}
                  <h4 className="text-[7.8px] sm:text-[10px] font-extrabold text-[#111111] leading-[1.14] tracking-tight select-text">
                    {service.circleTitle}
                  </h4>

                  {/* Node Subtitle Description (Selectable Text, clean margin) */}
                  <p className="mt-0.5 text-[6.2px] sm:text-[7.5px] font-normal text-[#555555] leading-[1.22] tracking-tight select-text px-0.5">
                    {service.circleDesc}
                  </p>'''

content = content.replace(old_mb_node, new_mb_node)

with open(file_path, 'w', encoding='utf-8', newline='\r\n') as f:
    f.write(content)

print('Successfully applied opacity-85 tree fade and refined typography!')

