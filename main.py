import time
import random
from pyniryo import NiryoRobot, ConveyorDirection, PoseObject

ROBOT_IP = '169.254.200.200'

INITIAL_POSE = (0.197, -0.008, 0.13, -0.077, 0.775, -0.041)                
INTERMEDIAIRE_POSE = (0.195, -0.016, 0.21, 1.789, 1.489, 1.825)            
PICK_POSE = (0.125, -0.191, 0.1, -2.235, 1.157, 2.689)                    
INTER_PICK_POSE = (0.176, -0.191, 0.19, -2.083, 1.522, -2.06)             
TAPIS_LESS_POS = (0.219, -0.279, 0.078, 2.612, 1.407, 1.504)              
TAPIS_LESS_INT_AFTER_POSE = (0.218, -0.281, 0.094, -2.514, 1.468, 2.834)   
TAPIS_PICK_POSE = (0.202, 0.278, 0.078, 2.228, 1.426, 2.351)               
TAPIS_PICK_INTER_POSE = (0.075, 0.257, 0.164, 1.486, 1.366, 1.735)         
TAPIS_PICK_INTER_INTER_POSE = (0.186, 0.263, 0.148, -1.885, 1.409, -1.765) 
RETURN_POSE = (-0.043, -0.198, 0.176, 0.089, 1.49, -2.806)               

POSITIONS_DEPOT = [
    (0.07, 0.207, 0.018, 2.402, 1.53, 2.727),    
    (0.07, 0.355, 0.017, 2.328, 1.515, 2.869),   
    (-0.085, 0.211, 0.018, -2.8, 1.378, -2.22),  
    (-0.086, 0.371, 0.017, 1.891, 1.508, 2.717), 
    (-0.008, 0.281, 0.017, 2.32, 1.564, 3.09)    
]
ORDRE_INITIAL = list(POSITIONS_DEPOT)

try:
    print(f"Connexion au robot sur {ROBOT_IP}...")
    robot = NiryoRobot(ROBOT_IP)
    robot.calibrate_auto()
    robot.update_tool()
    conveyor_id = robot.set_conveyor()
    cycle_complet = 0

    while True:
        cycle_complet += 1
        print(f"\n--- SÉQUENCE #{cycle_complet} ---")

        # Phase 1 : Aller (Bac -> Tapis -> Workspace)
        for i, target_pos in enumerate(POSITIONS_DEPOT, start=1):
            print(f"[ALLER {i}/{len(POSITIONS_DEPOT)}]")
            robot.move(PoseObject(*INTERMEDIAIRE_POSE))
            time.sleep(0.3)
            
            robot.move(PoseObject(*PICK_POSE))
            robot.grasp_with_tool()
            time.sleep(0.3)
            
            robot.move(PoseObject(*INTER_PICK_POSE))
            robot.move(PoseObject(*TAPIS_LESS_POS))
            time.sleep(0.1)
            robot.release_with_tool()
            time.sleep(0.1)
            robot.move(PoseObject(*TAPIS_LESS_INT_AFTER_POSE))
            time.sleep(0.3)
            robot.move(PoseObject(*INTERMEDIAIRE_POSE)) 
            
            robot.run_conveyor(conveyor_id, speed=75, direction=ConveyorDirection.FORWARD)
            time.sleep(13)
            robot.stop_conveyor(conveyor_id)

            robot.move(PoseObject(*TAPIS_PICK_POSE))
            robot.grasp_with_tool()
            time.sleep(0.3)

            robot.move(PoseObject(*TAPIS_PICK_INTER_INTER_POSE))
            time.sleep(0.3)
            robot.move(PoseObject(*TAPIS_PICK_INTER_POSE))
            time.sleep(0.3)

            robot.move(PoseObject(*target_pos))
            time.sleep(0.3)
            robot.release_with_tool()

            robot.move(PoseObject(*TAPIS_PICK_INTER_POSE))
            time.sleep(0.3)
            robot.move(PoseObject(*INTERMEDIAIRE_POSE))
            time.sleep(0.3)

        # Phase 2 : Retour aléatoire (Workspace -> Bac)
        random.shuffle(POSITIONS_DEPOT)
        for i, source_pos in enumerate(POSITIONS_DEPOT, start=1):
            print(f"[RETOUR {i}/{len(POSITIONS_DEPOT)}]")
            robot.move(PoseObject(*INTERMEDIAIRE_POSE))
            time.sleep(0.3)
            robot.move(PoseObject(*TAPIS_PICK_INTER_POSE))
            time.sleep(0.3)

            robot.move(PoseObject(*source_pos))
            time.sleep(0.3)
            robot.grasp_with_tool()
            time.sleep(0.3)

            robot.move(PoseObject(*TAPIS_PICK_INTER_POSE))
            time.sleep(0.3)
            robot.move(PoseObject(*INTERMEDIAIRE_POSE))
            time.sleep(0.3)

            robot.move(PoseObject(*RETURN_POSE))
            time.sleep(0.3)
            robot.release_with_tool()
            time.sleep(0.3)

            robot.move(PoseObject(*INTERMEDIAIRE_POSE))
            time.sleep(0.3)

        POSITIONS_DEPOT[:] = ORDRE_INITIAL

except KeyboardInterrupt:
    print("\nArrêt manuel.")
except Exception as e:
    print(f"Erreur : {e}")
finally:
    if 'robot' in locals() and robot is not None:
        try:
            if 'conveyor_id' in locals() and conveyor_id is not None:
                robot.stop_conveyor(conveyor_id)
            robot.move(PoseObject(*INITIAL_POSE))
        except Exception:
            pass
        robot.close_connection()