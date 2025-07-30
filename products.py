from flask import Blueprint, request, jsonify
from src.models.product import Product
from src.database import db
from src.routes.auth import require_permission

products_bp = Blueprint('products', __name__)

@products_bp.route('/products', methods=['GET'])
@require_permission('manage_inventory')
def get_products():
    """الحصول على جميع المنتجات"""
    try:
        search = request.args.get('search', '')
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 50, type=int)
        
        query = Product.query
        
        if search:
            query = query.filter(
                Product.name.contains(search) |
                Product.color.contains(search) |
                Product.size.contains(search)
            )
        
        products = query.paginate(
            page=page, 
            per_page=per_page, 
            error_out=False
        )
        
        return jsonify({
            'products': [product.to_dict() for product in products.items],
            'total': products.total,
            'pages': products.pages,
            'current_page': page
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@products_bp.route('/products/<int:product_id>', methods=['GET'])
@require_permission('manage_inventory')
def get_product(product_id):
    """الحصول على منتج محدد"""
    try:
        product = Product.query.get_or_404(product_id)
        return jsonify({'product': product.to_dict()}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@products_bp.route('/products', methods=['POST'])
@require_permission('manage_inventory')
def create_product():
    """إنشاء منتج جديد"""
    try:
        data = request.get_json()
        
        # التحقق من البيانات المطلوبة
        required_fields = ['name', 'size', 'color', 'price', 'quantity']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'الحقل {field} مطلوب'}), 400
        
        # التحقق من عدم تكرار المنتج
        existing_product = Product.query.filter_by(
            name=data['name'],
            size=data['size'],
            color=data['color']
        ).first()
        
        if existing_product:
            return jsonify({'error': 'المنتج موجود بالفعل بنفس الحجم واللون'}), 400
        
        product = Product(
            name=data['name'],
            description=data.get('description', ''),
            size=data['size'],
            color=data['color'],
            price=data['price'],
            quantity=data['quantity'],
            min_quantity=data.get('min_quantity', 10)
        )
        
        db.session.add(product)
        db.session.commit()
        
        return jsonify({
            'message': 'تم إنشاء المنتج بنجاح',
            'product': product.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@products_bp.route('/products/<int:product_id>', methods=['PUT'])
@require_permission('manage_inventory')
def update_product(product_id):
    """تحديث منتج"""
    try:
        product = Product.query.get_or_404(product_id)
        data = request.get_json()
        
        # التحقق من عدم تكرار المنتج (باستثناء المنتج الحالي)
        if 'name' in data or 'size' in data or 'color' in data:
            existing_product = Product.query.filter_by(
                name=data.get('name', product.name),
                size=data.get('size', product.size),
                color=data.get('color', product.color)
            ).filter(Product.id != product_id).first()
            
            if existing_product:
                return jsonify({'error': 'المنتج موجود بالفعل بنفس الحجم واللون'}), 400
        
        # تحديث البيانات
        if 'name' in data:
            product.name = data['name']
        if 'description' in data:
            product.description = data['description']
        if 'size' in data:
            product.size = data['size']
        if 'color' in data:
            product.color = data['color']
        if 'price' in data:
            product.price = data['price']
        if 'quantity' in data:
            product.quantity = data['quantity']
        if 'min_quantity' in data:
            product.min_quantity = data['min_quantity']
        
        db.session.commit()
        
        return jsonify({
            'message': 'تم تحديث المنتج بنجاح',
            'product': product.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@products_bp.route('/products/<int:product_id>', methods=['DELETE'])
@require_permission('manage_inventory')
def delete_product(product_id):
    """حذف منتج"""
    try:
        product = Product.query.get_or_404(product_id)
        
        # التحقق من عدم وجود طلبات مرتبطة بالمنتج
        if product.order_items:
            return jsonify({'error': 'لا يمكن حذف المنتج لوجود طلبات مرتبطة به'}), 400
        
        db.session.delete(product)
        db.session.commit()
        
        return jsonify({'message': 'تم حذف المنتج بنجاح'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@products_bp.route('/products/low-stock', methods=['GET'])
@require_permission('manage_inventory')
def get_low_stock_products():
    """الحصول على المنتجات منخفضة المخزون"""
    try:
        products = Product.query.filter(Product.quantity <= Product.min_quantity).all()
        
        return jsonify({
            'products': [product.to_dict() for product in products],
            'count': len(products)
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@products_bp.route('/products/out-of-stock', methods=['GET'])
@require_permission('manage_inventory')
def get_out_of_stock_products():
    """الحصول على المنتجات نافدة المخزون"""
    try:
        products = Product.query.filter(Product.quantity == 0).all()
        
        return jsonify({
            'products': [product.to_dict() for product in products],
            'count': len(products)
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@products_bp.route('/products/stats', methods=['GET'])
@require_permission('manage_inventory')
def get_products_stats():
    """الحصول على إحصائيات المنتجات"""
    try:
        total_products = Product.query.count()
        low_stock_count = Product.query.filter(Product.quantity <= Product.min_quantity).count()
        out_of_stock_count = Product.query.filter(Product.quantity == 0).count()
        total_value = db.session.query(db.func.sum(Product.price * Product.quantity)).scalar() or 0
        
        return jsonify({
            'total_products': total_products,
            'low_stock_count': low_stock_count,
            'out_of_stock_count': out_of_stock_count,
            'total_value': float(total_value)
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

