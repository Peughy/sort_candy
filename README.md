# 🍭 La Maison des Délices (Sort Candy)

Bienvenue dans le projet **La Maison des Délices**, une installation interactive permettant à un bras robotique (Niryo) de préparer automatiquement une commande de bonbons personnalisée !

Ce projet allie une interface web amusante pour les enfants, une API rapide en Python, et un contrôle matériel complet avec un bras robotisé, une caméra (OpenCV), et un tapis roulant.

## 📸 Aperçu du Projet

_(Insérez vos photos ici !)_

### L'Interface Utilisateur

![L'interface web - Choix des bonbons](static/readme%20img/photo%20choix.jpeg)
_L'interface web ludique où l'enfant passe sa commande de bonbons._

![L'interface web - Choix des bonbons](static/readme%20img/platform.jpeg)
_L'interface web ludique où l'enfant lance la demo de tri_

### Le Robot en Action

![Le robot Niryo triant les bonbons](static/readme%20img/robot.jpeg)
_Le bras Niryo scannant et triant les bonbons sur le tapis roulant._

---

## Fonctionnalités

- **Application Web Interactive** : Thème dessin animé avec transitions animées, gérée en HTML/JS pur avec TailwindCSS.
- **Serveur Asynchrone** : API propulsée par **FastAPI**.
- **Contrôle Robotique** :
  - Détection d'objets (bonbons) sur le tapis roulant via **vision par ordinateur (OpenCV / PyNiryo)**.
  - Sélection intelligente : le robot attrape uniquement les couleurs demandées et laisse passer le reste.
  - Suivi en temps réel de la progression (ramassés / restants) via un système de "polling" (AJAX).
  - Prise de photo-souvenir de la commande terminée, envoyée en Base64 au site web.
- **Mode Simulation Intégré** : Si le robot n'est pas branché, le serveur simule un temps de recherche et génère de fausses photos pour continuer à travailler sur le design du site web !

---

## Installation & Lancement

1. **Prérequis** :
   - Python 3.12+
   - FastAPI, Uvicorn, PyNiryo, OpenCV, Pydantic

2. **Installation des dépendances** :

   ```bash
   pip install fastapi uvicorn pyniryo opencv-python pydantic
   ```

3. **Lancement du serveur** :
   ```bash
   uvicorn main:app --reload
   ```
   > Le serveur tourne par défaut sur `http://127.0.0.1:8000`

## Architecture

- `main.py` : Le serveur FastAPI et la logique de pilotage du Niryo.
- `templates/index.html` : L'interface web de la "Maison des Délices".
- `static/main.js` : La logique dynamique (animations, pop-ups, communication avec l'API).
- `static/style.css` : Le design et les animations CSS.

---

_Projet conçu pour explorer l'intégration matériel/logiciel (Vision par Ordinateur + Web) de façon ludique !_
