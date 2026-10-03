import time
from fastapi import FastAPI, Request
from fastapi.templating import Jinja2Templates
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from pyniryo import NiryoRobot, ConveyorDirection, ObjectColor, ObjectShape, PoseObject

# ROBOT_IP = '169.254.200.200'
# robot = NiryoRobot(ROBOT_IP)
# robot.calibrate_auto()

app = FastAPI()

# Montage du dossier static pour JS et CSS
app.mount("/static", StaticFiles(directory="static"), name="static")

# lien fichier html
templates = Jinja2Templates(directory="templates")

class InfoEnfant(BaseModel):
    prenom: str


class ChoixEnfant(BaseModel):
    choixBb : dict

@app.get("/", response_class=HTMLResponse)
async def afficher_accueil(request: Request):
    return templates.TemplateResponse(name="index.html", request={"request": request})

# 2. Route pour recevoir le prénom
@app.post("/saluer")
async def saluer_enfant(enfant: InfoEnfant):
    # Simulation d'un traitement serveur ou d'une communication robot pour afficher le chargement
    time.sleep(1.5)
    print(f"Bonjour {enfant.prenom} !")
    return {"status": "ok", "message": f"Bonjour {enfant.prenom}"}

@app.post('/choix')
async def choix_enfant(choixEnfant: ChoixEnfant):
    time.sleep(2)
    print(f"Votre choix {choixEnfant.choixBb}")
    return {"status": "ok", "message": f"Choix recu {choixEnfant.choixBb}"}