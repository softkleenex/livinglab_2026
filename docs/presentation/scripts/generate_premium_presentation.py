import os
import re
import json

def parse_analysis(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    slides = []
    slide_blocks = content.split('=== SLIDE')
    for block in slide_blocks[1:]:
        lines = block.split('\n')
        slide_num_str = lines[0].split('===')[0].strip()
        if not slide_num_str: continue
        slide_num = int(slide_num_str)
        
        slide_data = {
            "number": slide_num,
            "text": [],
            "images": [],
            "tables": []
        }
        
        current_table = None
        for line in lines:
            if line.startswith('Text: '):
                slide_data["text"].append(line.replace('Text: ', '').strip())
            elif line.startswith('Table Row: '):
                if not current_table: current_table = []
                current_table.append(line.replace('Table Row: ', '').split(' | '))
            elif not line.startswith('Table Row: ') and current_table:
                slide_data["tables"].append(current_table)
                current_table = None
        
        if current_table: slide_data["tables"].append(current_table)
        
        # Map images
        image_pattern = re.compile(f'slide_{slide_num}_img_.*')
        for img_file in os.listdir('extracted_images'):
            if image_pattern.match(img_file):
                slide_data["images"].append(f'extracted_images/{img_file}')
        
        slides.append(slide_data)
    return slides

def generate_premium_html(slides):
    html = """
    <!DOCTYPE html>
    <html lang="ko">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>MDGA Premium Presentation | 2026 Living Lab</title>
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css">
        <style>
            :root {
                --primary: #1e3a8a;
                --secondary: #10b981;
                --dark: #0f172a;
                --light: #f8fafc;
                --accent: #f59e0b;
                --glass: rgba(255, 255, 255, 0.8);
            }
            
            body { 
                background-color: var(--dark); 
                font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;
                margin: 0; padding: 0;
                color: #334155;
            }
            
            .presentation-container {
                display: flex;
                flex-direction: column;
                align-items: center;
                padding: 40px 0;
            }
            
            .slide { 
                background: var(--light); 
                width: 1920px; height: 1080px; 
                margin-bottom: 80px;
                padding: 60px 100px; 
                box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5); 
                position: relative;
                overflow: hidden;
                display: flex;
                flex-direction: column;
                border-radius: 24px;
                transform: scale(0.6); /* Viewport scaling for editing/review */
                transform-origin: top center;
            }
            
            @media (min-width: 1921px) {
                .slide { transform: scale(1); }
            }

            .slide-number { position: absolute; bottom: 40px; left: 40px; font-size: 18px; font-weight: 600; color: #94a3b8; }
            .brand-mark { position: absolute; bottom: 40px; right: 100px; font-size: 20px; font-weight: 800; color: var(--primary); letter-spacing: 2px; }
            
            h1 { 
                font-size: 64px; font-weight: 800; color: var(--dark); 
                margin-bottom: 40px; display: flex; align-items: center; gap: 20px;
            }
            h1::before { content: ''; width: 12px; height: 60px; background: var(--secondary); border-radius: 6px; }

            .grid-container { display: grid; grid-template-columns: 1.2fr 1fr; gap: 60px; flex: 1; align-items: start; }
            
            .text-block { background: var(--glass); padding: 40px; border-radius: 20px; border: 1px solid rgba(255,255,255,0.3); }
            
            .content-list { list-style: none; padding: 0; font-size: 32px; line-height: 1.6; }
            .content-list li { margin-bottom: 24px; padding-left: 40px; position: relative; }
            .content-list li::before { content: '→'; position: absolute; left: 0; color: var(--secondary); font-weight: bold; }
            
            .highlight-card { 
                background: white; padding: 30px; border-radius: 16px; 
                box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);
                border-left: 8px solid var(--secondary);
                margin-top: 20px;
            }
            .stat-number { font-size: 80px; font-weight: 900; color: var(--primary); line-height: 1; }
            .stat-label { font-size: 24px; font-weight: 600; color: #64748b; }

            .image-box { 
                width: 100%; height: 100%; min-height: 600px;
                background: #e2e8f0; border-radius: 20px; overflow: hidden;
                box-shadow: inset 0 2px 4px 0 rgba(0,0,0,0.06);
                display: flex; justify-content: center; align-items: center;
            }
            .image-box img { width: 100%; height: 100%; object-fit: cover; }

            /* Title Slide Style */
            .title-slide { 
                background: radial-gradient(circle at top right, #1e40af, #0f172a);
                color: white; justify-content: center; align-items: center; text-align: center;
            }
            .title-slide h1 { color: white; font-size: 120px; border: none; margin-bottom: 20px; }
            .title-slide h1::before { display: none; }
            .title-slide .subtitle { font-size: 44px; color: var(--secondary); font-weight: 600; margin-bottom: 60px; }
            .title-slide .tech-pills { display: flex; gap: 15px; margin-top: 40px; }
            .tech-pill { background: rgba(255,255,255,0.1); padding: 10px 25px; border-radius: 50px; border: 1px solid rgba(255,255,255,0.2); font-size: 20px; }

            /* Section Divider */
            .section-slide { 
                background: var(--secondary); color: white;
                justify-content: center; align-items: flex-start;
            }
            .section-slide .step-num { font-size: 180px; font-weight: 900; opacity: 0.3; line-height: 1; }
            .section-slide h1 { color: white; font-size: 90px; }
            .section-slide h1::before { background: white; }

            /* Pivot Style */
            .pivot-container { display: flex; justify-content: space-between; gap: 40px; margin-top: 40px; }
            .pivot-box { flex: 1; background: white; padding: 40px; border-radius: 20px; position: relative; }
            .pivot-box.before { border-top: 10px solid #ef4444; }
            .pivot-box.after { border-top: 10px solid var(--secondary); }
            .pivot-label { position: absolute; top: -20px; left: 40px; background: inherit; padding: 5px 20px; border-radius: 10px; font-weight: 800; border: 2px solid; }

            table { width: 100%; border-collapse: separate; border-spacing: 0 10px; margin-top: 20px; }
            th { background: var(--primary); color: white; padding: 20px; font-size: 24px; }
            td { background: white; padding: 20px; font-size: 22px; border-top: 1px solid #e2e8f0; border-bottom: 1px solid #e2e8f0; }
        </style>
    </head>
    <body>
        <div class="presentation-container">
    """
    
    for slide in slides:
        num = slide['number']
        is_title = num == 1
        is_section = num in [3, 8, 11, 17, 22]
        
        classes = "slide"
        if is_title: classes += " title-slide"
        if is_section: classes += " section-slide"
        
        html += f'<div class="{classes}" id="slide-{num}">'
        
        if is_title:
            html += f'<h1>{slide["text"][2]}</h1>' # MDGA
            html += f'<div class="subtitle">{slide["text"][3]}</div>'
            html += f'<div style="font-size: 28px; opacity: 0.7;">{slide["text"][0]} | {slide["text"][1]}</div>'
            html += '<div class="tech-pills">'
            for tech in ["React 19", "FastAPI", "Supabase", "Gemini 2.5 Pro", "Cloudflare"]:
                html += f'<div class="tech-pill">{tech}</div>'
            html += '</div>'
        elif is_section:
            html += f'<div class="step-num">STEP 0{int(num/4)+1}</div>'
            html += f'<h1>{slide["text"][2] if len(slide["text"])>2 else slide["text"][0]}</h1>'
            if len(slide["text"]) > 3:
                html += f'<div style="font-size: 40px; margin-top: 20px;">{slide["text"][4] if len(slide["text"])>4 else ""}</div>'
        else:
            title = slide["text"][0] if slide["text"] else f"Slide {num}"
            html += f'<h1>{title}</h1>'
            
            html += '<div class="grid-container">'
            html += '<div class="text-block">'
            html += '<ul class="content-list">'
            
            # Smartly filter and group text
            for t in slide["text"][1:]:
                if len(t) < 3 or t.isdigit(): continue
                if "→" in t or "100%" in t or "2시간" in t or "85%" in t:
                    html += f'</ul><div class="highlight-card">'
                    parts = t.split('→') if '→' in t else [t]
                    if len(parts) > 1:
                        html += f'<div class="stat-label">{parts[0]}</div>'
                        html += f'<div class="stat-number">{parts[1]}</div>'
                    else:
                        html += f'<div class="stat-number">{t}</div>'
                    html += f'</div><ul class="content-list">'
                else:
                    html += f'<li>{t}</li>'
            html += '</ul>'
            
            if slide["tables"]:
                for table in slide["tables"]:
                    html += '<table><thead><tr>'
                    for header in table[0]:
                        html += f'<th>{header}</th>'
                    html += '</tr></thead><tbody>'
                    for row in table[1:]:
                        html += '<tr>'
                        for cell in row:
                            html += f'<td>{cell}</td>'
                        html += '</tr>'
                    html += '</tbody></table>'
            
            html += '</div>' # end text-block
            
            # Image area
            html += '<div class="image-box">'
            if slide["images"]:
                # Just show the first image as main
                html += f'<img src="{slide["images"][0]}" alt="Slide Image">'
            else:
                # Placeholder for data-driven slides
                html += '<div style="color: #cbd5e1; text-align: center; padding: 100px;">'
                html += '<div style="font-size: 120px; margin-bottom: 20px;">📊</div>'
                html += '<div style="font-size: 32px; font-weight: 600;">Data Visualization Area</div>'
                html += '</div>'
            html += '</div>'
            
            html += '</div>' # end grid-container
            
        html += f'<div class="slide-number">PAGE {num:02d}</div>'
        html += '<div class="brand-mark">MDGA UNIVERSAL DATA ENGINE</div>'
        html += '</div>'
        
    html += """
        </div>
    </body>
    </html>
    """
    return html

if __name__ == "__main__":
    slides = parse_analysis('presentation_deep_analysis.txt')
    final_html = generate_premium_html(slides)
    with open('MDGA_Premium_Presentation.html', 'w', encoding='utf-8') as f:
        f.write(final_html)
    print("Premium HTML Presentation generated successfully.")
