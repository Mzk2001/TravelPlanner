import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Layout,
  Card,
  Typography,
  Button,
  Table,
  Space,
  Tag,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  InputNumber,
  Row,
  Col,
  Statistic,
  Progress,
  Alert,
  Spin,
  FloatButton,
  Popconfirm,
  message
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  DollarOutlined,
  BarChartOutlined,
  ArrowLeftOutlined,
  ShoppingOutlined,
  CarOutlined,
  HomeOutlined,
  CoffeeOutlined,
  GiftOutlined,
  CameraOutlined,
  MedicineBoxOutlined,
  MoreOutlined
} from '@ant-design/icons';
import { expenseAPI } from '../services/api';
import Header from '../components/Header';
import dayjs from 'dayjs';

const { Content } = Layout;
const { Title, Text } = Typography;
const { Option } = Select;

const ExpenseManagementPage = () => {
  const { planId } = useParams();
  const navigate = useNavigate();
  
  const [expenses, setExpenses] = useState([]);
  const [budgetAnalysis, setBudgetAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // 对话框状态
  const [modalVisible, setModalVisible] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [form] = Form.useForm();

  const expenseCategories = [
    { value: 'TRANSPORTATION', label: '交通', icon: <CarOutlined /> },
    { value: 'ACCOMMODATION', label: '住宿', icon: <HomeOutlined /> },
    { value: 'MEAL', label: '餐饮', icon: <CoffeeOutlined /> },
    { value: 'ACTIVITY', label: '活动', icon: <CameraOutlined /> },
    { value: 'SHOPPING', label: '购物', icon: <ShoppingOutlined /> },
    { value: 'HEALTH', label: '医疗', icon: <MedicineBoxOutlined /> },
    { value: 'ENTERTAINMENT', label: '娱乐', icon: <GiftOutlined /> },
    { value: 'OTHER', label: '其他', icon: <MoreOutlined /> }
  ];

  const paymentMethods = [
    { value: 'CASH', label: '现金' },
    { value: 'CREDIT_CARD', label: '信用卡' },
    { value: 'ALIPAY', label: '支付宝' },
    { value: 'WECHAT', label: '微信支付' },
    { value: 'BANK_TRANSFER', label: '银行转账' }
  ];

  useEffect(() => {
    if (planId) {
      loadExpenses();
      loadBudgetAnalysis();
    }
  }, [planId]);

  const loadExpenses = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await expenseAPI.getExpenses(Number(planId));
      // 后端返回的数据结构是 { data: { expenses: [...] } }
      setExpenses(response.data?.data?.expenses || []);
    } catch (err) {
      setError('加载费用记录失败');
      console.error('Load expenses error:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadBudgetAnalysis = async () => {
    try {
      const response = await expenseAPI.getExpenseSummary(Number(planId));
      // 后端返回的数据结构是 { data: { totalExpense: ..., totalBudget: ... } }
      setBudgetAnalysis(response.data?.data);
    } catch (err) {
      console.error('Load budget analysis error:', err);
    }
  };

  const handleCreateExpense = async () => {
    try {
      const values = await form.validateFields();
      const expenseData = {
        ...values,
        planId: Number(planId),
        userId: 1, // 从认证上下文获取
        expenseDate: values.expenseDate.format('YYYY-MM-DD')
      };
      
      await expenseAPI.createExpense(expenseData);
      message.success('费用记录创建成功');
      setModalVisible(false);
      form.resetFields();
      loadExpenses();
      loadBudgetAnalysis();
    } catch (err) {
      message.error('创建费用记录失败');
      console.error('Create expense error:', err);
    }
  };

  const handleUpdateExpense = async () => {
    if (!editingExpense) return;
    
    try {
      const values = await form.validateFields();
      const updateData = {
        ...values,
        expenseDate: values.expenseDate.format('YYYY-MM-DD')
      };
      
      await expenseAPI.updateExpense(editingExpense.id, updateData);
      message.success('费用记录更新成功');
      setModalVisible(false);
      setEditingExpense(null);
      form.resetFields();
      loadExpenses();
      loadBudgetAnalysis();
    } catch (err) {
      message.error('更新费用记录失败');
      console.error('Update expense error:', err);
    }
  };

  const handleDeleteExpense = async (expenseId) => {
    try {
      await expenseAPI.deleteExpense(expenseId);
      message.success('费用记录删除成功');
      loadExpenses();
      loadBudgetAnalysis();
    } catch (err) {
      message.error('删除费用记录失败');
      console.error('Delete expense error:', err);
    }
  };

  const handleEditExpense = (expense) => {
    setEditingExpense(expense);
    form.setFieldsValue({
      ...expense,
      expenseDate: dayjs(expense.expenseDate)
    });
    setModalVisible(true);
  };

  const getCategoryIcon = (category) => {
    const categoryInfo = expenseCategories.find(cat => cat.value === category);
    return categoryInfo?.icon || <MoreOutlined />;
  };

  const getCategoryColor = (category) => {
    const colors = {
      'TRANSPORTATION': 'blue',
      'ACCOMMODATION': 'green',
      'MEAL': 'orange',
      'ACTIVITY': 'purple',
      'SHOPPING': 'red',
      'HEALTH': 'volcano',
      'ENTERTAINMENT': 'cyan',
      'OTHER': 'default'
    };
    return colors[category] || 'default';
  };

  const columns = [
    {
      title: '类别',
      dataIndex: 'category',
      key: 'category',
      render: (category) => (
        <Space>
          {getCategoryIcon(category)}
          <Tag color={getCategoryColor(category)}>
            {expenseCategories.find(cat => cat.value === category)?.label || category}
          </Tag>
        </Space>
      ),
    },
    {
      title: '金额',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount) => (
        <Text strong style={{ color: '#f5222d' }}>
          ¥{amount.toFixed(2)}
        </Text>
      ),
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: '地点',
      dataIndex: 'location',
      key: 'location',
      ellipsis: true,
    },
    {
      title: '日期',
      dataIndex: 'expenseDate',
      key: 'expenseDate',
      render: (date) => dayjs(date).format('YYYY-MM-DD'),
    },
    {
      title: '支付方式',
      dataIndex: 'paymentMethod',
      key: 'paymentMethod',
      render: (method) => {
        const methodInfo = paymentMethods.find(m => m.value === method);
        return methodInfo?.label || method;
      },
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEditExpense(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这条费用记录吗？"
            onConfirm={() => handleDeleteExpense(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button
              type="link"
              danger
              icon={<DeleteOutlined />}
            >
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  if (loading) {
    return (
      <div style={{ padding: '24px', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
        {/* 页面操作栏 */}
        <Row justify="end" style={{ marginBottom: 24 }}>
          <Col>
            <Space>
              <Button 
                icon={<ArrowLeftOutlined />} 
                onClick={() => navigate(-1)}
              >
                返回
              </Button>
              <Button
                type="primary"
                icon={<BarChartOutlined />}
                onClick={() => navigate(`/plans/${planId}/budget`)}
              >
                预算分析
              </Button>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => {
                  setEditingExpense(null);
                  form.resetFields();
                  setModalVisible(true);
                }}
              >
                添加费用
              </Button>
            </Space>
          </Col>
        </Row>

        {error && (
          <Alert
            message="错误"
            description={error}
            type="error"
            showIcon
            closable
            onClose={() => setError(null)}
            style={{ marginBottom: 16 }}
          />
        )}

        {/* 预算概览 */}
        {budgetAnalysis && (
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="总预算"
                  value={budgetAnalysis.totalBudget}
                  prefix={<DollarOutlined />}
                  suffix="元"
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="已支出"
                  value={budgetAnalysis.totalExpense}
                  prefix={<DollarOutlined />}
                  suffix="元"
                  valueStyle={{ color: '#f5222d' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="剩余预算"
                  value={budgetAnalysis.remainingBudget}
                  prefix={<DollarOutlined />}
                  suffix="元"
                  valueStyle={{ color: budgetAnalysis.remainingBudget >= 0 ? '#52c41a' : '#f5222d' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <div>
                  <div style={{ marginBottom: 8 }}>预算使用率</div>
                  <Progress
                    type="circle"
                    percent={Math.round(budgetAnalysis.budgetUtilization)}
                    status={budgetAnalysis.budgetUtilization > 100 ? 'exception' : 'normal'}
                    format={(percent) => `${percent}%`}
                  />
                </div>
              </Card>
            </Col>
          </Row>
        )}

        {/* 费用记录表格 */}
        <Card title="费用记录" extra={<Text type="secondary">共 {expenses.length} 条记录</Text>}>
          <Table
            columns={columns}
            dataSource={expenses}
            rowKey="id"
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`,
            }}
          />
        </Card>

        {/* 添加/编辑费用模态框 */}
        <Modal
          title={editingExpense ? '编辑费用记录' : '添加费用记录'}
          open={modalVisible}
          onCancel={() => {
            setModalVisible(false);
            setEditingExpense(null);
            form.resetFields();
          }}
          onOk={editingExpense ? handleUpdateExpense : handleCreateExpense}
          width={800}
        >
          <Form
            form={form}
            layout="vertical"
            initialValues={{
              category: 'MEAL',
              currency: 'CNY',
              expenseDate: dayjs(),
              isReimbursable: false
            }}
          >
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="category"
                  label="费用类别"
                  rules={[{ required: true, message: '请选择费用类别' }]}
                >
                  <Select placeholder="选择费用类别">
                    {expenseCategories.map(category => (
                      <Option key={category.value} value={category.value}>
                        <Space>
                          {category.icon}
                          {category.label}
                        </Space>
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="amount"
                  label="金额"
                  rules={[
                    { required: true, message: '请输入金额' },
                    { type: 'number', min: 0.01, message: '金额必须大于0' }
                  ]}
                >
                  <InputNumber
                    style={{ width: '100%' }}
                    placeholder="请输入金额"
                    min={0}
                    step={0.01}
                    precision={2}
                    prefix="¥"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="description"
                  label="描述"
                  rules={[{ required: true, message: '请输入费用描述' }]}
                >
                  <Input placeholder="请输入费用描述" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="location"
                  label="地点"
                >
                  <Input placeholder="请输入消费地点" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="expenseDate"
                  label="费用日期"
                  rules={[{ required: true, message: '请选择费用日期' }]}
                >
                  <DatePicker style={{ width: '100%' }} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="paymentMethod"
                  label="支付方式"
                >
                  <Select placeholder="选择支付方式">
                    {paymentMethods.map(method => (
                      <Option key={method.value} value={method.value}>
                        {method.label}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="notes"
              label="备注"
            >
              <Input.TextArea rows={3} placeholder="请输入备注信息" />
            </Form.Item>
          </Form>
        </Modal>

        {/* 浮动按钮 */}
        <FloatButton
          icon={<PlusOutlined />}
          type="primary"
          onClick={() => {
            setEditingExpense(null);
            form.resetFields();
            setModalVisible(true);
          }}
        />
    </div>
  );
};

export default ExpenseManagementPage;
