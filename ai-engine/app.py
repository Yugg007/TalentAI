from flask import Flask

from routes.ai_routes import ai_blueprint

from scheduler.scheduler import (
    start_scheduler
)

from models.db import mongo



from utils.logging_config import (
    configure_logging
)

configure_logging()



app = Flask(__name__)

app.config[
    "MONGO_URI"
] = "mongodb://localhost:27017/TalentAI"

mongo.init_app(app)

app.register_blueprint(
    ai_blueprint,
    url_prefix="/api/v1/ai"
)

if __name__ == "__main__":

    start_scheduler()

    app.run(
        host="0.0.0.0",
        port=7008,
        debug=False,
        threaded=True
    )