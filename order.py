from datetime import datetime
from src.database import db

class Order(db.Model):
    __tablename__ = 'orders'
    
    id = db.Column(db.Integer, primary_key=True)
    order_date = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    student_name = db.Column(db.String(100), nullable=False)
    parent_name = db.Column(db.String(100), nullable=False)
    total_amount = db.Column(db.Numeric(10, 2), nullable=False, default=0)
    status = db.Column(db.String(50), nullable=False, default='معلق')
    storekeeper_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    accountant_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # العلاقات
    items = db.relationship('OrderItem', backref='order', lazy=True, cascade='all, delete-orphan')
    invoice = db.relationship('Invoice', backref='order', uselist=False)
    storekeeper = db.relationship('User', foreign_keys=[storekeeper_id], backref='created_orders')
    accountant = db.relationship('User', foreign_keys=[accountant_id], backref='processed_orders')
    
    def to_dict(self):
        return {
            'id': self.id,
            'order_date': self.order_date.isoformat() if self.order_date else None,
            'student_name': self.student_name,
            'parent_name': self.parent_name,
            'total_amount': float(self.total_amount),
            'status': self.status,
            'storekeeper_id': self.storekeeper_id,
            'accountant_id': self.accountant_id,
            'items': [item.to_dict() for item in self.items],
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
    
    def calculate_total(self):
        """حساب المبلغ الإجمالي للطلب"""
        total = sum(item.quantity * item.unit_price for item in self.items)
        self.total_amount = total
        return total
    
    def __repr__(self):
        return f'<Order {self.id} - {self.student_name} - {self.status}>'


class OrderItem(db.Model):
    __tablename__ = 'order_items'
    
    id = db.Column(db.Integer, primary_key=True)
    order_id = db.Column(db.Integer, db.ForeignKey('orders.id'), nullable=False)
    product_id = db.Column(db.Integer, db.ForeignKey('products.id'), nullable=False)
    quantity = db.Column(db.Integer, nullable=False)
    unit_price = db.Column(db.Numeric(10, 2), nullable=False)
    subtotal = db.Column(db.Numeric(10, 2), nullable=False)
    
    def to_dict(self):
        return {
            'id': self.id,
            'order_id': self.order_id,
            'product_id': self.product_id,
            'quantity': self.quantity,
            'unit_price': float(self.unit_price),
            'subtotal': float(self.subtotal),
            'currency': 'KWD',
            'product': self.product.to_dict() if self.product else None
        }       
    def calculate_subtotal(self):
        """حساب المبلغ الفرعي للعنصر"""
        self.subtotal = self.quantity * self.unit_price
        return self.subtotal
    
    def __repr__(self):
        return f'<OrderItem {self.id} - Order {self.order_id} - Product {self.product_id}>'

