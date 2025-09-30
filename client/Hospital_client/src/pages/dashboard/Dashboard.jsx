import React, { useState, useEffect } from 'react'
import { Row, Col, Card, Statistic, Table, List, Tag, Progress, Alert } from 'antd'
import { 
  UserOutlined, 
  TeamOutlined, 
  CalendarOutlined, 
  DollarOutlined,
  MedicineBoxOutlined,
  WarningOutlined
} from '@ant-design/icons'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import api from '@/services/api'
import dayjs from 'dayjs'

const Dashboard = () => {
  const [stats, setStats] = useState({})
  const [recentAppointments, setRecentAppointments] = useState([])
  const [lowStock, setLowStock] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const [patientsRes, doctorsRes, appointmentsRes, billingsRes, lowStockRes] = await Promise.all([
        api.get('/patients'),
        api.get('/doctors'),
        api.get('/appointments'),
        api.get('/billing'),
        api.get('/inventory/low-stock')
      ])

      const today = new Date().toISOString().split('T')[0]
      const todayAppointments = appointmentsRes.data.filter(apt => 
        dayjs(apt.appointmentDate).format('YYYY-MM-DD') === today
      ).length

      const paidBillings = billingsRes.data.filter(billing => billing.status === 'Paid')
      const monthlyRevenue = paidBillings.reduce((sum, billing) => sum + parseFloat(billing.totalAmount), 0)

      setStats({
        totalPatients: patientsRes.data.length,
        totalDoctors: doctorsRes.data.length,
        todayAppointments,
        monthlyRevenue,
        pendingBillings: billingsRes.data.filter(b => b.status === 'Pending').length,
        lowStockItems: lowStockRes.data.length
      })

      setRecentAppointments(appointmentsRes.data.slice(0, 5))
      setLowStock(lowStockRes.data.slice(0, 5))
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const revenueData = [
    { name: 'Jan', revenue: 4000 },
    { name: 'Feb', revenue: 3000 },
    { name: 'Mar', revenue: 2000 },
    { name: 'Apr', revenue: 2780 },
    { name: 'May', revenue: 1890 },
    { name: 'Jun', revenue: 2390 },
  ]

  const appointmentStatusData = [
    { name: 'Scheduled', value: 45 },
    { name: 'Completed', value: 30 },
    { name: 'Cancelled', value: 5 },
  ]

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28']

  const appointmentColumns = [
    {
      title: 'Patient',
      dataIndex: ['patient', 'firstName'],
      key: 'patient',
      render: (text, record) => `${record.patient?.firstName} ${record.patient?.lastName}`
    },
    {
      title: 'Doctor',
      dataIndex: ['doctor', 'firstName'],
      key: 'doctor',
      render: (text, record) => `Dr. ${record.doctor?.firstName} ${record.doctor?.lastName}`
    },
    {
      title: 'Date & Time',
      dataIndex: 'appointmentDate',
      key: 'appointmentDate',
      render: (text, record) => `${dayjs(record.appointmentDate).format('DD/MM/YYYY')} ${record.appointmentTime}`
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={
          status === 'Scheduled' ? 'blue' : 
          status === 'Completed' ? 'green' : 'red'
        }>
          {status}
        </Tag>
      )
    }
  ]

  return (
    <div>
      {lowStock.length > 0 && (
        <Alert
          message="Low Stock Alert"
          description={`You have ${lowStock.length} items running low on stock`}
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      <Row gutter={16}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Patients"
              value={stats.totalPatients}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#3f8600' }}
              loading={loading}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Doctors"
              value={stats.totalDoctors}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#1890ff' }}
              loading={loading}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Today's Appointments"
              value={stats.todayAppointments}
              prefix={<CalendarOutlined />}
              valueStyle={{ color: '#cf1322' }}
              loading={loading}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Monthly Revenue"
              value={stats.monthlyRevenue}
              prefix={<DollarOutlined />}
              precision={2}
              valueStyle={{ color: '#3f8600' }}
              loading={loading}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={16} style={{ marginTop: 16 }}>
        <Col span={12}>
          <Card title="Revenue Trend" loading={loading}>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="#8884d8" activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col span={12}>
          <Card title="Appointment Status" loading={loading}>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={appointmentStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {appointmentStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      <Row gutter={16} style={{ marginTop: 16 }}>
        <Col span={12}>
          <Card title="Recent Appointments" loading={loading}>
            <Table
              dataSource={recentAppointments}
              columns={appointmentColumns}
              rowKey="id"
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
        <Col span={12}>
          <Card title="Low Stock Alert" loading={loading}>
            <List
              dataSource={lowStock}
              renderItem={item => (
                <List.Item>
                  <List.Item.Meta
                    avatar={<MedicineBoxOutlined style={{ color: '#ff4d4f' }} />}
                    title={item.name}
                    description={`Current: ${item.quantity} | Alert: ${item.lowStockAlert}`}
                  />
                  <Progress 
                    percent={Math.min((item.quantity / item.lowStockAlert) * 100, 100)} 
                    size="small" 
                    status={item.quantity <= item.reorderLevel ? 'exception' : 'normal'}
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default Dashboard