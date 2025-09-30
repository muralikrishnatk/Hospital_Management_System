import React, { useState } from 'react'
import { Form, Input, Button, Card, message, Tabs, Divider, Descriptions } from 'antd'
import { UserOutlined, MailOutlined, PhoneOutlined, LockOutlined } from '@ant-design/icons'
import { useAuth } from '@/contexts/AuthContext'
import { authService } from '@/services/auth'

const { TabPane } = Tabs

const Profile = () => {
  const [loading, setLoading] = useState(false)
  const [profileForm] = Form.useForm()
  const [passwordForm] = Form.useForm()
  const { user, updateUser } = useAuth()

  const handleProfileUpdate = async (values) => {
    setLoading(true)
    try {
      const response = await authService.updateProfile(values)
      message.success('Profile updated successfully')
      updateUser(response.user)
    } catch (error) {
      message.error('Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordChange = async (values) => {
    setLoading(true)
    try {
      await authService.changePassword(values)
      message.success('Password changed successfully')
      passwordForm.resetFields()
    } catch (error) {
      message.error(error.response?.data?.error || 'Failed to change password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card title="My Profile" style={{ maxWidth: 600, margin: '0 auto' }}>
      <Tabs defaultActiveKey="profile">
        <TabPane tab="Profile Information" key="profile">
          <Form
            form={profileForm}
            layout="vertical"
            onFinish={handleProfileUpdate}
            initialValues={user}
          >
            <Form.Item
              name="firstName"
              label="First Name"
              rules={[{ required: true, message: 'Please enter your first name' }]}
            >
              <Input prefix={<UserOutlined />} />
            </Form.Item>

            <Form.Item
              name="lastName"
              label="Last Name"
              rules={[{ required: true, message: 'Please enter your last name' }]}
            >
              <Input prefix={<UserOutlined />} />
            </Form.Item>

            <Form.Item
              name="email"
              label="Email"
              rules={[
                { required: true, message: 'Please enter your email' },
                { type: 'email', message: 'Please enter a valid email' },
              ]}
            >
              <Input prefix={<MailOutlined />} />
            </Form.Item>

            <Form.Item name="phone" label="Phone">
              <Input prefix={<PhoneOutlined />} />
            </Form.Item>

            <Form.Item name="department" label="Department">
              <Input />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading}>
                Update Profile
              </Button>
            </Form.Item>
          </Form>
        </TabPane>

        <TabPane tab="Change Password" key="password">
          <Form
            form={passwordForm}
            layout="vertical"
            onFinish={handlePasswordChange}
          >
            <Form.Item
              name="currentPassword"
              label="Current Password"
              rules={[{ required: true, message: 'Please enter current password' }]}
            >
              <Input.Password prefix={<LockOutlined />} />
            </Form.Item>

            <Form.Item
              name="newPassword"
              label="New Password"
              rules={[
                { required: true, message: 'Please enter new password' },
                { min: 6, message: 'Password must be at least 6 characters' }
              ]}
            >
              <Input.Password prefix={<LockOutlined />} />
            </Form.Item>

            <Form.Item
              name="confirmPassword"
              label="Confirm New Password"
              dependencies={['newPassword']}
              rules={[
                { required: true, message: 'Please confirm your password' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('newPassword') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('Passwords do not match'));
                  },
                }),
              ]}
            >
              <Input.Password prefix={<LockOutlined />} />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading}>
                Change Password
              </Button>
            </Form.Item>
          </Form>
        </TabPane>
      </Tabs>

      <Divider />

      <Descriptions title="Account Information" column={1}>
        <Descriptions.Item label="Username">{user?.username}</Descriptions.Item>
        <Descriptions.Item label="Role">
          <span style={{ 
            color: user?.role === 'admin' ? '#ff4d4f' : 
                   user?.role === 'doctor' ? '#1890ff' : 
                   user?.role === 'nurse' ? '#52c41a' : 
                   user?.role === 'receptionist' ? '#faad14' : '#722ed1',
            fontWeight: 'bold'
          }}>
            {user?.role?.toUpperCase()}
          </span>
        </Descriptions.Item>
        <Descriptions.Item label="Member Since">
          {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
        </Descriptions.Item>
        <Descriptions.Item label="Last Login">
          {user?.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never'}
        </Descriptions.Item>
      </Descriptions>
    </Card>
  )
}

export default Profile