import { useState, useEffect } from 'react'
import Layout from './Layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Package,
  AlertTriangle
} from 'lucide-react'

const InventoryManagement = ({ user, onLogout }) => {
  const [products, setProducts] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    size: '',
    color: '',
    price: '',
    quantity: '',
    minQuantity: '10'
  })

  // بيانات تجريبية للمنتجات
  useEffect(() => {
    setProducts([
      {
        id: 1,
        name: 'قميص بولو',
        description: 'قميص بولو مدرسي عالي الجودة',
        size: 'S',
        color: 'أزرق',
        price: 45.00,
        quantity: 25,
        minQuantity: 10
      },
      {
        id: 2,
        name: 'قميص بولو',
        description: 'قميص بولو مدرسي عالي الجودة',
        size: 'M',
        color: 'أزرق',
        price: 45.00,
        quantity: 5,
        minQuantity: 10
      },
      {
        id: 3,
        name: 'بنطلون مدرسي',
        description: 'بنطلون مدرسي رسمي',
        size: 'L',
        color: 'رمادي',
        price: 65.00,
        quantity: 2,
        minQuantity: 10
      },
      {
        id: 4,
        name: 'تنورة مدرسية',
        description: 'تنورة مدرسية للطالبات',
        size: 'S',
        color: 'زرقاء',
        price: 55.00,
        quantity: 7,
        minQuantity: 10
      },
      {
        id: 5,
        name: 'قميص أبيض',
        description: 'قميص أبيض رسمي',
        size: 'M',
        color: 'أبيض',
        price: 40.00,
        quantity: 30,
        minQuantity: 10
      }
    ])
  }, [])

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.color.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.size.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleAddProduct = () => {
    const product = {
      id: Date.now(),
      ...newProduct,
      price: parseFloat(newProduct.price),
      quantity: parseInt(newProduct.quantity),
      minQuantity: parseInt(newProduct.minQuantity)
    }
    setProducts([...products, product])
    setNewProduct({
      name: '',
      description: '',
      size: '',
      color: '',
      price: '',
      quantity: '',
      minQuantity: '10'
    })
    setIsAddDialogOpen(false)
  }

  const handleEditProduct = () => {
    const updatedProducts = products.map(product =>
      product.id === editingProduct.id
        ? {
            ...editingProduct,
            price: parseFloat(editingProduct.price),
            quantity: parseInt(editingProduct.quantity),
            minQuantity: parseInt(editingProduct.minQuantity)
          }
        : product
    )
    setProducts(updatedProducts)
    setIsEditDialogOpen(false)
    setEditingProduct(null)
  }

  const handleDeleteProduct = (id) => {
    if (window.confirm('هل أنت متأكد من حذف هذا المنتج؟')) {
      setProducts(products.filter(product => product.id !== id))
    }
  }

  const getStockStatus = (quantity, minQuantity) => {
    if (quantity === 0) {
      return { label: 'نفد المخزون', color: 'bg-red-500' }
    } else if (quantity <= minQuantity) {
      return { label: 'مخزون منخفض', color: 'bg-yellow-500' }
    } else {
      return { label: 'متوفر', color: 'bg-green-500' }
    }
  }

  const ProductForm = ({ product, setProduct, onSubmit, title }) => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">اسم المنتج</Label>
          <Input
            id="name"
            value={product.name}
            onChange={(e) => setProduct({ ...product, name: e.target.value })}
            placeholder="مثال: قميص بولو"
            className="form-input"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="color">اللون</Label>
          <Select value={product.color} onValueChange={(value) => setProduct({ ...product, color: value })}>
            <SelectTrigger className="form-input">
              <SelectValue placeholder="اختر اللون" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="أزرق">أزرق</SelectItem>
              <SelectItem value="أبيض">أبيض</SelectItem>
              <SelectItem value="رمادي">رمادي</SelectItem>
              <SelectItem value="أحمر">أحمر</SelectItem>
              <SelectItem value="أسود">أسود</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="size">الحجم</Label>
          <Select value={product.size} onValueChange={(value) => setProduct({ ...product, size: value })}>
            <SelectTrigger className="form-input">
              <SelectValue placeholder="اختر الحجم" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="XS">XS</SelectItem>
              <SelectItem value="S">S</SelectItem>
              <SelectItem value="M">M</SelectItem>
              <SelectItem value="L">L</SelectItem>
              <SelectItem value="XL">XL</SelectItem>
              <SelectItem value="XXL">XXL</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="price">السعر (ر.س)</Label>
          <Input
            id="price"
            type="number"
            step="0.01"
            value={product.price}
            onChange={(e) => setProduct({ ...product, price: e.target.value })}
            placeholder="0.00"
            className="form-input"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="quantity">الكمية</Label>
          <Input
            id="quantity"
            type="number"
            value={product.quantity}
            onChange={(e) => setProduct({ ...product, quantity: e.target.value })}
            placeholder="0"
            className="form-input"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="minQuantity">الحد الأدنى</Label>
          <Input
            id="minQuantity"
            type="number"
            value={product.minQuantity}
            onChange={(e) => setProduct({ ...product, minQuantity: e.target.value })}
            placeholder="10"
            className="form-input"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">الوصف</Label>
        <Input
          id="description"
          value={product.description}
          onChange={(e) => setProduct({ ...product, description: e.target.value })}
          placeholder="وصف المنتج"
          className="form-input"
        />
      </div>

      <Button onClick={onSubmit} className="w-full btn-school-primary">
        {title}
      </Button>
    </div>
  )

  return (
    <Layout user={user} onLogout={onLogout}>
      <div className="space-y-6">
        {/* رأس الصفحة */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">إدارة المخزون</h1>
            <p className="text-gray-600">إدارة منتجات الزي المدرسي</p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="btn-school-primary">
                <Plus className="ml-2 h-4 w-4" />
                إضافة منتج جديد
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>إضافة منتج جديد</DialogTitle>
                <DialogDescription>
                  أدخل تفاصيل المنتج الجديد
                </DialogDescription>
              </DialogHeader>
              <ProductForm
                product={newProduct}
                setProduct={setNewProduct}
                onSubmit={handleAddProduct}
                title="إضافة المنتج"
              />
            </DialogContent>
          </Dialog>
        </div>

        {/* شريط البحث */}
        <Card>
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="البحث في المنتجات..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-input pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* قائمة المنتجات */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => {
            const stockStatus = getStockStatus(product.quantity, product.minQuantity)
            return (
              <Card key={product.id} className="card-school">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{product.name}</CardTitle>
                      <CardDescription>{product.description}</CardDescription>
                    </div>
                    <Badge className={`${stockStatus.color} text-white`}>
                      {stockStatus.label}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">الحجم:</span>
                      <span className="font-medium">{product.size}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">اللون:</span>
                      <span className="font-medium">{product.color}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">السعر:</span>
                      <span className="font-medium">{product.price.toFixed(2)} د.ك</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">الكمية:</span>
                      <span className={`font-medium ${product.quantity <= product.minQuantity ? 'text-red-600' : ''}`}>
                        {product.quantity}
                        {product.quantity <= product.minQuantity && (
                          <AlertTriangle className="inline h-4 w-4 mr-1" />
                        )}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 mt-4">
                    <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => setEditingProduct({ ...product })}
                        >
                          <Edit className="h-4 w-4 ml-1" />
                          تعديل
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md">
                        <DialogHeader>
                          <DialogTitle>تعديل المنتج</DialogTitle>
                          <DialogDescription>
                            تعديل تفاصيل المنتج
                          </DialogDescription>
                        </DialogHeader>
                        {editingProduct && (
                          <ProductForm
                            product={editingProduct}
                            setProduct={setEditingProduct}
                            onSubmit={handleEditProduct}
                            title="حفظ التغييرات"
                          />
                        )}
                      </DialogContent>
                    </Dialog>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-700"
                      onClick={() => handleDeleteProduct(product.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {filteredProducts.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <Package className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">لا توجد منتجات</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm ? 'لم يتم العثور على منتجات تطابق البحث' : 'ابدأ بإضافة منتج جديد'}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  )
}

export default InventoryManagement

