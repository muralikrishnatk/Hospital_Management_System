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
  Badge
} from 'antd';
import {
  UserOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  MedicineBoxOutlined,
  TeamOutlined,
  ArrowUpOutlined
} from '@ant-design/icons';
import { getQuickActions } from '../../config/navigation';
import api from '../../services/api';

const { Title, Text } = Typography;

const DoctorDashboard = () => {
  const [dashboardData, setDashboardData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await api.get('/doctor/dashboard');
      setDashboardData(response.data.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = getQuickActions('doctor');

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'success';
      case 'confirmed': return 'processing';
      case 'pending': return 'warning';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircleOutlined />;
      case 'confirmed': return <ClockCircleOutlined />;
      case 'pending': return <ClockCircleOutlined />;
      default: return <ClockCircleOutlined />;
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
        <Title level={2} style={{ margin: 0 }}>Doctor Dashboard</Title>
        <Text type="secondary">Manage your schedule and patient consultations</Text>
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
            title={
              <Space>
                Today's Appointments
                <Badge 
                  count={dashboardData.todayAppointments?.length || 0} 
                  showZero 
                  color="#1890ff"
                />
              </Space>
            }
            style={{ marginBottom: 24 }}
          >
            <List
              dataSource={dashboardData.todayAppointments || []}
              renderItem={(appointment, index) => (
                <List.Item
                  actions={[
                    <Tag 
                      color={getStatusColor(appointment.status)}
                      icon={getStatusIcon(appointment.status)}
                    >
                      {appointment.status.toUpperCase()}
                    </Tag>
                  ]}
                >
                  <List.Item.Meta
                    avatar={<Avatar icon={<UserOutlined />} />}
                    title={`${appointment.patient?.firstName} ${appointment.patient?.lastName}`}
                    description={
                      <Space direction="vertical" size={0}>
                        <Text type="secondary">
                          Time: {appointment.time} • Type: {appointment.type}
                        </Text>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          Reason: {appointment.reason}
                        </Text>
                        {appointment.patient?.bloodGroup && (
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            Blood Group: {appointment.patient.bloodGroup}
                          </Text>
                        )}
                      </Space>
                    }
                  />
                </List.Item>
              )}
              locale={{ emptyText: 'No appointments scheduled for today' }}
            />
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card title="Your Statistics" style={{ marginBottom: 24 }}>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Card size="small" style={{ textAlign: 'center' }}>
                  <Statistic
                    value={dashboardData.stats?.todayAppointments || 0}
                    valueStyle={{ color: '#1890ff', fontSize: 32 }}
                  />
                  <Text type="secondary">Today's Patients</Text>
                </Card>
              </Col>
              <Col span={12}>
                <Card size="small" style={{ textAlign: 'center' }}>
                  <Statistic
                    value={dashboardData.stats?.pendingPrescriptions || 0}
                    valueStyle={{ color: '#722ed1', fontSize: 32 }}
                  />
                  <Text type="secondary">Pending Rx</Text>
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
                    value={dashboardData.stats?.totalPatients || 0}
                    valueStyle={{ color: '#faad14', fontSize: 32 }}
                  />
                  <Text type="secondary">Total Patients</Text>
                </Card>
              </Col>
            </Row>
          </Card>

          <Card title="Recent Activity">
            <List
              size="small"
              dataSource={[
                { action: 'Completed consultation', time: '2 hours ago', status: 'success' },
                { action: 'New appointment scheduled', time: '4 hours ago', status: 'info' },
                { action: 'Prescription updated', time: '1 day ago', status: 'info' }
              ]}
              renderItem={item => (
                <List.Item>
                  <List.Item.Meta
                    avatar={
                      <Avatar 
                        size="small" 
                        icon={<CheckCircleOutlined />}
                        style={{ backgroundColor: '#52c41a' }}
                      />
                    }
                    title={item.action}
                    description={item.time}
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

export default DoctorDashboard;