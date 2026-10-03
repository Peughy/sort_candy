import time
from fastapi import FastAPI, Request
from fastapi.templating import Jinja2Templates
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from pyniryo import NiryoRobot, ConveyorDirection, ObjectColor, ObjectShape, PoseObject

# ==========================================
# CONFIGURATION ET CONNEXION AU ROBOT NIRYO
# ==========================================
ROBOT_IP = '169.254.200.200'

try:
    print(f"🔌 Tentative de connexion au robot sur {ROBOT_IP}...")
    robot = NiryoRobot(ROBOT_IP)
    robot.calibrate_auto()
    robot.update_tool()
    
    # Initialisation du convoyeur (tapis roulant)
    conveyor_id = robot.set_conveyor()
    
    # Position d'attente pour que la caméra puisse voir le tapis
    OBSERVATION_POSE = [0.106, -0.059, 0.28, -2.686, 1.406, 2.691]
    print("🤖 Positionnement en mode observation...")
    robot.move(PoseObject(*OBSERVATION_POSE))
    
    ROBOT_CONNECTE = True
    print("✅ Robot connecté, calibré et prêt !")

except Exception as e:
    print(f"⚠️ Impossible de se connecter au robot : {e}")
    print("⚠️ Démarrage du serveur web en mode SIMULATION.")
    ROBOT_CONNECTE = False
    robot = None
    conveyor_id = None
# ==========================================

app = FastAPI()
app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")

class InfoEnfant(BaseModel):
    prenom: str

class ChoixEnfant(BaseModel):
    choixBb: dict

@app.get("/", response_class=HTMLResponse)
async def afficher_accueil(request: Request):
    return templates.TemplateResponse(name="index.html", request={"request": request})

@app.post("/saluer")
async def saluer_enfant(enfant: InfoEnfant):
    time.sleep(1.5)
    print(f"👦 Nouvelle session pour : {enfant.prenom}")
    return {"status": "ok", "message": f"Bonjour {enfant.prenom}"}

@app.post('/choix')
async def choix_enfant(choixEnfant: ChoixEnfant):
    print(f"📦 Commande reçue : {choixEnfant.choixBb}")
    return {"status": "ok", "message": f"Choix reçu, en attente de la validation du chargement."}

@app.post('/valider_chargement')
async def demarrer_tri():
    print("🚀 L'enfant a cliqué sur 'C'est prêt !'")
    
    # ACTION ROBOT : On allume ENFIN le tapis roulant !
    if ROBOT_CONNECTE:
        print("⚙️ Démarrage du convoyeur (vitesse 50)...")
        robot.run_conveyor(conveyor_id, speed=50, direction=ConveyorDirection.FORWARD)
    else:
        print("[SIMULATION] ⚙️ Le tapis roulant démarre virtuellement...")
        time.sleep(3) # On simule un délai pour l'animation côté web
        
    return {"status": "ok", "message": "Le tri a commencé !"}