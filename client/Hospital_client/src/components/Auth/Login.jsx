// src/components/Auth/Login.js
import React, { useState, useContext } from 'react';
import {
  Form,
  Input,
  Button,
  Card,
  Typography,
  Alert,
  Switch,
  Space,
  Divider,
  Row,
  Col
} from 'antd';
import {
  UserOutlined,
  LockOutlined,
  EyeInvisibleOutlined,
  EyeTwoTone,
  MedicineBoxOutlined
} from '@ant-design/icons';
import { ThemeContext } from '../../context/ThemeContext';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../utils/api';

const { Title, Text } = Typography;

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { isDark, toggleTheme } = useContext(ThemeContext);
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const onFinish = async (values) => {
    setLoading(true);
    setError('');

    try {
      const response = await api.post('/auth/login', {
        email: values.email,
        password: values.password
      });

      const { token, user } = response.data;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      navigate(getDashboardRoute(user.role));

    } catch (error) {
      setError(error.response?.data?.message || 'An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  const getDashboardRoute = (role) => {
    switch (role) {
      case 'admin': return '/admin/dashboard';
      case 'doctor': return '/doctor/dashboard';
      case 'patient': return '/patient/dashboard';
      case 'pharmacist': return '/pharmacist/dashboard';
      case 'receptionist': return '/receptionist/dashboard';
      default: return '/';
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px'
    }}>
      <Card
        style={{
          width: 400,
          borderRadius: 10,
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
        }}
        bodyStyle={{ padding: '40px' }}
      >
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <MedicineBoxOutlined style={{ 
            fontSize: 48, 
            color: '#1890ff', 
            marginBottom: 16 
          }} />
          <Title level={2} style={{ margin: 0, color: '#1890ff' }}>
            Hospital Management
          </Title>
          <Title level={4} style={{ margin: '16px 0 0 0', color: '#666' }}>
            Sign In
          </Title>
        </div>

        {error && (
          <Alert 
            message={error} 
            type="error" 
            showIcon 
            style={{ marginBottom: 24 }} 
          />
        )}

        <Form
          form={form}
          name="login"
          onFinish={onFinish}
          autoComplete="off"
          layout="vertical"
          size="large"
        >
          <Form.Item
            label="Email Address"
            name="email"
            rules={[
              { required: true, message: 'Please input your email!' },
              { type: 'email', message: 'Please enter a valid email!' }
            ]}
          >
            <Input 
              prefix={<UserOutlined />} 
              placeholder="Enter your email" 
            />
          </Form.Item>

          <Form.Item
            label="Password"
            name="password"
            rules={[{ required: true, message: 'Please input your password!' }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Enter your password"
              iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
            />
          </Form.Item>

          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading}
              block
              style={{ height: 45 }}
            >
              Sign In
            </Button>
          </Form.Item>
        </Form>

        <Divider />

        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          <Button type="link" block style={{ padding: 0 }}>
            <Link to="/register">Don't have an account? Sign Up</Link>
          </Button>
          
          <Row justify="space-between" align="middle">
            <Text>Dark Mode</Text>
            <Switch 
              checked={isDark} 
              onChange={toggleTheme}
              checkedChildren="🌙" 
              unCheckedChildren="☀️"
            />
          </Row>
        </Space>
      </Card>
    </div>
  );
};

export default Login;