import React, { useState, useEffect } from 'react'
import {
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
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

const { Option } = Select

const Doctors = () => {
  const [doctors, setDoctors] = useState([])
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [editingDoctor, setEditingDoctor] = useState(null)
  const [form] = Form.useForm()

  useEffect(() => {
    fetchDoctors()
  }, [])

  const fetchDoctors = async () => {
    setLoading(true)
    try {
      const response = await api.get('/doctors')
      setDoctors(response.data)
    } catch (error) {
      message.error('Failed to fetch doctors')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (values) => {
    try {
      if (editingDoctor) {
        await api.put(`/doctors/${editingDoctor.id}`, values)
        message.success('Doctor updated successfully')
      } else {
        await api.post('/doctors', values)
        message.success('Doctor created successfully')
      }

      setModalVisible(false)
      setEditingDoctor(null)
      form.resetFields()
      fetchDoctors()
    } catch (error) {
      message.error('Failed to save doctor')
    }
  }

  const handleEdit = (doctor) => {
    setEditingDoctor(doctor)
    form.setFieldsValue(doctor)
    setModalVisible(true)
  }

  const handleDelete = async (doctorId) => {
    try {
      await api.delete(`/doctors/${doctorId}`)
      message.success('Doctor deleted successfully')
      fetchDoctors()
    } catch (error) {
      message.error('Failed to delete doctor')
    }
  }

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 60,
    },
    {
      title: 'Name',
      dataIndex: 'firstName',
      key: 'name',
      render: (text, record) => `Dr. ${record.firstName} ${record.lastName}`,
    },
    {
      title: 'Specialization',
      dataIndex: 'specialization',
      key: 'specialization',
    },
    {
      title: 'Qualification',
      dataIndex: 'qualification',
      key: 'qualification',
    },
    {
      title: 'Experience',
      dataIndex: 'experience',
      key: 'experience',
      render: (exp) => `${exp} years`,
    },
    {
      title: 'Fee',
      dataIndex: 'consultationFee',
      key: 'consultationFee',
      render: (fee) => `$${parseFloat(fee).toFixed(2)}`,
    },
    {
      title: 'Availability',
      dataIndex: 'availability',
      key: 'availability',
      render: (available) => (
        <Tag color={available ? 'green' : 'red'}>
          {available ? 'Available' : 'Not Available'}
        </Tag>
      ),
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
            title="Are you sure to delete this doctor?"
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
        title="Doctor Management"
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingDoctor(null)
              form.resetFields()
              setModalVisible(true)
            }}
          >
            Add Doctor
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={doctors}
          loading={loading}
          rowKey="id"
          scroll={{ x: 800 }}
        />
      </Card>

      <Modal
        title={editingDoctor ? 'Edit Doctor' : 'Add Doctor'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false)
          setEditingDoctor(null)
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
            name="firstName"
            label="First Name"
            rules={[{ required: true, message: 'Please enter first name' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="lastName"
            label="Last Name"
            rules={[{ required: true, message: 'Please enter last name' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Please enter email' },
              { type: 'email', message: 'Please enter a valid email' },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="phone"
            label="Phone"
            rules={[{ required: true, message: 'Please enter phone number' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="specialization"
            label="Specialization"
            rules={[{ required: true, message: 'Please enter specialization' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="qualification"
            label="Qualification"
            rules={[{ required: true, message: 'Please enter qualification' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="experience"
            label="Experience (years)"
            rules={[{ required: true, message: 'Please enter experience' }]}
          >
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="consultationFee"
            label="Consultation Fee"
            rules={[{ required: true, message: 'Please enter consultation fee' }]}
          >
            <InputNumber min={0} step={0.01} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item name="availability" label="Availability" valuePropName="checked">
            <Select>
              <Option value={true}>Available</Option>
              <Option value={false}>Not Available</Option>
            </Select>
          </Form.Item>

          <Form.Item name="bio" label="Bio">
            <Input.TextArea rows={3} />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingDoctor ? 'Update' : 'Create'}
              </Button>
              <Button
                onClick={() => {
                  setModalVisible(false)
                  setEditingDoctor(null)
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

export default Doctors