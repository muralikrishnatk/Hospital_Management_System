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
  CalendarOutlined,
  FileTextOutlined,
  DollarOutlined,
  TeamOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import { getQuickActions } from '../../config/navigation';
import api from '../../services/api';

const { Title, Text } = Typography;

const PatientDashboard = () => {
  const [dashboardData, setDashboardData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await api.get('/patient/dashboard');
      setDashboardData(response.data.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = getQuickActions('patient');

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
        <Title level={2} style={{ margin: 0 }}>Patient Dashboard</Title>
        <Text type="secondary">Manage your health and appointments</Text>
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

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={16}>
          <Card 
            title="Upcoming Appointments"
            extra={
              <Button 
                type="primary" 
                icon={<CalendarOutlined />}
                onClick={() => window.location.href = '/patient/appointments/book'}
              >
                Book New
              </Button>
            }
            style={{ marginBottom: 24 }}
          >
            {dashboardData.upcomingAppointments?.length > 0 ? (
              <List
                dataSource={dashboardData.upcomingAppointments || []}
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
                      title={`Dr. ${appointment.doctor?.firstName} ${appointment.doctor?.lastName}`}
                      description={
                        <Space direction="vertical" size={0}>
                          <Text type="secondary">
                            {new Date(appointment.date).toLocaleDateString()} at {appointment.time}
                          </Text>
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            Department: {appointment.doctor?.specialization} • Type: {appointment.type}
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
                description="No upcoming appointments"
              >
                <Button 
                  type="primary"
                  onClick={() => window.location.href = '/patient/appointments/book'}
                >
                  Book Your First Appointment
                </Button>
              </Empty>
            )}
          </Card>

          <Card title="Recent Medical Records">
            <List
              dataSource={dashboardData.recentRecords || []}
              renderItem={(record, index) => (
                <List.Item
                  actions={[
                    <Button type="link" size="small">View</Button>
                  ]}
                >
                  <List.Item.Meta
                    avatar={<Avatar icon={<FileTextOutlined />} />}
                    title={record.title}
                    description={`Date: ${new Date(record.createdAt).toLocaleDateString()} • Doctor: ${record.doctor?.firstName} ${record.doctor?.lastName}`}
                  />
                </List.Item>
              )}
              locale={{ emptyText: 'No medical records available' }}
            />
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card title="Health Summary" style={{ marginBottom: 24 }}>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Card size="small" style={{ textAlign: 'center' }}>
                  <Statistic
                    value={dashboardData.stats?.totalAppointments || 0}
                    valueStyle={{ color: '#1890ff', fontSize: 32 }}
                  />
                  <Text type="secondary">Total Visits</Text>
                </Card>
              </Col>
              <Col span={12}>
                <Card size="small" style={{ textAlign: 'center' }}>
                  <Statistic
                    value={dashboardData.stats?.medicalRecords || 0}
                    valueStyle={{ color: '#722ed1', fontSize: 32 }}
                  />
                  <Text type="secondary">Records</Text>
                </Card>
              </Col>
              <Col span={12}>
                <Card size="small" style={{ textAlign: 'center' }}>
                  <Statistic
                    value={dashboardData.stats?.completedAppointments || 0}
                    valueStyle={{ color: '#52c41a', fontSize: 32 }}
                  />
                  <Text type="secondary">Completed</Text>
                </Card>
              </Col>
              <Col span={12}>
                <Card size="small" style={{ textAlign: 'center' }}>
                  <Statistic
                    value={dashboardData.stats?.pendingBills || 0}
                    valueStyle={{ color: '#faad14', fontSize: 32 }}
                  />
                  <Text type="secondary">Pending Bills</Text>
                </Card>
              </Col>
            </Row>
          </Card>

          <Card title="Health Tips">
            <List
              size="small"
              dataSource={[
                { tip: 'Regular Checkups', detail: 'Schedule routine health checkups annually' },
                { tip: 'Stay Hydrated', detail: 'Drink at least 8 glasses of water daily' },
                { tip: 'Exercise Regularly', detail: '30 minutes of exercise most days' }
              ]}
              renderItem={item => (
                <List.Item>
                  <List.Item.Meta
                    avatar={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
                    title={item.tip}
                    description={item.detail}
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default PatientDashboard;