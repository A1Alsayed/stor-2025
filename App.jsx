import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './components/LoginPage'
import Dashboard from './components/Dashboard'
import InventoryManagement from './components/InventoryManagement'
import OrderManagement from './components/OrderManagement'
import InvoiceReports from './components/InvoiceReports'
import UserManagement from './components/UserManagement'
import './App.css'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)

  const handleLogin = (userData) => {
    setIsAuthenticated(true)
    setCurrentUser(userData)
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    setCurrentUser(null)
  }

  return (
    <div className="rtl arabic-font">
      <Router>
        <Routes>
          <Route 
            path="/login" 
            element={
              !isAuthenticated ? 
              <LoginPage onLogin={handleLogin} /> : 
              <Navigate to="/dashboard" replace />
            } 
          />
          <Route 
            path="/dashboard" 
            element={
              isAuthenticated ? 
              <Dashboard user={currentUser} onLogout={handleLogout} /> : 
              <Navigate to="/login" replace />
            } 
          />
          <Route 
            path="/inventory" 
            element={
              isAuthenticated ? 
              <InventoryManagement user={currentUser} onLogout={handleLogout} /> : 
              <Navigate to="/login" replace />
            } 
          />
          <Route 
            path="/orders" 
            element={
              isAuthenticated ? 
              <OrderManagement user={currentUser} onLogout={handleLogout} /> : 
              <Navigate to="/login" replace />
            } 
          />
          <Route 
            path="/invoices" 
            element={
              isAuthenticated ? 
              <InvoiceReports user={currentUser} onLogout={handleLogout} /> : 
              <Navigate to="/login" replace />
            } 
          />
          <Route 
            path="/users" 
            element={
              isAuthenticated && currentUser?.role === 'مدير' ? 
              <UserManagement user={currentUser} onLogout={handleLogout} /> : 
              <Navigate to="/dashboard" replace />
            } 
          />
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </div>
  )
}

export default App

