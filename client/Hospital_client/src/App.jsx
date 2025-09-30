import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ConfigProvider } from 'antd'
import MainLayout from '@/components/layout/MainLayout'
import Login from '@/pages/auth/Login'
import Register from '@/pages/auth/Register'
import Dashboard from '@/pages/dashboard/Dashboard'
import Patients from '@/pages/patients/Patients'
import Doctors from '@/pages/doctors/Doctors'
import Appointments from '@/pages/appointments/Appointments'
import Billing from '@/pages/billing/Billing'
import Inventory from '@/pages/inventory/Inventory'
import Reports from '@/pages/reports/Reports'
import UserManagement from '@/pages/users/UserManagement'
import Profile from '@/pages/settings/Profile'
import { AuthProvider } from '@/contexts/AuthContext'
import './App.css'

function App() {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#1890ff',
        },
      }}
    >
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/*" element={<MainLayout />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ConfigProvider>
  )
}

export default App