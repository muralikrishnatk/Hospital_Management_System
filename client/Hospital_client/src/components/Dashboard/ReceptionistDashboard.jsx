import React, { useState, useEffect } from 'react';
import {
  Row,
  Col,
  Card,
  Statistic,
  List,
  Tag,
  Button,
  Space,
  Spin,
  Typography,
  Avatar,
  Empty
} from 'antd';
import {
  TeamOutlined,
  CalendarOutlined,
  DollarOutlined,
  PlusCircleOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  UserAddOutlined
} from '@ant-design/icons';
import { getQuickActions } from '../../config/navigation';
import api from '../../services/api';

const { Title, Text } = Typography;

const ReceptionistDashboard = () => {
  const [dashboardData, setDashboardData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await api.get('/receptionist/dashboard');
      setDashboardData(response.data.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = getQuickActions('receptionist');

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'success';
      case 'pending': return 'warning';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0 }}>Receptionist Dashboard</Title>
        <Text type="secondary">Manage appointments and patient registration</Text>
      </div>

      {/* Quick Actions */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {quickActions.map((action, index) => (
          <Col xs={24} sm={12} md={6} key={index}>
            <Card 
              hoverable
              style={{ textAlign: 'center', height: '100%' }}
              onClick={() => window.location.href = action.path}
              bodyStyle={{ padding: '20px' }}
            >
              <div style={{ fontSize: 32, color: '#1890ff', marginBottom: 12 }}>
                {action.icon}
              </div>
              <Text strong style={{ fontSize: 14 }}>{action.label}</Text>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Statistics */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Today's Appointments"
              value={dashboardData.stats?.todayAppointments || 0}
              prefix={<CalendarOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Pending Appointments"
              value={dashboardData.stats?.pendingAppointments || 0}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Walk-in Patients"
              value={dashboardData.stats?.walkInPatients || 0}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Pending Payments"
              value={dashboardData.stats?.pendingPayments || 0}
              prefix={<DollarOutlined />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={16}>
          <Card 
            title="Today's Schedule"
            extra={
              <Button 
                type="primary" 
                icon={<PlusCircleOutlined />}
                onClick={() => window.location.href = '/receptionist/appointments/schedule'}
              >
                Schedule New
              </Button>
            }
          >
            {dashboardData.todayAppointments?.length > 0 ? (
              <List
                dataSource={dashboardData.todayAppointments || []}
                renderItem={(appointment, index) => (
                  <List.Item
                    actions={[
                      <Tag color={getStatusColor(appointment.status)}>
                        {appointment.status.toUpperCase()}
                      </Tag>
                    ]}
                  >
                    <List.Item.Meta
                      avatar={<Avatar icon={<CalendarOutlined />} />}
                      title={`${appointment.patient?.firstName} ${appointment.patient?.lastName}`}
                      description={
                        <Space direction="vertical" size={0}>
                          <Text type="secondary">
                            Doctor: {appointment.doctor?.firstName} {appointment.doctor?.lastName}
                          </Text>
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            Time: {appointment.time} • Room: {appointment.roomNumber || 'TBD'}
                          </Text>
                        </Space>
                      }
                    />
                  </List.Item>
                )}
              />
            ) : (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="No appointments today"
              >
                <Button 
                  type="primary"
                  icon={<PlusCircleOutlined />}
                  onClick={() => window.location.href = '/receptionist/appointments/schedule'}
                >
                  Schedule First Appointment
                </Button>
              </Empty>
            )}
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card title="Quick Tasks" style={{ marginBottom: 24 }}>
            <List
              size="small"
              dataSource={[
                { 
                  task: 'Register New Patient', 
                  detail: 'Complete patient registration',
                  icon: <UserAddOutlined />,
                  action: 'Start'
                },
                { 
                  task: 'Collect Payments', 
                  detail: 'Process pending bills',
                  icon: <DollarOutlined />,
                  action: 'View'
                },
                { 
                  task: 'Confirm Appointments', 
                  detail: 'Review pending requests',
                  icon: <CheckCircleOutlined />,
                  action: 'Check'
                }
              ]}
              renderItem={item => (
                <List.Item
                  actions={[
                    <Button type="link" size="small">{item.action}</Button>
                  ]}
                >
                  <List.Item.Meta
                    avatar={<Avatar icon={item.icon} size="small" />}
                    title={item.task}
                    description={item.detail}
                  />
                </List.Item>
              )}
            />
          </Card>

          <Card title="Today's Performance">
            <Space direction="vertical" style={{ width: '100%' }} size="middle">
              <div>
                <Text type="secondary" style={{ display: 'block', marginBottom: 4 }}>
                  Patient Satisfaction
                </Text>
                <Title level={3} style={{ margin: 0, color: '#52c41a' }}>92%</Title>
              </div>
              
              <div>
                <Text type="secondary" style={{ display: 'block', marginBottom: 4 }}>
                  Appointment Accuracy
                </Text>
                <Title level={3} style={{ margin: 0, color: '#1890ff' }}>98%</Title>
              </div>
              
              <div>
                <Text type="secondary" style={{ display: 'block', marginBottom: 4 }}>
                  Payment Collection
                </Text>
                <Title level={3} style={{ margin: 0, color: '#722ed1' }}>85%</Title>
              </div>
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default ReceptionistDashboard;