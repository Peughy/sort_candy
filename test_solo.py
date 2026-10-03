from pyniryo import (
    NiryoRobot,
    ObjectColor,
    ObjectShape,
    PoseObject
)
import time
# 1. Renseigne ici l'adresse IP de ton Ned2
ROBOT_IP = '169.254.200.200'

WORKSPACE_NAME = "convoyeur_bonbon"  # Le nom exact donné dans Niryo Studio

# Remplace ces 6 valeurs par celles affichées par robot.get_POSE()
OBSERVATION_POSE = [0.118, -0.007, 0.227, 3.082, 1.432, 3.006]

PLATEAU_POSE = [0.026, 0.274, 0.06, -1682, 1.492, -0.443]        # Ta position plateau

robot = NiryoRobot(ROBOT_IP)
robot.calibrate_auto()
robot.update_tool()

# 2. Se positionner au-dessus du tapis
print("Positionnement d'observation...")
robot.move(PoseObject(*OBSERVATION_POSE))

# 3. Détection de l'objet
# height_offset=0.010 : pince à 10 mm au-dessus de la bande noire
print("Analyse de la zone de travail...")
# L'étoile *_ absorbe les valeurs superflues (shape, color)
has_obj, obj_pose, *_ = robot.get_target_pose_from_cam(
    WORKSPACE_NAME,
    height_offset=0.0005,
    shape=ObjectShape.ANY,
    color=ObjectColor.ANY
)

if has_obj:
    print(f"Bonbon trouvé en : {obj_pose}")
    
    # 4. Saisie (Pick)
    print("Prise du bonbon...")
    # pick_from_pose descend verticalement, referme la pince et remonte
    robot.pick(obj_pose)
    
    # 5. Dépose (Place)
    print("Transport vers le plateau...")
    robot.move(PoseObject(*PLATEAU_POSE))
    robot.release_with_tool()
    time.sleep(0.5)
    
    # 6. Retour en position d'observation
    robot.move(PoseObject(*OBSERVATION_POSE))
    print("Cycle terminé avec succès !")
else:
    print("Erreur : aucun bonbon détecté. Vérifie la couleur et le contraste.")

robot.close_connection()