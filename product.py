from datetime import datetime
from src.database import db

class Product(db.Model):
    __tablename__ = 'products'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    size = db.Column(db.String(20), nullable=False)
    color = db.Column(db.String(50), nullable=False)
    price = db.Column(db.Numeric(10, 2), nullable=False)
    quantity = db.Column(db.Integer, nullable=False, default=0)
    min_quantity = db.Column(db.Integer, nullable=False, default=10)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'size': self.size,
            'color': self.color,
            'price': float(self.price),
            'quantity': self.quantity,
            'min_quantity': self.min_quantity,
            'currency': 'KWD',
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
    
    def is_low_stock(self):
        return self.quantity <= self.min_quantity
    
    def is_out_of_stock(self):
        return self.quantity == 0
    
    def __repr__(self):
        return f'<Product {self.name} - {self.size} - {self.color}>'

