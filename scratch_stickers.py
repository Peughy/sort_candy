import os

html_path = r"d:\PYTHON'S\sort_candy\templates\index.html"
with open(html_path, "r", encoding="utf-8") as f:
    html = f.read()

stickers = """
        <!-- Stickers Décoratifs (Arrière-plan de la page choix) -->
        <!-- Sucre d'orge -->
        <svg class="absolute top-20 left-4 md:left-10 w-24 h-24 md:w-32 md:h-32 animate-bounce-slow opacity-80 -rotate-12 pointer-events-none z-0" viewBox="0 0 100 100">
            <path d="M40,90 L40,40 A20,20 0 1,1 80,40" fill="none" stroke="#FF5A92" stroke-width="12" stroke-linecap="round"/>
            <path d="M40,90 L40,40 A20,20 0 1,1 80,40" fill="none" stroke="white" stroke-width="12" stroke-dasharray="10 15" stroke-linecap="round"/>
        </svg>

        <!-- Étoile Jaune -->
        <svg class="absolute top-10 right-8 md:right-20 w-16 h-16 animate-pulse opacity-90 pointer-events-none z-0" viewBox="0 0 100 100">
            <polygon points="50,10 61,35 88,35 67,52 75,78 50,63 25,78 33,52 12,35 39,35" fill="#FFC933" stroke="#3D2314" stroke-width="3"/>
        </svg>

        <!-- Bonbon emballé volant -->
        <svg class="absolute top-[40%] left-2 md:left-16 w-20 h-20 animate-spin-slow opacity-70 rotate-45 pointer-events-none z-0" viewBox="0 0 100 100" style="animation-duration: 8s;">
            <path d="M30,50 L10,30 L10,70 Z" fill="#4D9DE0" stroke="#3D2314" stroke-width="3" stroke-linejoin="round"/>
            <path d="M70,50 L90,30 L90,70 Z" fill="#4D9DE0" stroke="#3D2314" stroke-width="3" stroke-linejoin="round"/>
            <circle cx="50" cy="50" r="20" fill="#FFC933" stroke="#3D2314" stroke-width="3"/>
            <path d="M40,40 Q50,30 60,40" fill="none" stroke="white" stroke-width="4" stroke-linecap="round" opacity="0.6"/>
        </svg>

        <!-- Sucette rebondissante -->
        <svg class="absolute top-[60%] right-2 md:right-12 w-24 h-24 md:w-28 md:h-28 animate-bounce-slow opacity-80 rotate-12 pointer-events-none z-0" viewBox="0 0 100 100" style="animation-delay: 1s;">
            <line x1="50" y1="50" x2="50" y2="90" stroke="#3D2314" stroke-width="6" stroke-linecap="round"/>
            <circle cx="50" cy="40" r="25" fill="#FF5A92" stroke="#3D2314" stroke-width="3"/>
            <path d="M50,25 C65,25 70,35 60,45 C50,55 35,50 40,40 C45,30 55,35 50,45" fill="none" stroke="white" stroke-width="3" stroke-linecap="round"/>
        </svg>

        <!-- Étoile Bleue en bas -->
        <svg class="absolute bottom-40 left-1/4 w-12 h-12 animate-pulse opacity-80 pointer-events-none z-0" viewBox="0 0 100 100" style="animation-delay: 0.5s;">
            <polygon points="50,10 61,35 88,35 67,52 75,78 50,63 25,78 33,52 12,35 39,35" fill="#A0E5FF" stroke="#3D2314" stroke-width="3"/>
        </svg>
"""

target = '<div id="screen-menu" class="hidden-screen w-full min-h-screen flex flex-col items-center pt-8 pb-32 px-4 z-10">'
replacement = '<div id="screen-menu" class="hidden-screen relative w-full min-h-screen flex flex-col items-center pt-8 pb-32 px-4 z-10 overflow-hidden">' + stickers

html = html.replace(target, replacement)
html = html.replace('<div class="text-center mb-10 animate-slide-up w-full">', '<div class="text-center mb-10 animate-slide-up w-full relative z-10">')
html = html.replace('<div class="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl w-full">', '<div class="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl w-full relative z-10">')

# Bust cache
html = html.replace('?v=2', '?v=3')

with open(html_path, "w", encoding="utf-8") as f:
    f.write(html)
print("Updated successfully")
