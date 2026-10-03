import os

js_path = r"d:\PYTHON'S\sort_candy\static\main.js"
with open(js_path, "r", encoding="utf-8") as f:
    js = f.read()

new_functions = """
function retryOrder() {
    hideModal('modal-error');
    hideModal('modal-success');
    hideModal('modal-chargement');
    hideModal('modal-loading');
    // Le background est déjà 'screen-menu'
}

function cancelOrder() {
    hideModal('modal-chargement');
}

function resetApp() {
"""

js = js.replace('function resetApp() {', new_functions)
js = js.replace("hideModal('modal-success');", "hideModal('modal-success');\n    hideModal('modal-error');")

with open(js_path, "w", encoding="utf-8") as f:
    f.write(js)
