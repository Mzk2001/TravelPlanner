import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Button, 
  Table, 
  Space, 
  Tag, 
  Modal, 
  Form, 
  Input, 
  DatePicker, 
  InputNumber, 
  Select, 
  message,
  Popconfirm,
  Typography,
  Row,
  Col,
  Statistic
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  EyeOutlined,
  CalendarOutlined,
  DollarOutlined,
  TeamOutlined
} from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import apiService from '../services/api';
import { TravelPlan, CreatePlanRequest, UpdatePlanRequest } from '../types';
import dayjs from 'dayjs';

const { Title } = Typography;
const { RangePicker } = DatePicker;

const TravelPlansPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [plans, setPlans] = useState<TravelPlan[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingPlan, setEditingPlan] = useState<TravelPlan | null>(null);
  const [form] = Form.useForm();

  // 定义parser函数避免类型问题
  const parseCurrency = (value: string | undefined): number => {
    const num = Number(value?.replace(/¥\s?|(,*)/g, '') || 0);
    return isNaN(num) ? 0 : num;
  };

  useEffect(() => {
    if (user) {
      fetchPlans();
    }
  }, [user]);

  const fetchPlans = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const response = await apiService.getUserPlans(user.id);
      setPlans(response.content);
    } catch (error) {
      message.error('获取计划列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingPlan(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (plan: TravelPlan) => {
    setEditingPlan(plan);
    form.setFieldsValue({
      ...plan,
      dateRange: [dayjs(plan.startDate), dayjs(plan.endDate)]
    });
    setModalVisible(true);
  };

  const handleDelete = async (planId: number) => {
    try {
      await apiService.deletePlan(planId);
      message.success('删除成功');
      fetchPlans();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleSubmit = async (values: any) => {
    if (!user) return;

    try {
      const { dateRange, ...otherValues } = values;
      
      if (editingPlan) {
        // 更新计划
        const updateData: UpdatePlanRequest = {
          ...otherValues,
          startDate: dateRange[0].format('YYYY-MM-DD') + 'T00:00:00.000Z',
          endDate: dateRange[1].format('YYYY-MM-DD') + 'T23:59:59.999Z',
        };
        await apiService.updatePlan(editingPlan.id, updateData);
        message.success('更新成功');
      } else {
        // 创建计划
        const createData: CreatePlanRequest = {
          userId: user.id,
          ...otherValues,
          startDate: dateRange[0].format('YYYY-MM-DD') + 'T00:00:00.000Z',
          endDate: dateRange[1].format('YYYY-MM-DD') + 'T23:59:59.999Z',
        };
        await apiService.createPlan(createData);
        message.success('创建成功');
      }
      
      setModalVisible(false);
      fetchPlans();
    } catch (error) {
      message.error(editingPlan ? '更新失败' : '创建失败');
    }
  };


  const columns = [
    {
      title: '计划名称',
      dataIndex: 'planName',
      key: 'planName',
      render: (text: string, record: TravelPlan) => (
        <Button 
          type="link" 
          onClick={() => navigate(`/plans/${record.id}`)}
          style={{ padding: 0, height: 'auto' }}
        >
          {text}
        </Button>
      ),
    },
    {
      title: '目的地',
      dataIndex: 'destination',
      key: 'destination',
    },
    {
      title: '出发日期',
      dataIndex: 'startDate',
      key: 'startDate',
      render: (date: string) => dayjs(date).format('YYYY-MM-DD'),
    },
    {
      title: '返回日期',
      dataIndex: 'endDate',
      key: 'endDate',
      render: (date: string) => dayjs(date).format('YYYY-MM-DD'),
    },
    {
      title: '预算',
      dataIndex: 'budget',
      key: 'budget',
      render: (budget: number) => `¥${budget.toLocaleString()}`,
    },
    {
      title: '人数',
      dataIndex: 'groupSize',
      key: 'groupSize',
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: TravelPlan) => (
        <Space>
          <Button 
            type="text" 
            icon={<EyeOutlined />}
            onClick={() => navigate(`/plans/${record.id}`)}
          >
            查看
          </Button>
          <Button 
            type="text" 
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个计划吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button 
              type="text" 
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

  const stats = [
    { title: '总计划数', value: plans.length, icon: <CalendarOutlined />, color: '#1890ff' },
    { title: '总预算', value: plans.reduce((sum, plan) => sum + plan.budget, 0), icon: <DollarOutlined />, color: '#52c41a' },
    { title: '总人数', value: plans.reduce((sum, plan) => sum + plan.groupSize, 0), icon: <TeamOutlined />, color: '#fa8c16' },
  ];

  return (
    <div style={{ padding: '24px', minHeight: '100vh' }}>
        <div style={{ marginBottom: 24 }}>
          <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
            <Col>
              <Title level={2} style={{ margin: 0 }}>我的旅游计划</Title>
            </Col>
            <Col>
              <Button 
                type="primary" 
                icon={<PlusOutlined />}
                onClick={handleCreate}
                size="large"
              >
                创建新计划
              </Button>
            </Col>
          </Row>

          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            {stats.map((stat, index) => (
              <Col xs={24} sm={8} key={index}>
                <Card>
                  <Statistic
                    title={stat.title}
                    value={stat.value}
                    prefix={stat.icon}
                    valueStyle={{ color: stat.color }}
                    formatter={stat.title === '总预算' ? (value) => `¥${Number(value).toLocaleString()}` : undefined}
                  />
                </Card>
              </Col>
            ))}
          </Row>
        </div>

        <Card>
          <Table
            columns={columns}
            dataSource={plans}
            loading={loading}
            rowKey="id"
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total) => `共 ${total} 条记录`,
            }}
          />
        </Card>

        <Modal
          title={editingPlan ? '编辑计划' : '创建计划'}
          open={modalVisible}
          onCancel={() => setModalVisible(false)}
          footer={null}
          width={600}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
          >
            <Form.Item
              name="planName"
              label="计划名称"
              rules={[{ required: true, message: '请输入计划名称' }]}
            >
              <Input placeholder="例如：北京三日游" />
            </Form.Item>

            <Form.Item
              name="destination"
              label="目的地"
              rules={[{ required: true, message: '请输入目的地' }]}
            >
              <Input placeholder="例如：北京" />
            </Form.Item>

            <Form.Item
              name="dateRange"
              label="出行日期"
              rules={[{ required: true, message: '请选择出行日期' }]}
            >
              <RangePicker 
                style={{ width: '100%' }}
                placeholder={['出发日期', '返回日期']}
              />
            </Form.Item>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="budget"
                  label="预算 (元)"
                  rules={[{ required: true, message: '请输入预算' }]}
                >
                  <InputNumber 
                    style={{ width: '100%' }}
                    placeholder="3000"
                    min={0}
                    formatter={(value) => `¥ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={parseCurrency}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="groupSize"
                  label="人数"
                  rules={[{ required: true, message: '请输入人数' }]}
                >
                  <InputNumber 
                    style={{ width: '100%' }}
                    placeholder="2"
                    min={1}
                    max={20}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="travelType"
              label="旅游类型"
              rules={[{ required: true, message: '请选择旅游类型' }]}
            >
              <Select placeholder="请选择旅游类型">
                <Select.Option value="休闲">休闲</Select.Option>
                <Select.Option value="商务">商务</Select.Option>
                <Select.Option value="探险">探险</Select.Option>
                <Select.Option value="文化">文化</Select.Option>
                <Select.Option value="美食">美食</Select.Option>
                <Select.Option value="购物">购物</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="specialRequirements"
              label="特殊要求"
            >
              <Input.TextArea 
                rows={3}
                placeholder="例如：希望参观故宫和长城，喜欢当地美食"
              />
            </Form.Item>

            <Form.Item>
              <Space>
                <Button type="primary" htmlType="submit">
                  {editingPlan ? '更新' : '创建'}
                </Button>
                <Button onClick={() => setModalVisible(false)}>
                  取消
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>
    </div>
  );
};

export default TravelPlansPage;
