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
    ['screen-home', 'screen-menu', 'screen-quiz', 'screen-logic-game'].forEach(id => {
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
    showModal('modal-choice'); // On affiche la modale de choix de parcours
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

// ==================== MINI-JEU LOGIQUE ====================
const logicStepsBase = [
    { id: 1, text: "Je me place au-dessus", img: "/static/images/im1.jpeg" },
    { id: 2, text: "J'attrape le bonbon", img: "/static/images/im2.jpeg" },
    { id: 3, text: "Je le dépose sur le tapis", img: "/static/images/im3.jpeg" },
    { id: 4, text: "Le tapis avance", img: "/static/images/im4.jpeg" },
    { id: 5, text: "J'attrape à la fin du tapis", img: "/static/images/im5.jpeg" },
    { id: 6, text: "Je le lâche dans le bac", img: "/static/images/im6.jpeg" }
];

let logicDeck = [];
let logicSlots = [null, null, null, null, null, null];
let isLogicLevel2 = false;

function startLogicGameDemo() {
    isLogicLevel2 = false;
    showScreen('screen-logic-game');
    document.getElementById('logic-instructions').textContent = "Lis bien ces étapes pour comprendre comment je fonctionne.";
    document.getElementById('logic-divider').classList.add('hidden');
    document.getElementById('logic-deck').classList.add('hidden');
    document.getElementById('btn-logic-shuffle').classList.add('hidden');

    const btnAction = document.getElementById('btn-logic-action');
    btnAction.textContent = "🤖 Lancer la démo du robot !";
    btnAction.onclick = async () => {
        btnAction.disabled = true;
        btnAction.textContent = "Démo en cours...";
        try {
            await fetch('/run_demo', { method: 'POST' });
        } catch (e) { }
        btnAction.disabled = false;
        btnAction.textContent = "J'ai compris, on joue !";
        btnAction.onclick = shuffleAndStartLogic;
    };
    btnAction.classList.remove('hidden');

    logicSlots = [...logicStepsBase]; // Fill with correct sequence
    renderLogicGame(true); // true = demo mode (no clicking)
}

function startLogicLevel2() {
    isLogicLevel2 = true;
    showScreen('screen-logic-game');
    document.getElementById('logic-instructions').textContent = "NIVEAU 2 : Attention, certaines étapes sont cachées ! Retrouve l'ordre.";

    // Shuffle logicDeck with level 2 modifier
    let mixed = [...logicStepsBase].sort(() => Math.random() - 0.5);
    logicDeck = mixed.map((step, idx) => {
        // Hide every other text randomly for level 2
        return {
            ...step,
            isHiddenText: Math.random() > 0.5 // 50% chance to hide text and show "?"
        };
    });

    logicSlots = [null, null, null, null, null, null];

    document.getElementById('logic-divider').classList.remove('hidden');
    document.getElementById('logic-deck').classList.remove('hidden');
    document.getElementById('btn-logic-shuffle').classList.remove('hidden');

    const btnAction = document.getElementById('btn-logic-action');
    btnAction.textContent = "Vérifier ma réponse !";
    btnAction.onclick = validateLogicGame;
    btnAction.classList.remove('hidden');

    renderLogicGame(false);
}

function shuffleAndStartLogic() {
    document.getElementById('logic-instructions').textContent = "Clique sur les cartes en bas pour les remettre dans le bon ordre en haut !";
    document.getElementById('logic-divider').classList.remove('hidden');
    document.getElementById('logic-deck').classList.remove('hidden');
    document.getElementById('btn-logic-shuffle').classList.remove('hidden');

    const btnAction = document.getElementById('btn-logic-action');
    btnAction.textContent = "Vérifier ma réponse !";
    btnAction.onclick = validateLogicGame;

    // Mélange des cartes
    logicDeck = [...logicStepsBase].sort(() => Math.random() - 0.5);
    // Reset hidden text for level 1
    logicDeck = logicDeck.map(step => ({ ...step, isHiddenText: false }));
    logicSlots = [null, null, null, null, null, null];

    renderLogicGame(false);
}

function shuffleDeckOnly() {
    logicDeck = logicDeck.sort(() => Math.random() - 0.5);
    renderLogicGame(false);
}

function renderLogicGame(isDemo) {
    const slotsContainer = document.getElementById('logic-slots');
    const deckContainer = document.getElementById('logic-deck');

    slotsContainer.innerHTML = '';
    deckContainer.innerHTML = '';

    // Render slots (Top)
    logicSlots.forEach((slotData, index) => {
        const slotEl = document.createElement('div');
        slotEl.className = 'w-full min-h-[160px] md:min-h-[220px] flex flex-col items-center justify-center p-2 text-center transition-all cursor-pointer relative border-4 border-dashed rounded-xl ' +
            (slotData ? 'border-[#4D9DE0] bg-blue-50' : 'border-gray-300 bg-gray-50');

        const numBadge = document.createElement('div');
        numBadge.className = 'absolute -top-3 -left-3 w-8 h-8 bg-[#FFC933] border-2 border-[#3D2314] rounded-full flex items-center justify-center font-bold font-[Chewy] text-xl z-10';
        numBadge.textContent = index + 1;
        slotEl.appendChild(numBadge);

        if (slotData) {
            if (!slotData.isHiddenText) {
                const imgEl = document.createElement('img');
                imgEl.src = slotData.img;
                imgEl.className = 'h-32 md:h-40 w-auto max-w-full object-contain mx-auto rounded pointer-events-none mb-2 border border-gray-300 bg-white';
                imgEl.onerror = () => { imgEl.style.display = 'none'; }; // Hide if image missing
                slotEl.appendChild(imgEl);
            }

            const textEl = document.createElement('span');
            textEl.className = 'font-[Quicksand] font-bold text-[#3D2314] text-sm md:text-base pointer-events-none leading-tight';
            textEl.textContent = slotData.isHiddenText ? "??? (Mystère) ???" : slotData.text;
            slotEl.appendChild(textEl);

            if (!isDemo) {
                slotEl.onclick = () => returnCardToDeck(index);
                slotEl.classList.add('hover:bg-red-50', 'hover:border-red-400');
            }
        } else {
            const placeholder = document.createElement('span');
            placeholder.className = 'text-gray-400 font-bold';
            placeholder.textContent = 'Vide';
            slotEl.appendChild(placeholder);
        }

        slotsContainer.appendChild(slotEl);
    });

    // Render deck (Bottom)
    logicDeck.forEach((cardData, deckIndex) => {
        if (cardData === null) return;

        const cardEl = document.createElement('div');
        cardEl.className = 'w-full min-h-[160px] md:min-h-[220px] flex flex-col items-center justify-center p-2 bg-white border-4 border-[#FF5A92] rounded-xl text-center cursor-pointer hover:-translate-y-1 hover:shadow-lg transition-transform shadow';

        if (!cardData.isHiddenText) {
            const imgEl = document.createElement('img');
            imgEl.src = cardData.img;
            imgEl.className = 'h-32 md:h-40 w-auto max-w-full object-contain mx-auto rounded pointer-events-none mb-2 border border-gray-300 bg-white';
            imgEl.onerror = () => { imgEl.style.display = 'none'; }; // Hide if image missing
            cardEl.appendChild(imgEl);
        }

        const textEl = document.createElement('span');
        textEl.className = 'font-[Quicksand] font-bold text-[#3D2314] text-sm md:text-base pointer-events-none leading-tight';
        textEl.textContent = cardData.isHiddenText ? "??? (Mystère) ???" : cardData.text;

        cardEl.appendChild(textEl);
        cardEl.onclick = () => moveCardToSlot(deckIndex);

        deckContainer.appendChild(cardEl);
    });
}

function moveCardToSlot(deckIndex) {
    const emptySlotIndex = logicSlots.findIndex(s => s === null);
    if (emptySlotIndex !== -1) {
        logicSlots[emptySlotIndex] = logicDeck[deckIndex];
        logicDeck.splice(deckIndex, 1);
        renderLogicGame(false);
    }
}

function returnCardToDeck(slotIndex) {
    if (logicSlots[slotIndex]) {
        logicDeck.push(logicSlots[slotIndex]);
        logicSlots[slotIndex] = null;
        renderLogicGame(false);
    }
}

function validateLogicGame() {
    // Check if full
    if (logicSlots.includes(null)) {
        alert("Place toutes les cartes avant de vérifier !");
        return;
    }

    // Check order
    let isWin = true;
    logicSlots.forEach((slot, index) => {
        if (slot.id !== index + 1) {
            isWin = false;
        }
    });

    if (isWin) {
        showModal('modal-logic-success');
    } else {
        // Tremblement et message
        const slotsContainer = document.getElementById('logic-slots');
        slotsContainer.classList.add('animate-bounce-slow');
        setTimeout(() => slotsContainer.classList.remove('animate-bounce-slow'), 500);
        alert("Oups ! L'ordre n'est pas le bon. Le robot est perdu ! Réessaie.");
    }
}
