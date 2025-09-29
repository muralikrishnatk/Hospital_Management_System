import React, { useState } from 'react';
import { Form, Input, Button, Card, message, Typography, Select, Divider, DatePicker, InputNumber } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, PhoneOutlined, DollarOutlined, ExperimentOutlined, ReadOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { authService } from '../services/auth';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const Register = () => {
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState('patient');
  const { login } = useAuth();
  const navigate = useNavigate();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      // Format date for backend
      const formattedValues = {
        ...values,
        dateOfBirth: values.dateOfBirth ? values.dateOfBirth.format('YYYY-MM-DD') : null,
      };
      
      const response = await authService.register(formattedValues);
      login(response.user, response.token);
      message.success('Registration successful!');
      navigate('/');
    } catch (error) {
      message.error(error.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = (value) => {
    setSelectedRole(value);
  };

  // Common medical specializations
  const specializations = [
    'Cardiology', 'Dermatology', 'Emergency Medicine', 'Family Medicine', 
    'Gastroenterology', 'General Surgery', 'Internal Medicine', 'Neurology',
    'Obstetrics and Gynecology', 'Ophthalmology', 'Orthopedics', 'Pediatrics',
    'Psychiatry', 'Radiology', 'Urology', 'Endocrinology', 'Oncology',
    'Pulmonology', 'Nephrology', 'Rheumatology'
  ];

  // Common medical qualifications
  const qualifications = [
    'MBBS', 'MD', 'MS', 'DNB', 'DM', 'MCh', 'BDS', 'BAMS',
    'BHMS', 'BUMS', 'BVSc', 'BPT', 'BPharm', 'BSc Nursing'
  ];

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px'
    }}>
      <Card style={{ width: 500, boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <Title level={2}>Create Account</Title>
          <Text type="secondary">Join Hospital Management System</Text>
        </div>
        
        <Form
          name="register"
          onFinish={onFinish}
          autoComplete="off"
          size="large"
          layout="vertical"
        >
          <div style={{ display: 'flex', gap: '16px' }}>
            <Form.Item
              name="firstName"
              label="First Name"
              rules={[{ required: true, message: 'Please input your first name!' }]}
              style={{ flex: 1 }}
            >
              <Input prefix={<UserOutlined />} placeholder="First Name" />
            </Form.Item>

            <Form.Item
              name="lastName"
              label="Last Name"
              rules={[{ required: true, message: 'Please input your last name!' }]}
              style={{ flex: 1 }}
            >
              <Input prefix={<UserOutlined />} placeholder="Last Name" />
            </Form.Item>
          </div>

          <Form.Item
            name="username"
            label="Username"
            rules={[{ required: true, message: 'Please input your username!' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="Username" />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Please input your email!' },
              { type: 'email', message: 'Please enter a valid email!' }
            ]}
          >
            <Input prefix={<MailOutlined />} placeholder="Email" />
          </Form.Item>

          <Form.Item
            name="phone"
            label="Phone"
            rules={[{ required: true, message: 'Please input your phone number!' }]}
          >
            <Input prefix={<PhoneOutlined />} placeholder="Phone" />
          </Form.Item>

          <Form.Item
            name="role"
            label="Role"
            rules={[{ required: true, message: 'Please select your role!' }]}
          >
            <Select placeholder="Select Role" onChange={handleRoleChange}>
              <Option value="patient">Patient</Option>
              <Option value="receptionist">Receptionist</Option>
              <Option value="doctor">Doctor</Option>
              <Option value="nurse">Nurse</Option>
            </Select>
          </Form.Item>

          {/* Patient-specific fields */}
          {selectedRole === 'patient' && (
            <>
              <Form.Item
                name="dateOfBirth"
                label="Date of Birth"
                rules={[{ required: true, message: 'Please select your date of birth!' }]}
              >
                <DatePicker 
                  style={{ width: '100%' }}
                  format="YYYY-MM-DD"
                  placeholder="Select Date of Birth"
                  disabledDate={(current) => current && current > dayjs().endOf('day')}
                />
              </Form.Item>

              <Form.Item
                name="gender"
                label="Gender"
                rules={[{ required: true, message: 'Please select your gender!' }]}
              >
                <Select placeholder="Select Gender">
                  <Option value="Male">Male</Option>
                  <Option value="Female">Female</Option>
                  <Option value="Other">Other</Option>
                </Select>
              </Form.Item>

              <Form.Item
                name="address"
                label="Address"
              >
                <TextArea placeholder="Address" rows={3} />
              </Form.Item>
            </>
          )}

          {/* Doctor-specific fields */}
          {selectedRole === 'doctor' && (
            <>
              <Form.Item
                name="specialization"
                label="Specialization"
                rules={[{ required: true, message: 'Please select your specialization!' }]}
              >
                <Select 
                  placeholder="Select Specialization"
                  showSearch
                  filterOption={(input, option) =>
                    option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }
                >
                  {specializations.map(spec => (
                    <Option key={spec} value={spec}>{spec}</Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                name="qualification"
                label="Qualification"
                rules={[{ required: true, message: 'Please select your qualification!' }]}
              >
                <Select 
                  placeholder="Select Qualification"
                  showSearch
                  filterOption={(input, option) =>
                    option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }
                >
                  {qualifications.map(qual => (
                    <Option key={qual} value={qual}>{qual}</Option>
                  ))}
                </Select>
              </Form.Item>

              <div style={{ display: 'flex', gap: '16px' }}>
                <Form.Item
                  name="experience"
                  label="Experience (Years)"
                  rules={[{ required: true, message: 'Please input your experience!' }]}
                  style={{ flex: 1 }}
                >
                  <InputNumber
                    min={0}
                    max={50}
                    style={{ width: '100%' }}
                    placeholder="Years"
                  />
                </Form.Item>

                <Form.Item
                  name="consultationFee"
                  label="Consultation Fee"
                  rules={[{ required: true, message: 'Please input consultation fee!' }]}
                  style={{ flex: 1 }}
                >
                  <InputNumber
                    min={0}
                    max={10000}
                    style={{ width: '100%' }}
                    placeholder="Fee"
                    prefix={<DollarOutlined />}
                    formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={value => value.replace(/\$\s?|(,*)/g, '')}
                  />
                </Form.Item>
              </div>

              <Form.Item
                name="bio"
                label="Bio"
              >
                <TextArea 
                  placeholder="Tell us about your professional background..."
                  rows={4}
                />
              </Form.Item>
            </>
          )}

          {/* Department field for non-patient roles */}
          {(selectedRole === 'doctor' || selectedRole === 'nurse' || selectedRole === 'receptionist') && (
            <Form.Item
              name="department"
              label="Department"
              rules={[{ required: true, message: 'Please input your department!' }]}
            >
              <Input placeholder="Department" />
            </Form.Item>
          )}

          {/* Department field for patients (optional) */}
          {selectedRole === 'patient' && (
            <Form.Item
              name="department"
              label="Department"
            >
              <Input placeholder="Department (optional)" />
            </Form.Item>
          )}

          <Form.Item
            name="password"
            label="Password"
            rules={[
              { required: true, message: 'Please input your password!' },
              { min: 6, message: 'Password must be at least 6 characters!' }
            ]}
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
              Register
            </Button>
          </Form.Item>
        </Form>

        <Divider>
          <Text type="secondary">Or</Text>
        </Divider>

        <div style={{ textAlign: 'center' }}>
          <Text>Already have an account? </Text>
          <Link to="/login">Login now!</Link>
        </div>
      </Card>
    </div>
  );
};

export default Register;