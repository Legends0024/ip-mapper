from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from utils.api import get_location
import os

app = Flask(__name__, static_folder='dist', static_url_path='/')
CORS(app) # Allow React dev server to communicate with Flask

# Render the React SPA
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    if path != "" and os.path.exists(app.static_folder + '/' + path):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, 'index.html')

# JSON API for the React frontend
@app.route('/api/track', methods=['POST'])
def track_api():
    try:
        data = request.get_json()
        ip = data.get('ip')
        if not ip:
            return jsonify({"status": "fail", "message": "IP address required"}), 400
            
        result = get_location(ip)
        return jsonify(result)
    except Exception as e:
        return jsonify({"status": "fail", "message": str(e)}), 500

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 10000))
    app.run(host='0.0.0.0', port=port, debug=True)