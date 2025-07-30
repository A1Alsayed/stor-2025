import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  FileText, 
  Users, 
  LogOut,
  Menu,
  X
} from 'lucide-react'
import schoolLogo from '../assets/school-logo.png'

const Layout = ({ children, user, onLogout }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()

  const menuItems = [
    { 
      path: '/dashboard', 
      icon: LayoutDashboard, 
      label: 'لوحة التحكم',
      roles: ['أمين مخزن', 'محاسب', 'مدير']
    },
    { 
      path: '/inventory', 
      icon: Package, 
      label: 'إدارة المخزون',
      roles: ['أمين مخزن', 'مدير']
    },
    { 
      path: '/orders', 
      icon: ShoppingCart, 
      label: 'إدارة الطلبات',
      roles: ['أمين مخزن', 'محاسب', 'مدير']
    },
    { 
      path: '/invoices', 
      icon: FileText, 
      label: 'الفواتير والتقارير',
      roles: ['محاسب', 'مدير']
    },
    { 
      path: '/users', 
      icon: Users, 
      label: 'إدارة المستخدمين',
      roles: ['مدير']
    }
  ]

  const filteredMenuItems = menuItems.filter(item => 
    item.roles.includes(user?.role)
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* الشريط الجانبي للشاشات الكبيرة */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex min-h-0 flex-1 flex-col bg-white border-r border-gray-200">
          <div className="flex flex-1 flex-col pt-5 pb-4 overflow-y-auto">
            <div className="flex items-center flex-shrink-0 px-4">
              <img 
                src={schoolLogo} 
                alt="شعار المدرسة" 
                className="h-12 w-12 object-contain ml-3"
              />
              <div>
                <h1 className="text-lg font-bold text-gray-900">
                  نظام إدارة المخزن
                </h1>
                <p className="text-sm text-gray-500">
                  مدرسة الخليج الأمريكية
                </p>
              </div>
            </div>
            <nav className="mt-8 flex-1 px-2 space-y-1">
              {filteredMenuItems.map((item) => {
                const Icon = item.icon
                const isActive = location.pathname === item.path
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`sidebar-item flex items-center ${
                      isActive ? 'active' : ''
                    }`}
                  >
                    <Icon className="ml-3 h-5 w-5" />
                    {item.label}
                  </Link>
                )
              })}
            </nav>
          </div>
          <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
            <div className="flex items-center w-full">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  {user?.fullName}
                </p>
                <p className="text-xs text-gray-500">
                  {user?.role}
                </p>
              </div>
              <Button
                onClick={onLogout}
                variant="ghost"
                size="sm"
                className="text-gray-500 hover:text-red-600"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* الشريط الجانبي للشاشات الصغيرة */}
      {sidebarOpen && (
        <div className="fixed inset-0 flex z-40 lg:hidden">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <Button
                onClick={() => setSidebarOpen(false)}
                variant="ghost"
                size="sm"
                className="text-white"
              >
                <X className="h-6 w-6" />
              </Button>
            </div>
            <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
              <div className="flex items-center flex-shrink-0 px-4">
                <img 
                  src={schoolLogo} 
                  alt="شعار المدرسة" 
                  className="h-8 w-8 object-contain ml-2"
                />
                <h1 className="text-lg font-bold text-gray-900">
                  نظام إدارة المخزن
                </h1>
              </div>
              <nav className="mt-5 px-2 space-y-1">
                {filteredMenuItems.map((item) => {
                  const Icon = item.icon
                  const isActive = location.pathname === item.path
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setSidebarOpen(false)}
                      className={`sidebar-item flex items-center ${
                        isActive ? 'active' : ''
                      }`}
                    >
                      <Icon className="ml-3 h-5 w-5" />
                      {item.label}
                    </Link>
                  )
                })}
              </nav>
            </div>
            <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
              <div className="flex items-center w-full">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {user?.fullName}
                  </p>
                  <p className="text-xs text-gray-500">
                    {user?.role}
                  </p>
                </div>
                <Button
                  onClick={onLogout}
                  variant="ghost"
                  size="sm"
                  className="text-gray-500 hover:text-red-600"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* المحتوى الرئيسي */}
      <div className="lg:pr-64 flex flex-col flex-1">
        <div className="sticky top-0 z-10 lg:hidden pl-1 pt-1 sm:pl-3 sm:pt-3 bg-gray-50">
          <Button
            onClick={() => setSidebarOpen(true)}
            variant="ghost"
            size="sm"
            className="text-gray-500"
          >
            <Menu className="h-6 w-6" />
          </Button>
        </div>
        <main className="flex-1">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default Layout

