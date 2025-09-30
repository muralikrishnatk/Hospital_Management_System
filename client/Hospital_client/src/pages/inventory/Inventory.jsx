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
  Row,
  Col,
  Statistic,
} from 'antd'
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
} from '@ant-design/icons'
import api from '@/services/api'
import dayjs from 'dayjs'

const { Option } = Select

const Inventory = () => {
  const [inventory, setInventory] = useState([])
  const [lowStock, setLowStock] = useState([])
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [stockModalVisible, setStockModalVisible] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [selectedItem, setSelectedItem] = useState(null)
  const [form] = Form.useForm()
  const [stockForm] = Form.useForm()

  useEffect(() => {
    fetchInventory()
    fetchLowStock()
  }, [])

  const fetchInventory = async () => {
    setLoading(true)
    try {
      const response = await api.get('/inventory')
      setInventory(response.data)
    } catch (error) {
      message.error('Failed to fetch inventory')
    } finally {
      setLoading(false)
    }
  }

  const fetchLowStock = async () => {
    try {
      const response = await api.get('/inventory/low-stock')
      setLowStock(response.data)
    } catch (error) {
      message.error('Failed to fetch low stock items')
    }
  }

  const handleSubmit = async (values) => {
    try {
      const inventoryData = {
        ...values,
        expiryDate: values.expiryDate?.format('YYYY-MM-DD'),
      }

      if (editingItem) {
        await api.put(`/inventory/${editingItem.id}`, inventoryData)
        message.success('Inventory item updated successfully')
      } else {
        await api.post('/inventory', inventoryData)
        message.success('Inventory item created successfully')
      }

      setModalVisible(false)
      setEditingItem(null)
      form.resetFields()
      fetchInventory()
      fetchLowStock()
    } catch (error) {
      message.error('Failed to save inventory item')
    }
  }

  const handleStockUpdate = async (values) => {
    try {
      await api.post(`/inventory/${selectedItem.id}/stock`, values)
      message.success('Stock updated successfully')
      setStockModalVisible(false)
      setSelectedItem(null)
      stockForm.resetFields()
      fetchInventory()
      fetchLowStock()
    } catch (error) {
      message.error('Failed to update stock')
    }
  }

  const handleDelete = async (itemId) => {
    try {
      await api.delete(`/inventory/${itemId}`)
      message.success('Inventory item deleted successfully')
      fetchInventory()
      fetchLowStock()
    } catch (error) {
      message.error('Failed to delete inventory item')
    }
  }

  const showStockModal = (item, operation) => {
    setSelectedItem(item)
    stockForm.setFieldsValue({ operation })
    setStockModalVisible(true)
  }

  const getStockStatus = (item) => {
    if (item.quantity <= item.reorderLevel) {
      return { status: 'error', text: 'Critical' }
    } else if (item.quantity <= item.lowStockAlert) {
      return { status: 'warning', text: 'Low' }
    } else {
      return { status: 'success', text: 'Adequate' }
    }
  }

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
    },
    {
      title: 'Quantity',
      dataIndex: 'quantity',
      key: 'quantity',
      render: (quantity, record) => (
        <Space>
          <span>{quantity}</span>
          <Tag color={getStockStatus(record).status}>
            {getStockStatus(record).text}
          </Tag>
        </Space>
      )
    },
    {
      title: 'Unit Price',
      dataIndex: 'unitPrice',
      key: 'unitPrice',
      render: (price) => `$${parseFloat(price).toFixed(2)}`
    },
    {
      title: 'Supplier',
      dataIndex: 'supplier',
      key: 'supplier',
    },
    {
      title: 'Expiry Date',
      dataIndex: 'expiryDate',
      key: 'expiryDate',
      render: (date) => date ? dayjs(date).format('DD/MM/YYYY') : '-'
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="link"
            icon={<ArrowUpOutlined />}
            onClick={() => showStockModal(record, 'add')}
          >
            Add Stock
          </Button>
          <Button
            type="link"
            icon={<ArrowDownOutlined />}
            onClick={() => showStockModal(record, 'subtract')}
          >
            Use Stock
          </Button>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => {
              setEditingItem(record)
              form.setFieldsValue({
                ...record,
                expiryDate: record.expiryDate ? dayjs(record.expiryDate) : null,
              })
              setModalVisible(true)
            }}
          >
            Edit
          </Button>
          <Popconfirm
            title="Are you sure to delete this item?"
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

  const totalValue = inventory.reduce((sum, item) => 
    sum + (item.quantity * parseFloat(item.unitPrice)), 0
  )

  return (
    <div>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Items"
              value={inventory.length}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Low Stock Items"
              value={lowStock.length}
              valueStyle={{ color: '#cf1322' }}
              prefix={<ExclamationCircleOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Inventory Value"
              value={totalValue}
              precision={2}
              prefix="$"
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Active Items"
              value={inventory.filter(item => item.isActive).length}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      <Card
        title="Inventory Management"
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingItem(null)
              form.resetFields()
              setModalVisible(true)
            }}
          >
            Add Item
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={inventory}
          loading={loading}
          rowKey="id"
          scroll={{ x: 1000 }}
        />
      </Card>

      {/* Add/Edit Inventory Modal */}
      <Modal
        title={editingItem ? 'Edit Inventory Item' : 'Add Inventory Item'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false)
          setEditingItem(null)
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
            name="name"
            label="Item Name"
            rules={[{ required: true, message: 'Please enter item name' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="category"
            label="Category"
            rules={[{ required: true, message: 'Please enter category' }]}
          >
            <Input />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="quantity"
                label="Quantity"
                rules={[{ required: true, message: 'Please enter quantity' }]}
              >
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="unitPrice"
                label="Unit Price"
                rules={[{ required: true, message: 'Please enter unit price' }]}
              >
                <InputNumber min={0} step={0.01} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="lowStockAlert"
                label="Low Stock Alert"
                rules={[{ required: true, message: 'Please enter low stock alert level' }]}
              >
                <InputNumber min={1} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="reorderLevel"
                label="Reorder Level"
                rules={[{ required: true, message: 'Please enter reorder level' }]}
              >
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="supplier" label="Supplier">
            <Input />
          </Form.Item>

          <Form.Item name="expiryDate" label="Expiry Date">
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item name="description" label="Description">
            <Input.TextArea rows={3} />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingItem ? 'Update' : 'Create'}
              </Button>
              <Button
                onClick={() => {
                  setModalVisible(false)
                  setEditingItem(null)
                  form.resetFields()
                }}
              >
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Stock Update Modal */}
      <Modal
        title={`${selectedItem ? selectedItem.name : ''} - ${stockForm.getFieldValue('operation') === 'add' ? 'Add' : 'Use'} Stock`}
        open={stockModalVisible}
        onCancel={() => {
          setStockModalVisible(false)
          setSelectedItem(null)
          stockForm.resetFields()
        }}
        footer={null}
      >
        {selectedItem && (
          <Form
            form={stockForm}
            layout="vertical"
            onFinish={handleStockUpdate}
            initialValues={{ quantity: 1 }}
          >
            <Form.Item
              name="quantity"
              label="Quantity"
              rules={[{ required: true, message: 'Please enter quantity' }]}
            >
              <InputNumber 
                min={1} 
                style={{ width: '100%' }} 
                placeholder={`Current stock: ${selectedItem.quantity}`}
              />
            </Form.Item>

            <Form.Item>
              <Space>
                <Button type="primary" htmlType="submit">
                  Update Stock
                </Button>
                <Button
                  onClick={() => {
                    setStockModalVisible(false)
                    setSelectedItem(null)
                    stockForm.resetFields()
                  }}
                >
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

export default Inventory