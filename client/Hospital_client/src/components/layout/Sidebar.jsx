import React from 'react'
import { Layout, Menu } from 'antd'
import { 
  DashboardOutlined, 
  UserOutlined, 
  TeamOutlined, 
  CalendarOutlined,
  DollarOutlined,
  MedicineBoxOutlined,
  BarChartOutlined,
  SettingOutlined
} from '@ant-design/icons'
import { useNavigate, useLocation } from 'react-router-dom'

const { Sider } = Layout

const Sidebar = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  const menuItems = [
    {
      key: '/',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
    },
    {
      key: '/patients',
      icon: <UserOutlined />,
      label: 'Patients',
    },
    {
      key: '/doctors',
      icon: <TeamOutlined />,
      label: 'Doctors',
    },
    {
      key: '/appointments',
      icon: <CalendarOutlined />,
      label: 'Appointments',
    },
    {
      key: '/billing',
      icon: <DollarOutlined />,
      label: 'Billing',
    },
    {
      key: '/inventory',
      icon: <MedicineBoxOutlined />,
      label: 'Inventory',
    },
    {
      key: '/reports',
      icon: <BarChartOutlined />,
      label: 'Reports',
    },
    ...(user.role === 'admin' ? [{
      key: '/users',
      icon: <TeamOutlined />,
      label: 'User Management',
    }] : []),
    {
      key: '/profile',
      icon: <SettingOutlined />,
      label: 'My Profile',
    },
  ]

  return (
    <Sider
      breakpoint="lg"
      collapsedWidth="0"
      style={{
        background: '#fff',
        boxShadow: '2px 0 6px rgba(0,21,41,0.1)',
      }}
    >
      <div style={{ 
        height: '32px', 
        margin: '16px', 
        background: 'rgba(255, 255, 255, 0.3)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 'bold',
        fontSize: '16px',
        color: '#1890ff'
      }}>
        HMS
      </div>
      <Menu
        mode="inline"
        selectedKeys={[location.pathname]}
        items={menuItems}
        onClick={({ key }) => navigate(key)}
        style={{ borderRight: 0 }}
      />
    </Sider>
  )
}

export default Sidebar