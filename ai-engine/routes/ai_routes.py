from flask import Blueprint, jsonify


# Define the Blueprint without the repetitive prefix
ai_blueprint = Blueprint('ai_routes', __name__)

@ai_blueprint.route('/test', methods=['GET'])
def test():
    return jsonify({"message": "AI Service is up and running!"})
