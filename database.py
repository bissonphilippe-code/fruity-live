from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

# Initialisation de l'objet SQLAlchemy pour gérer la base de données
db = SQLAlchemy()

class FruitLog(db.Model):
    """
    Cette classe définit la structure de votre table 'fruit_logs'.
    Chaque attribut correspond à une colonne dans la base de données.
    """
    __tablename__ = 'fruit_logs'
    
    id = db.Column(db.Integer, primary_key=True)
    date = db.Column(db.String(10), nullable=False) # Format attendu : YYYY-MM-DD
    fruit = db.Column(db.String(100), nullable=False)
    origin = db.Column(db.String(100))
    rating = db.Column(db.Integer, nullable=False)
    store = db.Column(db.String(100))
    region = db.Column(db.String(100))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        """
        Méthode utilitaire pour convertir un objet de la base de données 
        en dictionnaire JSON pour votre application mobile.
        """
        return {
            "id": self.id,
            "date": self.date,
            "fruit": self.fruit,
            "origin": self.origin,
            "rating": self.rating,
            "store": self.store,
            "userRegion": self.region
        }
