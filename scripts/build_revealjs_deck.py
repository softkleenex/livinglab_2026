import os
import re

def parse_analysis(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    slides = []
    slide_blocks = content.split('=== SLIDE ')
    for block in slide_blocks[1:]:
        lines = block.strip().split('\n')
        slide_num = int(lines[0].split('===')[0].strip())
        
        slide_data = {
            "number": slide_num,
            "text": [],
            "images": []
        }
        
        for line in lines[1:]:
            if line.startswith('Text: '):
                slide_data["text"].append(line.replace('Text: ', '').strip())
        
        # Search for images in extracted_images directory
        image_pattern = re.compile(f'slide_{slide_num}_img_.*')
        if os.path.exists('extracted_images'):
            for img_file in os.listdir('extracted_images'):
                if image_pattern.match(img_file):
                    slide_data["images"].append(f'extracted_images/{img_file}')
        
        slides.append(slide_data)
    return slides

def generate_revealjs(slides):
    html = """<!doctype html>
<html lang="ko">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>MDGA Final Presentation Reconstruction</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/reveal.js/4.6.1/reset.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/reveal.js/4.6.1/reveal.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/reveal.js/4.6.1/theme/simple.css" id="theme">
    <style>
        @import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css');
        .reveal { font-family: 'Pretendard', sans-serif; color: #333; }
        .reveal h1, .reveal h2, .reveal h3, .reveal h4 {
            font-family: 'Pretendard', sans-serif;
            font-weight: 800;
            color: #1a3a5f;
            text-transform: none;
            margin-bottom: 20px;
        }
        .reveal h1 { font-size: 2.8em; }
        .reveal h2 { font-size: 2.0em; text-align: left; padding-bottom: 10px; border-bottom: 3px solid #4caf50; display: inline-block; margin-bottom: 30px; }
        .reveal h3 { font-size: 1.4em; color: #2e7d32; margin-top: 20px;}
        .reveal p { font-size: 26px; text-align: left; line-height: 1.5; color: #444; margin: 10px 0;}
        .reveal ul { display: block; font-size: 26px; text-align: left; margin-left: 1.2em; color: #555; }
        .reveal li { margin-bottom: 10px; }
        
        .tech-badge { background: #e3f2fd; color: #1565c0; padding: 8px 16px; border-radius: 8px; font-size: 20px; margin: 5px; display: inline-block; font-weight: bold; border: 1px solid #bbdefb;}
        .content-area { display: flex; align-items: flex-start; gap: 40px; text-align: left; margin-top: 20px; width: 100%;}
        .text-content { flex: 1.2; display: flex; flex-direction: column; justify-content: flex-start; width: 100%;}
        .image-content { flex: 1; display: flex; flex-direction: column; gap: 20px; align-items: center; justify-content: center; }
        .image-content img { max-width: 100%; max-height: 500px; border-radius: 12px; box-shadow: 0 8px 20px rgba(0,0,0,0.15); margin: 0; }
        .highlight { color: #fff; font-weight: bold; background: #2e7d32; padding: 4px 12px; border-radius: 6px; display: inline-block; margin-top: 10px;}
        
        .title-slide { text-align: center; height: 100%; display: flex; flex-direction: column; justify-content: center; align-items: center;}
        .title-slide h1 { font-size: 4em; border-bottom: none; margin-bottom: 10px; color: #1a3a5f; }
        .title-slide .subtitle { font-size: 2em; color: #4caf50; font-weight: 700; margin-bottom: 40px; }
        .title-slide .dept { font-size: 1.2em; color: #666; margin-bottom: 20px; letter-spacing: 1px;}
        
        .section-slide { text-align: left; color: white !important; display: flex; flex-direction: column; justify-content: center; height: 100%; padding-left: 10%;}
        .section-slide h1 { font-size: 4.5em; border-bottom: none; color: #fff; margin-bottom: 20px;}
        .section-slide h2 { font-size: 2.2em; color: #a5d6a7; margin-top: 0; border: none; padding: 0;}
        .section-slide p { color: #e0e0e0; font-size: 32px; }
        
        .footer-note { position: absolute; bottom: 20px; left: 0; right: 0; text-align: center; font-size: 14px; color: #999; }
        
        .two-column { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; width: 100%; }
        .three-column { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; width: 100%; }
        .box { background: #f8f9fa; padding: 20px; border-radius: 12px; border-left: 4px solid #4caf50; box-shadow: 0 4px 10px rgba(0,0,0,0.05); }
    </style>
</head>
<body>
    <div class="reveal">
        <div class="slides">
"""

    for slide in slides:
        is_title = slide['number'] == 1
        is_section = False
        is_end = slide['number'] == 27
        
        # Check if it's a section slide
        if len(slide['text']) > 0 and len(slide['text']) < 8 and slide['text'][0].startswith("STEP"):
            is_section = True
            
        if is_title:
            html += f'            <section data-state="slide-{slide["number"]}">'
            html += f"""
                <div class="title-slide">
                    <div class="dept">{" / ".join(slide["text"][0:2])}</div>
                    <h1>{slide["text"][2]}</h1>
                    <div class="subtitle">{slide["text"][3]}</div>
                    <p style="text-align: center; font-size: 1.2em; color: #555; margin-bottom: 5px;">{slide["text"][4]}</p>
                    <p style="text-align: center; font-size: 1.2em; color: #555; margin-top: 0;">{slide["text"][5]}</p>
                    <p style="text-align: center; font-size: 1em; color: #1565c0; font-weight: bold; margin-top: 30px;">{slide["text"][6]}</p>
                    
                    <div style="margin-top: 50px; background: #f5f5f5; padding: 20px; border-radius: 15px;">
                        <h4 style="margin-bottom: 15px; font-size: 20px; color: #666; text-transform: uppercase;">Tech Stack</h4>
            """
            for tech in slide["text"][8:-1]:
                if tech.strip() and tech not in ['Frontend', 'Backend', 'DB', 'AI', 'Deploy']:
                    html += f'<span class="tech-badge">{tech}</span>'
            html += '</div></div></section>\n'
            
        elif is_section:
            html += f'            <section data-background-gradient="linear-gradient(135deg, #1a3a5f 0%, #0d1b2a 100%)" data-state="slide-{slide["number"]}">'
            html += f"""
                <div class="section-slide">
                    <h2>{slide["text"][2]}</h2>
                    <h1>{slide["text"][3]}</h1>
                    <p>{"<br>".join(slide["text"][4:-1])}</p>
                </div>
            </section>\n
            """
            
        elif is_end:
            html += f'            <section data-state="slide-{slide["number"]}">'
            html += f"""
                <div class="title-slide">
                    <div class="dept">{slide["text"][0]}</div>
                    <h1 style="font-size: 3em; margin: 40px 0;">{slide["text"][1]}</h1>
                    <p style="text-align: center; font-size: 1.5em; color: #2e7d32; font-weight: bold;">{slide["text"][2]}</p>
                    
                    <div class="two-column" style="margin-top: 50px; text-align: left; max-width: 800px;">
                        <div class="box">
                            <h3 style="margin-top:0;">{slide["text"][3]}</h3>
                            <p>{slide["text"][4]}</p>
                        </div>
                        <div class="box">
                            <h3 style="margin-top:0;">{slide["text"][5]}</h3>
                            <p>{slide["text"][6]}</p>
                        </div>
                        <div class="box">
                            <h3 style="margin-top:0;">{slide["text"][7]}</h3>
                            <p>{slide["text"][8]}</p>
                        </div>
                    </div>
                    <p style="margin-top: 50px; color: #888; font-size: 20px;">{slide["text"][-1]}</p>
                </div>
            </section>\n
            """
            
        else:
            html += f'            <section data-state="slide-{slide["number"]}">'
            
            # Smart extraction of title
            title = slide["text"][0]
            if title.startswith("STEP") and len(slide["text"]) > 1:
                title = slide["text"][1]
                start_idx = 2
            elif slide["number"] == 2:
                title = slide["text"][0]
                start_idx = 1
            else:
                start_idx = 1
                
            html += f'<h2>{title}</h2>'
            html += '<div class="content-area">'
            html += '<div class="text-content">'
            
            in_list = False
            for t in slide["text"][start_idx:-1]: # Last one is usually slide number or footer
                t = t.strip()
                if not t or t.isdigit() or "경북대학교" in t:
                    continue
                    
                if t.startswith('•') or t.startswith('-'):
                    if not in_list:
                        html += '<ul>'
                        in_list = True
                    html += f'<li>{t.lstrip("•-").strip()}</li>'
                else:
                    if in_list:
                        html += '</ul>'
                        in_list = False
                        
                    if "→" in t or "100%" in t or "2시간" in t or "BEFORE" in t or "AFTER" in t:
                        html += f'<div style="margin-bottom: 10px;"><span class="highlight">{t}</span></div>'
                    elif len(t) < 20 and not any(char.isdigit() for char in t) and not "현장 방문" in t:
                        html += f'<h3>{t}</h3>'
                    else:
                        html += f'<p>{t}</p>'
            
            if in_list:
                html += '</ul>'
                
            html += '</div>'
            
            if slide["images"]:
                html += '<div class="image-content">'
                for img in slide["images"]:
                    html += f'<img src="{img}" alt="Slide {slide["number"]} Image">'
                html += '</div>'
                
            html += '</div>'
            # Add footer
            html += '<div class="footer-note">경북대학교 지식재산전문인력양성사업단 · MDGA 리빙랩 2026</div>'
            html += '            </section>\n'
            
    html += """
        </div>
    </div>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/reveal.js/4.6.1/reveal.js"></script>
    <script>
        Reveal.initialize({
            hash: true,
            slideNumber: 'c/t',
            transition: 'fade',
            center: false,
            margin: 0.08,
            width: 1280,
            height: 720,
            plugins: []
        });
    </script>
</body>
</html>
"""
    return html

if __name__ == "__main__":
    slides = parse_analysis('presentation_deep_analysis.txt')
    final_html = generate_revealjs(slides)
    with open('MDGA_Reconstructed_Reveal.html', 'w', encoding='utf-8') as f:
        f.write(final_html)
    print("Reveal.js Presentation generated successfully to MDGA_Reconstructed_Reveal.html.")
