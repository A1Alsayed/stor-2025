from flask import Blueprint, request, jsonify
from src.models.order import Order, OrderItem
from src.models.product import Product
from src.database import db
from src.routes.auth import require_permission

orders_bp = Blueprint('orders', __name__)

@orders_bp.route('/orders', methods=['GET'])
@require_permission('view_orders')
def get_orders():
    """الحصول على جميع الطلبات"""
    try:
        search = request.args.get('search', '')
        status = request.args.get('status', '')
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 50, type=int)
        
        query = Order.query
        
        if search:
            query = query.filter(
                Order.student_name.contains(search) |
                Order.parent_name.contains(search) |
                Order.id.like(f'%{search}%')
            )
        
        if status:
            query = query.filter(Order.status == status)
        
        orders = query.order_by(Order.created_at.desc()).paginate(
            page=page, 
            per_page=per_page, 
            error_out=False
        )
        
        return jsonify({
            'orders': [order.to_dict() for order in orders.items],
            'total': orders.total,
            'pages': orders.pages,
            'current_page': page
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@orders_bp.route('/orders/<int:order_id>', methods=['GET'])
@require_permission('view_orders')
def get_order(order_id):
    """الحصول على طلب محدد"""
    try:
        order = Order.query.get_or_404(order_id)
        return jsonify({'order': order.to_dict()}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@orders_bp.route('/orders', methods=['POST'])
@require_permission('create_orders')
def create_order():
    """إنشاء طلب جديد"""
    try:
        data = request.get_json()
        
        # التحقق من البيانات المطلوبة
        required_fields = ['student_name', 'parent_name', 'items']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'الحقل {field} مطلوب'}), 400
        
        if not data['items']:
            return jsonify({'error': 'يجب إضافة منتج واحد على الأقل'}), 400
        
        # إنشاء الطلب
        order = Order(
            student_name=data['student_name'],
            parent_name=data['parent_name'],
            storekeeper_id=request.current_user.id
        )
        
        db.session.add(order)
        db.session.flush()  # للحصول على معرف الطلب
        
        total_amount = 0
        
        # إضافة عناصر الطلب
        for item_data in data['items']:
            product = Product.query.get(item_data['product_id'])
            if not product:
                return jsonify({'error': f'المنتج {item_data["product_id"]} غير موجود'}), 400
            
            if product.quantity < item_data['quantity']:
                return jsonify({'error': f'الكمية المطلوبة من {product.name} غير متوفرة'}), 400
            
            order_item = OrderItem(
                order_id=order.id,
                product_id=product.id,
                quantity=item_data['quantity'],
                unit_price=product.price
            )
            order_item.calculate_subtotal()
            
            db.session.add(order_item)
            total_amount += float(order_item.subtotal)
        
        order.total_amount = total_amount
        db.session.commit()
        
        return jsonify({
            'message': 'تم إنشاء الطلب بنجاح',
            'order': order.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@orders_bp.route('/orders/<int:order_id>/status', methods=['PUT'])
@require_permission('view_orders')
def update_order_status(order_id):
    """تحديث حالة الطلب"""
    try:
        order = Order.query.get_or_404(order_id)
        data = request.get_json()
        
        new_status = data.get('status')
        if not new_status:
            return jsonify({'error': 'حالة الطلب مطلوبة'}), 400
        
        # التحقق من صلاحية تغيير الحالة
        user = request.current_user
        current_status = order.status
        
        # قواعد تغيير الحالة
        if user.role == 'أمين مخزن':
            if current_status == 'معلق' and new_status == 'بانتظار الدفع':
                order.status = new_status
            elif current_status == 'مدفوع' and new_status == 'مكتمل':
                # خصم الكميات من المخزون
                for item in order.items:
                    product = item.product
                    product.quantity -= item.quantity
                order.status = new_status
            else:
                return jsonify({'error': 'لا يمكنك تغيير حالة الطلب إلى هذه الحالة'}), 403
                
        elif user.role == 'محاسب':
            if current_status == 'بانتظار الدفع' and new_status == 'مدفوع':
                order.status = new_status
                order.accountant_id = user.id
            else:
                return jsonify({'error': 'لا يمكنك تغيير حالة الطلب إلى هذه الحالة'}), 403
                
        elif user.role == 'مدير':
            # المدير يمكنه تغيير أي حالة
            order.status = new_status
            if new_status == 'مدفوع' and not order.accountant_id:
                order.accountant_id = user.id
            elif new_status == 'مكتمل' and current_status == 'مدفوع':
                # خصم الكميات من المخزون
                for item in order.items:
                    product = item.product
                    product.quantity -= item.quantity
        
        db.session.commit()
        
        return jsonify({
            'message': 'تم تحديث حالة الطلب بنجاح',
            'order': order.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@orders_bp.route('/orders/<int:order_id>', methods=['DELETE'])
@require_permission('create_orders')
def delete_order(order_id):
    """حذف طلب (فقط إذا كان معلقاً)"""
    try:
        order = Order.query.get_or_404(order_id)
        
        if order.status != 'معلق':
            return jsonify({'error': 'لا يمكن حذف الطلب بعد بدء معالجته'}), 400
        
        db.session.delete(order)
        db.session.commit()
        
        return jsonify({'message': 'تم حذف الطلب بنجاح'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@orders_bp.route('/orders/stats', methods=['GET'])
@require_permission('view_orders')
def get_orders_stats():
    """الحصول على إحصائيات الطلبات"""
    try:
        total_orders = Order.query.count()
        pending_orders = Order.query.filter(Order.status == 'معلق').count()
        waiting_payment = Order.query.filter(Order.status == 'بانتظار الدفع').count()
        paid_orders = Order.query.filter(Order.status == 'مدفوع').count()
        completed_orders = Order.query.filter(Order.status == 'مكتمل').count()
        
        total_revenue = db.session.query(
            db.func.sum(Order.total_amount)
        ).filter(Order.status.in_(['مدفوع', 'مكتمل'])).scalar() or 0
        
        return jsonify({
            'total_orders': total_orders,
            'pending_orders': pending_orders,
            'waiting_payment': waiting_payment,
            'paid_orders': paid_orders,
            'completed_orders': completed_orders,
            'total_revenue': float(total_revenue)
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@orders_bp.route('/orders/by-status/<status>', methods=['GET'])
@require_permission('view_orders')
def get_orders_by_status(status):
    """الحصول على الطلبات حسب الحالة"""
    try:
        orders = Order.query.filter(Order.status == status).order_by(Order.created_at.desc()).all()
        
        return jsonify({
            'orders': [order.to_dict() for order in orders],
            'count': len(orders)
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

