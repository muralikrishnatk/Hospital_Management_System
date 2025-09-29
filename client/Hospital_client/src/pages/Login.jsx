import React, { useState } from 'react'
import { Form, Input, Button, Card, message, Typography, Divider } from 'antd'
import { UserOutlined, LockOutlined } from '@ant-design/icons'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { authService } from '../services/auth'

const { Title, Text } = Typography

const Login = () => {
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const onFinish = async (values) => {
    setLoading(true)
    try {
      const response = await authService.login(values.username, values.password)
      login(response.user, response.token)
      message.success('Login successful!')
      navigate('/')
    } catch (error) {
      message.error(error.response?.data?.error || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px'
    }}>
      <Card style={{ width: 400, boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <Title level={2}>HMS Login</Title>
          <Text type="secondary">Hospital Management System</Text>
        </div>
        
        <Form
          name="login"
          onFinish={onFinish}
          autoComplete="off"
          size="large"
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: 'Please input your username!' }]}
          >
            <Input 
              prefix={<UserOutlined />} 
              placeholder="Username" 
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Please input your password!' }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Password"
            />
          </Form.Item>

          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading}
              style={{ width: '100%' }}
            >
              Log in
            </Button>
          </Form.Item>
        </Form>

        <Divider>
          <Text type="secondary">Or</Text>
        </Divider>

        <div style={{ textAlign: 'center' }}>
          <Text>Don't have an account? </Text>
          <Link to="/register">Register now!</Link>
        </div>

        <div style={{ marginTop: 16, padding: 12, background: '#f5f5f5', borderRadius: 6 }}>
          <Text type="secondary" style={{ fontSize: 12 }}>
            <strong>Demo Credentials:</strong><br />
            Admin: admin / Admin123<br />
            Doctor: doctor / Doctor123<br />
            Reception: reception / Reception123<br />
            Patient: patient / Patient123
          </Text>
        </div>
      </Card>
    </div>
  )
}

export default Login