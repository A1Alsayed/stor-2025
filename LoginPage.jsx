import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { LogIn, User, Lock } from 'lucide-react'
import schoolLogo from '../assets/school-logo.png'

const LoginPage = ({ onLogin }) => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // بيانات تجريبية للمستخدمين
  const users = [
    { username: 'storekeeper', password: '123456', role: 'أمين مخزن', fullName: 'أحمد محمد' },
    { username: 'accountant', password: '123456', role: 'محاسب', fullName: 'فاطمة علي' },
    { username: 'manager', password: '123456', role: 'مدير', fullName: 'محمد السالم' }
  ]

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    // محاكاة تأخير الشبكة
    await new Promise(resolve => setTimeout(resolve, 1000))

    const user = users.find(u => u.username === username && u.password === password)
    
    if (user) {
      onLogin(user)
    } else {
      setError('اسم المستخدم أو كلمة المرور غير صحيحة')
    }
    
    setIsLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-red-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <img 
              src={schoolLogo} 
              alt="شعار مدرسة الخليج الأمريكية" 
              className="h-20 w-20 object-contain"
            />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-800">
            نظام إدارة مخزن الزي المدرسي
          </CardTitle>
          <CardDescription className="text-gray-600">
            مدرسة الخليج الأمريكية ثنائية اللغة
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert className="alert-error">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="username" className="text-right block">
                اسم المستخدم
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="form-input pl-10"
                  placeholder="أدخل اسم المستخدم"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-right block">
                كلمة المرور
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="form-input pl-10"
                  placeholder="أدخل كلمة المرور"
                  required
                />
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full btn-school-primary"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  جاري تسجيل الدخول...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <LogIn className="ml-2 h-4 w-4" />
                  تسجيل الدخول
                </div>
              )}
            </Button>
          </form>

          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-sm text-gray-700 mb-2">بيانات تجريبية:</h3>
            <div className="text-xs text-gray-600 space-y-1">
              <div>أمين مخزن: storekeeper / 123456</div>
              <div>محاسب: accountant / 123456</div>
              <div>مدير: manager / 123456</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default LoginPage

