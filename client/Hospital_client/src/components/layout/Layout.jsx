import React, { useState, useContext } from 'react';
import {
  Layout,
  Menu,
  Button,
  Typography,
  Space,
  Avatar,
  Dropdown,
  theme as antdTheme,
  Row,
  Col
} from 'antd';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  DashboardOutlined,
  UserOutlined,
  LogoutOutlined,
  BulbOutlined,
  BulbFilled
} from '@ant-design/icons';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import { ThemeContext } from '../../context/ThemeContext';
import { getNavigationItems } from '../../config/navigation';
import { getAntdIcon } from '../../utils/icons';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

const AppLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { isDark, toggleTheme } = useContext(ThemeContext);
  
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = antdTheme.useToken();

  const user = JSON.parse(localStorage.getItem('user'));
  const navigationItems = getNavigationItems(user?.role);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const generateMenuItems = (items) => {
    return items.map(item => {
      if (item.children) {
        return {
          key: item.text,
          icon: getAntdIcon(item.icon),
          label: item.text,
          children: item.children.map(child => ({
            key: child.path,
            label: child.text,
            onClick: () => navigate(child.path)
          }))
        };
      }
      
      return {
        key: item.path,
        icon: getAntdIcon(item.icon),
        label: item.text,
        onClick: () => navigate(item.path)
      };
    });
  };

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Profile',
      onClick: () => navigate('/profile')
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      onClick: handleLogout
    }
  ];

  const menuItems = generateMenuItems(navigationItems);

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider 
        trigger={null} 
        collapsible 
        collapsed={collapsed}
        style={{
          background: colorBgContainer,
          boxShadow: '2px 0 6px rgba(0,21,41,0.1)'
        }}
        width={260}
      >
        <div style={{
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'flex-start',
          padding: collapsed ? '0' : '0 24px',
          borderBottom: '1px solid #f0f0f0'
        }}>
          <Space>
            <DashboardOutlined style={{ fontSize: 24, color: '#1890ff' }} />
            {!collapsed && (
              <Text strong style={{ color: '#1890ff', fontSize: 16 }}>
                Hospital MS
              </Text>
            )}
          </Space>
        </div>

        <div style={{
          padding: collapsed ? '16px 8px' : '16px 24px',
          borderBottom: '1px solid #f0f0f0'
        }}>
          {!collapsed ? (
            <Space direction="vertical" size="small" style={{ width: '100%' }}>
              <Text strong style={{ fontSize: 14 }}>
                {user?.firstName} {user?.lastName}
              </Text>
              <Text type="secondary" style={{ 
                fontSize: 12, 
                textTransform: 'capitalize',
                display: 'block'
              }}>
                {user?.role}
              </Text>
              <Text type="secondary" style={{ fontSize: 12, display: 'block' }}>
                {user?.email}
              </Text>
            </Space>
          ) : (
            <div style={{ textAlign: 'center' }}>
              <Avatar 
                style={{ backgroundColor: '#1890ff' }}
                size="small"
              >
                {user?.firstName?.charAt(0)}
              </Avatar>
            </div>
          )}
        </div>

        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          defaultOpenKeys={navigationItems.map(item => item.text)}
          items={menuItems}
          style={{ 
            border: 'none', 
            marginTop: 8,
            fontSize: 14
          }}
        />
      </Sider>

      <Layout>
        <Header style={{
          padding: '0 24px',
          background: colorBgContainer,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid #f0f0f0',
          boxShadow: '0 1px 4px rgba(0,21,41,0.08)'
        }}>
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{ 
              fontSize: '16px', 
              width: 64, 
              height: 64 
            }}
          />

          <Space size="middle">
            <Button
              type="text"
              icon={isDark ? <BulbFilled /> : <BulbOutlined />}
              onClick={toggleTheme}
              style={{ fontSize: '16px' }}
            />
            
            <Dropdown 
              menu={{ items: userMenuItems }} 
              placement="bottomRight"
              trigger={['click']}
            >
              <Space style={{ cursor: 'pointer', padding: '8px 12px', borderRadius: 6 }}>
                <Avatar 
                  style={{ backgroundColor: '#1890ff' }}
                  icon={<UserOutlined />}
                />
                {!collapsed && (
                  <Text strong>
                    {user?.firstName} {user?.lastName}
                  </Text>
                )}
              </Space>
            </Dropdown>
          </Space>
        </Header>

        <Content style={{
          margin: '24px',
          padding: 24,
          minHeight: 280,
          background: colorBgContainer,
          borderRadius: borderRadiusLG,
        }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default AppLayout;