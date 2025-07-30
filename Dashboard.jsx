import { useState, useEffect } from 'react'
import Layout from './Layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Package, 
  ShoppingCart, 
  FileText, 
  AlertTriangle,
  TrendingUp,
  Users
} from 'lucide-react'

const Dashboard = ({ user, onLogout }) => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    pendingOrders: 0,
    completedOrders: 0,
    lowStockItems: 0,
    totalRevenue: 0,
    totalUsers: 0
  })

  const [lowStockProducts, setLowStockProducts] = useState([])

  // بيانات تجريبية
  useEffect(() => {
    // محاكاة تحميل البيانات
    setStats({
      totalProducts: 45,
      pendingOrders: 8,
      completedOrders: 127,
      lowStockItems: 3,
      totalRevenue: 15750.50,
      totalUsers: 3
    })

    setLowStockProducts([
      { name: 'قميص بولو أزرق - حجم M', quantity: 5, minQuantity: 10 },
      { name: 'بنطلون رمادي - حجم L', quantity: 2, minQuantity: 10 },
      { name: 'تنورة زرقاء - حجم S', quantity: 7, minQuantity: 10 }
    ])
  }, [])

  const dashboardCards = [
    {
      title: 'إجمالي المنتجات',
      value: stats.totalProducts,
      icon: Package,
      color: 'bg-blue-500',
      description: 'منتج متوفر في المخزن'
    },
    {
      title: 'الطلبات المعلقة',
      value: stats.pendingOrders,
      icon: ShoppingCart,
      color: 'bg-yellow-500',
      description: 'طلب بانتظار المعالجة'
    },
    {
      title: 'الطلبات المكتملة',
      value: stats.completedOrders,
      icon: FileText,
      color: 'bg-green-500',
      description: 'طلب تم إنجازه'
    },
    {
      title: 'المنتجات منخفضة المخزون',
      value: stats.lowStockItems,
      icon: AlertTriangle,
      color: 'bg-red-500',
      description: 'منتج يحتاج إعادة تخزين'
    }
  ]

  // إضافة بطاقات إضافية حسب دور المستخدم
  if (user?.role === 'محاسب' || user?.role === 'مدير') {
    dashboardCards.push({
      title: 'إجمالي الإيرادات',
      value: `${stats.totalRevenue.toLocaleString("ar-SA")} د.ك`,
      icon: TrendingUp,
      color: "bg-purple-500",
      description: 'إجمالي المبيعات'
    })
  }

  if (user?.role === 'مدير') {
    dashboardCards.push({
      title: 'المستخدمين',
      value: stats.totalUsers,
      icon: Users,
      color: 'bg-indigo-500',
      description: 'مستخدم نشط'
    })
  }

  return (
    <Layout user={user} onLogout={onLogout}>
      <div className="space-y-6">
        {/* ترحيب */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            مرحباً، {user?.fullName}
          </h1>
          <p className="text-gray-600">
            إليك نظرة عامة على حالة المخزن اليوم
          </p>
        </div>

        {/* تنبيهات المخزون المنخفض */}
        {lowStockProducts.length > 0 && (
          <Alert className="alert-warning">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>تنبيه:</strong> يوجد {lowStockProducts.length} منتجات بكميات منخفضة تحتاج إعادة تخزين
            </AlertDescription>
          </Alert>
        )}

        {/* بطاقات الإحصائيات */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {dashboardCards.map((card, index) => {
            const Icon = card.icon
            return (
              <Card key={index} className="card-school">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {card.title}
                  </CardTitle>
                  <div className={`${card.color} p-2 rounded-md`}>
                    <Icon className="h-4 w-4 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{card.value}</div>
                  <p className="text-xs text-muted-foreground">
                    {card.description}
                  </p>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* المنتجات منخفضة المخزون */}
        {lowStockProducts.length > 0 && (
          <Card className="card-school">
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertTriangle className="h-5 w-5 text-red-500 ml-2" />
                المنتجات منخفضة المخزون
              </CardTitle>
              <CardDescription>
                المنتجات التي تحتاج إعادة تخزين
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {lowStockProducts.map((product, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{product.name}</p>
                      <p className="text-sm text-gray-600">
                        الكمية المتوفرة: {product.quantity} | الحد الأدنى: {product.minQuantity}
                      </p>
                    </div>
                    <div className="text-red-600 font-bold">
                      {product.quantity} قطعة
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* الأنشطة الأخيرة */}
        <Card className="card-school">
          <CardHeader>
            <CardTitle>الأنشطة الأخيرة</CardTitle>
            <CardDescription>
              آخر العمليات في النظام
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 space-x-reverse">
                <div className="bg-green-100 p-2 rounded-full">
                  <ShoppingCart className="h-4 w-4 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">تم إنشاء طلب جديد #1234</p>
                  <p className="text-xs text-gray-500">منذ 5 دقائق</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 space-x-reverse">
                <div className="bg-blue-100 p-2 rounded-full">
                  <Package className="h-4 w-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">تم تحديث مخزون قميص بولو أحمر</p>
                  <p className="text-xs text-gray-500">منذ 15 دقيقة</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 space-x-reverse">
                <div className="bg-purple-100 p-2 rounded-full">
                  <FileText className="h-4 w-4 text-purple-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">تم إصدار فاتورة #INV-001</p>
                  <p className="text-xs text-gray-500">منذ 30 دقيقة</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  )
}

export default Dashboard

