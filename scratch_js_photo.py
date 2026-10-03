import os

js_path = r"d:\PYTHON'S\sort_candy\static\main.js"
with open(js_path, "r", encoding="utf-8") as f:
    js = f.read()

new_success_logic = """        if(data.status === 'error') {
            const errMsg = document.getElementById('error-message-txt');
            if(errMsg) errMsg.textContent = data.message;
            showModal('modal-error');
        } else {
            showModal('modal-success');
            
            // Gestion de la photo
            const imgEl = document.getElementById('robot-photo');
            const loadingEl = document.getElementById('photo-loading');
            
            if (imgEl && loadingEl) {
                imgEl.classList.add('hidden');
                loadingEl.classList.remove('hidden');
                
                if (data.photo) {
                    imgEl.onload = () => {
                        loadingEl.classList.add('hidden');
                        imgEl.classList.remove('hidden');
                    };
                    imgEl.src = data.photo;
                }
            }
        }"""

import re
js = re.sub(
    r"if\(data\.status === 'error'\) \{.*?showModal\('modal-success'\);\n\s*\}",
    new_success_logic,
    js,
    flags=re.DOTALL
)

with open(js_path, "w", encoding="utf-8") as f:
    f.write(js)
