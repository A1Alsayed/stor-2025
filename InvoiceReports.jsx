import { useState, useEffect } from 'react'
import Layout from './Layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  FileText, 
  Download, 
  Printer,
  BarChart3,
  TrendingUp,
  Calendar,
  Search
} from 'lucide-react'
import schoolLogo from '../assets/school-logo.png'

const InvoiceReports = ({ user, onLogout }) => {
  const [invoices, setInvoices] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [dateFilter, setDateFilter] = useState('الكل')
  const [reportType, setReportType] = useState('مبيعات')
  const [reportPeriod, setReportPeriod] = useState('شهري')

  // بيانات تجريبية للفواتير
  useEffect(() => {
    setInvoices([
      {
        id: 1,
        invoiceNumber: 'INV-001',
        orderId: 3,
        invoiceDate: '2024-01-13',
        studentName: 'خالد سالم',
        parentName: 'سالم خالد',
        totalAmount: 110.00,
        items: [
          { productName: 'بنطلون رمادي - L', quantity: 1, unitPrice: 65.00 },
          { productName: 'قميص بولو أزرق - L', quantity: 1, unitPrice: 45.00 }
        ]
      },
      {
        id: 2,
        invoiceNumber: 'INV-002',
        orderId: 4,
        invoiceDate: '2024-01-12',
        studentName: 'نورا عبدالله',
        parentName: 'عبدالله محمد',
        totalAmount: 90.00,
        items: [
          { productName: 'قميص أبيض - S', quantity: 2, unitPrice: 45.00 }
        ]
      }
    ])
  }, [])

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = 
      invoice.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.parentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase())
    
    // تصفية التاريخ (مبسطة للعرض التوضيحي)
    const matchesDate = dateFilter === 'الكل' || true
    
    return matchesSearch && matchesDate
  })

  const generateInvoicePDF = (invoice) => {
    // محاكاة إنشاء PDF
    const invoiceContent = `
      فاتورة رقم: ${invoice.invoiceNumber}
      
      مدرسة الخليج الأمريكية ثنائية اللغة
      نظام إدارة مخزن الزي المدرسي
      
      تاريخ الفاتورة: ${invoice.invoiceDate}
      اسم الطالب: ${invoice.studentName}
      ولي الأمر: ${invoice.parentName}
      
      المنتجات:
      ${invoice.items.map(item => 
        `${item.productName} - الكمية: ${item.quantity} - السعر: ${item.unitPrice.toFixed(2)} د.ك`
      ).join("\n")}
      
      المبلغ الإجمالي: ${invoice.totalAmount.toFixed(2)} د.ك
    `
    
    // إنشاء ملف نصي مؤقت للعرض التوضيحي
    const blob = new Blob([invoiceContent], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${invoice.invoiceNumber}.txt`
    link.click()
    URL.revokeObjectURL(url)
  }

  const printInvoice = (invoice) => {
    const printContent = `
      <div style="font-family: Arial, sans-serif; direction: rtl; text-align: right; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #E02020;">مدرسة الخليج الأمريكية ثنائية اللغة</h1>
          <h2>فاتورة الزي المدرسي</h2>
        </div>
        
        <div style="margin-bottom: 20px;">
          <p><strong>رقم الفاتورة:</strong> ${invoice.invoiceNumber}</p>
          <p><strong>التاريخ:</strong> ${invoice.invoiceDate}</p>
          <p><strong>اسم الطالب:</strong> ${invoice.studentName}</p>
          <p><strong>ولي الأمر:</strong> ${invoice.parentName}</p>
        </div>
        
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <thead>
            <tr style="background-color: #f5f5f5;">
              <th style="border: 1px solid #ddd; padding: 8px;">المنتج</th>
              <th style="border: 1px solid #ddd; padding: 8px;">الكمية</th>
              <th style="border: 1px solid #ddd; padding: 8px;">السعر</th>
              <th style="border: 1px solid #ddd; padding: 8px;">الإجمالي</th>
            </tr>
          </thead>
          <tbody>
            ${invoice.items.map(item => `
              <tr>
                <td style="border: 1px solid #ddd; padding: 8px;">${item.productName}</td>
                <td style="border: 1px solid #ddd; padding: 8px;">${item.quantity}</td>
                <td style="border: 1px solid #ddd; padding: 8px;">${item.unitPrice.toFixed(2)} د.ك</td>
                <td style="border: 1px solid #ddd; padding: 8px;">${(item.quantity * item.unitPrice).toFixed(2)} د.ك</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
        
        <div style="text-align: left; font-size: 18px; font-weight: bold;">
          المبلغ الإجمالي: ${invoice.totalAmount.toFixed(2)} د.ك
        </div>
      </div>
    `
    
    const printWindow = window.open('', '_blank')
    printWindow.document.write(printContent)
    printWindow.document.close()
    printWindow.print()
  }

  const generateReport = () => {
    // محاكاة إنشاء التقرير
    const reportData = {
      مبيعات: {
        totalSales: 200.00,
        totalOrders: 2,
        averageOrderValue: 100.00,
        topProducts: [
          { name: 'قميص أبيض', sales: 90.00 },
          { name: 'بنطلون رمادي', sales: 65.00 },
          { name: 'قميص بولو أزرق', sales: 45.00 }
        ]
      },
      مخزون: {
        totalProducts: 45,
        lowStockItems: 3,
        outOfStockItems: 0,
        totalValue: 2250.00
      }
    }
    
    const data = reportData[reportType]
    let reportContent = `تقرير ${reportType} - ${reportPeriod}\n\n`
    
    if (reportType === 'مبيعات') {
      reportContent += `إجمالي المبيعات: ${data.totalSales.toFixed(2)} د.ك\n`
      reportContent += `عدد الطلبات: ${data.totalOrders}\n`
      reportContent += `متوسط قيمة الطلب: ${data.averageOrderValue.toFixed(2)} د.ك\n\n`
      reportContent += `أفضل المنتجات مبيعاً:\n`
      data.topProducts.forEach((product, index) => {
        reportContent += `${index + 1}. ${product.name}: ${product.sales.toFixed(2)} د.ك\n`
      })
    } else if (reportType === 'مخزون') {
      reportContent += `إجمالي المنتجات: ${data.totalProducts}\n`
      reportContent += `منتجات منخفضة المخزون: ${data.lowStockItems}\n`
      reportContent += `منتجات نفد مخزونها: ${data.outOfStockItems}\n`
      reportContent += `قيمة المخزون الإجمالية: ${data.totalValue.toFixed(2)} د.ك\n`
    }
    
    const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `تقرير_${reportType}_${reportPeriod}.txt`
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <Layout user={user} onLogout={onLogout}>
      <div className="space-y-6">
        {/* رأس الصفحة */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">الفواتير والتقارير</h1>
          <p className="text-gray-600">إدارة الفواتير وإنشاء التقارير</p>
        </div>

        <Tabs defaultValue="invoices" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="invoices">الفواتير</TabsTrigger>
            <TabsTrigger value="reports">التقارير</TabsTrigger>
          </TabsList>

          {/* تبويب الفواتير */}
          <TabsContent value="invoices" className="space-y-4">
            {/* شريط البحث والتصفية */}
            <Card>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="البحث في الفواتير..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="form-input pl-10"
                    />
                  </div>
                  <Select value={dateFilter} onValueChange={setDateFilter}>
                    <SelectTrigger className="form-input">
                      <SelectValue placeholder="تصفية حسب التاريخ" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="الكل">جميع التواريخ</SelectItem>
                      <SelectItem value="اليوم">اليوم</SelectItem>
                      <SelectItem value="الأسبوع">هذا الأسبوع</SelectItem>
                      <SelectItem value="الشهر">هذا الشهر</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* جدول الفواتير */}
            <Card>
              <CardHeader>
                <CardTitle>قائمة الفواتير</CardTitle>
                <CardDescription>
                  جميع الفواتير الصادرة
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="table-header">
                      <TableHead className="text-right">رقم الفاتورة</TableHead>
                      <TableHead className="text-right">التاريخ</TableHead>
                      <TableHead className="text-right">اسم الطالب</TableHead>
                      <TableHead className="text-right">ولي الأمر</TableHead>
                      <TableHead className="text-right">المبلغ</TableHead>
                      <TableHead className="text-right">الإجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredInvoices.map((invoice) => (
                      <TableRow key={invoice.id}>
                        <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                        <TableCell>{invoice.invoiceDate}</TableCell>
                        <TableCell>{invoice.studentName}</TableCell>
                        <TableCell>{invoice.parentName}</TableCell>
                        <TableCell>{invoice.totalAmount.toFixed(2)} د.ك</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => printInvoice(invoice)}
                            >
                              <Printer className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => generateInvoicePDF(invoice)}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {filteredInvoices.length === 0 && (
                  <div className="text-center py-8">
                    <FileText className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">لا توجد فواتير</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {searchTerm ? 'لم يتم العثور على فواتير تطابق البحث' : 'لم يتم إصدار أي فواتير بعد'}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* تبويب التقارير */}
          <TabsContent value="reports" className="space-y-4">
            {/* إعدادات التقرير */}
            <Card>
              <CardHeader>
                <CardTitle>إنشاء تقرير</CardTitle>
                <CardDescription>
                  اختر نوع التقرير والفترة الزمنية
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>نوع التقرير</Label>
                    <Select value={reportType} onValueChange={setReportType}>
                      <SelectTrigger className="form-input">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="مبيعات">تقرير المبيعات</SelectItem>
                        <SelectItem value="مخزون">تقرير المخزون</SelectItem>
                        <SelectItem value="طلبات">تقرير الطلبات</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>الفترة الزمنية</Label>
                    <Select value={reportPeriod} onValueChange={setReportPeriod}>
                      <SelectTrigger className="form-input">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="يومي">يومي</SelectItem>
                        <SelectItem value="أسبوعي">أسبوعي</SelectItem>
                        <SelectItem value="شهري">شهري</SelectItem>
                        <SelectItem value="سنوي">سنوي</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-end">
                    <Button onClick={generateReport} className="w-full btn-school-primary">
                      <BarChart3 className="ml-2 h-4 w-4" />
                      إنشاء التقرير
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* ملخص الإحصائيات */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="card-school">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    إجمالي المبيعات
                  </CardTitle>
                  <TrendingUp className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">200.00 د.ك</div>
                  <p className="text-xs text-muted-foreground">
                    هذا الشهر
                  </p>
                </CardContent>
              </Card>

              <Card className="card-school">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    عدد الطلبات
                  </CardTitle>
                  <FileText className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">2</div>
                  <p className="text-xs text-muted-foreground">
                    طلب مكتمل
                  </p>
                </CardContent>
              </Card>

              <Card className="card-school">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    متوسط قيمة الطلب
                  </CardTitle>
                  <BarChart3 className="h-4 w-4 text-purple-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">100.00 د.ك</div>
                  <p className="text-xs text-muted-foreground">
                    متوسط الطلب
                  </p>
                </CardContent>
              </Card>

              <Card className="card-school">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    الفواتير الصادرة
                  </CardTitle>
                  <Calendar className="h-4 w-4 text-orange-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">2</div>
                  <p className="text-xs text-muted-foreground">
                    فاتورة هذا الشهر
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* أفضل المنتجات مبيعاً */}
            <Card>
              <CardHeader>
                <CardTitle>أفضل المنتجات مبيعاً</CardTitle>
                <CardDescription>
                  المنتجات الأكثر مبيعاً هذا الشهر
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { name: 'قميص أبيض - S', sales: 90.00, orders: 2 },
                    { name: 'بنطلون رمادي - L', sales: 65.00, orders: 1 },
                    { name: 'قميص بولو أزرق - L', sales: 45.00, orders: 1 }
                  ].map((product, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{product.name}</p>
                        <p className="text-sm text-gray-600">
                          {product.orders} طلب
                        </p>
                      </div>
                      <div className="text-green-600 font-bold">
                        {product.sales.toFixed(2)} ر.س
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  )
}

export default InvoiceReports

