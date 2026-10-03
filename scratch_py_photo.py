import os
import re

py_path = r"d:\PYTHON'S\sort_candy\main.py"
with open(py_path, "r", encoding="utf-8") as f:
    py = f.read()

# Add imports
if 'import cv2' not in py:
    py = py.replace('import time', 'import time\nimport cv2\nimport base64\nimport numpy as np')

if 'uncompress_image' not in py:
    py = py.replace('from pyniryo import NiryoRobot', 'from pyniryo import NiryoRobot, uncompress_image')

# Rewrite the end of valider_chargement
new_end = """
    print("✅ Tri terminé avec succès !")
    if ROBOT_CONNECTE:
        robot.stop_conveyor(conveyor_id)
        
    print("📸 Prise de la photo souvenir...")
    photo_b64 = None
    
    if ROBOT_CONNECTE:
        try:
            # On se met en position pour voir le résultat
            robot.move_pose(PoseObject(*OBSERVATION_POSE))
            time.sleep(1) # Laisse le temps à la caméra de faire l'auto-focus/balance des blancs
            
            img_compressed = robot.get_img_compressed()
            img_cv2 = uncompress_image(img_compressed)
            
            # Encodage de l'image OpenCV en base64 pour le web
            _, buffer = cv2.imencode('.jpg', img_cv2)
            photo_b64 = f"data:image/jpeg;base64,{base64.b64encode(buffer).decode('utf-8')}"
        except Exception as e:
            print(f"⚠️ Erreur lors de la prise de photo: {e}")
    else:
        # Fausse image générée via OpenCV pour le mode simulation
        img_sim = np.zeros((400, 600, 3), dtype=np.uint8)
        img_sim[:] = (220, 200, 255) # Fond rose pâle
        cv2.putText(img_sim, "Mission accomplie !", (80, 200), cv2.FONT_HERSHEY_SIMPLEX, 1.5, (50, 50, 150), 4)
        _, buffer = cv2.imencode('.jpg', img_sim)
        photo_b64 = f"data:image/jpeg;base64,{base64.b64encode(buffer).decode('utf-8')}"

    return {"status": "ok", "message": "Tous les bonbons ont été triés !", "photo": photo_b64}
"""

py = re.sub(
    r'print\("✅ Tri terminé avec succès !"\).*?return \{"status": "ok", "message": "Tous les bonbons ont été triés !"}',
    new_end,
    py,
    flags=re.DOTALL
)

# Also fix the simulation early return if too many candies
py = py.replace(
    'return {"status": "ok", "message": "Tri terminé !"}',
    'return {"status": "ok", "message": "Tri terminé !", "photo": None}'
)

with open(py_path, "w", encoding="utf-8") as f:
    f.write(py)
