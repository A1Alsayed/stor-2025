from datetime import datetime
from src.database import db

class Invoice(db.Model):
    __tablename__ = 'invoices'
    
    id = db.Column(db.Integer, primary_key=True)
    invoice_number = db.Column(db.String(50), unique=True, nullable=False)
    order_id = db.Column(db.Integer, db.ForeignKey('orders.id'), nullable=False, unique=True)
    invoice_date = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    total_amount = db.Column(db.Numeric(10, 2), nullable=False)
    accountant_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # العلاقات
    accountant = db.relationship('User', backref='issued_invoices')
    
    def to_dict(self):
            return {
                'id': self.id,
                'order_id': self.order_id,
                'invoice_number': self.invoice_number,
                'invoice_date': self.invoice_date.isoformat() if self.invoice_date else None,
                'total_amount': float(self.total_amount),
                'accountant_id': self.accountant_id,
                'created_at': self.created_at.isoformat() if self.created_at else None,
                'updated_at': self.updated_at.isoformat() if self.updated_at else None,
                'currency': 'KWD'
            }
    
    def generate_invoice_number(self):
        """توليد رقم فاتورة فريد"""
        # تنسيق: INV-YYYY-NNNN
        year = datetime.now().year
        # البحث عن آخر فاتورة في نفس السنة
        last_invoice = Invoice.query.filter(
            Invoice.invoice_number.like(f'INV-{year}-%')
        ).order_by(Invoice.id.desc()).first()
        
        if last_invoice:
            # استخراج الرقم التسلسلي من آخر فاتورة
            last_number = int(last_invoice.invoice_number.split('-')[-1])
            new_number = last_number + 1
        else:
            new_number = 1
        
        self.invoice_number = f'INV-{year}-{new_number:04d}'
        return self.invoice_number
    
    def __repr__(self):
        return f'<Invoice {self.invoice_number} - Order {self.order_id}>'

