function showGlobalLoading(message) {
    const textEl = document.getElementById('loading-text');
    if (textEl) textEl.textContent = message || "Chargement...";
    document.getElementById('modal-global-loading').classList.remove('hidden-screen');
}

function hideGlobalLoading() {
    document.getElementById('modal-global-loading').classList.add('hidden-screen');
}

let childName = "";
const cart = { vert: 0, rouge: 0, bleu: 0 };
// Couleurs pour les badges
const colors = { vert: 'bg-green-100 text-green-700', rouge: 'bg-red-100 text-red-700', bleu: 'bg-blue-100 text-blue-700' };

function showScreen(idToShow) {
    ['screen-home', 'screen-menu'].forEach(id => {
        document.getElementById(id).classList.add('hidden-screen');
    });
    document.getElementById(idToShow).classList.remove('hidden-screen');
}

function showModal(idToShow) {
    document.getElementById(idToShow).classList.remove('hidden-screen');
}

function hideModal(idToHide) {
    document.getElementById(idToHide).classList.add('hidden-screen');
}

async function validerPrenom() {
    const input = document.getElementById('input-prenom').value.trim();
    if (input === "") {
        const inputEl = document.getElementById('input-prenom');
        inputEl.style.transform = 'translateX(-10px)';
        setTimeout(() => inputEl.style.transform = 'translateX(10px)', 100);
        setTimeout(() => inputEl.style.transform = 'translateX(0)', 200);
        return;
    }

    childName = input;

    showGlobalLoading("Magie en cours... ");
    hideModal('modal-name');

    try {
        const response = await fetch('/saluer', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prenom: childName })
        });
        const data = await response.json();
        console.log(`[SERVEUR] :`, data.message);
    } catch (e) {
        console.error("Erreur de connexion:", e);
    }

    hideGlobalLoading();
    document.getElementById('display-name').textContent = childName;
    showScreen('screen-menu');
}

function toggleQty(couleur) {
    const container = document.getElementById(`qty-${couleur}`);
    const card = document.getElementById(`card-${couleur}`);

    if (container.classList.contains('open')) {
        // Fermer si déjà ouvert
        container.classList.remove('open');
        card.classList.remove('candy-selected');
    } else {
        // Ouvrir
        container.classList.add('open');
        card.classList.add('candy-selected');
        if (cart[couleur] === 0) updateQty(couleur, 1);
    }
    checkCart();
}

function updateQty(couleur, change) {
    let newQty = cart[couleur] + change;
    if (newQty < 0) newQty = 0;
    if (newQty > 10) newQty = 10;

    cart[couleur] = newQty;

    // Animation du chiffre
    const valSpan = document.getElementById(`val-${couleur}`);
    valSpan.textContent = newQty;
    valSpan.style.transform = 'scale(1.5)';
    setTimeout(() => valSpan.style.transform = 'scale(1)', 150);

    if (newQty === 0) {
        document.getElementById(`qty-${couleur}`).classList.remove('open');
        document.getElementById(`card-${couleur}`).classList.remove('candy-selected');
    }

    checkCart();
}

function checkCart() {
    const total = cart.vert + cart.rouge + cart.bleu;
    const btn = document.getElementById('commander-container');
    if (total > 0) {
        btn.classList.remove('translate-y-[150%]'); // Fait monter le bouton
    } else {
        btn.classList.add('translate-y-[150%]'); // Cache le bouton
    }
}

async function commander() {
    let htmlRecap = "";
    let textLog = [];
    let choixBonbon = {};

    for (let [coul, qte] of Object.entries(cart)) {
        if (qte > 0) {
            htmlRecap += `<div class="game-panel ${colors[coul]} px-4 py-2 border-2 text-xl font-[Chewy]">${qte} ${coul.toUpperCase()}</div>`;
            textLog.push(`${qte} ${coul}`);
            choixBonbon[coul] = qte;
        }
    }

    document.getElementById('recap-commande').innerHTML = htmlRecap;
    showGlobalLoading("Envoi de la commande... 🚀");

    try {
        const response = await fetch('/choix', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ choixBb: choixBonbon })
        });
        const data = await response.json();
        console.log(`[SERVEUR] :`, data.message);
    } catch (e) {
        console.error("Erreur de connexion:", e);
    }

    hideGlobalLoading();
    showModal('modal-chargement');
}

let pollInterval = null;

async function validerChargement() {
    hideModal('modal-chargement');
    showModal('modal-loading');

    console.log(`[ROBOT] TTS: Je vérifie le tapis...`);
    
    // Clear previous interval if any
    if(pollInterval) clearInterval(pollInterval);
    
    // Polling de progression
    pollInterval = setInterval(async () => {
        try {
            const res = await fetch('/status_tri');
            if (res.ok) {
                const status = await res.json();
                let htmlContent = '';
                const colorNames = { vert: 'Vert', rouge: 'Rouge', bleu: 'Bleu' };
                const colorClasses = { vert: 'text-green-600', rouge: 'text-red-500', bleu: 'text-blue-500' };
                
                for (let c of ['vert', 'rouge', 'bleu']) {
                    if (status.initiale[c] > 0) {
                        htmlContent += `
                        <div class="grid grid-cols-3 gap-2 py-2 border-b-2 border-dashed border-gray-300 last:border-0 ${colorClasses[c]}">
                            <div>${status.initiale[c]} ${colorNames[c]}</div>
                            <div>${status.ramasse[c]} ${colorNames[c]}</div>
                            <div>${status.actuelle[c]} ${colorNames[c]}</div>
                        </div>`;
                    }
                }
                const pt = document.getElementById('progress-table');
                if (pt) pt.innerHTML = htmlContent;
            }
        } catch(e) {
            console.error("Polling error", e);
        }
    }, 800);

    try {
        const response = await fetch('/valider_chargement', { method: 'POST' });
        const data = await response.json();
        
        clearInterval(pollInterval);
        hideModal('modal-loading');
        
        if(data.status === 'error') {
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
        }
    } catch (e) {
        clearInterval(pollInterval);
        console.error(e);
        hideModal('modal-loading');
        showModal('modal-error');
    }
}

function retryOrder() {
    hideModal('modal-error');
    hideModal('modal-success');
    hideModal('modal-error');
    hideModal('modal-chargement');
    hideModal('modal-loading');
    // Le background est déjà 'screen-menu'
}

function cancelOrder() {
    hideModal('modal-chargement');
}

function resetApp() {

    // Remise à zéro
    childName = "";
    document.getElementById('input-prenom').value = "";
    cart.vert = 0; cart.rouge = 0; cart.bleu = 0;

    ['vert', 'rouge', 'bleu'].forEach(c => {
        document.getElementById(`val-${c}`).textContent = "0";
        document.getElementById(`qty-${c}`).classList.remove('open');
        document.getElementById(`card-${c}`).classList.remove('candy-selected');
    });
    checkCart();

    hideModal('modal-success');
    hideModal('modal-error');
    showScreen('screen-home');
}

// Ensure the element exists before adding listener to avoid errors in some edge cases
document.addEventListener('DOMContentLoaded', () => {
    const inputPrenom = document.getElementById('input-prenom');
    if (inputPrenom) {
        inputPrenom.addEventListener('keypress', function (e) {
            if (e.key === 'Enter') validerPrenom();
        });
    }
});