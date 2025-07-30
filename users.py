from flask import Blueprint, request, jsonify
from src.models.user import User
from src.database import db
from src.routes.auth import require_permission

users_bp = Blueprint('users', __name__)

@users_bp.route('/users', methods=['GET'])
@require_permission('manage_users')
def get_users():
    """الحصول على جميع المستخدمين"""
    try:
        search = request.args.get('search', '')
        role = request.args.get('role', '')
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 50, type=int)
        
        query = User.query
        
        if search:
            query = query.filter(
                User.username.contains(search) |
                User.full_name.contains(search) |
                User.email.contains(search)
            )
        
        if role and role != 'الكل':
            query = query.filter(User.role == role)
        
        users = query.order_by(User.created_at.desc()).paginate(
            page=page, 
            per_page=per_page, 
            error_out=False
        )
        
        return jsonify({
            'users': [user.to_dict() for user in users.items],
            'total': users.total,
            'pages': users.pages,
            'current_page': page
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@users_bp.route('/users/<int:user_id>', methods=['GET'])
@require_permission('manage_users')
def get_user(user_id):
    """الحصول على مستخدم محدد"""
    try:
        user = User.query.get_or_404(user_id)
        return jsonify({'user': user.to_dict()}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@users_bp.route('/users', methods=['POST'])
@require_permission('manage_users')
def create_user():
    """إنشاء مستخدم جديد"""
    try:
        data = request.get_json()
        
        # التحقق من البيانات المطلوبة
        required_fields = ['username', 'password', 'full_name', 'role']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'الحقل {field} مطلوب'}), 400
        
        # التحقق من عدم تكرار اسم المستخدم
        if User.query.filter_by(username=data['username']).first():
            return jsonify({'error': 'اسم المستخدم موجود بالفعل'}), 400
        
        # التحقق من عدم تكرار البريد الإلكتروني
        if data.get('email') and User.query.filter_by(email=data['email']).first():
            return jsonify({'error': 'البريد الإلكتروني موجود بالفعل'}), 400
        
        # التحقق من صحة الدور
        valid_roles = ['أمين مخزن', 'محاسب', 'مدير']
        if data['role'] not in valid_roles:
            return jsonify({'error': 'الدور غير صحيح'}), 400
        
        user = User(
            username=data['username'],
            full_name=data['full_name'],
            email=data.get('email'),
            role=data['role'],
            is_active=data.get('is_active', True)
        )
        user.set_password(data['password'])
        
        db.session.add(user)
        db.session.commit()
        
        return jsonify({
            'message': 'تم إنشاء المستخدم بنجاح',
            'user': user.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@users_bp.route('/users/<int:user_id>', methods=['PUT'])
@require_permission('manage_users')
def update_user(user_id):
    """تحديث مستخدم"""
    try:
        user = User.query.get_or_404(user_id)
        data = request.get_json()
        
        # التحقق من عدم تكرار اسم المستخدم (باستثناء المستخدم الحالي)
        if 'username' in data:
            existing_user = User.query.filter_by(username=data['username']).filter(User.id != user_id).first()
            if existing_user:
                return jsonify({'error': 'اسم المستخدم موجود بالفعل'}), 400
        
        # التحقق من عدم تكرار البريد الإلكتروني (باستثناء المستخدم الحالي)
        if 'email' in data and data['email']:
            existing_user = User.query.filter_by(email=data['email']).filter(User.id != user_id).first()
            if existing_user:
                return jsonify({'error': 'البريد الإلكتروني موجود بالفعل'}), 400
        
        # التحقق من صحة الدور
        if 'role' in data:
            valid_roles = ['أمين مخزن', 'محاسب', 'مدير']
            if data['role'] not in valid_roles:
                return jsonify({'error': 'الدور غير صحيح'}), 400
        
        # تحديث البيانات
        if 'username' in data:
            user.username = data['username']
        if 'full_name' in data:
            user.full_name = data['full_name']
        if 'email' in data:
            user.email = data['email']
        if 'role' in data:
            user.role = data['role']
        if 'is_active' in data:
            user.is_active = data['is_active']
        if 'password' in data and data['password']:
            user.set_password(data['password'])
        
        db.session.commit()
        
        return jsonify({
            'message': 'تم تحديث المستخدم بنجاح',
            'user': user.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@users_bp.route('/users/<int:user_id>', methods=['DELETE'])
@require_permission('manage_users')
def delete_user(user_id):
    """حذف مستخدم"""
    try:
        user = User.query.get_or_404(user_id)
        
        # منع حذف المستخدم الحالي
        if user.id == request.current_user.id:
            return jsonify({'error': 'لا يمكنك حذف حسابك الخاص'}), 400
        
        # التحقق من عدم وجود طلبات مرتبطة بالمستخدم
        if hasattr(user, 'created_orders') and user.created_orders:
            return jsonify({'error': 'لا يمكن حذف المستخدم لوجود طلبات مرتبطة به'}), 400
        
        if hasattr(user, 'processed_orders') and user.processed_orders:
            return jsonify({'error': 'لا يمكن حذف المستخدم لوجود طلبات معالجة بواسطته'}), 400
        
        db.session.delete(user)
        db.session.commit()
        
        return jsonify({'message': 'تم حذف المستخدم بنجاح'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@users_bp.route('/users/<int:user_id>/toggle-status', methods=['PUT'])
@require_permission('manage_users')
def toggle_user_status(user_id):
    """تفعيل/إلغاء تفعيل مستخدم"""
    try:
        user = User.query.get_or_404(user_id)
        
        # منع إلغاء تفعيل المستخدم الحالي
        if user.id == request.current_user.id:
            return jsonify({'error': 'لا يمكنك إلغاء تفعيل حسابك الخاص'}), 400
        
        user.is_active = not user.is_active
        db.session.commit()
        
        status = 'تم تفعيل' if user.is_active else 'تم إلغاء تفعيل'
        
        return jsonify({
            'message': f'{status} المستخدم بنجاح',
            'user': user.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@users_bp.route('/users/stats', methods=['GET'])
@require_permission('manage_users')
def get_users_stats():
    """الحصول على إحصائيات المستخدمين"""
    try:
        total_users = User.query.count()
        active_users = User.query.filter(User.is_active == True).count()
        inactive_users = User.query.filter(User.is_active == False).count()
        
        # إحصائيات الأدوار
        storekeeper_count = User.query.filter(User.role == 'أمين مخزن').count()
        accountant_count = User.query.filter(User.role == 'محاسب').count()
        manager_count = User.query.filter(User.role == 'مدير').count()
        
        return jsonify({
            'total_users': total_users,
            'active_users': active_users,
            'inactive_users': inactive_users,
            'role_distribution': {
                'أمين مخزن': storekeeper_count,
                'محاسب': accountant_count,
                'مدير': manager_count
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@users_bp.route('/users/roles', methods=['GET'])
@require_permission('manage_users')
def get_user_roles():
    """الحصول على قائمة الأدوار المتاحة"""
    try:
        roles = ['أمين مخزن', 'محاسب', 'مدير']
        return jsonify({'roles': roles}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@users_bp.route('/users/change-password', methods=['PUT'])
def change_password():
    """تغيير كلمة المرور للمستخدم الحالي"""
    try:
        data = request.get_json()
        
        # التحقق من البيانات المطلوبة
        required_fields = ['current_password', 'new_password']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'الحقل {field} مطلوب'}), 400
        
        user_id = request.session.get('user_id')
        if not user_id:
            return jsonify({'error': 'غير مصرح بالوصول'}), 401
        
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'المستخدم غير موجود'}), 404
        
        # التحقق من كلمة المرور الحالية
        if not user.check_password(data['current_password']):
            return jsonify({'error': 'كلمة المرور الحالية غير صحيحة'}), 400
        
        # تحديث كلمة المرور
        user.set_password(data['new_password'])
        db.session.commit()
        
        return jsonify({'message': 'تم تغيير كلمة المرور بنجاح'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

