from flask import Blueprint, request, jsonify, make_response
from src.models.order import Order, OrderItem
from src.models.product import Product
from src.models.user import User
from src.models.invoice import Invoice
from src.database import db
from src.routes.auth import require_permission
from datetime import datetime, timedelta
import io
from reportlab.lib.pagesizes import letter, A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.units import inch
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
import os

reports_bp = Blueprint('reports', __name__)

# تسجيل خط عربي للـ PDF
try:
    font_path = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
    if os.path.exists(font_path):
        pdfmetrics.registerFont(TTFont('Arabic', font_path))
except:
    pass

@reports_bp.route('/reports/sales', methods=['GET'])
@require_permission('view_reports')
def get_sales_report():
    """تقرير المبيعات"""
    try:
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')
        
        query = Order.query.filter(Order.status.in_(['مدفوع', 'مكتمل']))
        
        if start_date:
            start_date = datetime.strptime(start_date, '%Y-%m-%d')
            query = query.filter(Order.order_date >= start_date)
        
        if end_date:
            end_date = datetime.strptime(end_date, '%Y-%m-%d')
            query = query.filter(Order.order_date <= end_date)
        
        orders = query.all()
        
        # حساب الإحصائيات
        total_sales = sum(order.total_amount for order in orders)
        total_orders = len(orders)
        
        # تجميع المبيعات حسب المنتج
        product_sales = {}
        for order in orders:
            for item in order.items:
                product_name = f"{item.product.name} - {item.product.size} - {item.product.color}"
                if product_name not in product_sales:
                    product_sales[product_name] = {
                        'quantity': 0,
                        'revenue': 0
                    }
                product_sales[product_name]['quantity'] += item.quantity
                product_sales[product_name]['revenue'] += float(item.subtotal)
        
        # تجميع المبيعات حسب التاريخ
        daily_sales = {}
        for order in orders:
            date_key = order.order_date.strftime('%Y-%m-%d')
            if date_key not in daily_sales:
                daily_sales[date_key] = {
                    'orders': 0,
                    'revenue': 0
                }
            daily_sales[date_key]['orders'] += 1
            daily_sales[date_key]['revenue'] += float(order.total_amount)
        
        return jsonify({
            'summary': {
                'total_sales': float(total_sales),
                'total_orders': total_orders,
                'average_order_value': float(total_sales / total_orders) if total_orders > 0 else 0
            },
            'product_sales': product_sales,
            'daily_sales': daily_sales,
            'orders': [order.to_dict() for order in orders]
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@reports_bp.route('/reports/inventory', methods=['GET'])
@require_permission('view_reports')
def get_inventory_report():
    """تقرير المخزون"""
    try:
        products = Product.query.all()
        
        total_products = len(products)
        total_value = sum(product.price * product.quantity for product in products)
        low_stock_products = [p for p in products if p.is_low_stock()]
        out_of_stock_products = [p for p in products if p.is_out_of_stock()]
        
        # تجميع المنتجات حسب الفئة
        categories = {}
        for product in products:
            category = product.name
            if category not in categories:
                categories[category] = {
                    'products': 0,
                    'total_quantity': 0,
                    'total_value': 0
                }
            categories[category]['products'] += 1
            categories[category]['total_quantity'] += product.quantity
            categories[category]['total_value'] += float(product.price * product.quantity)
        
        return jsonify({
            'summary': {
                'total_products': total_products,
                'total_value': float(total_value),
                'low_stock_count': len(low_stock_products),
                'out_of_stock_count': len(out_of_stock_products)
            },
            'categories': categories,
            'low_stock_products': [p.to_dict() for p in low_stock_products],
            'out_of_stock_products': [p.to_dict() for p in out_of_stock_products],
            'all_products': [p.to_dict() for p in products]
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@reports_bp.route('/invoices', methods=['GET'])
@require_permission('generate_invoices')
def get_invoices():
    """الحصول على جميع الفواتير"""
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 50, type=int)
        
        invoices = Invoice.query.order_by(Invoice.created_at.desc()).paginate(
            page=page, 
            per_page=per_page, 
            error_out=False
        )
        
        return jsonify({
            'invoices': [invoice.to_dict() for invoice in invoices.items],
            'total': invoices.total,
            'pages': invoices.pages,
            'current_page': page
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@reports_bp.route('/invoices/<int:order_id>', methods=['POST'])
@require_permission('generate_invoices')
def create_invoice(order_id):
    """إنشاء فاتورة لطلب"""
    try:
        order = Order.query.get_or_404(order_id)
        
        if order.status not in ['مدفوع', 'مكتمل']:
            return jsonify({'error': 'لا يمكن إنشاء فاتورة لطلب غير مدفوع'}), 400
        
        # التحقق من عدم وجود فاتورة مسبقة
        existing_invoice = Invoice.query.filter_by(order_id=order_id).first()
        if existing_invoice:
            return jsonify({'error': 'الفاتورة موجودة بالفعل'}), 400
        
        invoice = Invoice(
            order_id=order_id,
            total_amount=order.total_amount,
            accountant_id=request.current_user.id
        )
        invoice.generate_invoice_number()
        
        db.session.add(invoice)
        db.session.commit()
        
        return jsonify({
            'message': 'تم إنشاء الفاتورة بنجاح',
            'invoice': invoice.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@reports_bp.route('/invoices/<int:invoice_id>/pdf', methods=['GET'])
@require_permission('generate_invoices')
def generate_invoice_pdf(invoice_id):
    """توليد PDF للفاتورة"""
    try:
        invoice = Invoice.query.get_or_404(invoice_id)
        order = invoice.order
        
        # إنشاء PDF في الذاكرة
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=A4, rightMargin=72, leftMargin=72,
                              topMargin=72, bottomMargin=18)
        
        # إعداد الأنماط
        styles = getSampleStyleSheet()
        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Heading1'],
            fontSize=18,
            spaceAfter=30,
            alignment=1,  # وسط
            fontName='Arabic' if 'Arabic' in pdfmetrics.getRegisteredFontNames() else 'Helvetica-Bold'
        )
        
        normal_style = ParagraphStyle(
            'CustomNormal',
            parent=styles['Normal'],
            fontSize=12,
            fontName='Arabic' if 'Arabic' in pdfmetrics.getRegisteredFontNames() else 'Helvetica'
        )
        
        # محتوى الفاتورة
        story = []
        
        # العنوان
        story.append(Paragraph("مدرسة الخليج الأمريكية ثنائية اللغة", title_style))
        story.append(Paragraph("American Gulf Bilingual School", title_style))
        story.append(Spacer(1, 12))
        
        # معلومات الفاتورة
        invoice_info = [
            [f"Invoice Number: {invoice.invoice_number}", f"رقم الفاتورة: {invoice.invoice_number}"],
            [f"Date: {invoice.invoice_date.strftime('%Y-%m-%d')}", f"التاريخ: {invoice.invoice_date.strftime('%Y-%m-%d')}"],
            [f"Order ID: {order.id}", f"رقم الطلب: {order.id}"],
            [f"Student: {order.student_name}", f"الطالب: {order.student_name}"],
            [f"Parent: {order.parent_name}", f"ولي الأمر: {order.parent_name}"]
        ]
        
        invoice_table = Table(invoice_info, colWidths=[3*inch, 3*inch])
        invoice_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 14),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
            ('GRID', (0, 0), (-1, -1), 1, colors.black)
        ]))
        
        story.append(invoice_table)
        story.append(Spacer(1, 12))
        
        # جدول المنتجات
        data = [['Product', 'Size', 'Color', 'Qty', 'Price', 'Total']]
        data.append(['المنتج', 'الحجم', 'اللون', 'الكمية', 'السعر', 'المجموع'])
        
        for item in order.items:
            data.append([
                item.product.name,
                item.product.size,
                item.product.color,
                str(item.quantity),
                f"{item.unit_price:.2f} KWD",
                f"{item.subtotal:.2f} KWD"
            ])
        
        # إضافة المجموع الكلي
        data.append(["", "", "", "", "Total:", f"{order.total_amount:.2f} KWD"])
        data.append(["", "", "", "", "المجموع الكلي:", f"{order.total_amount:.2f} دينار كويتي"])
        
        table = Table(data, colWidths=[2*inch, 1*inch, 1*inch, 0.7*inch, 1*inch, 1*inch])
        table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 1), colors.grey),
            ('TEXTCOLOR', (0, 0), (-1, 1), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 1), 12),
            ('BOTTOMPADDING', (0, 0), (-1, 1), 12),
            ('BACKGROUND', (0, 2), (-1, -3), colors.beige),
            ('BACKGROUND', (0, -2), (-1, -1), colors.lightgrey),
            ('FONTNAME', (0, -2), (-1, -1), 'Helvetica-Bold'),
            ('GRID', (0, 0), (-1, -1), 1, colors.black)
        ]))
        
        story.append(table)
        story.append(Spacer(1, 12))
        
        # معلومات إضافية
        story.append(Paragraph("Thank you for your business!", normal_style))
        story.append(Paragraph("شكراً لتعاملكم معنا!", normal_style))
        
        # بناء PDF
        doc.build(story)
        
        # إرجاع PDF
        buffer.seek(0)
        response = make_response(buffer.getvalue())
        response.headers['Content-Type'] = 'application/pdf'
        response.headers['Content-Disposition'] = f'attachment; filename=invoice_{invoice.invoice_number}.pdf'
        
        return response
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@reports_bp.route('/reports/export/sales', methods=['GET'])
@require_permission('view_reports')
def export_sales_report():
    """تصدير تقرير المبيعات كـ PDF"""
    try:
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')
        
        query = Order.query.filter(Order.status.in_(['مدفوع', 'مكتمل']))
        
        if start_date:
            start_date = datetime.strptime(start_date, '%Y-%m-%d')
            query = query.filter(Order.order_date >= start_date)
        
        if end_date:
            end_date = datetime.strptime(end_date, '%Y-%m-%d')
            query = query.filter(Order.order_date <= end_date)
        
        orders = query.all()
        
        # إنشاء PDF
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=A4)
        
        story = []
        styles = getSampleStyleSheet()
        
        # العنوان
        title = Paragraph("Sales Report - تقرير المبيعات", styles['Title'])
        story.append(title)
        story.append(Spacer(1, 12))
        
        # الملخص
        total_sales = sum(order.total_amount for order in orders)
        summary_data = [
            ['Total Orders', 'إجمالي الطلبات', str(len(orders))],
            ["Total Sales", "إجمالي المبيعات", f"{total_sales:.2f} KWD"],
            ["Period", "الفترة", f"{(start_date.strftime('%Y-%m-%d') if start_date else 'All')} to {(end_date.strftime('%Y-%m-%d') if end_date else 'All')}"]
        ]
        
        summary_table = Table(summary_data)
        summary_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 14),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
            ('GRID', (0, 0), (-1, -1), 1, colors.black)
        ]))
        
        story.append(summary_table)
        story.append(Spacer(1, 12))
        
        # جدول الطلبات
        data = [['Order ID', 'Date', 'Student', 'Parent', 'Amount']]
        for order in orders:
            data.append([
                str(order.id),
                order.order_date.strftime('%Y-%m-%d'),
                order.student_name,
                order.parent_name,
                f"{order.total_amount:.2f} SAR"
            ])
        
        orders_table = Table(data)
        orders_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 12),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
            ('GRID', (0, 0), (-1, -1), 1, colors.black)
        ]))
        
        story.append(orders_table)
        
        doc.build(story)
        
        buffer.seek(0)
        response = make_response(buffer.getvalue())
        response.headers['Content-Type'] = 'application/pdf'
        response.headers['Content-Disposition'] = 'attachment; filename=sales_report.pdf'
        
        return response
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

