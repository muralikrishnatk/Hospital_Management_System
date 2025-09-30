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
  DatePicker,
  message,
  Card,
  Tag,
  Popconfirm,
  Descriptions,
  Divider,
} from 'antd'
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  DollarOutlined,
  PrinterOutlined,
} from '@ant-design/icons'
import api from '@/services/api'
import dayjs from 'dayjs'

const { Option } = Select
const { TextArea } = Input

const Billing = () => {
  const [billings, setBillings] = useState([])
  const [patients, setPatients] = useState([])
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [detailVisible, setDetailVisible] = useState(false)
  const [paymentModalVisible, setPaymentModalVisible] = useState(false)
  const [editingBilling, setEditingBilling] = useState(null)
  const [selectedBilling, setSelectedBilling] = useState(null)
  const [form] = Form.useForm()

  useEffect(() => {
    fetchBillings()
    fetchPatients()
    fetchAppointments()
  }, [])

  const fetchBillings = async () => {
    setLoading(true)
    try {
      const response = await api.get('/billing')
      setBillings(response.data)
    } catch (error) {
      message.error('Failed to fetch billings')
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

  const fetchAppointments = async () => {
    try {
      const response = await api.get('/appointments')
      setAppointments(response.data)
    } catch (error) {
      message.error('Failed to fetch appointments')
    }
  }

  const handleSubmit = async (values) => {
    try {
      const billingData = {
        ...values,
        dueDate: values.dueDate?.format('YYYY-MM-DD'),
      }

      if (editingBilling) {
        await api.put(`/billing/${editingBilling.id}`, billingData)
        message.success('Billing updated successfully')
      } else {
        await api.post('/billing', billingData)
        message.success('Billing created successfully')
      }

      setModalVisible(false)
      setEditingBilling(null)
      form.resetFields()
      fetchBillings()
    } catch (error) {
      message.error('Failed to save billing')
    }
  }

  const handleProcessPayment = async (values) => {
    try {
      await api.post(`/billing/${selectedBilling.id}/process-payment`, values)
      message.success('Payment processed successfully')
      setPaymentModalVisible(false)
      setSelectedBilling(null)
      fetchBillings()
    } catch (error) {
      message.error('Failed to process payment')
    }
  }

  const handleDelete = async (billingId) => {
    try {
      await api.delete(`/billing/${billingId}`)
      message.success('Billing deleted successfully')
      fetchBillings()
    } catch (error) {
      message.error('Failed to delete billing')
    }
  }

  const showDetails = (billing) => {
    setSelectedBilling(billing)
    setDetailVisible(true)
  }

  const showPaymentModal = (billing) => {
    setSelectedBilling(billing)
    setPaymentModalVisible(true)
  }

  const printInvoice = (billing) => {
    const printWindow = window.open('', '_blank')
    printWindow.document.write(`
      <html>
        <head>
          <title>Invoice ${billing.invoiceNumber}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .details { margin: 20px 0; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            .total { text-align: right; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>HOSPITAL MANAGEMENT SYSTEM</h1>
            <h2>INVOICE</h2>
            <p>Invoice Number: ${billing.invoiceNumber}</p>
          </div>
          <div class="details">
            <p><strong>Patient:</strong> ${billing.patient.firstName} ${billing.patient.lastName}</p>
            <p><strong>Date:</strong> ${dayjs(billing.createdAt).format('DD/MM/YYYY')}</p>
            <p><strong>Status:</strong> ${billing.status}</p>
          </div>
          <table>
            <thead>
              <tr>
                <th>Description</th>
                <th>Quantity</th>
                <th>Unit Price</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              ${billing.items.map(item => `
                <tr>
                  <td>${item.description}</td>
                  <td>${item.quantity}</td>
                  <td>$${item.unitPrice}</td>
                  <td>$${(item.quantity * item.unitPrice).toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div class="total">
            <p>Subtotal: $${billing.amount}</p>
            <p>Tax: $${billing.tax}</p>
            <p>Discount: $${billing.discount}</p>
            <p><strong>Total: $${billing.totalAmount}</strong></p>
          </div>
        </body>
      </html>
    `)
    printWindow.document.close()
    printWindow.print()
  }

  const columns = [
    {
      title: 'Invoice No',
      dataIndex: 'invoiceNumber',
      key: 'invoiceNumber',
    },
    {
      title: 'Patient',
      dataIndex: ['patient', 'firstName'],
      key: 'patient',
      render: (text, record) => `${record.patient?.firstName} ${record.patient?.lastName}`
    },
    {
      title: 'Amount',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: (amount) => `$${parseFloat(amount).toFixed(2)}`
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={
          status === 'Paid' ? 'green' : 
          status === 'Pending' ? 'orange' : 'red'
        }>
          {status}
        </Tag>
      )
    },
    {
      title: 'Due Date',
      dataIndex: 'dueDate',
      key: 'dueDate',
      render: (date) => date ? dayjs(date).format('DD/MM/YYYY') : '-'
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => showDetails(record)}
          >
            View
          </Button>
          {record.status === 'Pending' && (
            <Button
              type="link"
              icon={<DollarOutlined />}
              onClick={() => showPaymentModal(record)}
            >
              Pay
            </Button>
          )}
          <Button
            type="link"
            icon={<PrinterOutlined />}
            onClick={() => printInvoice(record)}
          >
            Print
          </Button>
          <Popconfirm
            title="Are you sure to delete this billing?"
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

  const initialItems = [{ description: '', quantity: 1, unitPrice: 0 }]

  return (
    <div>
      <Card
        title="Billing Management"
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingBilling(null)
              form.resetFields()
              form.setFieldValue('items', initialItems)
              setModalVisible(true)
            }}
          >
            Create Bill
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={billings}
          loading={loading}
          rowKey="id"
          scroll={{ x: 800 }}
        />
      </Card>

      {/* Create/Edit Billing Modal */}
      <Modal
        title={editingBilling ? 'Edit Billing' : 'Create Billing'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false)
          setEditingBilling(null)
          form.resetFields()
        }}
        footer={null}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            items: initialItems,
            tax: 0,
            discount: 0
          }}
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

          <Form.Item name="appointmentId" label="Appointment (Optional)">
            <Select placeholder="Select appointment">
              {appointments.map(apt => (
                <Option key={apt.id} value={apt.id}>
                  {apt.patient?.firstName} {apt.patient?.lastName} - {dayjs(apt.appointmentDate).format('DD/MM/YYYY')}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Divider>Bill Items</Divider>
          
          <Form.List name="items">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                    <Form.Item
                      {...restField}
                      name={[name, 'description']}
                      rules={[{ required: true, message: 'Description required' }]}
                    >
                      <Input placeholder="Description" />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, 'quantity']}
                      rules={[{ required: true, message: 'Quantity required' }]}
                    >
                      <InputNumber min={1} placeholder="Qty" />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, 'unitPrice']}
                      rules={[{ required: true, message: 'Price required' }]}
                    >
                      <InputNumber min={0} step={0.01} placeholder="Price" />
                    </Form.Item>
                    <Button type="link" danger onClick={() => remove(name)}>
                      Remove
                    </Button>
                  </Space>
                ))}
                <Form.Item>
                  <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                    Add Item
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>

          <Form.Item name="tax" label="Tax">
            <InputNumber min={0} step={0.01} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item name="discount" label="Discount">
            <InputNumber min={0} step={0.01} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item name="dueDate" label="Due Date">
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item name="notes" label="Notes">
            <TextArea rows={3} />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingBilling ? 'Update' : 'Create'}
              </Button>
              <Button
                onClick={() => {
                  setModalVisible(false)
                  setEditingBilling(null)
                  form.resetFields()
                }}
              >
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Billing Details Modal */}
      <Modal
        title="Billing Details"
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        footer={[
          <Button key="print" icon={<PrinterOutlined />} onClick={() => printInvoice(selectedBilling)}>
            Print
          </Button>,
          <Button key="close" onClick={() => setDetailVisible(false)}>
            Close
          </Button>
        ]}
        width={700}
      >
        {selectedBilling && (
          <Descriptions column={2} bordered>
            <Descriptions.Item label="Invoice Number" span={2}>
              {selectedBilling.invoiceNumber}
            </Descriptions.Item>
            <Descriptions.Item label="Patient">
              {selectedBilling.patient?.firstName} {selectedBilling.patient?.lastName}
            </Descriptions.Item>
            <Descriptions.Item label="Status">
              <Tag color={selectedBilling.status === 'Paid' ? 'green' : 'orange'}>
                {selectedBilling.status}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Amount">
              ${parseFloat(selectedBilling.amount).toFixed(2)}
            </Descriptions.Item>
            <Descriptions.Item label="Total Amount">
              ${parseFloat(selectedBilling.totalAmount).toFixed(2)}
            </Descriptions.Item>
            <Descriptions.Item label="Due Date">
              {selectedBilling.dueDate ? dayjs(selectedBilling.dueDate).format('DD/MM/YYYY') : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="Items" span={2}>
              <Table
                dataSource={selectedBilling.items}
                pagination={false}
                size="small"
                columns={[
                  { title: 'Description', dataIndex: 'description' },
                  { title: 'Quantity', dataIndex: 'quantity' },
                  { title: 'Unit Price', dataIndex: 'unitPrice', render: (price) => `$${price}` },
                  { title: 'Amount', render: (_, record) => `$${(record.quantity * record.unitPrice).toFixed(2)}` }
                ]}
              />
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>

      {/* Payment Modal */}
      <Modal
        title="Process Payment"
        open={paymentModalVisible}
        onCancel={() => setPaymentModalVisible(false)}
        footer={null}
      >
        {selectedBilling && (
          <Form onFinish={handleProcessPayment} layout="vertical">
            <Descriptions column={1} size="small">
              <Descriptions.Item label="Invoice Number">
                {selectedBilling.invoiceNumber}
              </Descriptions.Item>
              <Descriptions.Item label="Patient">
                {selectedBilling.patient?.firstName} {selectedBilling.patient?.lastName}
              </Descriptions.Item>
              <Descriptions.Item label="Total Amount">
                <strong>${parseFloat(selectedBilling.totalAmount).toFixed(2)}</strong>
              </Descriptions.Item>
            </Descriptions>
            
            <Form.Item
              name="paymentMethod"
              label="Payment Method"
              rules={[{ required: true, message: 'Please select payment method' }]}
            >
              <Select placeholder="Select payment method">
                <Option value="Cash">Cash</Option>
                <Option value="Credit Card">Credit Card</Option>
                <Option value="Debit Card">Debit Card</Option>
                <Option value="Insurance">Insurance</Option>
                <Option value="Bank Transfer">Bank Transfer</Option>
              </Select>
            </Form.Item>

            <Form.Item>
              <Space>
                <Button type="primary" htmlType="submit">
                  Process Payment
                </Button>
                <Button onClick={() => setPaymentModalVisible(false)}>
                  Cancel
                </Button>
              </Space>
            </Form.Item>
          </Form>
        )}
      </Modal>
    </div>
  )
}

export default Billing