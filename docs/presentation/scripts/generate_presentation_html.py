import os
import re

def parse_analysis(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    slides = []
    slide_blocks = content.split('=== SLIDE')
    for block in slide_blocks[1:]:
        lines = block.split('\n')
        slide_num = int(lines[0].split('===')[0].strip())
        
        slide_data = {
            "number": slide_num,
            "text": [],
            "images": []
        }
        
        for line in lines:
            if line.startswith('Text: '):
                slide_data["text"].append(line.replace('Text: ', '').strip())
            elif line.startswith('[Image Found]'):
                # We need to map extracted_images to these.
                # Since we extracted them in order slide_{i}_img_{j}, we can try to guess.
                pass
        
        # Search for images in extracted_images directory
        image_pattern = re.compile(f'slide_{slide_num}_img_.*')
        for img_file in os.listdir('extracted_images'):
            if image_pattern.match(img_file):
                slide_data["images"].append(f'extracted_images/{img_file}')
        
        slides.append(slide_data)
    return slides

def generate_html(slides):
    html = """
    <!DOCTYPE html>
    <html lang="ko">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>MDGA Final Presentation Reconstruction</title>
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
        <style>
            body { background-color: #f4f7f6; font-family: 'Pretendard', sans-serif; }
            .slide { 
                background: white; 
                width: 1920px; height: 1080px; 
                margin: 50px auto; 
                padding: 80px; 
                box-shadow: 0 10px 30px rgba(0,0,0,0.1); 
                position: relative;
                overflow: hidden;
                display: flex;
                flex-direction: column;
            }
            .slide-number { position: absolute; bottom: 40px; right: 40px; font-size: 24px; color: #aaa; }
            h1 { color: #1a3a5f; font-weight: 800; border-bottom: 4px solid #4caf50; padding-bottom: 10px; margin-bottom: 40px; }
            .content-area { display: flex; gap: 40px; flex: 1; }
            .text-content { flex: 1.5; font-size: 32px; line-height: 1.6; color: #333; }
            .image-content { flex: 1; display: flex; flex-direction: column; gap: 20px; justify-content: center; align-items: center; }
            .image-content img { max-width: 100%; max-height: 800px; border-radius: 15px; box-shadow: 0 5px 15px rgba(0,0,0,0.2); }
            .highlight { color: #2e7d32; font-weight: bold; }
            .pivot-tag { background: #e8f5e9; color: #2e7d32; padding: 5px 15px; border-radius: 20px; font-size: 20px; font-weight: bold; }
            .tech-badge { background: #e3f2fd; color: #1565c0; padding: 5px 10px; border-radius: 5px; font-size: 18px; margin: 5px; display: inline-block; }
            
            /* Specific Slide Styles */
            .title-slide { justify-content: center; align-items: center; text-align: center; background: linear-gradient(135deg, #1a3a5f 0%, #0d1b2a 100%); color: white; }
            .title-slide h1 { color: white; border-bottom: none; font-size: 80px; }
            .title-slide .subtitle { font-size: 40px; color: #4caf50; margin-bottom: 40px; }
        </style>
    </head>
    <body>
    """
    
    for slide in slides:
        is_title = slide['number'] == 1
        class_name = "slide title-slide" if is_title else "slide"
        
        html += f'<div class="{class_name}" id="slide-{slide["number"]}">'
        
        if is_title:
            html += f'<h1>{slide["text"][2]}</h1>' # MDGA
            html += f'<div class="subtitle">{slide["text"][3]}</div>' # Universal Data Engine
            html += f'<div style="font-size: 30px; opacity: 0.8;">{" / ".join(slide["text"][0:2])}</div>'
            html += '<div style="margin-top: 50px;">'
            for tech in slide["text"][8:13]:
                html += f'<span class="tech-badge">{tech}</span>'
            html += '</div>'
        else:
            title = slide["text"][0] if slide["text"] else f"Slide {slide['number']}"
            html += f'<h1>{title}</h1>'
            
            html += '<div class="content-area">'
            html += '<div class="text-content">'
            for t in slide["text"][1:]:
                if t.strip():
                    if "→" in t or "100%" in t or "2시간" in t:
                        html += f'<p><span class="highlight">{t}</span></p>'
                    else:
                        html += f'<p>• {t}</p>'
            html += '</div>'
            
            if slide["images"]:
                html += '<div class="image-content">'
                for img in slide["images"]:
                    html += f'<img src="{img}" alt="Slide Image">'
                html += '</div>'
            
            html += '</div>'
            
        html += f'<div class="slide-number">{slide["number"]}</div>'
        html += '</div>'
        
    html += """
    </body>
    </html>
    """
    return html

if __name__ == "__main__":
    slides = parse_analysis('presentation_deep_analysis.txt')
    final_html = generate_html(slides)
    with open('MDGA_Reconstructed_Presentation.html', 'w', encoding='utf-8') as f:
        f.write(final_html)
    print("HTML Presentation generated successfully.")
