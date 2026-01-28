import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from database import db, FruitLog

app = Flask(__name__)
# CORS is essential to allow your React app to talk to this server
CORS(app)

# Database Configuration
# Render automatically provides the DATABASE_URL environment variable.
# We modify it slightly to ensure compatibility with modern SQLAlchemy.
database_url = os.environ.get('DATABASE_URL')
if database_url and database_url.startswith("postgres://"):
    database_url = database_url.replace("postgres://", "postgresql://", 1)

app.config['SQLALCHEMY_DATABASE_URI'] = database_url or 'sqlite:///fruity_local.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)

# Create the database tables on startup if they don't exist
with app.app_context():
    db.create_all()

@app.route('/api/logs', methods=['GET'])
def get_logs():
    """Fetch all logs from the database."""
    try:
        logs = FruitLog.query.order_by(FruitLog.date.desc()).all()
        return jsonify([l.to_dict() for l in logs])
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/logs', methods=['POST'])
def add_log():
    """Add a new fruit log to the database."""
    data = request.json
    try:
        new_log = FruitLog(
            date=data.get('date'),
            fruit=data.get('fruit'),
            origin=data.get('origin', ''),
            rating=data.get('rating'),
            store=data.get('store', ''),
            region=data.get('userRegion', 'Quebec')
        )
        db.session.add(new_log)
        db.session.commit()
        return jsonify(new_log.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400

@app.route('/api/logs/<int:log_id>', methods=['DELETE'])
def delete_log(log_id):
    """Remove a log entry."""
    log = FruitLog.query.get_or_404(log_id)
    try:
        db.session.delete(log)
        db.session.commit()
        return jsonify({"message": "Deleted successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    # Render requires the app to run on 0.0.0.0
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)
