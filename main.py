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
WORKSPACE_NAME = "convoyeur_bonbon"

# Poses
OBSERVATION_POSE = [0.106, -0.059, 0.28, -2.686, 1.406, 2.691]
PLATEAU_POSE = [0.13, 0.251, 0.069, -2.368, 1.48, -1.596]

try:
    print(f"🔌 Tentative de connexion au robot sur {ROBOT_IP}...")
    robot = NiryoRobot(ROBOT_IP)
    robot.calibrate_auto()
    robot.update_tool()
    
    conveyor_id = robot.set_conveyor()
    
    print("🤖 Positionnement en mode observation...")
    robot.move_pose(PoseObject(*OBSERVATION_POSE))
    
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

# Variables globales pour suivre la commande
commande_actuelle = {"vert": 0, "rouge": 0, "bleu": 0}

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
    global commande_actuelle
    print(f"📦 Commande reçue : {choixEnfant.choixBb}")
    
    # On enregistre la commande pour le robot
    commande_actuelle = {"vert": 0, "rouge": 0, "bleu": 0}
    for couleur, qte in choixEnfant.choixBb.items():
        commande_actuelle[couleur] = qte
        
    return {"status": "ok", "message": "Choix reçu, en attente du chargement."}

@app.post('/valider_chargement')
async def demarrer_tri():
    global commande_actuelle
    print("🚀 L'enfant a cliqué sur 'C'est prêt !'")
    
    # ---------------- SIMULATION ----------------
    if not ROBOT_CONNECTE:
        print("[SIMULATION] ⚙️ Le tapis roulant démarre virtuellement...")
        time.sleep(3) 
        # On simule un timeout si on demande trop de bonbons
        if sum(commande_actuelle.values()) > 5:
            return {"status": "error", "message": "Oups ! Je n'ai pas trouvé assez de bonbons sur le tapis !"}
        return {"status": "ok", "message": "Tri terminé !"}
    # --------------------------------------------

    # ----------- LOGIQUE RÉELLE ROBOT -----------
    print("⚙️ Démarrage du convoyeur (vitesse 50)...")
    robot.run_conveyor(conveyor_id, speed=50, direction=ConveyorDirection.FORWARD)
    
    time_start = time.time()
    
    # Dictionnaire inversé pour lier le retour caméra (ex: GREEN) avec notre code (ex: vert)
    inv_mapping = {"GREEN": "vert", "RED": "rouge", "BLUE": "bleu"}
    
    while sum(commande_actuelle.values()) > 0:
        # Vérification du timeout (25 secondes)
        if time.time() - time_start > 25:
            print("❌ Erreur : Timeout de 25s dépassé.")
            robot.stop_conveyor(conveyor_id)
            return {"status": "error", "message": "Oups ! Je n'ai pas trouvé assez de bonbons sur le tapis !"}
            
        try:
            # On cherche N'IMPORTE QUEL objet sur le tapis
            has_obj, obj_pose, obj_shape, obj_color = robot.get_target_pose_from_cam(
                WORKSPACE_NAME,
                height_offset=0.0005,
                shape=ObjectShape.ANY,
                color=ObjectColor.ANY
            )
        except Exception:
            has_obj = False
            
        if has_obj:
            color_str = obj_color.name # Retourne "GREEN", "RED" ou "BLUE" (ou "ANY" si non reconnu)
            couleur_fr = inv_mapping.get(color_str)
            
            # Si on reconnaît la couleur ET qu'il nous en faut encore dans la commande
            if couleur_fr and commande_actuelle.get(couleur_fr, 0) > 0:
                print(f"🎯 Bonbon {couleur_fr} détecté ! Prise en cours...")
                
                robot.stop_conveyor(conveyor_id)
                robot.pick(obj_pose)
                robot.move(PoseObject(*PLATEAU_POSE))
                robot.release_with_tool()
                robot.move(PoseObject(*OBSERVATION_POSE))
                
                # On diminue la quantité restante à chercher
                commande_actuelle[couleur_fr] -= 1
                
                # On réinitialise le chronomètre car on vient de trouver un bonbon valide
                time_start = time.time()
                
                # On redémarre le tapis si on n'a pas fini
                if sum(commande_actuelle.values()) > 0:
                    robot.run_conveyor(conveyor_id, speed=50, direction=ConveyorDirection.FORWARD)
        
        # Petite pause pour ne pas surcharger le processeur
        time.sleep(0.1)

    print("✅ Tri terminé avec succès !")
    robot.stop_conveyor(conveyor_id)
    return {"status": "ok", "message": "Tous les bonbons ont été triés !"}