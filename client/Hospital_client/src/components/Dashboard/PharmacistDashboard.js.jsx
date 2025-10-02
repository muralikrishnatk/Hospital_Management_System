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
  Progress
} from 'antd';
import {
  ClockCircleOutlined,
  MedicineBoxOutlined,
  InboxOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  ArrowUpOutlined
} from '@ant-design/icons';
import { getQuickActions } from '../../config/navigation';
import api from '../../services/api';

const { Title, Text } = Typography;

const PharmacistDashboard = () => {
  const [dashboardData, setDashboardData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await api.get('/pharmacist/dashboard');
      setDashboardData(response.data.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = getQuickActions('pharmacist');

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
        <Title level={2} style={{ margin: 0 }}>Pharmacist Dashboard</Title>
        <Text type="secondary">Manage prescriptions and medicine inventory</Text>
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
              title="Pending Prescriptions"
              value={dashboardData.stats?.pendingPrescriptions || 0}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
              suffix={<ArrowUpOutlined style={{ color: '#faad14', fontSize: 12 }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Dispensed Today"
              value={dashboardData.stats?.dispensedToday || 0}
              prefix={<MedicineBoxOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Low Stock Items"
              value={dashboardData.stats?.lowStockItems || 0}
              prefix={<WarningOutlined />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Total Inventory"
              value={dashboardData.stats?.totalInventory || 0}
              prefix={<InboxOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={16}>
          <Card title="Low Stock Alerts">
            {dashboardData.lowStockItems?.length > 0 ? (
              <List
                dataSource={dashboardData.lowStockItems || []}
                renderItem={(item, index) => (
                  <List.Item
                    actions={[
                      <Button type="link" size="small" color="warning">
                        Reorder
                      </Button>
                    ]}
                  >
                    <List.Item.Meta
                      avatar={
                        <Avatar 
                          icon={<WarningOutlined />}
                          style={{ backgroundColor: '#faad14' }}
                        />
                      }
                      title={item.name}
                      description={`Current Stock: ${item.quantity} ${item.unit} | Reorder Level: ${item.reorderLevel}`}
                    />
                  </List.Item>
                )}
              />
            ) : (
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <CheckCircleOutlined style={{ fontSize: 48, color: '#52c41a', marginBottom: 16 }} />
                <Title level={4} style={{ color: '#666' }}>All Stock Levels Good</Title>
                <Text type="secondary">No low stock alerts at this time</Text>
              </div>
            )}
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card title="Pharmacy Overview">
            <Space direction="vertical" style={{ width: '100%' }} size="large">
              <div>
                <Text type="secondary" style={{ display: 'block', marginBottom: 8 }}>
                  Today's Performance
                </Text>
                <Title level={3} style={{ margin: 0, color: '#1890ff' }}>Good</Title>
              </div>
              
              <div>
                <Text type="secondary" style={{ display: 'block', marginBottom: 8 }}>
                  Average Dispensing Time
                </Text>
                <Title level={3} style={{ margin: 0, color: '#722ed1' }}>15 mins</Title>
              </div>
              
              <div>
                <Text type="secondary" style={{ display: 'block', marginBottom: 8 }}>
                  Customer Satisfaction
                </Text>
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Title level={3} style={{ margin: 0, color: '#52c41a' }}>94%</Title>
                  <Progress percent={94} strokeColor="#52c41a" />
                </Space>
              </div>
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default PharmacistDashboard;