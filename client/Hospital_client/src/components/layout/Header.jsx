import React from 'react'
import { Layout, Typography, Space, Avatar, Dropdown, Button, Badge } from 'antd'
import { UserOutlined, LogoutOutlined, BellOutlined } from '@ant-design/icons'
import { useAuth } from '@/contexts/AuthContext'

const { Header: AntHeader } = Layout
const { Title } = Typography

const Header = () => {
  const { user, logout } = useAuth()

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Profile',
      onClick: () => window.location.href = '/profile'
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      onClick: logout
    },
  ]

  return (
    <AntHeader style={{ 
      padding: '0 16px', 
      background: '#fff',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      boxShadow: '0 1px 4px rgba(0,21,41,0.08)'
    }}>
      <Title level={4} style={{ margin: 0, color: '#1890ff' }}>
        Hospital Management System
      </Title>
      <Space size="middle">
        <Badge count={0} showZero>
          <Button type="text" icon={<BellOutlined />} />
        </Badge>
        <span>Welcome, {user?.firstName}</span>
        <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
          <Avatar 
            size="large" 
            icon={<UserOutlined />} 
            style={{ cursor: 'pointer', backgroundColor: '#1890ff' }}
          />
        </Dropdown>
        <Button type="text" icon={<LogoutOutlined />} onClick={logout}>
          Logout
        </Button>
      </Space>
    </AntHeader>
  )
}

export default Header