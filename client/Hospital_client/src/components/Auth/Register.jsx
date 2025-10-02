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
  Col,
  Select,
  DatePicker,
  Steps
} from 'antd';
import {
  MedicineBoxOutlined,
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  LockOutlined,
  EyeInvisibleOutlined,
  EyeTwoTone,
  IdcardOutlined,
  EnvironmentOutlined
} from '@ant-design/icons';
import { ThemeContext } from '../../context/ThemeContext';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../utils/api';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;
const { Step } = Steps;

const Register = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { isDark, toggleTheme } = useContext(ThemeContext);
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const steps = [
    {
      title: 'Personal Info',
      content: 'personal',
    },
    {
      title: 'Account Details',
      content: 'account',
    },
    {
      title: 'Additional Info',
      content: 'additional',
    },
  ];

  const onFinish = async (values) => {
    setLoading(true);

    if (values.password !== values.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const submitData = {
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        password: values.password,
        phone: values.phone,
        dateOfBirth: values.dateOfBirth.format('YYYY-MM-DD'),
        role: values.role,
        bloodGroup: values.bloodGroup,
        address: values.address,
        ...(values.role === 'doctor' && {
          specialization: values.specialization,
          qualification: values.qualification,
          licenseNumber: values.licenseNumber,
          experience: parseInt(values.experience) || 0,
          consultationFee: parseFloat(values.consultationFee) || 0
        }),
        ...(values.role === 'pharmacist' && {
          pharmacyLicense: values.pharmacyLicense
        })
      };

      const response = await api.post('/auth/register', submitData);
      
      const { token, user } = response.data;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      navigate(getDashboardRoute(user.role));

    } catch (error) {
      setError(error.response?.data?.message || 'An error occurred during registration');
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

  const nextStep = () => {
    setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  const personalInfoForm = (
    <Row gutter={[16, 0]}>
      <Col span={12}>
        <Form.Item
          name="firstName"
          rules={[{ required: true, message: 'Please input your first name!' }]}
        >
          <Input 
            prefix={<UserOutlined />} 
            placeholder="First Name" 
            size="large"
          />
        </Form.Item>
      </Col>
      <Col span={12}>
        <Form.Item
          name="lastName"
          rules={[{ required: true, message: 'Please input your last name!' }]}
        >
          <Input 
            placeholder="Last Name" 
            size="large"
          />
        </Form.Item>
      </Col>
      <Col span={24}>
        <Form.Item
          name="email"
          rules={[
            { required: true, message: 'Please input your email!' },
            { type: 'email', message: 'Please enter a valid email!' }
          ]}
        >
          <Input 
            prefix={<MailOutlined />} 
            placeholder="Email Address" 
            size="large"
          />
        </Form.Item>
      </Col>
      <Col span={12}>
        <Form.Item
          name="phone"
          rules={[{ required: true, message: 'Please input your phone number!' }]}
        >
          <Input 
            prefix={<PhoneOutlined />} 
            placeholder="Phone Number" 
            size="large"
          />
        </Form.Item>
      </Col>
      <Col span={12}>
        <Form.Item
          name="dateOfBirth"
          rules={[{ required: true, message: 'Please select your date of birth!' }]}
        >
          <DatePicker 
            placeholder="Date of Birth" 
            style={{ width: '100%' }}
            size="large"
            disabledDate={(current) => current && current > dayjs().endOf('day')}
          />
        </Form.Item>
      </Col>
    </Row>
  );

  const accountForm = (
    <Row gutter={[16, 0]}>
      <Col span={24}>
        <Form.Item
          name="role"
          rules={[{ required: true, message: 'Please select your role!' }]}
        >
          <Select placeholder="Select Role" size="large">
            <Option value="patient">Patient</Option>
            <Option value="doctor">Doctor</Option>
            <Option value="pharmacist">Pharmacist</Option>
            <Option value="receptionist">Receptionist</Option>
          </Select>
        </Form.Item>
      </Col>
      <Col span={12}>
        <Form.Item
          name="password"
          rules={[{ required: true, message: 'Please input your password!' }]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="Password"
            size="large"
            iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
          />
        </Form.Item>
      </Col>
      <Col span={12}>
        <Form.Item
          name="confirmPassword"
          rules={[{ required: true, message: 'Please confirm your password!' }]}
        >
          <Input.Password
            placeholder="Confirm Password"
            size="large"
            iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
          />
        </Form.Item>
      </Col>
      
      {/* Doctor-specific fields */}
      <Form.Item
        noStyle
        shouldUpdate={(prevValues, currentValues) => prevValues.role !== currentValues.role}
      >
        {({ getFieldValue }) => 
          getFieldValue('role') === 'doctor' ? (
            <>
              <Col span={24}>
                <Form.Item
                  name="specialization"
                  rules={[{ required: true, message: 'Please input specialization!' }]}
                >
                  <Input 
                    placeholder="Specialization" 
                    size="large"
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="qualification"
                  rules={[{ required: true, message: 'Please input qualification!' }]}
                >
                  <Input 
                    placeholder="Qualification" 
                    size="large"
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="licenseNumber"
                  rules={[{ required: true, message: 'Please input license number!' }]}
                >
                  <Input 
                    prefix={<IdcardOutlined />} 
                    placeholder="License Number" 
                    size="large"
                  />
                </Form.Item>
              </Col>
            </>
          ) : null
        }
      </Form.Item>

      {/* Pharmacist-specific fields */}
      <Form.Item
        noStyle
        shouldUpdate={(prevValues, currentValues) => prevValues.role !== currentValues.role}
      >
        {({ getFieldValue }) => 
          getFieldValue('role') === 'pharmacist' ? (
            <Col span={24}>
              <Form.Item
                name="pharmacyLicense"
                rules={[{ required: true, message: 'Please input pharmacy license!' }]}
              >
                <Input 
                  prefix={<IdcardOutlined />} 
                  placeholder="Pharmacy License Number" 
                  size="large"
                />
              </Form.Item>
            </Col>
          ) : null
        }
      </Form.Item>
    </Row>
  );

  const additionalInfoForm = (
    <Row gutter={[16, 0]}>
      <Col span={24}>
        <Form.Item name="bloodGroup">
          <Select placeholder="Blood Group (Optional)" size="large">
            <Option value="">Not Specified</Option>
            <Option value="A+">A+</Option>
            <Option value="A-">A-</Option>
            <Option value="B+">B+</Option>
            <Option value="B-">B-</Option>
            <Option value="AB+">AB+</Option>
            <Option value="AB-">AB-</Option>
            <Option value="O+">O+</Option>
            <Option value="O-">O-</Option>
          </Select>
        </Form.Item>
      </Col>
      <Col span={24}>
        <Form.Item name="address">
          <Input.TextArea
            prefix={<EnvironmentOutlined />}
            placeholder="Address (Optional)"
            rows={3}
            size="large"
          />
        </Form.Item>
      </Col>
    </Row>
  );

  const stepContent = [
    personalInfoForm,
    accountForm,
    additionalInfoForm
  ];

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
          width: 500,
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
            Create Account
          </Title>
        </div>

        <Steps current={currentStep} style={{ marginBottom: 32 }}>
          {steps.map(item => (
            <Step key={item.title} title={item.title} />
          ))}
        </Steps>

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
          name="register"
          onFinish={onFinish}
          autoComplete="off"
          layout="vertical"
          size="large"
        >
          {stepContent[currentStep]}

          <div style={{ marginTop: 24 }}>
            {currentStep > 0 && (
              <Button style={{ marginRight: 8 }} onClick={prevStep}>
                Previous
              </Button>
            )}
            {currentStep < steps.length - 1 && (
              <Button type="primary" onClick={nextStep}>
                Next
              </Button>
            )}
            {currentStep === steps.length - 1 && (
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={loading}
                block
              >
                Register
              </Button>
            )}
          </div>
        </Form>

        <Divider />

        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          <Button type="link" block style={{ padding: 0 }}>
            <Link to="/login">Already have an account? Sign In</Link>
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

export default Register;