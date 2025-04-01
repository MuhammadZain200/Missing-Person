from flask import Flask, request, jsonify
from flask_cors import CORS
from deepface import DeepFace
import os

app = Flask(__name__)
CORS(app)

KNOWN_FACES_DIR = "./known_faces"  # - Directory of Known_faces 

@app.route("/match-face", methods=["POST"])
def match_face():
    print("Python API HIT")  # - Handles faces recognition requests (uploads the picture)

    if "file" not in request.files:
        print("No file found in request")  # <-- Debug
        return jsonify({"error": "No file uploaded"}), 400   # - Checks if the image is uploaded or not.

    file = request.files["file"]
    uploaded_path = os.path.join("uploads", file.filename)   
    os.makedirs("uploads", exist_ok=True)
    file.save(uploaded_path)

    print(" Image saved to:", uploaded_path)    # - Saves the upload pictures in the uploads folder

    try:
        result = DeepFace.find(img_path=uploaded_path, db_path=KNOWN_FACES_DIR)
        matches = result[0].to_dict(orient="records")

        if matches:
            best_match = matches[0]
            confidence = (1 - best_match["distance"]) * 100
            confidence = round(confidence, 2)

            print(f"Match Found with {confidence}% confidence")
            return jsonify({
                "match_found": True,
                "confidence": confidence
     })
        else:
            return jsonify({
                "match_found": False,
                "message": "No match found"
         })

    except Exception as e:                                              # - Uses Deepface to compare with the uploaded picture with pictures in the known faces
        print("DeepFace Error:", e)  
        return jsonify({ "error": str(e) }), 500    # - Tells us if match is found or not. If it is then how accurate it is.

if __name__ == "__main__":
    app.run(port=5001, debug=True)          # - Runs the face_api on the website.
