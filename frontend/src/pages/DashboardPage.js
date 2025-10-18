import React, { useState, useEffect } from 'react';
import { Row, Col, Card, List, Button, Tag, Empty, Spin, message } from 'antd';
import { PlusOutlined, EyeOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { planAPI } from '../services/api';
import dayjs from 'dayjs';

const DashboardPage = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      const response = await planAPI.getUserPlans(user.id, 0, 10);
      setPlans(response.data.content || []);
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

  const handleCreatePlan = () => {
    navigate('/chat');
  };

  const handleViewPlan = (planId) => {
    navigate(`/plan/${planId}`);
  };

  const handleEditPlan = (planId) => {
    navigate(`/chat/${planId}`);
  };

  const handleDeletePlan = async (planId) => {
    try {
      await planAPI.deletePlan(planId);
      message.success('删除成功');
      loadPlans();
    } catch (error) {
      message.error('删除失败');
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div>
      <Row gutter={[24, 24]}>
        <Col span={24}>
          <Card 
            title="我的旅游计划" 
            extra={
              <Button 
                type="primary" 
                icon={<PlusOutlined />}
                onClick={handleCreatePlan}
              >
                创建新计划
              </Button>
            }
          >
            {plans.length === 0 ? (
              <Empty 
                description="还没有旅游计划"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              >
                <Button type="primary" onClick={handleCreatePlan}>
                  创建第一个计划
                </Button>
              </Empty>
            ) : (
              <List
                dataSource={plans}
                renderItem={(plan) => (
                  <List.Item
                    actions={[
                      <Button 
                        type="link" 
                        icon={<EyeOutlined />}
                        onClick={() => handleViewPlan(plan.id)}
                      >
                        查看
                      </Button>,
                      <Button 
                        type="link" 
                        icon={<EditOutlined />}
                        onClick={() => handleEditPlan(plan.id)}
                      >
                        编辑
                      </Button>,
                      <Button 
                        type="link" 
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => handleDeletePlan(plan.id)}
                      >
                        删除
                      </Button>
                    ]}
                  >
                    <List.Item.Meta
                      title={
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {plan.planName}
                          {getStatusTag(plan.status)}
                        </div>
                      }
                      description={
                        <div>
                          <div>目的地：{plan.destination}</div>
                          <div>
                            时间：{dayjs(plan.startDate).format('YYYY-MM-DD')} 至 {dayjs(plan.endDate).format('YYYY-MM-DD')}
                          </div>
                          <div>预算：¥{plan.budget}</div>
                          <div>人数：{plan.groupSize}人</div>
                          <div style={{ color: '#999', fontSize: '12px' }}>
                            创建时间：{dayjs(plan.createdAt).format('YYYY-MM-DD HH:mm')}
                          </div>
                        </div>
                      }
                    />
                  </List.Item>
                )}
              />
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default DashboardPage;


