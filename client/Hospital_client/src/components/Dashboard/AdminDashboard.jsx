import React, { useState, useEffect } from 'react';
import {
  Row,
  Col,
  Card,
  Statistic,
  Table,
  Tag,
  Progress,
  Button,
  Space,
  Alert,
  Spin,
  Typography,
  List,
  Avatar
} from 'antd';
import {
  UserOutlined,
  TeamOutlined,
  CalendarOutlined,
  DollarOutlined,
  WarningOutlined,
  ArrowUpOutlined,
  MedicineBoxOutlined,
  ShoppingOutlined,
  InboxOutlined
} from '@ant-design/icons';
import { getQuickActions } from '../../config/navigation';
import api from '../../services/api';

const { Title, Text } = Typography;

const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await api.get('/admin/dashboard');
      setDashboardData(response.data.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = getQuickActions('admin');

  const columns = [
    {
      title: 'Patient',
      dataIndex: ['patient', 'firstName'],
      key: 'patient',
      render: (text, record) => 
        `${record.patient?.firstName} ${record.patient?.lastName}`
    },
    {
      title: 'Doctor',
      dataIndex: ['doctor', 'firstName'],
      key: 'doctor',
      render: (text, record) => 
        `Dr. ${record.doctor?.firstName} ${record.doctor?.lastName}`
    },
    {
      title: 'Date & Time',
      key: 'datetime',
      render: (record) => 
        `${new Date(record.date).toLocaleDateString()} ${record.time}`
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type) => <Tag color="blue">{type}</Tag>
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const color = status === 'completed' ? 'green' : 
                     status === 'pending' ? 'orange' : 'default';
        return <Tag color={color}>{status.toUpperCase()}</Tag>;
      }
    }
  ];

  const systemHealthData = [
    {
      title: 'Server Uptime',
      value: 99.9,
      status: 'success',
      color: '#52c41a'
    },
    {
      title: 'Database',
      value: 'Healthy',
      status: 'success',
      color: '#52c41a'
    },
    {
      title: 'Storage',
      value: 78,
      status: 'warning',
      color: '#faad14'
    }
  ];

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
        <Title level={2} style={{ margin: 0 }}>Admin Dashboard</Title>
        <Text type="secondary">Overview of hospital operations and management</Text>
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
              title="Total Patients"
              value={dashboardData.stats?.totalPatients || 0}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#1890ff' }}
              suffix={<ArrowUpOutlined style={{ color: '#52c41a', fontSize: 12 }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Total Doctors"
              value={dashboardData.stats?.totalDoctors || 0}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Total Appointments"
              value={dashboardData.stats?.totalAppointments || 0}
              prefix={<CalendarOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Pending Appointments"
              value={dashboardData.stats?.pendingAppointments || 0}
              prefix={<WarningOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[24, 24]}>
        <Col xs={24} xl={16}>
          <Card 
            title="Recent Appointments" 
            extra={<Button type="link">View All</Button>}
            style={{ height: '100%' }}
          >
            <Table
              columns={columns}
              dataSource={dashboardData.recentAppointments || []}
              pagination={false}
              size="middle"
              scroll={{ x: 800 }}
            />
          </Card>
        </Col>

        <Col xs={24} xl={8}>
          <Card title="System Health" style={{ marginBottom: 24 }}>
            <List
              dataSource={systemHealthData}
              renderItem={item => (
                <List.Item>
                  <List.Item.Meta
                    avatar={
                      <Avatar 
                        style={{ backgroundColor: item.color }}
                        icon={<MedicineBoxOutlined />}
                      />
                    }
                    title={item.title}
                    description={
                      typeof item.value === 'number' ? (
                        <Progress 
                          percent={item.value} 
                          strokeColor={item.color}
                          size="small"
                        />
                      ) : (
                        <Tag color={item.color}>{item.value}</Tag>
                      )
                    }
                  />
                </List.Item>
              )}
            />
          </Card>

          <Card title="Quick Statistics">
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Statistic
                  title="Total Bills"
                  value={dashboardData.stats?.totalBills || 0}
                  prefix={<ShoppingOutlined />}
                  valueStyle={{ color: '#1890ff', fontSize: 24 }}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="Pending Payments"
                  value={dashboardData.stats?.pendingBills || 0}
                  prefix={<DollarOutlined />}
                  valueStyle={{ color: '#faad14', fontSize: 24 }}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="Total Revenue"
                  value={dashboardData.stats?.totalRevenue || 0}
                  prefix="$"
                  valueStyle={{ color: '#52c41a', fontSize: 24 }}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="Low Stock Items"
                  value={dashboardData.stats?.lowStockItems || 0}
                  prefix={<InboxOutlined />}
                  valueStyle={{ color: '#ff4d4f', fontSize: 24 }}
                />
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AdminDashboard;