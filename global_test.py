import time
from pyniryo import NiryoRobot, ConveyorDirection, ObjectColor, ObjectShape, PoseObject

print('DEBUT################################################## 1')
ROBOT_IP = '169.254.200.200'

WORKSPACE_NAME = "convoyer_cyborg"

OBSERVATION_POSE = [0.106, -0.059, 0.28, -2.686, 1.406, 2.691]
PLATEAU_POSE = [0.13, 0.251, 0.069, -2.368, 1.48, -1.596]  

robot = NiryoRobot(ROBOT_IP)
robot.calibrate_auto()
robot.update_tool()
conveyor_id = robot.set_conveyor()

print("Positionnement d'observation...")
robot.move_pose(PoseObject(*OBSERVATION_POSE))

# Boucle principale (Chef d'orchestre)
while True:
    print("Démarrage du convoyeur...")
    robot.run_conveyor(conveyor_id, speed=50, direction=ConveyorDirection.FORWARD)
    
    has_obj = False
    time_start = time.time()
    
    # Sous-boucle de surveillance (avec timeout de 20s)
    while not has_obj:
        try:
            # On utilise uniquement la caméra pour trouver les coordonnées (sans bouger le bras)
            has_obj, obj_pose, *_ = robot.get_target_pose_from_cam(
                WORKSPACE_NAME,
                height_offset=0.030,
                shape=ObjectShape.ANY,
                color=ObjectColor.GREEN  # Filtre activé
            )
        except TypeError:
            # Bouclier contre le bug de tableau vide de PyNiryo
            has_obj = False
        except Exception as e:
            # Bouclier contre toute autre erreur de caméra
            has_obj = False
        
        # Arrêt si le bac est vide après 20 secondes
        if time.time() - time_start > 20:
            break
            
    print(f"Objet détecté : {has_obj}")       
    
    # ACTION IMMÉDIATE : Couper le moteur pour immobiliser le bonbon !
    robot.stop_conveyor(conveyor_id)
    
    # Choix de l'action selon le résultat de la surveillance
    if has_obj:
        # C'EST ICI QU'ON RÉINTÈGRE LE PICK ! 
        # Le bonbon est arrêté, on peut l'attraper en toute sécurité.
        print(f"Prise du bonbon en : {obj_pose}")
        robot.pick(obj_pose)
        
        print("Dépose sur le plateau...")
        robot.move(PoseObject(*PLATEAU_POSE))
        robot.release_with_tool()
        
        print("Retour en position d'observation...")
        robot.move(PoseObject(*OBSERVATION_POSE))
    else:
        print("Aucun bonbon vert détecté pendant 20 secondes. Fin du tri.")
        break  # Casse la boucle principale, le bac est vide

robot.unset_conveyor(conveyor_id)
robot.close_connection()