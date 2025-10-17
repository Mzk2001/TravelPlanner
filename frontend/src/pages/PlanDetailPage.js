import React, { useState, useEffect } from 'react';
import { Card, Spin, message, Tag, Button } from 'antd';
import { ArrowLeftOutlined, EditOutlined } from '@ant-design/icons';
import { useParams, useHistory } from 'react-router-dom';
import { planAPI } from '../services/api';
import dayjs from 'dayjs';

const PlanDetailPage = () => {
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const { id } = useParams();
  const history = useHistory();

  useEffect(() => {
    loadPlan();
  }, [id]);

  const loadPlan = async () => {
    try {
      const response = await planAPI.getPlan(id);
      setPlan(response.data);
    } catch (error) {
      message.error('加载计划失败');
    } finally {
      setLoading(false);
    }
  };

  const getStatusTag = (status) => {
    const statusMap = {
      DRAFT: { color: 'default', text: '草稿' },
      PROCESSING: { color: 'processing', text: '生成中' },
      COMPLETED: { color: 'success', text: '已完成' }
    };
    const config = statusMap[status] || { color: 'default', text: status };
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!plan) {
    return (
      <Card>
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <p>计划不存在</p>
          <Button onClick={() => history.push('/dashboard')}>
            返回仪表盘
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: '16px' }}>
        <Button 
          icon={<ArrowLeftOutlined />}
          onClick={() => history.push('/dashboard')}
        >
          返回
        </Button>
        <Button 
          type="primary"
          icon={<EditOutlined />}
          onClick={() => history.push(`/chat/${id}`)}
          style={{ marginLeft: '8px' }}
        >
          继续编辑
        </Button>
      </div>

      <Card title={plan.planName}>
        <div style={{ marginBottom: '16px' }}>
          {getStatusTag(plan.status)}
        </div>
        
        <div style={{ marginBottom: '16px' }}>
          <h3>基本信息</h3>
          <p><strong>目的地：</strong>{plan.destination}</p>
          <p><strong>开始时间：</strong>{dayjs(plan.startDate).format('YYYY-MM-DD')}</p>
          <p><strong>结束时间：</strong>{dayjs(plan.endDate).format('YYYY-MM-DD')}</p>
          <p><strong>预算：</strong>¥{plan.budget}</p>
          <p><strong>旅游类型：</strong>{plan.travelType}</p>
          <p><strong>团队人数：</strong>{plan.groupSize}人</p>
          {plan.specialRequirements && (
            <p><strong>特殊要求：</strong>{plan.specialRequirements}</p>
          )}
        </div>

        {plan.aiGenerated && (
          <div>
            <h3>AI生成的旅游计划</h3>
            <div style={{ 
              whiteSpace: 'pre-wrap',
              padding: '16px',
              backgroundColor: '#f9f9f9',
              borderRadius: '8px',
              border: '1px solid #e8e8e8'
            }}>
              {plan.aiGenerated}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default PlanDetailPage;


