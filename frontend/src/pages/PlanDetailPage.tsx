import React, { useState, useEffect } from 'react';
import { 
  Layout, 
  Card, 
  Typography, 
  Row, 
  Col, 
  Tag, 
  Button, 
  Space, 
  Descriptions, 
  Statistic,
  message,
  Modal,
  Form,
  Input,
  DatePicker,
  InputNumber,
  Select
} from 'antd';
import { 
  EditOutlined, 
  DeleteOutlined, 
  CalendarOutlined,
  DollarOutlined,
  TeamOutlined,
  EnvironmentOutlined,
  RobotOutlined,
  MessageOutlined
} from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import apiService from '../services/api';
import Header from '../components/Header';
import { TravelPlan, UpdatePlanRequest, UpdateStatusRequest } from '../types';
import dayjs from 'dayjs';

const { Content } = Layout;
const { Title, Paragraph } = Typography;
const { RangePicker } = DatePicker;

const PlanDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [plan, setPlan] = useState<TravelPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [form] = Form.useForm();

  // 定义parser函数避免类型问题
  const parseCurrency = (value: string | undefined): number => {
    const num = Number(value?.replace(/¥\s?|(,*)/g, '') || 0);
    return isNaN(num) ? 0 : num;
  };

  useEffect(() => {
    if (id) {
      fetchPlan();
    }
  }, [id]);

  const fetchPlan = async () => {
    if (!id) return;
    
    setLoading(true);
    try {
      const planData = await apiService.getPlan(parseInt(id));
      setPlan(planData);
    } catch (error) {
      message.error('获取计划详情失败');
      navigate('/plans');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    if (!plan) return;
    
    form.setFieldsValue({
      ...plan,
      dateRange: [dayjs(plan.startDate), dayjs(plan.endDate)]
    });
    setEditModalVisible(true);
  };

  const handleStatusUpdate = () => {
    setStatusModalVisible(true);
  };

  const handleDelete = async () => {
    if (!plan) return;
    
    try {
      await apiService.deletePlan(plan.id);
      message.success('删除成功');
      navigate('/plans');
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleEditSubmit = async (values: any) => {
    if (!plan) return;

    try {
      const { dateRange, ...otherValues } = values;
      
      const updateData: UpdatePlanRequest = {
        ...otherValues,
        startDate: dateRange[0].format('YYYY-MM-DD HH:mm:ss'),
        endDate: dateRange[1].format('YYYY-MM-DD HH:mm:ss'),
      };
      
      const updatedPlan = await apiService.updatePlan(plan.id, updateData);
      setPlan(updatedPlan);
      setEditModalVisible(false);
      message.success('更新成功');
    } catch (error) {
      message.error('更新失败');
    }
  };

  const handleStatusSubmit = async (values: { status: string }) => {
    if (!plan) return;

    try {
      await apiService.updatePlanStatus(plan.id, values.status);
      setPlan({ ...plan, status: values.status as any });
      setStatusModalVisible(false);
      message.success('状态更新成功');
    } catch (error) {
      message.error('状态更新失败');
    }
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      DRAFT: 'default',
      PLANNING: 'processing',
      CONFIRMED: 'success',
      COMPLETED: 'success',
      CANCELLED: 'error',
    };
    return colors[status] || 'default';
  };

  const getStatusText = (status: string) => {
    const texts: { [key: string]: string } = {
      DRAFT: '草稿',
      PLANNING: '规划中',
      CONFIRMED: '已确认',
      COMPLETED: '已完成',
      CANCELLED: '已取消',
    };
    return texts[status] || status;
  };

  if (loading) {
    return (
      <Layout style={{ minHeight: '100vh' }}>
        <Header />
        <Content style={{ padding: '24px', textAlign: 'center' }}>
          <div>加载中...</div>
        </Content>
      </Layout>
    );
  }

  if (!plan) {
    return (
      <Layout style={{ minHeight: '100vh' }}>
        <Header />
        <Content style={{ padding: '24px', textAlign: 'center' }}>
          <div>计划不存在</div>
        </Content>
      </Layout>
    );
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header />
      <Content style={{ padding: '24px' }}>
        {/* 页面头部 */}
        <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
          <Col>
            <Title level={2} style={{ margin: 0 }}>
              {plan.planName}
            </Title>
            <Space style={{ marginTop: 8 }}>
              <Tag color={getStatusColor(plan.status)}>
                {getStatusText(plan.status)}
              </Tag>
              <span style={{ color: '#999' }}>
                创建于 {dayjs(plan.createdAt).format('YYYY-MM-DD HH:mm')}
              </span>
            </Space>
          </Col>
          <Col>
            <Space>
              <Button 
                type="primary" 
                icon={<MessageOutlined />}
                onClick={() => navigate(`/chat?planId=${plan.id}`)}
              >
                与AI讨论
              </Button>
              <Button 
                icon={<EditOutlined />}
                onClick={handleEdit}
              >
                编辑
              </Button>
              <Button 
                onClick={handleStatusUpdate}
              >
                更新状态
              </Button>
              <Button 
                danger 
                icon={<DeleteOutlined />}
                onClick={handleDelete}
              >
                删除
              </Button>
            </Space>
          </Col>
        </Row>

        <Row gutter={[24, 24]}>
          {/* 基本信息 */}
          <Col xs={24} lg={16}>
            <Card title="基本信息" style={{ marginBottom: 24 }}>
              <Descriptions column={2}>
                <Descriptions.Item label="目的地">
                  <Space>
                    <EnvironmentOutlined />
                    {plan.destination}
                  </Space>
                </Descriptions.Item>
                <Descriptions.Item label="出行日期">
                  <Space>
                    <CalendarOutlined />
                    {dayjs(plan.startDate).format('YYYY-MM-DD')} 至 {dayjs(plan.endDate).format('YYYY-MM-DD')}
                  </Space>
                </Descriptions.Item>
                <Descriptions.Item label="预算">
                  <Space>
                    <DollarOutlined />
                    ¥{plan.budget.toLocaleString()}
                  </Space>
                </Descriptions.Item>
                <Descriptions.Item label="人数">
                  <Space>
                    <TeamOutlined />
                    {plan.groupSize} 人
                  </Space>
                </Descriptions.Item>
                <Descriptions.Item label="旅游类型">
                  {plan.travelType}
                </Descriptions.Item>
                <Descriptions.Item label="最后更新">
                  {dayjs(plan.updatedAt).format('YYYY-MM-DD HH:mm')}
                </Descriptions.Item>
              </Descriptions>
              
              {plan.specialRequirements && (
                <div style={{ marginTop: 16 }}>
                  <Title level={5}>特殊要求</Title>
                  <Paragraph>{plan.specialRequirements}</Paragraph>
                </div>
              )}
            </Card>

            {/* AI生成内容 */}
            {plan.aiGenerated && (
              <Card title="AI建议" extra={<RobotOutlined />}>
                <div style={{ 
                  whiteSpace: 'pre-wrap',
                  lineHeight: '1.6'
                }}>
                  {plan.aiGenerated}
                </div>
              </Card>
            )}
          </Col>

          {/* 统计信息 */}
          <Col xs={24} lg={8}>
            <Card title="统计信息" style={{ marginBottom: 24 }}>
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <Statistic
                    title="旅行天数"
                    value={dayjs(plan.endDate).diff(dayjs(plan.startDate), 'day') + 1}
                    suffix="天"
                    valueStyle={{ color: '#1890ff' }}
                  />
                </Col>
                <Col span={12}>
                  <Statistic
                    title="人均预算"
                    value={Math.round(plan.budget / plan.groupSize)}
                    prefix="¥"
                    valueStyle={{ color: '#52c41a' }}
                  />
                </Col>
                <Col span={12}>
                  <Statistic
                    title="日均预算"
                    value={Math.round(plan.budget / (dayjs(plan.endDate).diff(dayjs(plan.startDate), 'day') + 1))}
                    prefix="¥"
                    valueStyle={{ color: '#fa8c16' }}
                  />
                </Col>
                <Col span={12}>
                  <Statistic
                    title="总预算"
                    value={plan.budget}
                    prefix="¥"
                    valueStyle={{ color: '#722ed1' }}
                  />
                </Col>
              </Row>
            </Card>

            {/* 快速操作 */}
            <Card title="快速操作">
              <Space direction="vertical" style={{ width: '100%' }}>
                <Button 
                  type="primary" 
                  block
                  icon={<MessageOutlined />}
                  onClick={() => navigate(`/chat?planId=${plan.id}`)}
                >
                  与AI讨论此计划
                </Button>
                <Button 
                  block
                  icon={<EditOutlined />}
                  onClick={handleEdit}
                >
                  编辑计划
                </Button>
                <Button 
                  block
                  onClick={handleStatusUpdate}
                >
                  更新状态
                </Button>
              </Space>
            </Card>
          </Col>
        </Row>

        {/* 编辑模态框 */}
        <Modal
          title="编辑计划"
          open={editModalVisible}
          onCancel={() => setEditModalVisible(false)}
          footer={null}
          width={600}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleEditSubmit}
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
                  更新
                </Button>
                <Button onClick={() => setEditModalVisible(false)}>
                  取消
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>

        {/* 状态更新模态框 */}
        <Modal
          title="更新计划状态"
          open={statusModalVisible}
          onCancel={() => setStatusModalVisible(false)}
          footer={null}
        >
          <Form
            layout="vertical"
            onFinish={handleStatusSubmit}
            initialValues={{ status: plan.status }}
          >
            <Form.Item
              name="status"
              label="计划状态"
              rules={[{ required: true, message: '请选择计划状态' }]}
            >
              <Select placeholder="请选择计划状态">
                <Select.Option value="DRAFT">草稿</Select.Option>
                <Select.Option value="PLANNING">规划中</Select.Option>
                <Select.Option value="CONFIRMED">已确认</Select.Option>
                <Select.Option value="COMPLETED">已完成</Select.Option>
                <Select.Option value="CANCELLED">已取消</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item>
              <Space>
                <Button type="primary" htmlType="submit">
                  更新
                </Button>
                <Button onClick={() => setStatusModalVisible(false)}>
                  取消
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>
      </Content>
    </Layout>
  );
};

export default PlanDetailPage;
