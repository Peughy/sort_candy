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
    ['screen-home', 'screen-menu', 'screen-quiz'].forEach(id => {
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
    showModal('modal-intro-quiz'); // On affiche la modale d'intro au lieu de lancer directement
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
    showGlobalLoading("Envoi de la commande...");

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
    if (pollInterval) clearInterval(pollInterval);

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
        } catch (e) {
            console.error("Polling error", e);
        }
    }, 800);

    try {
        const response = await fetch('/valider_chargement', { method: 'POST' });
        const data = await response.json();

        clearInterval(pollInterval);
        hideModal('modal-loading');

        if (data.status === 'error') {
            const errMsg = document.getElementById('error-message-txt');
            if (errMsg) errMsg.textContent = data.message;
            
            const recapDetails = document.getElementById('error-recap-details');
            const recapContent = document.getElementById('error-recap-content');
            
            if (recapDetails && recapContent && data.details) {
                let html = '';
                const colorNames = { vert: 'Vert', rouge: 'Rouge', bleu: 'Bleu' };
                const colorClasses = { vert: 'text-green-600', rouge: 'text-red-500', bleu: 'text-blue-500' };
                for (let c of ['vert', 'rouge', 'bleu']) {
                    if (data.details.initiale[c] > 0) {
                        html += `
                        <div class="${colorClasses[c]}">${data.details.ramasse[c]} ${colorNames[c]}</div>
                        <div class="${colorClasses[c]} font-bold">${data.details.actuelle[c]} ${colorNames[c]}</div>
                        `;
                    }
                }
                recapContent.innerHTML = html;
                recapDetails.classList.remove('hidden');
            }
            
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

function retryQuizAfterError() {
    hideModal('modal-error');
    hideModal('modal-success');
    hideModal('modal-chargement');
    hideModal('modal-loading');
    
    // Réinitialiser le panier
    cart.vert = 0; cart.rouge = 0; cart.bleu = 0;
    ['vert', 'rouge', 'bleu'].forEach(c => {
        document.getElementById(`qty-${c}`).classList.remove('open');
        document.getElementById(`card-${c}`).classList.remove('candy-selected');
        document.getElementById(`val-${c}`).textContent = 0;
    });
    checkCart();
    
    // Relancer le quiz
    startQuiz();
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


// ==========================================
// GESTION DU QUIZ
// ==========================================
let currentQuiz = [];
let currentQuestionIndex = 0;
let score = 0;

function melangerTableau(array) {
    let arrayCopy = [...array];
    for (let i = arrayCopy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arrayCopy[i], arrayCopy[j]] = [arrayCopy[j], arrayCopy[i]];
    }
    return arrayCopy;
}

function startQuiz() {
    // Si 'Questions' n'est pas chargé (erreur réseau), on passe direct au menu
    if (typeof Questions === 'undefined' || Questions.length === 0) {
        showScreen('screen-menu');
        return;
    }

    currentQuiz = melangerTableau(Questions).slice(0, 6);
    currentQuestionIndex = 0;
    score = 0;

    showScreen('screen-quiz');
    updateQuizUI();
}

function updateQuizUI() {
    const qData = currentQuiz[currentQuestionIndex];

    // Mise à jour de la barre de progression
    const progressText = document.getElementById('quiz-progress-text');
    const progressBar = document.getElementById('quiz-progress-bar');
    if (progressText) progressText.textContent = `${currentQuestionIndex + 1} / 6`;
    if (progressBar) progressBar.style.width = `${((currentQuestionIndex) / 6) * 100}%`;

    // Texte de la question
    const qText = document.getElementById('quiz-question-text');
    if (qText) {
        qText.style.opacity = 0;
        setTimeout(() => {
            qText.textContent = qData.question;
            qText.style.opacity = 1;
        }, 200);
    }

    // Génération des boutons de réponse
    const ansContainer = document.getElementById('quiz-answers');
    if (ansContainer) {
        ansContainer.innerHTML = '';
        qData.reponses.forEach((rep, index) => {
            const btn = document.createElement('button');
            btn.className = 'btn-game bg-white text-[#3D2314] border-4 border-[#3D2314] [text-shadow:none] hover:bg-yellow-50 py-4 px-6 text-2xl w-full text-center transition-all';
            btn.textContent = rep;
            btn.onclick = () => handleAnswer(index, btn);
            ansContainer.appendChild(btn);
        });
    }
}

function handleAnswer(selectedIndex, btnElement) {
    // Désactiver tous les boutons pour éviter les doubles clics
    const buttons = document.querySelectorAll('#quiz-answers button');
    buttons.forEach(b => b.disabled = true);

    const qData = currentQuiz[currentQuestionIndex];
    const isCorrect = (selectedIndex === qData.correction);

    if (isCorrect) {
        score++;
        btnElement.classList.remove('bg-white', 'text-[#3D2314]', 'hover:bg-yellow-50');
        btnElement.classList.add('bg-green-500', 'text-white', 'border-green-700');
    } else {
        btnElement.classList.remove('bg-white', 'text-[#3D2314]', 'hover:bg-yellow-50');
        btnElement.classList.add('bg-red-500', 'text-white', 'border-red-700');

        // Mettre le bon en vert
        if (buttons[qData.correction]) {
            buttons[qData.correction].classList.remove('bg-white', 'text-[#3D2314]', 'hover:bg-yellow-50');
            buttons[qData.correction].classList.add('bg-green-500', 'text-white', 'border-green-700');
        }
    }

    setTimeout(() => {
        currentQuestionIndex++;
        if (currentQuestionIndex < 6) {
            updateQuizUI();
        } else {
            finishQuiz();
        }
    }, 2000); // 1.5s pour voir la correction
}

function finishQuiz() {
    // Mise à jour de la barre à 100%
    const progressBar = document.getElementById('quiz-progress-bar');
    if (progressBar) progressBar.style.width = '100%';

    setTimeout(() => {
        showModal('modal-quiz-result');
        const titleEl = document.getElementById('quiz-result-title');
        const msgEl = document.getElementById('quiz-result-msg');
        const btnContainer = document.getElementById('quiz-result-buttons');

        btnContainer.innerHTML = '';

        if (score >= 3) {
            titleEl.textContent = 'Bravo !';
            titleEl.className = 'title-cartoon text-6xl mb-4 text-green-500';
            msgEl.textContent = `Félicitations ${childName} ! Tu as eu ${score}/6. Tu as mérité tes bonbons !`;

            const btnNext = document.createElement('button');
            btnNext.className = 'btn-game btn-game-yellow w-full text-3xl';
            btnNext.textContent = 'Choisir mes bonbons !';
            btnNext.onclick = () => {
                hideModal('modal-quiz-result');
                showScreen('screen-menu');
            };
            btnContainer.appendChild(btnNext);
        } else {
            titleEl.textContent = 'Dommage !';
            titleEl.className = 'title-cartoon text-6xl mb-4 text-red-500';
            msgEl.textContent = `Tu as eu ${score}/6, ${childName}. Il faut au moins 3 bonnes réponses pour accéder à la machine.`;

            const btnRetry = document.createElement('button');
            btnRetry.className = 'btn-game w-full text-2xl';
            btnRetry.style.backgroundColor = '#ff4757';
            btnRetry.style.color = 'white';
            btnRetry.textContent = 'Recommencer le Quiz';
            btnRetry.onclick = () => {
                hideModal('modal-quiz-result');
                startQuiz();
            };
            btnContainer.appendChild(btnRetry);

            const btnHome = document.createElement('button');
            btnHome.className = 'btn-game w-full text-xl mt-2';
            btnHome.style.backgroundColor = '#f1f2f6';
            btnHome.style.color = '#3D2314';
            btnHome.textContent = 'Retour à l\'accueil';
            btnHome.onclick = () => {
                hideModal('modal-quiz-result');
                resetApp();
            };
            btnContainer.appendChild(btnHome);
        }
    }, 500);
}