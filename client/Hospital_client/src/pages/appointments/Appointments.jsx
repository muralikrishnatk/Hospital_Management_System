import React, { useState, useEffect } from 'react'
import {
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  TimePicker,
  message,
  Card,
  Tag,
  Popconfirm,
} from 'antd'
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
} from '@ant-design/icons'
import api from '@/services/api'
import dayjs from 'dayjs'

const { Option } = Select
const { TextArea } = Input

const Appointments = () => {
  const [appointments, setAppointments] = useState([])
  const [patients, setPatients] = useState([])
  const [doctors, setDoctors] = useState([])
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [editingAppointment, setEditingAppointment] = useState(null)
  const [form] = Form.useForm()

  useEffect(() => {
    fetchAppointments()
    fetchPatients()
    fetchDoctors()
  }, [])

  const fetchAppointments = async () => {
    setLoading(true)
    try {
      const response = await api.get('/appointments')
      setAppointments(response.data)
    } catch (error) {
      message.error('Failed to fetch appointments')
    } finally {
      setLoading(false)
    }
  }

  const fetchPatients = async () => {
    try {
      const response = await api.get('/patients')
      setPatients(response.data)
    } catch (error) {
      message.error('Failed to fetch patients')
    }
  }

  const fetchDoctors = async () => {
    try {
      const response = await api.get('/doctors')
      setDoctors(response.data)
    } catch (error) {
      message.error('Failed to fetch doctors')
    }
  }

  const handleSubmit = async (values) => {
    try {
      const appointmentData = {
        ...values,
        appointmentDate: values.appointmentDate.format('YYYY-MM-DD'),
        appointmentTime: values.appointmentTime.format('HH:mm:ss'),
      }

      if (editingAppointment) {
        await api.put(`/appointments/${editingAppointment.id}`, appointmentData)
        message.success('Appointment updated successfully')
      } else {
        await api.post('/appointments', appointmentData)
        message.success('Appointment created successfully')
      }

      setModalVisible(false)
      setEditingAppointment(null)
      form.resetFields()
      fetchAppointments()
    } catch (error) {
      message.error('Failed to save appointment')
    }
  }

  const handleEdit = (appointment) => {
    setEditingAppointment(appointment)
    form.setFieldsValue({
      ...appointment,
      appointmentDate: dayjs(appointment.appointmentDate),
      appointmentTime: dayjs(appointment.appointmentTime, 'HH:mm:ss'),
    })
    setModalVisible(true)
  }

  const handleDelete = async (appointmentId) => {
    try {
      await api.delete(`/appointments/${appointmentId}`)
      message.success('Appointment deleted successfully')
      fetchAppointments()
    } catch (error) {
      message.error('Failed to delete appointment')
    }
  }

  const getStatusColor = (status) => {
    const colors = {
      Scheduled: 'blue',
      Completed: 'green',
      Cancelled: 'red',
      'No-Show': 'orange'
    }
    return colors[status] || 'default'
  }

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 60,
    },
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
      title: 'Date',
      dataIndex: 'appointmentDate',
      key: 'appointmentDate',
      render: (date) => dayjs(date).format('DD/MM/YYYY')
    },
    {
      title: 'Time',
      dataIndex: 'appointmentTime',
      key: 'appointmentTime',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={getStatusColor(status)}>
          {status}
        </Tag>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            Edit
          </Button>
          <Popconfirm
            title="Are you sure to delete this appointment?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <div>
      <Card
        title="Appointment Management"
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingAppointment(null)
              form.resetFields()
              setModalVisible(true)
            }}
          >
            Schedule Appointment
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={appointments}
          loading={loading}
          rowKey="id"
          scroll={{ x: 800 }}
        />
      </Card>

      <Modal
        title={editingAppointment ? 'Edit Appointment' : 'Schedule Appointment'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false)
          setEditingAppointment(null)
          form.resetFields()
        }}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="patientId"
            label="Patient"
            rules={[{ required: true, message: 'Please select a patient' }]}
          >
            <Select placeholder="Select patient">
              {patients.map(patient => (
                <Option key={patient.id} value={patient.id}>
                  {patient.firstName} {patient.lastName}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="doctorId"
            label="Doctor"
            rules={[{ required: true, message: 'Please select a doctor' }]}
          >
            <Select placeholder="Select doctor">
              {doctors.map(doctor => (
                <Option key={doctor.id} value={doctor.id}>
                  Dr. {doctor.firstName} {doctor.lastName} - {doctor.specialization}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="appointmentDate"
            label="Appointment Date"
            rules={[{ required: true, message: 'Please select appointment date' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="appointmentTime"
            label="Appointment Time"
            rules={[{ required: true, message: 'Please select appointment time' }]}
          >
            <TimePicker format="HH:mm" style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="status"
            label="Status"
            rules={[{ required: true, message: 'Please select status' }]}
          >
            <Select>
              <Option value="Scheduled">Scheduled</Option>
              <Option value="Completed">Completed</Option>
              <Option value="Cancelled">Cancelled</Option>
              <Option value="No-Show">No-Show</Option>
            </Select>
          </Form.Item>

          <Form.Item name="reason" label="Reason">
            <TextArea rows={3} />
          </Form.Item>

          <Form.Item name="notes" label="Notes">
            <TextArea rows={3} />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingAppointment ? 'Update' : 'Schedule'}
              </Button>
              <Button
                onClick={() => {
                  setModalVisible(false)
                  setEditingAppointment(null)
                  form.resetFields()
                }}
              >
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default Appointments