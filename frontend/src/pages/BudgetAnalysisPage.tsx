import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Typography, Spin, Alert, Button, Space, Avatar } from 'antd';
import { ArrowLeftOutlined, RobotOutlined, ReloadOutlined } from '@ant-design/icons';
import apiService from '../services/api';

const { Title, Text, Paragraph } = Typography;

const BudgetAnalysisPage: React.FC = () => {
  const { planId } = useParams<{ planId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<any>(null);

  useEffect(() => {
    if (planId) {
      loadBudgetAnalysis();
    }
  }, [planId]);

  const loadBudgetAnalysis = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Loading budget analysis for planId:', planId);
      const data = await apiService.getBudgetAnalysis(Number(planId));
      console.log('Budget analysis data:', data);
      setAnalysis(data);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || '加载预算分析失败';
      setError(`加载预算分析失败: ${errorMessage}`);
      console.error('Load budget analysis error:', err);
    } finally {
      setLoading(false);
    }
  };


  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
        <div style={{ marginTop: '16px' }}>AI正在分析预算中...</div>
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
        <Alert 
          message="未找到预算分析数据" 
          description="请确保该旅行计划存在且有预算设置，或者先添加一些费用记录"
          type="warning" 
          showIcon 
          action={
            <Button onClick={loadBudgetAnalysis}>
              重新加载
            </Button>
          }
        />
      </div>
    );
  }

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
        <Title level={2}>AI预算分析</Title>
        <Text type="secondary">基于通义千问的智能预算分析</Text>
      </div>

      {/* 基础预算信息 */}
      <Card style={{ marginBottom: '24px' }}>
        <Title level={4}>预算概览</Title>
        <div style={{ display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap' }}>
          <div style={{ textAlign: 'center', margin: '10px' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1890ff' }}>
              {analysis.totalBudget}元
            </div>
            <div style={{ color: '#666' }}>总预算</div>
          </div>
          <div style={{ textAlign: 'center', margin: '10px' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#f5222d' }}>
              {analysis.totalExpense}元
            </div>
            <div style={{ color: '#666' }}>已支出</div>
          </div>
          <div style={{ textAlign: 'center', margin: '10px' }}>
            <div style={{ 
              fontSize: '24px', 
              fontWeight: 'bold', 
              color: analysis.remainingBudget >= 0 ? '#52c41a' : '#f5222d' 
            }}>
              {analysis.remainingBudget}元
            </div>
            <div style={{ color: '#666' }}>剩余预算</div>
          </div>
          <div style={{ textAlign: 'center', margin: '10px' }}>
            <div style={{ 
              fontSize: '24px', 
              fontWeight: 'bold', 
              color: analysis.budgetUtilization > 100 ? '#f5222d' : '#1890ff' 
            }}>
              {Math.round(analysis.budgetUtilization)}%
            </div>
            <div style={{ color: '#666' }}>预算使用率</div>
          </div>
        </div>
      </Card>

      {/* AI智能分析结果 */}
      <Card 
        title={
          <Space>
            <Avatar icon={<RobotOutlined />} style={{ backgroundColor: '#1890ff' }} />
            <span>通义千问智能分析</span>
            <Button 
              icon={<ReloadOutlined />} 
              onClick={loadBudgetAnalysis}
              size="small"
            >
              重新分析
            </Button>
          </Space>
        }
      >
        {analysis.hasAiAnalysis && analysis.aiAnalysis ? (
          <div>
            <Paragraph style={{ 
              whiteSpace: 'pre-wrap', 
              fontSize: '16px', 
              lineHeight: '1.8',
              background: '#f8f9fa',
              padding: '20px',
              borderRadius: '8px',
              border: '1px solid #e9ecef'
            }}>
              {analysis.aiAnalysis}
            </Paragraph>
          </div>
        ) : (
          <Alert
            message="AI分析暂时不可用"
            description="请稍后再试或检查网络连接"
            type="warning"
            showIcon
            action={
              <Button onClick={loadBudgetAnalysis}>
                重新分析
              </Button>
            }
          />
        )}
      </Card>
    </div>
  );
};

export default BudgetAnalysisPage;