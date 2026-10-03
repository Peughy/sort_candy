import os
html_path = r"d:\PYTHON'S\sort_candy\templates\index.html"
with open(html_path, "r", encoding="utf-8") as f:
    html = f.read()

error_modal = """
    <!-- Modal Erreur (Timeout bonbons introuvables) -->
    <div id="modal-error" class="hidden-screen fixed inset-0 bg-red-900/60 z-50 flex items-center justify-center backdrop-blur-md p-4">
        <div class="game-panel w-full max-w-lg p-6 text-center animate-pop-in border-red-500 border-8 bg-red-50">
            <h2 class="title-cartoon text-6xl text-red-500 mb-4" style="text-shadow: 2px 2px 0 var(--text-dark);">Oh non... 😢</h2>
            <p id="error-message-txt" class="text-2xl font-bold mb-6 text-red-800">Je n'ai pas trouvé tous les bonbons !</p>
            <button onclick="resetApp()" class="btn-game w-full text-2xl" style="background-color: #ff4757; box-shadow: 0px 8px 0px #c0392b;">
                Recommencer 🔄
            </button>
        </div>
    </div>
"""

html = html.replace('<!-- Global Loading Modal', error_modal + '\n    <!-- Global Loading Modal')
html = html.replace('?v=4', '?v=5').replace('?v=5', '?v=6')

with open(html_path, "w", encoding="utf-8") as f:
    f.write(html)
