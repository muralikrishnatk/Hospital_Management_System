import React, { useState, useEffect } from 'react'
import {
  Card,
  Row,
  Col,
  DatePicker,
  Select,
  Button,
  Table,
  Statistic,
  List,
  Tag,
  Descriptions,
} from 'antd'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { DownloadOutlined, CalendarOutlined, DollarOutlined, UserOutlined } from '@ant-design/icons'
import api from '@/services/api'
import dayjs from 'dayjs'

const { RangePicker } = DatePicker
const { Option } = Select

const Reports = () => {
  const [loading, setLoading] = useState(false)
  const [dateRange, setDateRange] = useState([
    dayjs().startOf('month'),
    dayjs().endOf('month')
  ])
  const [reportType, setReportType] = useState('financial')
  const [financialData, setFinancialData] = useState({})
  const [patientData, setPatientData] = useState({})
  const [appointmentData, setAppointmentData] = useState({})

  useEffect(() => {
    generateReports()
  }, [dateRange, reportType])

  const generateReports = async () => {
    setLoading(true)
    try {
      // In a real app, you'd have dedicated report endpoints
      // For now, we'll use existing data
      const [patientsRes, appointmentsRes, billingsRes] = await Promise.all([
        api.get('/patients'),
        api.get('/appointments'),
        api.get('/billing')
      ])

      const [startDate, endDate] = dateRange

      // Filter data by date range
      const filteredBillings = billingsRes.data.filter(billing => {
        const billingDate = dayjs(billing.createdAt)
        return billingDate.isAfter(startDate) && billingDate.isBefore(endDate)
      })

      const filteredAppointments = appointmentsRes.data.filter(apt => {
        const aptDate = dayjs(apt.appointmentDate)
        return aptDate.isAfter(startDate) && aptDate.isBefore(endDate)
      })

      // Financial data
      const paidBillings = filteredBillings.filter(b => b.status === 'Paid')
      const totalRevenue = paidBillings.reduce((sum, b) => sum + parseFloat(b.totalAmount), 0)
      
      const revenueByDate = {}
      paidBillings.forEach(billing => {
        const date = dayjs(billing.createdAt).format('YYYY-MM-DD')
        if (!revenueByDate[date]) {
          revenueByDate[date] = 0
        }
        revenueByDate[date] += parseFloat(billing.totalAmount)
      })

      setFinancialData({
        totalRevenue,
        totalTransactions: paidBillings.length,
        revenueByDate,
        transactions: paidBillings.slice(0, 10)
      })

      // Patient data
      const newPatients = patientsRes.data.filter(patient => {
        const patientDate = dayjs(patient.createdAt)
        return patientDate.isAfter(startDate) && patientDate.isBefore(endDate)
      })

      setPatientData({
        stats: {
          total: newPatients.length,
          newThisMonth: newPatients.length,
          withAppointments: newPatients.filter(p => 
            filteredAppointments.some(apt => apt.patientId === p.id)
          ).length
        },
        patients: newPatients
      })

      // Appointment data
      const appointmentStats = {
        total: filteredAppointments.length,
        scheduled: filteredAppointments.filter(a => a.status === 'Scheduled').length,
        completed: filteredAppointments.filter(a => a.status === 'Completed').length,
        cancelled: filteredAppointments.filter(a => a.status === 'Cancelled').length
      }

      // Appointments by doctor
      const appointmentsByDoctor = {}
      filteredAppointments.forEach(apt => {
        const doctorName = `Dr. ${apt.doctor?.firstName} ${apt.doctor?.lastName}`
        if (!appointmentsByDoctor[doctorName]) {
          appointmentsByDoctor[doctorName] = 0
        }
        appointmentsByDoctor[doctorName]++
      })

      setAppointmentData({
        stats: appointmentStats,
        appointmentsByDoctor,
        appointments: filteredAppointments
      })

    } catch (error) {
      console.error('Failed to generate reports:', error)
    } finally {
      setLoading(false)
    }
  }

  const exportToCSV = () => {
    // Simple CSV export implementation
    let csvContent = "data:text/csv;charset=utf-8,"
    let data = []

    if (reportType === 'financial') {
      csvContent += "Date,Revenue\n"
      Object.entries(financialData.revenueByDate || {}).forEach(([date, revenue]) => {
        csvContent += `${date},${revenue}\n`
      })
    }

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `${reportType}_report_${dayjs().format('YYYY-MM-DD')}.csv`)
    document.body.appendChild(link)
    link.click()
  }

  const financialChartData = Object.entries(financialData.revenueByDate || {}).map(([date, revenue]) => ({
    date: dayjs(date).format('MMM DD'),
    revenue
  }))

  const appointmentPieData = appointmentData.stats ? [
    { name: 'Scheduled', value: appointmentData.stats.scheduled },
    { name: 'Completed', value: appointmentData.stats.completed },
    { name: 'Cancelled', value: appointmentData.stats.cancelled },
  ] : []

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28']

  return (
    <div>
      <Card
        title="Reports & Analytics"
        extra={
          <Space>
            <Select
              value={reportType}
              onChange={setReportType}
              style={{ width: 150 }}
            >
              <Option value="financial">Financial</Option>
              <Option value="patients">Patients</Option>
              <Option value="appointments">Appointments</Option>
            </Select>
            <RangePicker
              value={dateRange}
              onChange={setDateRange}
              format="DD/MM/YYYY"
            />
            <Button
              icon={<DownloadOutlined />}
              onClick={exportToCSV}
            >
              Export CSV
            </Button>
          </Space>
        }
      >
        {reportType === 'financial' && (
          <Row gutter={16}>
            <Col span={24}>
              <Row gutter={16} style={{ marginBottom: 16 }}>
                <Col span={6}>
                  <Card>
                    <Statistic
                      title="Total Revenue"
                      value={financialData.totalRevenue}
                      prefix={<DollarOutlined />}
                      valueStyle={{ color: '#3f8600' }}
                      precision={2}
                    />
                  </Card>
                </Col>
                <Col span={6}>
                  <Card>
                    <Statistic
                      title="Total Transactions"
                      value={financialData.totalTransactions}
                      valueStyle={{ color: '#1890ff' }}
                    />
                  </Card>
                </Col>
                <Col span={6}>
                  <Card>
                    <Statistic
                      title="Period"
                      value={`${dateRange[0].format('DD/MM')} - ${dateRange[1].format('DD/MM')}`}
                      prefix={<CalendarOutlined />}
                    />
                  </Card>
                </Col>
                <Col span={6}>
                  <Card>
                    <Statistic
                      title="Avg. Daily Revenue"
                      value={financialData.totalRevenue / (financialChartData.length || 1)}
                      prefix={<DollarOutlined />}
                      precision={2}
                    />
                  </Card>
                </Col>
              </Row>

              <Card title="Revenue Trend" loading={loading}>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={financialChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="revenue" stroke="#8884d8" activeDot={{ r: 8 }} />
                  </LineChart>
                </ResponsiveContainer>
              </Card>

              <Card title="Recent Transactions" loading={loading} style={{ marginTop: 16 }}>
                <Table
                  dataSource={financialData.transactions}
                  columns={[
                    { title: 'Invoice', dataIndex: 'invoiceNumber' },
                    { title: 'Patient', render: (_, record) => `${record.patient?.firstName} ${record.patient?.lastName}` },
                    { title: 'Amount', dataIndex: 'totalAmount', render: (amt) => `$${parseFloat(amt).toFixed(2)}` },
                    { title: 'Date', dataIndex: 'createdAt', render: (date) => dayjs(date).format('DD/MM/YYYY') },
                    { title: 'Method', dataIndex: 'paymentMethod' }
                  ]}
                  pagination={{ pageSize: 5 }}
                  size="small"
                />
              </Card>
            </Col>
          </Row>
        )}

        {reportType === 'patients' && (
          <Row gutter={16}>
            <Col span={24}>
              <Row gutter={16} style={{ marginBottom: 16 }}>
                <Col span={6}>
                  <Card>
                    <Statistic
                      title="Total Patients"
                      value={patientData.stats?.total}
                      prefix={<UserOutlined />}
                      valueStyle={{ color: '#1890ff' }}
                    />
                  </Card>
                </Col>
                <Col span={6}>
                  <Card>
                    <Statistic
                      title="New This Month"
                      value={patientData.stats?.newThisMonth}
                      valueStyle={{ color: '#52c41a' }}
                    />
                  </Card>
                </Col>
                <Col span={6}>
                  <Card>
                    <Statistic
                      title="With Appointments"
                      value={patientData.stats?.withAppointments}
                      valueStyle={{ color: '#faad14' }}
                    />
                  </Card>
                </Col>
                <Col span={6}>
                  <Card>
                    <Statistic
                      title="Active Patients"
                      value={patientData.stats?.total - patientData.stats?.newThisMonth}
                    />
                  </Card>
                </Col>
              </Row>

              <Card title="Patient Demographics" loading={loading}>
                <Table
                  dataSource={patientData.patients}
                  columns={[
                    { title: 'Name', render: (_, record) => `${record.firstName} ${record.lastName}` },
                    { title: 'Email', dataIndex: 'email' },
                    { title: 'Phone', dataIndex: 'phone' },
                    { title: 'Gender', dataIndex: 'gender' },
                    { title: 'Date of Birth', dataIndex: 'dateOfBirth', render: (date) => dayjs(date).format('DD/MM/YYYY') },
                    { title: 'Registered', dataIndex: 'createdAt', render: (date) => dayjs(date).format('DD/MM/YYYY') }
                  ]}
                  pagination={{ pageSize: 10 }}
                />
              </Card>
            </Col>
          </Row>
        )}

        {reportType === 'appointments' && (
          <Row gutter={16}>
            <Col span={24}>
              <Row gutter={16} style={{ marginBottom: 16 }}>
                <Col span={6}>
                  <Card>
                    <Statistic
                      title="Total Appointments"
                      value={appointmentData.stats?.total}
                      prefix={<CalendarOutlined />}
                      valueStyle={{ color: '#1890ff' }}
                    />
                  </Card>
                </Col>
                <Col span={6}>
                  <Card>
                    <Statistic
                      title="Completed"
                      value={appointmentData.stats?.completed}
                      valueStyle={{ color: '#52c41a' }}
                    />
                  </Card>
                </Col>
                <Col span={6}>
                  <Card>
                    <Statistic
                      title="Scheduled"
                      value={appointmentData.stats?.scheduled}
                      valueStyle={{ color: '#faad14' }}
                    />
                  </Card>
                </Col>
                <Col span={6}>
                  <Card>
                    <Statistic
                      title="Cancelled"
                      value={appointmentData.stats?.cancelled}
                      valueStyle={{ color: '#ff4d4f' }}
                    />
                  </Card>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Card title="Appointment Status Distribution" loading={loading}>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={appointmentPieData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {appointmentPieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </Card>
                </Col>
                <Col span={12}>
                  <Card title="Appointments by Doctor" loading={loading}>
                    <List
                      dataSource={Object.entries(appointmentData.appointmentsByDoctor || {})}
                      renderItem={([doctor, count]) => (
                        <List.Item>
                          <List.Item.Meta
                            title={doctor}
                            description={`${count} appointments`}
                          />
                          <Tag color="blue">{count}</Tag>
                        </List.Item>
                      )}
                    />
                  </Card>
                </Col>
              </Row>

              <Card title="Appointment Details" loading={loading} style={{ marginTop: 16 }}>
                <Table
                  dataSource={appointmentData.appointments}
                  columns={[
                    { title: 'Patient', render: (_, record) => `${record.patient?.firstName} ${record.patient?.lastName}` },
                    { title: 'Doctor', render: (_, record) => `Dr. ${record.doctor?.firstName} ${record.doctor?.lastName}` },
                    { title: 'Date', dataIndex: 'appointmentDate', render: (date, record) => `${dayjs(date).format('DD/MM/YYYY')} ${record.appointmentTime}` },
                    { title: 'Status', dataIndex: 'status', render: (status) => <Tag color={status === 'Completed' ? 'green' : status === 'Scheduled' ? 'blue' : 'red'}>{status}</Tag> },
                    { title: 'Reason', dataIndex: 'reason', ellipsis: true }
                  ]}
                  pagination={{ pageSize: 10 }}
                />
              </Card>
            </Col>
          </Row>
        )}
      </Card>
    </div>
  )
}

export default Reports