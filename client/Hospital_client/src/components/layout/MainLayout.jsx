import React from 'react'
import { Layout } from 'antd'
import { Routes, Route } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'
import Dashboard from '@/pages/dashboard/Dashboard'
import Patients from '@/pages/patients/Patients'
import Doctors from '@/pages/doctors/Doctors'
import Appointments from '@/pages/appointments/Appointments'
import Billing from '@/pages/billing/Billing'
import Inventory from '@/pages/inventory/Inventory'
import Reports from '@/pages/reports/Reports'
import UserManagement from '@/pages/users/UserManagement'
import Profile from '@/pages/settings/Profile'

const { Content } = Layout

const MainLayout = () => {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sidebar />
      <Layout>
        <Header />
        <Content style={{ margin: '16px' }}>
          <div style={{ padding: 24, background: '#fff', minHeight: 360, borderRadius: 8 }}>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/patients" element={<Patients />} />
              <Route path="/doctors" element={<Doctors />} />
              <Route path="/appointments" element={<Appointments />} />
              <Route path="/billing" element={<Billing />} />
              <Route path="/inventory" element={<Inventory />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/users" element={<UserManagement />} />
              <Route path="/profile" element={<Profile />} />
            </Routes>
          </div>
        </Content>
      </Layout>
    </Layout>
  )
}

export default MainLayout