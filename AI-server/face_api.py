from flask import Flask, request, jsonify
from flask_cors import CORS
from deepface import DeepFace
import os

app = Flask(__name__)
CORS(app)

KNOWN_FACES_DIR = "./known_faces"

@app.route("/match-face", methods=["POST"])
def match_face():
    print("📨 Python API HIT")  # <-- Add this at the top

    if "file" not in request.files:
        print("❌ No file found in request")  # <-- Debug
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files["file"]
    uploaded_path = os.path.join("uploads", file.filename)
    os.makedirs("uploads", exist_ok=True)
    file.save(uploaded_path)

    print("✅ Image saved to:", uploaded_path)

    try:
        result = DeepFace.find(img_path=uploaded_path, db_path=KNOWN_FACES_DIR)
        matches = result[0].to_dict(orient="records")
        print("🔍 Match results:", matches)  # <-- Optional log
        return jsonify({ "matches": matches })
    except Exception as e:
        print("❌ DeepFace Error:", e)  # <-- Log the error
        return jsonify({ "error": str(e) }), 500

if __name__ == "__main__":
    app.run(port=5001, debug=True)
