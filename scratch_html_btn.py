import os

html_path = r"d:\PYTHON'S\sort_candy\templates\index.html"
with open(html_path, "r", encoding="utf-8") as f:
    html = f.read()

# Replace resetApp() with retryOrder() in the error modal
html = html.replace('onclick="resetApp()" class="btn-game w-full text-2xl" style="background-color: #ff4757; box-shadow: 0px 8px 0px #c0392b;"',
                    'onclick="retryOrder()" class="btn-game w-full text-2xl" style="background-color: #ff4757; box-shadow: 0px 8px 0px #c0392b;"')

# Add "Modifier ma commande" button in modal-chargement
old_btn = """<button onclick="validerChargement()" class="btn-game btn-game-yellow w-full text-3xl">
                C'est prêt ! ✨
            </button>"""

new_btns = """<button onclick="validerChargement()" class="btn-game btn-game-yellow w-full text-3xl mb-4">
                C'est prêt ! ✨
            </button>
            <button onclick="cancelOrder()" class="btn-game w-full text-2xl" style="background-color: #f1f2f6; color: #3D2314; box-shadow: 0px 8px 0px #dcdde1;">
                ⬅️ Modifier ma commande
            </button>"""

# If the emojis were mangled, let's just insert before the closing div of modal-chargement
# Actually a regex is safer
import re
html = re.sub(
    r'<button onclick="validerChargement\(\)" class="btn-game btn-game-yellow w-full text-3xl">.*?C\'est prêt !.*?</button>',
    new_btns,
    html,
    flags=re.DOTALL
)

html = html.replace('?v=6', '?v=7').replace('?v=5', '?v=7')

with open(html_path, "w", encoding="utf-8") as f:
    f.write(html)
