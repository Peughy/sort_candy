import os
import re

html_path = r"d:\PYTHON'S\sort_candy\templates\index.html"
with open(html_path, "r", encoding="utf-8") as f:
    html = f.read()

photo_frame = """<div id="photo-loading" class="absolute inset-0 bg-yellow-100 flex flex-col items-center justify-center z-10">
                        <div class="text-4xl animate-bounce-slow mb-2">📸</div>
                        <p class="font-[Chewy] text-yellow-600 text-xl">Développement...</p>
                    </div>
                    <img id="robot-photo" src="" alt="Vue Camera" class="w-full h-full object-cover relative z-0 hidden">"""

html = re.sub(r'<img src="https://placehold.co/.*?class="w-full h-full object-cover">', photo_frame, html, flags=re.DOTALL)
html = html.replace('?v=7', '?v=8')

with open(html_path, "w", encoding="utf-8") as f:
    f.write(html)
