import time
from pyniryo import NiryoRobot, uncompress_image, ConveyorDirection, ObjectColor, ObjectShape, PoseObject

# ==========================================
# CONFIGURATION ET CONNEXION AU ROBOT NIRYO
# ==========================================
ROBOT_IP = '169.254.200.200'

# --- CORRECTIONS DE PRIS (Offsets) ---
OFFSET_X = 0.010   
OFFSET_Y = 0.020  
OFFSET_Z = 0.000 

# Poses
# Format des coordonnées : (x, y, z, roll, pitch, yaw)
INITIAL_POSE = (0.197, -0.008, 0.13, -0.077, 0.775, -0.041)                # initial pose[cite: 3]
INTERMEDIAIRE_POSE = (0.195, -0.016, 0.21, 1.789, 1.489, 1.825)            # intermediaire pose[cite: 3, 5]
PICK_POSE = (0.125, -0.191, 0.1, -2.235, 1.157, 2.689)                     # pick pose[cite: 3]
INTER_PICK_POSE = (0.176, -0.191, 0.19, -2.083, 1.522, -2.06)              # inter pick pose[cite: 3]
TAPIS_LESS_POS = (0.219, -0.279, 0.078, 2.612, 1.407, 1.504)               # tapis less pos[cite: 9]
TAPIS_LESS_INT_AFTER_POSE = (0.218, -0.281, 0.094, -2.514, 1.468, 2.834)   # tapis less int after pose[cite: 10]
TAPIS_PICK_POSE = (0.202, 0.278, 0.078, 2.228, 1.426, 2.351)               # tapis pick pose[cite: 7]
TAPIS_PICK_INTER_POSE = (0.075, 0.257, 0.164, 1.486, 1.366, 1.735)         # tapis pick inter pose[cite: 6]
TAPIS_PICK_INTER_INTER_POSE = (0.186, 0.263, 0.148, -1.885, 1.409, -1.765) # tapis pick inter inter pose[cite: 8]

POS1 = (0.07, 0.207, 0.018, 2.402, 1.53, 2.727)                            # pos1[cite: 4, 5]
POS2 = (0.07, 0.355, 0.017, 2.328, 1.515, 2.869)                           # pos2[cite: 4, 5]
POS3 = (-0.085, 0.211, 0.018, -2.8, 1.378, -2.22)                          # pos3[cite: 4, 5, 6]
POS4 = (-0.086, 0.371, 0.017, 1.891, 1.508, 2.717)                         # pos4[cite: 4, 6]
POS5 = (-0.008, 0.281, 0.017, 2.32, 1.564, 3.09)                           # pos5[cite: 11]

# Liste des 5 destinations
POSITIONS_DEPOT = [POS1, POS2, POS3, POS4, POS5]

try:
    print(f"Tentative de connexion au robot sur {ROBOT_IP}...")
    robot = NiryoRobot(ROBOT_IP)
    robot.calibrate_auto()
    robot.update_tool()
    
    conveyor_id = robot.set_conveyor()

    # Répétition du cycle pour chacune des 5 positions
    for i, target_pos in enumerate(POSITIONS_DEPOT, start=1):
        print(f"--- Début du cycle {i}/{len(POSITIONS_DEPOT)} ---")

        robot.move(PoseObject(*INTERMEDIAIRE_POSE))
        time.sleep(0.5)
        
        # Prise au point de départ
        robot.move(PoseObject(*PICK_POSE))
        robot.grasp_with_tool()
        time.sleep(0.5)
        
        # Dépose sur le tapis
        robot.move(PoseObject(*INTER_PICK_POSE))
        robot.move(PoseObject(*TAPIS_LESS_POS))
        time.sleep(0.1)
        robot.release_with_tool()
        time.sleep(0.1)
        robot.move(PoseObject(*TAPIS_LESS_INT_AFTER_POSE))
        time.sleep(0.5)
        robot.move(PoseObject(*INTERMEDIAIRE_POSE)) 
        
        # Avancement du tapis
        robot.run_conveyor(conveyor_id, speed=75, direction=ConveyorDirection.FORWARD)
        time.sleep(13)
        robot.stop_conveyor(conveyor_id)

        # Prise en fin de tapis
        robot.move(PoseObject(*TAPIS_PICK_POSE))
        robot.grasp_with_tool()
        time.sleep(0.5)

        robot.move(PoseObject(*TAPIS_PICK_INTER_INTER_POSE))
        time.sleep(0.5)
        
        robot.move(PoseObject(*TAPIS_PICK_INTER_POSE))
        time.sleep(0.5)

        # Dépose vers la position cible actuelle (POS1 à POS5)
        robot.move(PoseObject(*target_pos))
        time.sleep(0.5)
        robot.release_with_tool()

        # Dégagement et retour à la pose intermédiaire
        robot.move(PoseObject(*TAPIS_PICK_INTER_POSE))
        time.sleep(0.5)

        robot.move(PoseObject(*INTERMEDIAIRE_POSE))
        time.sleep(0.5)

    # Retour en position initiale une fois les 5 cycles terminés
    print("Tous les cycles sont terminés. Retour à INITIAL_POSE.")
    robot.move(PoseObject(*INITIAL_POSE))

except Exception as e:
    print(f"Erreur : {e}")
    ROBOT_CONNECTE = False
    robot = None
    conveyor_id = None
finally:
    if 'robot' in locals() and robot is not None:
        robot.close_connection()