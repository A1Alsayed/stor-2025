from flask import Blueprint, request, jsonify, session
from src.models.user import User
from src.database import db

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/login', methods=['POST'])
def login():
    """تسجيل الدخول"""
    try:
        data = request.get_json()
        username = data.get('username')
        password = data.get('password')
        
        if not username or not password:
            return jsonify({'error': 'اسم المستخدم وكلمة المرور مطلوبان'}), 400
        
        user = User.query.filter_by(username=username).first()
        
        if user and user.check_password(password) and user.is_active:
            # حفظ معلومات المستخدم في الجلسة
            session['user_id'] = user.id
            session['username'] = user.username
            session['role'] = user.role
            
            return jsonify({
                'message': 'تم تسجيل الدخول بنجاح',
                'user': user.to_dict()
            }), 200
        else:
            return jsonify({'error': 'اسم المستخدم أو كلمة المرور غير صحيحة'}), 401
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/logout', methods=['POST'])
def logout():
    """تسجيل الخروج"""
    try:
        session.clear()
        return jsonify({'message': 'تم تسجيل الخروج بنجاح'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/me', methods=['GET'])
def get_current_user():
    """الحصول على معلومات المستخدم الحالي"""
    try:
        user_id = session.get('user_id')
        if not user_id:
            return jsonify({'error': 'غير مصرح بالوصول'}), 401
        
        user = User.query.get(user_id)
        if not user or not user.is_active:
            session.clear()
            return jsonify({'error': 'المستخدم غير موجود أو غير نشط'}), 401
        
        return jsonify({'user': user.to_dict()}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

def require_auth(f):
    """ديكوريتر للتحقق من المصادقة"""
    from functools import wraps
    
    @wraps(f)
    def decorated_function(*args, **kwargs):
        user_id = session.get('user_id')
        if not user_id:
            return jsonify({'error': 'غير مصرح بالوصول'}), 401
        
        user = User.query.get(user_id)
        if not user or not user.is_active:
            session.clear()
            return jsonify({'error': 'المستخدم غير موجود أو غير نشط'}), 401
        
        # إضافة المستخدم إلى الطلب
        request.current_user = user
        return f(*args, **kwargs)
    
    return decorated_function

def require_permission(permission):
    """ديكوريتر للتحقق من الصلاحيات"""
    def decorator(f):
        from functools import wraps
        
        @wraps(f)
        def decorated_function(*args, **kwargs):
            user_id = session.get('user_id')
            if not user_id:
                return jsonify({'error': 'غير مصرح بالوصول'}), 401
            
            user = User.query.get(user_id)
            if not user or not user.is_active:
                session.clear()
                return jsonify({'error': 'المستخدم غير موجود أو غير نشط'}), 401
            
            if not user.has_permission(permission):
                return jsonify({'error': 'ليس لديك صلاحية للوصول إلى هذا المورد'}), 403
            
            # إضافة المستخدم إلى الطلب
            request.current_user = user
            return f(*args, **kwargs)
        
        return decorated_function
    return decorator

