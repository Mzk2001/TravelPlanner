import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Row, Col, Statistic, Progress, List, Typography, Spin, Alert, Button, Input, Modal, Space, Divider, Avatar } from 'antd';
import { ArrowLeftOutlined, DollarOutlined, ShoppingOutlined, CarOutlined, HomeOutlined, CoffeeOutlined, GiftOutlined, CameraOutlined, MedicineBoxOutlined, MoreOutlined, RobotOutlined, BulbOutlined } from '@ant-design/icons';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import apiService from '../services/api';
import { BudgetAnalysis, BudgetOptimization } from '../types';

const { Title, Text, Paragraph } = Typography;

const BudgetAnalysisPage: React.FC = () => {
  const { planId } = useParams<{ planId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<BudgetAnalysis | null>(null);
  const [optimizationModalVisible, setOptimizationModalVisible] = useState(false);
  const [targetSavings, setTargetSavings] = useState<number>(0);
  const [optimization, setOptimization] = useState<BudgetOptimization | null>(null);
  const [optimizationLoading, setOptimizationLoading] = useState(false);

  useEffect(() => {
    if (planId) {
      loadBudgetAnalysis();
    }
  }, [planId]);

  const loadBudgetAnalysis = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getBudgetAnalysis(Number(planId));
      setAnalysis(data);
    } catch (err) {
      setError('加载预算分析失败');
      console.error('Load budget analysis error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOptimization = async () => {
    if (!planId || targetSavings <= 0) return;

    try {
      setOptimizationLoading(true);
      const data = await apiService.getBudgetOptimization(Number(planId), targetSavings);
      setOptimization(data);
    } catch (err) {
      console.error('Get budget optimization error:', err);
    } finally {
      setOptimizationLoading(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, React.ReactNode> = {
      '交通': <CarOutlined />,
      '住宿': <HomeOutlined />,
      '餐饮': <CoffeeOutlined />,
      '购物': <ShoppingOutlined />,
      '门票': <CameraOutlined />,
      '娱乐': <GiftOutlined />,
      '其他': <MoreOutlined />,
      '医疗': <MedicineBoxOutlined />
    };
    return icons[category] || <DollarOutlined />;
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      '交通': '#1890ff',
      '住宿': '#52c41a',
      '餐饮': '#faad14',
      '购物': '#f5222d',
      '门票': '#722ed1',
      '娱乐': '#13c2c2',
      '其他': '#8c8c8c',
      '医疗': '#fa541c'
    };
    return colors[category] || '#8c8c8c';
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
        <div style={{ marginTop: '16px' }}>加载预算分析中...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '20px' }}>
        <Alert
          message="加载失败"
          description={error}
          type="error"
          showIcon
          action={
            <Button size="small" onClick={loadBudgetAnalysis}>
              重试
            </Button>
          }
        />
      </div>
    );
  }

  if (!analysis) {
    return (
      <div style={{ padding: '20px' }}>
        <Alert message="未找到预算分析数据" type="warning" showIcon />
      </div>
    );
  }

  // 准备图表数据
  const pieData = Object.entries(analysis.categoryBreakdown).map(([category, amount]) => ({
    name: category,
    value: amount,
    color: getCategoryColor(category)
  }));

  const barData = Object.entries(analysis.categoryBreakdown).map(([category, amount]) => ({
    category,
    amount,
    percentage: analysis.totalExpense > 0 ? (amount / analysis.totalExpense * 100).toFixed(1) : 0
  }));

  return (
    <div style={{ padding: '24px' }}>
      {/* 页面头部 */}
      <div style={{ marginBottom: '24px' }}>
        <Button 
          icon={<ArrowLeftOutlined />} 
          onClick={() => navigate(-1)}
          style={{ marginBottom: '16px' }}
        >
          返回
        </Button>
        <Title level={2}>预算分析</Title>
        <Text type="secondary">智能分析您的旅行预算使用情况</Text>
      </div>

      {/* 预算概览 */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="总预算"
              value={analysis.totalBudget}
              prefix={<DollarOutlined />}
              suffix="元"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="已支出"
              value={analysis.totalExpense}
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
              value={analysis.remainingBudget}
              prefix={<DollarOutlined />}
              suffix="元"
              valueStyle={{ color: analysis.remainingBudget >= 0 ? '#52c41a' : '#f5222d' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <div>
              <div style={{ marginBottom: '8px' }}>预算使用率</div>
              <Progress
                type="circle"
                percent={Math.round(analysis.budgetUtilization)}
                status={analysis.budgetUtilization > 100 ? 'exception' : 'normal'}
                format={(percent) => `${percent}%`}
              />
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        {/* 费用分布图表 */}
        <Col xs={24} lg={12}>
          <Card title="费用分布" style={{ height: '400px' }}>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(props: any) => `${props.name} ${(props.percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => [`${value}元`, '金额']} />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        {/* 费用类别对比 */}
        <Col xs={24} lg={12}>
          <Card title="费用类别对比" style={{ height: '400px' }}>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis />
                <Tooltip formatter={(value: number) => [`${value}元`, '金额']} />
                <Bar dataKey="amount" fill="#1890ff" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        {/* 基础建议 */}
        <Col xs={24} lg={12}>
          <Card title="基础建议">
            <List
              dataSource={analysis.basicSuggestions}
              renderItem={(suggestion) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={<BulbOutlined style={{ color: '#faad14' }} />}
                    description={suggestion}
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>

        {/* AI智能分析 */}
        <Col xs={24} lg={12}>
          <Card 
            title={
              <Space>
                <Avatar icon={<RobotOutlined />} style={{ backgroundColor: '#1890ff' }} />
                AI智能分析
              </Space>
            }
            extra={
              <Button 
                type="primary" 
                icon={<BulbOutlined />}
                onClick={() => setOptimizationModalVisible(true)}
              >
                预算优化
              </Button>
            }
          >
            {analysis.hasAiAnalysis ? (
              <div>
                <Paragraph style={{ whiteSpace: 'pre-wrap' }}>
                  {analysis.aiAnalysis}
                </Paragraph>
              </div>
            ) : (
              <Alert
                message="AI分析暂时不可用"
                description="请稍后再试或查看基础建议"
                type="warning"
                showIcon
              />
            )}
          </Card>
        </Col>
      </Row>

      {/* 预算优化模态框 */}
      <Modal
        title="AI预算优化"
        open={optimizationModalVisible}
        onCancel={() => setOptimizationModalVisible(false)}
        footer={null}
        width={800}
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          <div>
            <Text strong>目标节省金额：</Text>
            <Input
              type="number"
              value={targetSavings}
              onChange={(e) => setTargetSavings(Number(e.target.value))}
              placeholder="请输入目标节省金额"
              suffix="元"
              style={{ width: '200px', marginLeft: '8px' }}
            />
            <Button 
              type="primary" 
              onClick={handleOptimization}
              loading={optimizationLoading}
              style={{ marginLeft: '8px' }}
            >
              获取优化建议
            </Button>
          </div>

          {optimization && (
            <div>
              <Divider>优化结果</Divider>
              <Row gutter={16}>
                <Col span={8}>
                  <Statistic
                    title="当前预算"
                    value={optimization.currentBudget}
                    suffix="元"
                  />
                </Col>
                <Col span={8}>
                  <Statistic
                    title="目标节省"
                    value={optimization.targetSavings}
                    suffix="元"
                    valueStyle={{ color: '#52c41a' }}
                  />
                </Col>
                <Col span={8}>
                  <Statistic
                    title="优化后预算"
                    value={optimization.optimizedBudget}
                    suffix="元"
                    valueStyle={{ color: '#1890ff' }}
                  />
                </Col>
              </Row>

              {optimization.hasAiOptimization && (
                <div style={{ marginTop: '16px' }}>
                  <Title level={5}>AI优化建议：</Title>
                  <Paragraph style={{ whiteSpace: 'pre-wrap' }}>
                    {optimization.aiOptimization}
                  </Paragraph>
                </div>
              )}
            </div>
          )}
        </Space>
      </Modal>
    </div>
  );
};

export default BudgetAnalysisPage;