from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from utils.api import get_location
from utils.database import init_db, save_search, get_history, delete_search, clear_history, get_analytics
from utils.risk_detector import assess_risk
from utils.chatbot_kb import get_bot_response
import os
import json

app = Flask(__name__, static_folder='dist', static_url_path='/')
CORS(app)

init_db()


@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    if path != "" and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, 'index.html')


@app.route('/api/track', methods=['POST'])
def track_api():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"status": "fail", "message": "Request body required"}), 400

        ip = data.get('ip', '').strip()
        if not ip:
            return jsonify({"status": "fail", "message": "IP required"}), 400

        result = get_location(ip)

        if result.get('status') == 'success':
            risk = assess_risk(result)
            result['risk_level'] = risk['level']
            result['risk_reasons'] = risk['reasons']
            save_search(result)

        return jsonify(result)
    except Exception as e:
        return jsonify({"status": "fail", "message": str(e)}), 500


@app.route('/api/chat', methods=['POST'])
def chat_api():
    """Endpoint for the NetGuide CNIP Chatbot."""
    try:
        data = request.get_json()
        query = data.get('query', '')
        response = get_bot_response(query)
        return jsonify({"status": "success", "response": response})
    except Exception as e:
        return jsonify({"status": "fail", "message": str(e)}), 500


@app.route('/api/detect-ip', methods=['GET'])
def detect_ip():
    try:
        client_ip = (
            request.headers.get('X-Forwarded-For', '').split(',')[0].strip()
            or request.headers.get('X-Real-IP', '')
            or request.remote_addr
            or '127.0.0.1'
        )
        return jsonify({"status": "success", "ip": client_ip})
    except Exception as e:
        return jsonify({"status": "fail", "message": str(e)}), 500


@app.route('/api/history', methods=['GET'])
def history_api():
    try:
        limit = request.args.get('limit', 50, type=int)
        offset = request.args.get('offset', 0, type=int)
        result = get_history(limit, offset)
        for search in result['searches']:
            search['risk_reasons'] = json.loads(search.get('risk_reasons', '[]'))
        return jsonify({"status": "success", **result})
    except Exception as e:
        return jsonify({"status": "fail", "message": str(e)}), 500


@app.route('/api/history/<int:search_id>', methods=['DELETE'])
def delete_history_api(search_id):
    try:
        if delete_search(search_id):
            return jsonify({"status": "success"})
        return jsonify({"status": "fail", "message": "Not found"}), 404
    except Exception as e:
        return jsonify({"status": "fail", "message": str(e)}), 500


@app.route('/api/history', methods=['DELETE'])
def clear_history_api():
    try:
        clear_history()
        return jsonify({"status": "success"})
    except Exception as e:
        return jsonify({"status": "fail", "message": str(e)}), 500


@app.route('/api/analytics', methods=['GET'])
def analytics_api():
    try:
        return jsonify({"status": "success", **get_analytics()})
    except Exception as e:
        return jsonify({"status": "fail", "message": str(e)}), 500


if __name__ == '__main__':
    port = int(os.environ.get("PORT", 10000))
    app.run(host='0.0.0.0', port=port, debug=True)