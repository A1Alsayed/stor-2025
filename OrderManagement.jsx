import { useState, useEffect } from 'react'
import Layout from './Layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { 
  Plus, 
  Search, 
  Eye, 
  CheckCircle,
  Clock,
  XCircle,
  ShoppingCart
} from 'lucide-react'

const OrderManagement = ({ user, onLogout }) => {
  const [orders, setOrders] = useState([])
  const [products, setProducts] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('الكل')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [viewingOrder, setViewingOrder] = useState(null)
  const [newOrder, setNewOrder] = useState({
    studentName: '',
    parentName: '',
    items: []
  })
  const [selectedProduct, setSelectedProduct] = useState('')
  const [selectedQuantity, setSelectedQuantity] = useState(1)

  // بيانات تجريبية
  useEffect(() => {
    setProducts([
      { id: 1, name: 'قميص بولو أزرق - S', price: 45.00, quantity: 25 },
      { id: 2, name: 'قميص بولو أزرق - M', price: 45.00, quantity: 5 },
      { id: 3, name: 'بنطلون رمادي - L', price: 65.00, quantity: 2 },
      { id: 4, name: 'تنورة زرقاء - S', price: 55.00, quantity: 7 },
      { id: 5, name: 'قميص أبيض - M', price: 40.00, quantity: 30 }
    ])

    setOrders([
      {
        id: 1,
        orderDate: '2024-01-15',
        studentName: 'أحمد محمد علي',
        parentName: 'محمد علي أحمد',
        status: 'معلق',
        totalAmount: 135.00,
        items: [
          { productName: 'قميص بولو أزرق - M', quantity: 2, unitPrice: 45.00 },
          { productName: 'قميص أبيض - M', quantity: 1, unitPrice: 45.00 }
        ],
        storekeeperId: 1,
        accountantId: null
      },
      {
        id: 2,
        orderDate: '2024-01-14',
        studentName: 'فاطمة أحمد',
        parentName: 'أحمد محمد',
        status: 'بانتظار الدفع',
        totalAmount: 100.00,
        items: [
          { productName: 'تنورة زرقاء - S', quantity: 1, unitPrice: 55.00 },
          { productName: 'قميص أبيض - S', quantity: 1, unitPrice: 45.00 }
        ],
        storekeeperId: 1,
        accountantId: 2
      },
      {
        id: 3,
        orderDate: '2024-01-13',
        studentName: 'خالد سالم',
        parentName: 'سالم خالد',
        status: 'مدفوع',
        totalAmount: 110.00,
        items: [
          { productName: 'بنطلون رمادي - L', quantity: 1, unitPrice: 65.00 },
          { productName: 'قميص بولو أزرق - L', quantity: 1, unitPrice: 45.00 }
        ],
        storekeeperId: 1,
        accountantId: 2
      },
      {
        id: 4,
        orderDate: '2024-01-12',
        studentName: 'نورا عبدالله',
        parentName: 'عبدالله محمد',
        status: 'مكتمل',
        totalAmount: 90.00,
        items: [
          { productName: 'قميص أبيض - S', quantity: 2, unitPrice: 45.00 }
        ],
        storekeeperId: 1,
        accountantId: 2
      }
    ])
  }, [])

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.parentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.id.toString().includes(searchTerm)
    
    const matchesStatus = statusFilter === 'الكل' || order.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status) => {
    const statusConfig = {
      'معلق': { color: 'bg-gray-500', icon: Clock },
      'بانتظار الدفع': { color: 'bg-yellow-500', icon: Clock },
      'مدفوع': { color: 'bg-blue-500', icon: CheckCircle },
      'مكتمل': { color: 'bg-green-500', icon: CheckCircle },
      'ملغي': { color: 'bg-red-500', icon: XCircle }
    }
    
    const config = statusConfig[status] || statusConfig['معلق']
    const Icon = config.icon
    
    return (
      <Badge className={`${config.color} text-white`}>
        <Icon className="h-3 w-3 ml-1" />
        {status}
      </Badge>
    )
  }

  const addItemToOrder = () => {
    if (!selectedProduct || selectedQuantity <= 0) return
    
    const product = products.find(p => p.id === parseInt(selectedProduct))
    if (!product) return
    
    const newItem = {
      productId: product.id,
      productName: product.name,
      quantity: selectedQuantity,
      unitPrice: product.price,
      subtotal: selectedQuantity * product.price
    }
    
    setNewOrder({
      ...newOrder,
      items: [...newOrder.items, newItem]
    })
    
    setSelectedProduct('')
    setSelectedQuantity(1)
  }

  const removeItemFromOrder = (index) => {
    const updatedItems = newOrder.items.filter((_, i) => i !== index)
    setNewOrder({ ...newOrder, items: updatedItems })
  }

  const calculateTotal = () => {
    return newOrder.items.reduce((total, item) => total + item.subtotal, 0)
  }

  const handleCreateOrder = () => {
    if (!newOrder.studentName || !newOrder.parentName || newOrder.items.length === 0) {
      alert('يرجى ملء جميع الحقول المطلوبة وإضافة منتج واحد على الأقل')
      return
    }
    
    const order = {
      id: Date.now(),
      orderDate: new Date().toISOString().split('T')[0],
      ...newOrder,
      status: 'معلق',
      totalAmount: calculateTotal(),
      storekeeperId: 1,
      accountantId: null
    }
    
    setOrders([order, ...orders])
    setNewOrder({ studentName: '', parentName: '', items: [] })
    setIsAddDialogOpen(false)
  }

  const updateOrderStatus = (orderId, newStatus) => {
    const updatedOrders = orders.map(order =>
      order.id === orderId ? { ...order, status: newStatus } : order
    )
    setOrders(updatedOrders)
  }

  const canUpdateStatus = (order) => {
    if (user?.role === 'أمين مخزن') {
      return order.status === 'معلق'
    } else if (user?.role === 'محاسب') {
      return order.status === 'بانتظار الدفع' || order.status === 'مدفوع'
    } else if (user?.role === 'مدير') {
      return true
    }
    return false
  }

  const getNextStatus = (currentStatus, userRole) => {
    if (userRole === 'أمين مخزن' && currentStatus === 'معلق') {
      return 'بانتظار الدفع'
    } else if (userRole === 'محاسب' && currentStatus === 'بانتظار الدفع') {
      return 'مدفوع'
    } else if (userRole === 'أمين مخزن' && currentStatus === 'مدفوع') {
      return 'مكتمل'
    }
    return null
  }

  return (
    <Layout user={user} onLogout={onLogout}>
      <div className="space-y-6">
        {/* رأس الصفحة */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">إدارة الطلبات</h1>
            <p className="text-gray-600">متابعة وإدارة طلبات الزي المدرسي</p>
          </div>
          {(user?.role === 'أمين مخزن' || user?.role === 'مدير') && (
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="btn-school-primary">
                  <Plus className="ml-2 h-4 w-4" />
                  إنشاء طلب جديد
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>إنشاء طلب جديد</DialogTitle>
                  <DialogDescription>
                    أدخل تفاصيل الطلب والمنتجات المطلوبة
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="studentName">اسم الطالب</Label>
                      <Input
                        id="studentName"
                        value={newOrder.studentName}
                        onChange={(e) => setNewOrder({ ...newOrder, studentName: e.target.value })}
                        placeholder="اسم الطالب"
                        className="form-input"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="parentName">اسم ولي الأمر</Label>
                      <Input
                        id="parentName"
                        value={newOrder.parentName}
                        onChange={(e) => setNewOrder({ ...newOrder, parentName: e.target.value })}
                        placeholder="اسم ولي الأمر"
                        className="form-input"
                      />
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <h3 className="font-medium mb-3">إضافة منتجات</h3>
                    <div className="grid grid-cols-3 gap-2 mb-3">
                      <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                        <SelectTrigger className="form-input">
                          <SelectValue placeholder="اختر المنتج" />
                        </SelectTrigger>
                        <SelectContent>
                          {products.map(product => (
                            <SelectItem key={product.id} value={product.id.toString()}>
                              {product.name} - {product.price.toFixed(2)} د.ك
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Input
                        type="number"
                        min="1"
                        value={selectedQuantity}
                        onChange={(e) => setSelectedQuantity(parseInt(e.target.value) || 1)}
                        placeholder="الكمية"
                        className="form-input"
                      />
                      <Button onClick={addItemToOrder} className="btn-school-secondary">
                        إضافة
                      </Button>
                    </div>

                    {newOrder.items.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="font-medium">المنتجات المضافة:</h4>
                        {newOrder.items.map((item, index) => (
                          <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                            <div>
                              <span className="font-medium">{item.productName}</span>
                              <span className="text-sm text-gray-600 mr-2">
                                الكمية: {item.quantity} × {item.unitPrice.toFixed(2)} د.ك
                              </span>
                            </div>
                            <div className="flex items-center">
                              <span className="font-medium ml-3">{item.subtotal.toFixed(2)} د.ك</span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeItemFromOrder(index)}
                                className="text-red-600"
                              >
                                حذف
                              </Button>
                            </div>
                          </div>
                        ))}
                        <div className="text-left font-bold text-lg">
                          الإجمالي: {calculateTotal().toFixed(2)} د.ك
                        </div>
                      </div>
                    )}
                  </div>

                  <Button onClick={handleCreateOrder} className="w-full btn-school-primary">
                    إنشاء الطلب
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* شريط البحث والتصفية */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="البحث في الطلبات..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="form-input pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="form-input">
                  <SelectValue placeholder="تصفية حسب الحالة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="الكل">جميع الحالات</SelectItem>
                  <SelectItem value="معلق">معلق</SelectItem>
                  <SelectItem value="بانتظار الدفع">بانتظار الدفع</SelectItem>
                  <SelectItem value="مدفوع">مدفوع</SelectItem>
                  <SelectItem value="مكتمل">مكتمل</SelectItem>
                  <SelectItem value="ملغي">ملغي</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* جدول الطلبات */}
        <Card>
          <CardHeader>
            <CardTitle>قائمة الطلبات</CardTitle>
            <CardDescription>
              جميع طلبات الزي المدرسي
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="table-header">
                  <TableHead className="text-right">رقم الطلب</TableHead>
                  <TableHead className="text-right">التاريخ</TableHead>
                  <TableHead className="text-right">اسم الطالب</TableHead>
                  <TableHead className="text-right">ولي الأمر</TableHead>
                  <TableHead className="text-right">المبلغ الإجمالي</TableHead>
                  <TableHead className="text-right">الحالة</TableHead>
                  <TableHead className="text-right">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">#{order.id}</TableCell>
                    <TableCell>{order.orderDate}</TableCell>
                    <TableCell>{order.studentName}</TableCell>
                    <TableCell>{order.parentName}</TableCell>
                    <TableCell>{order.totalAmount.toFixed(2)} د.ك</TableCell>
                    <TableCell>{getStatusBadge(order.status)}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setViewingOrder(order)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>تفاصيل الطلب #{viewingOrder?.id}</DialogTitle>
                            </DialogHeader>
                            {viewingOrder && (
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label>اسم الطالب</Label>
                                    <p className="font-medium">{viewingOrder.studentName}</p>
                                  </div>
                                  <div>
                                    <Label>ولي الأمر</Label>
                                    <p className="font-medium">{viewingOrder.parentName}</p>
                                  </div>
                                  <div>
                                    <Label>تاريخ الطلب</Label>
                                    <p className="font-medium">{viewingOrder.orderDate}</p>
                                  </div>
                                  <div>
                                    <Label>الحالة</Label>
                                    <div className="mt-1">{getStatusBadge(viewingOrder.status)}</div>
                                  </div>
                                </div>
                                
                                <div>
                                  <Label>المنتجات</Label>
                                  <div className="mt-2 space-y-2">
                                    {viewingOrder.items.map((item, index) => (
                                      <div key={index} className="flex justify-between p-2 bg-gray-50 rounded">
                                        <span>{item.productName}</span>
                                        <span>
                                          {item.quantity} × {item.unitPrice.toFixed(2)} = {(item.quantity * item.unitPrice).toFixed(2)} ر.س
                                        </span>
                                      </div>
                                    ))}
                                    <div className="text-left font-bold text-lg border-t pt-2">
                                      الإجمالي: {viewingOrder.totalAmount.toFixed(2)} ر.س
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                        
                        {canUpdateStatus(order) && (
                          <Button
                            size="sm"
                            className="btn-school-secondary"
                            onClick={() => {
                              const nextStatus = getNextStatus(order.status, user.role)
                              if (nextStatus) {
                                updateOrderStatus(order.id, nextStatus)
                              }
                            }}
                          >
                            {order.status === 'معلق' && 'إرسال للمحاسب'}
                            {order.status === 'بانتظار الدفع' && 'تأكيد الدفع'}
                            {order.status === 'مدفوع' && 'إكمال الطلب'}
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {filteredOrders.length === 0 && (
              <div className="text-center py-8">
                <ShoppingCart className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">لا توجد طلبات</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {searchTerm || statusFilter !== 'الكل' ? 'لم يتم العثور على طلبات تطابق البحث' : 'لم يتم إنشاء أي طلبات بعد'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  )
}

export default OrderManagement

