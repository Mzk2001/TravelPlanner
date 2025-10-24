import React, { useState, useEffect } from 'react';
import { 
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
  MessageOutlined,
  CalculatorOutlined,
  BarChartOutlined
} from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import apiService from '../services/api';
import { TravelPlan, UpdatePlanRequest, UpdateStatusRequest } from '../types';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;
const { RangePicker } = DatePicker;

const PlanDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [plan, setPlan] = useState<TravelPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editAiModalVisible, setEditAiModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [aiForm] = Form.useForm();

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


  const handleGenerateAI = async () => {
    if (!plan) return;

    const apiKey = localStorage.getItem('qwen_api_key');
    if (!apiKey) {
      message.error('请先在设置页面配置API Key');
      return;
    }

    setGenerating(true);
    try {
      const planContext = `计划名称: ${plan.planName}, 目的地: ${plan.destination}, 预算: ¥${plan.budget}, 人数: ${plan.groupSize}人, 旅行类型: ${plan.travelType}, 开始时间: ${plan.startDate}, 结束时间: ${plan.endDate}${plan.specialRequirements ? `, 特殊要求: ${plan.specialRequirements}` : ''}`;
      
      const userMessage = `请为这个旅游计划生成详细的行程安排和建议，包括景点推荐、交通方式、住宿建议、美食推荐等。`;
      
      const response = await apiService.generateTravelPlan(apiKey, userMessage, planContext);
      
      if (response.success) {
        // 更新计划的AI生成内容并保存到数据库
        try {
          const updateData: UpdatePlanRequest = {
            planName: plan.planName,
            destination: plan.destination,
            startDate: plan.startDate,
            endDate: plan.endDate,
            budget: plan.budget,
            travelType: plan.travelType,
            groupSize: plan.groupSize,
            specialRequirements: plan.specialRequirements,
            aiGenerated: response.result
          };
          
          const updatedPlan = await apiService.updatePlan(plan.id, updateData);
          setPlan(updatedPlan);
          message.success('AI建议生成成功');
        } catch (error) {
          console.error('保存AI建议失败:', error);
          message.error('AI建议生成成功，但保存失败');
        }
      } else {
        message.error('生成失败，请检查API Key配置');
      }
    } catch (error) {
      console.error('生成AI建议失败:', error);
      message.error('生成失败，请稍后重试');
    } finally {
      setGenerating(false);
    }
  };

  const handleRegenerateAI = async () => {
    if (!plan) return;

    Modal.confirm({
      title: '重新生成AI建议',
      content: '确定要重新生成AI建议吗？这将覆盖当前的内容。',
      onOk: handleGenerateAI,
    });
  };

  const handleEditAI = () => {
    if (!plan) return;
    
    aiForm.setFieldsValue({
      aiGenerated: plan.aiGenerated || ''
    });
    setEditAiModalVisible(true);
  };

  const handleEditAISubmit = async (values: any) => {
    if (!plan) return;

    try {
      const updateData: UpdatePlanRequest = {
        planName: plan.planName,
        destination: plan.destination,
        startDate: plan.startDate,
        endDate: plan.endDate,
        budget: plan.budget,
        travelType: plan.travelType,
        groupSize: plan.groupSize,
        specialRequirements: plan.specialRequirements,
        aiGenerated: values.aiGenerated
      };
      
      const updatedPlan = await apiService.updatePlan(plan.id, updateData);
      setPlan(updatedPlan);
      setEditAiModalVisible(false);
      message.success('AI内容更新成功');
    } catch (error) {
      message.error('更新失败');
    }
  };


  if (loading) {
    return (
      <div style={{ padding: '24px', textAlign: 'center', minHeight: '50vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div>加载中...</div>
      </div>
    );
  }

  if (!plan) {
    return (
      <div style={{ padding: '24px', textAlign: 'center', minHeight: '50vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div>计划不存在</div>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
        {/* 页面标题和操作栏 */}
        <div style={{ marginBottom: 24 }}>
          <Title level={2} style={{ margin: 0, marginBottom: 8 }}>
            {plan.planName}
          </Title>
          <Text type="secondary" style={{ marginBottom: 16, display: 'block' }}>
            创建于 {dayjs(plan.createdAt).format('YYYY-MM-DD HH:mm')}
          </Text>
          <Row justify="end">
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
                  icon={<CalculatorOutlined />}
                  onClick={() => navigate(`/plans/${plan.id}/expenses`)}
                >
                  费用管理
                </Button>
                <Button 
                  icon={<BarChartOutlined />}
                  onClick={() => navigate(`/plans/${plan.id}/budget`)}
                >
                  预算分析
                </Button>
                <Button 
                  icon={<EditOutlined />}
                  onClick={handleEdit}
                >
                  编辑
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
        </div>

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
            <Card 
              title="AI建议" 
              extra={
                <Space>
                  {!plan.aiGenerated && (
                    <Button 
                      type="primary" 
                      icon={<RobotOutlined />}
                      loading={generating}
                      onClick={handleGenerateAI}
                    >
                      生成AI建议
                    </Button>
                  )}
                  {plan.aiGenerated && (
                    <>
                      <Button 
                        icon={<EditOutlined />}
                        onClick={handleEditAI}
                      >
                        编辑内容
                      </Button>
                      <Button 
                        icon={<RobotOutlined />}
                        onClick={handleRegenerateAI}
                        loading={generating}
                      >
                        重新生成
                      </Button>
                    </>
                  )}
                </Space>
              }
            >
              {plan.aiGenerated ? (
                <div style={{ 
                  whiteSpace: 'pre-wrap',
                  lineHeight: '1.6'
                }}>
                  {plan.aiGenerated}
                </div>
              ) : (
                <div style={{ 
                  textAlign: 'center', 
                  padding: '40px 0',
                  color: '#999'
                }}>
                  <RobotOutlined style={{ fontSize: 48, marginBottom: 16 }} />
                  <div>点击"生成AI建议"获取智能旅游规划</div>
                </div>
              )}
            </Card>
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
                  icon={<CalculatorOutlined />}
                  onClick={() => navigate(`/plans/${plan.id}/expenses`)}
                >
                  费用管理
                </Button>
                <Button 
                  block
                  icon={<BarChartOutlined />}
                  onClick={() => navigate(`/plans/${plan.id}/budget`)}
                >
                  预算分析
                </Button>
                <Button 
                  block
                  icon={<EditOutlined />}
                  onClick={handleEdit}
                >
                  编辑计划
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

        {/* 编辑AI内容模态框 */}
        <Modal
          title="编辑AI建议内容"
          open={editAiModalVisible}
          onCancel={() => setEditAiModalVisible(false)}
          footer={null}
          width={800}
        >
          <Form
            form={aiForm}
            layout="vertical"
            onFinish={handleEditAISubmit}
          >
            <Form.Item
              name="aiGenerated"
              label="AI建议内容"
              rules={[{ required: true, message: '请输入AI建议内容' }]}
            >
              <Input.TextArea 
                rows={15}
                placeholder="请编辑AI生成的旅游建议内容..."
                style={{ fontFamily: 'monospace' }}
              />
            </Form.Item>

            <Form.Item>
              <Space>
                <Button type="primary" htmlType="submit">
                  保存修改
                </Button>
                <Button onClick={() => setEditAiModalVisible(false)}>
                  取消
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>

    </div>
  );
};

export default PlanDetailPage;
