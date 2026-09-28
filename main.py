import time
import threading
from fastapi import FastAPI, Request
from fastapi.templating import Jinja2Templates
from fastapi.responses import HTMLResponse
from pydantic import BaseModel
import os

# Import des modules Niryo (à décommenter sur le vrai setup)
# from pyniryo import NiryoRobot, ConveyorID, ConveyorDirection, ObjectColor, ObjectShape
# from gtts import gTTS

app = FastAPI()
# Indique à FastAPI où se trouve le fichier HTML (dossier 'templates')
templates = Jinja2Templates(directory="templates") 

# --- STRUCTURES DE DONNÉES (Validation FastAPI) ---
class Enfant(BaseModel):
    prenom: str

class Commande(BaseModel):
    vert: int
    rouge: int
    bleu: int

# --- VARIABLES GLOBALES (Communication Web <-> Robot) ---
etat_robot = {
    "prenom": "",
    "commande_en_cours": None,
    "statut": "repos" # repos, parle, tri, termine
}

# --- THREAD DU ROBOT (S'exécute en parallèle) ---
def boucle_robotique():
    """Gère les actions physiques en lisant les variables globales"""
    print("[ROBOT] Thread démarré, en attente d'instructions...")
    
    # Initialisation théorique du robot
    # robot = NiryoRobot("169.254.200.200")
    # robot.calibrate_auto()
    
    while True:
        if etat_robot["statut"] == "nouveau_prenom":
            texte = f"Bonjour {etat_robot['prenom']} !"
            print(f"[ROBOT PARLE] : {texte}")
            # tts = gTTS(text=texte, lang='fr'); tts.save("bonjour.mp3"); os.system("mpg123 bonjour.mp3")
            etat_robot["statut"] = "repos"
            
        elif etat_robot["statut"] == "nouvelle_commande":
            c = etat_robot["commande_en_cours"]
            texte = f"Commande reçue : {c.vert} verts, {c.rouge} rouges, {c.bleu} bleus."
            print(f"[ROBOT PARLE] : {texte}")
            etat_robot["statut"] = "attente_chargement"
            
        elif etat_robot["statut"] == "traitement":
            print("[ROBOT] Je regarde le tapis avec la caméra...")
            time.sleep(1) # Simulation de la photo
            print("[ROBOT] Photo prise ! Démarrage du tri (Boucle Jour 4)...")
            
            # --- ICI VIENT LA BOUCLE DU JOUR 4 (Recherche de bonbons) ---
            time.sleep(2) # Simulation du temps de tri
            
            print("[ROBOT] Tri terminé !")
            etat_robot["statut"] = "termine"
            
        time.sleep(0.5)

# Lancement du processus robot
thread_robot = threading.Thread(target=boucle_robotique, daemon=True)
thread_robot.start()


# --- ROUTES FASTAPI (Écoutent la page web) ---

@app.get("/", response_class=HTMLResponse)
async def accueil(request: Request):
    # Charge le fichier main.html depuis le dossier templates
    return templates.TemplateResponse("index.html", {"request": request})

@app.post("/api/prenom")
async def recevoir_prenom(enfant: Enfant):
    etat_robot["prenom"] = enfant.prenom
    etat_robot["statut"] = "nouveau_prenom"
    return {"status": "ok"}

@app.post("/api/commande")
async def recevoir_commande(cmd: Commande):
    etat_robot["commande_en_cours"] = cmd
    etat_robot["statut"] = "nouvelle_commande"
    return {"status": "ok"}

@app.post("/api/valider_chargement")
async def demarrer_tri():
    etat_robot["statut"] = "traitement"
    return {"status": "ok"}