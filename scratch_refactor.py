import os
import re

base_dir = r"d:\PYTHON'S\sort_candy"
html_path = os.path.join(base_dir, "templates", "index.html")

with open(html_path, "r", encoding="utf-8") as f:
    html_content = f.read()

# Extract <style>
style_match = re.search(r"<style>(.*?)</style>", html_content, re.DOTALL)
style_text = style_match.group(1) if style_match else ""

# Extract <script>
script_match = re.search(r"<script>(.*?)</script>", html_content, re.DOTALL)
script_text = script_match.group(1) if script_match else ""

# Remove them from HTML
html_content = re.sub(r"<style>.*?</style>", '<link rel="stylesheet" href="/static/style.css">', html_content, flags=re.DOTALL)

# Build the new script part
# Add global loader HTML before the external script tag
loader_html = """
    <!-- Global Loading Modal (Theme Saveur Savante) -->
    <div id="modal-global-loading" class="hidden-screen fixed inset-0 bg-[#FFF0F5]/90 z-[100] flex flex-col items-center justify-center backdrop-blur-sm">
        <div class="text-center animate-bounce-slow">
            <div class="text-8xl animate-spin-slow mb-6 inline-block" style="filter: drop-shadow(0px 10px 10px rgba(0,0,0,0.2));">🍭</div>
            <h2 id="loading-text" class="title-cartoon text-5xl text-primary" style="text-shadow: 2px 2px 0 var(--text-dark);">Chargement...</h2>
        </div>
    </div>
"""

html_content = re.sub(
    r"<script>.*?</script>", 
    loader_html + '\n    <script src="/static/main.js"></script>', 
    html_content, 
    flags=re.DOTALL
)

# Write modified HTML
with open(html_path, "w", encoding="utf-8") as f:
    f.write(html_content)

# Create static directory
static_dir = os.path.join(base_dir, "static")
os.makedirs(static_dir, exist_ok=True)

# Write style.css
with open(os.path.join(static_dir, "style.css"), "w", encoding="utf-8") as f:
    f.write(style_text)
    f.write("\n/* Animations de chargement (loading) */\n")
    f.write(".animate-spin-slow { animation: spin 2.5s linear infinite; }\n")
    f.write("@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }\n")

# Refactor JS
new_js = """
function showGlobalLoading(message) {
    const textEl = document.getElementById('loading-text');
    if (textEl) textEl.textContent = message || "Chargement...";
    document.getElementById('modal-global-loading').classList.remove('hidden-screen');
}

function hideGlobalLoading() {
    document.getElementById('modal-global-loading').classList.add('hidden-screen');
}

"""

# modify validerPrenom
js_parts = script_text.split("function validerPrenom() {")
part1 = js_parts[0]
part2 = "async function validerPrenom() {" + js_parts[1]

# replace logic inside validerPrenom
old_prenom_logic = """
            childName = input;
            document.getElementById('display-name').textContent = childName;
            
            hideModal('modal-name');
            showScreen('screen-menu');
            
            // Console log pour faire le lien avec le script Python (TTS)
            console.log(`[ROBOT] TTS: Bonjour ${childName} !`);"""

new_prenom_logic = """
            childName = input;
            
            showGlobalLoading("Magie en cours... ✨");
            hideModal('modal-name');
            
            try {
                const response = await fetch('/saluer', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ prenom: childName })
                });
                const data = await response.json();
                console.log(`[SERVEUR] :`, data.message);
            } catch(e) {
                console.error("Erreur de connexion:", e);
            }
            
            hideGlobalLoading();
            document.getElementById('display-name').textContent = childName;
            showScreen('screen-menu');"""

part2 = part2.replace(old_prenom_logic.strip(), new_prenom_logic.strip())

# modify commander logic
old_commander_logic = """
            document.getElementById('recap-commande').innerHTML = htmlRecap;
            showModal('modal-chargement');
            
            console.log(`[ROBOT] TTS: Commande reçue : ${textLog.join(', ')}.`);"""

new_commander_logic = """
            document.getElementById('recap-commande').innerHTML = htmlRecap;
            
            showGlobalLoading("Envoi de la commande... 🚀");
            setTimeout(() => {
                hideGlobalLoading();
                showModal('modal-chargement');
                console.log(`[ROBOT] TTS: Commande reçue : ${textLog.join(', ')}.`);
            }, 1500);"""

part2 = part2.replace(old_commander_logic.strip(), new_commander_logic.strip())

with open(os.path.join(static_dir, "main.js"), "w", encoding="utf-8") as f:
    f.write(new_js + part1 + part2)

print("HTML, CSS et JS séparés avec succès.")
