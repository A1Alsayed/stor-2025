import os
import sys
# DON'T CHANGE THIS !!!
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from flask import Flask, send_from_directory
from flask_cors import CORS
from src.database import db

# استيراد النماذج بعد إنشاء db
from src.models.user import User
from src.models.product import Product
from src.models.order import Order, OrderItem
from src.models.invoice import Invoice
from src.routes.user import user_bp
from src.routes.auth import auth_bp
from src.routes.products import products_bp
from src.routes.orders import orders_bp
from src.routes.users import users_bp
from src.routes.reports import reports_bp

app = Flask(__name__, static_folder=os.path.join(os.path.dirname(__file__), 'static'))
app.config['SECRET_KEY'] = 'asdf#FGSgvasgf$5$WGT'

# تمكين CORS للسماح بالطلبات من الواجهة الأمامية
CORS(app, supports_credentials=True)

# تسجيل المسارات
app.register_blueprint(user_bp, url_prefix='/api')
app.register_blueprint(auth_bp, url_prefix='/api')
app.register_blueprint(products_bp, url_prefix='/api')
app.register_blueprint(orders_bp, url_prefix='/api')
app.register_blueprint(users_bp, url_prefix='/api')
app.register_blueprint(reports_bp, url_prefix='/api')

# إعداد قاعدة البيانات
app.config['SQLALCHEMY_DATABASE_URI'] = f"sqlite:///{os.path.join(os.path.dirname(__file__), 'database', 'app.db')}"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db.init_app(app)

def create_sample_data():
    """إنشاء بيانات تجريبية"""
    # إنشاء المستخدمين
    if User.query.count() == 0:
        # أمين مخزن
        storekeeper = User(
            username='storekeeper',
            full_name='أحمد محمد',
            email='ahmed@agbs.edu',
            role='أمين مخزن'
        )
        storekeeper.set_password('123456')
        
        # محاسب
        accountant = User(
            username='accountant',
            full_name='فاطمة علي',
            email='fatima@agbs.edu',
            role='محاسب'
        )
        accountant.set_password('123456')
        
        # مدير
        manager = User(
            username='manager',
            full_name='محمد السالم',
            email='mohammed@agbs.edu',
            role='مدير'
        )
        manager.set_password('123456')
        
        db.session.add_all([storekeeper, accountant, manager])
    
    # إنشاء المنتجات
    if Product.query.count() == 0:
        products = [
            Product(name='قميص بولو', description='قميص بولو مدرسي عالي الجودة', 
                   size='S', color='أزرق', price=45.00, quantity=25, min_quantity=10),
            Product(name='قميص بولو', description='قميص بولو مدرسي عالي الجودة', 
                   size='M', color='أزرق', price=45.00, quantity=5, min_quantity=10),
            Product(name='بنطلون مدرسي', description='بنطلون مدرسي رسمي', 
                   size='L', color='رمادي', price=65.00, quantity=2, min_quantity=10),
            Product(name='تنورة مدرسية', description='تنورة مدرسية للطالبات', 
                   size='S', color='زرقاء', price=55.00, quantity=7, min_quantity=10),
            Product(name='قميص أبيض', description='قميص أبيض رسمي', 
                   size='M', color='أبيض', price=40.00, quantity=30, min_quantity=10)
        ]
        db.session.add_all(products)
    
    db.session.commit()

with app.app_context():
    db.create_all()
    create_sample_data()

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    static_folder_path = app.static_folder
    if static_folder_path is None:
            return "Static folder not configured", 404

    if path != "" and os.path.exists(os.path.join(static_folder_path, path)):
        return send_from_directory(static_folder_path, path)
    else:
        index_path = os.path.join(static_folder_path, 'index.html')
        if os.path.exists(index_path):
            return send_from_directory(static_folder_path, 'index.html')
        else:
            return "index.html not found", 404


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
