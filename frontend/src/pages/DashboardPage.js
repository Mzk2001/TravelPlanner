import React, { useState, useEffect } from 'react';
import { Row, Col, Card, List, Button, Tag, Empty, Spin, message, Modal, Form, Input, DatePicker, InputNumber, Select } from 'antd';
import { PlusOutlined, EyeOutlined, EditOutlined, DeleteOutlined, EnvironmentOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { planAPI } from '../services/api';
import dayjs from 'dayjs';

const DashboardPage = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [form] = Form.useForm();
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


  const handleCreatePlan = () => {
    navigate('/chat');
  };

  const handleViewPlan = (planId) => {
    navigate(`/plan/${planId}`);
  };

  const handleEditPlan = (plan) => {
    setEditingPlan(plan);
    form.setFieldsValue({
      planName: plan.planName,
      destination: plan.destination,
      travelType: plan.travelType,
      groupSize: plan.groupSize,
      budget: plan.budget,
      specialRequirements: plan.specialRequirements,
      dateRange: [
        plan.startDate ? dayjs(plan.startDate) : null,
        plan.endDate ? dayjs(plan.endDate) : null
      ]
    });
    setEditModalVisible(true);
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

  // 百度地图导航功能
  const openBaiduNavigation = (destination, travelType = 'car') => {
    if (!destination) {
      message.warning('目的地信息不完整');
      return;
    }
    
    // 根据旅行类型选择导航模式
    let mode = 'driving'; // 默认驾车
    switch(travelType) {
      case '休闲':
      case '商务':
        mode = 'driving';
        break;
      case '探险':
        mode = 'walking';
        break;
      case '文化':
        mode = 'transit';
        break;
      case '美食':
        mode = 'walking';
        break;
      default:
        mode = 'driving';
    }
    
    // 百度地图Web版URL，自动搜索目的地并开启导航
    // 参数说明：
    // destination: 目的地（自动搜索，支持中英文地名）
    // mode: 导航模式 (driving=驾车, walking=步行, transit=公交, riding=骑行)
    // region: 搜索范围 (全国搜索)
    const baiduUrl = `https://map.baidu.com/?newmap=1&ie=utf-8&s=s%26wd%3D${encodeURIComponent(destination)}&mode=${mode}`;
    
    // 在新窗口中打开百度地图
    window.open(baiduUrl, '_blank');
  };

  const handleEditSubmit = async (values) => {
    if (!editingPlan) return;

    try {
      const { dateRange, ...otherValues } = values;
      
      const updateData = {
        ...otherValues,
        startDate: dateRange[0].format('YYYY-MM-DD') + 'T00:00:00.000Z',
        endDate: dateRange[1].format('YYYY-MM-DD') + 'T23:59:59.999Z',
      };

      console.log('更新计划数据:', updateData);
      await planAPI.updatePlan(editingPlan.id, updateData);
      message.success('计划更新成功！');
      setEditModalVisible(false);
      loadPlans();
    } catch (error) {
      console.error('更新计划失败:', error);
      message.error('更新计划失败，请重试');
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
                        icon={<EnvironmentOutlined />}
                        onClick={() => openBaiduNavigation(plan.destination, plan.travelType)}
                        title="打开百度地图导航"
                      >
                        导航
                      </Button>,
                      <Button 
                        type="link" 
                        icon={<EditOutlined />}
                        onClick={() => handleEditPlan(plan)}
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
                        </div>
                      }
                      description={
                        <div>
                          <div>目的地：{plan.destination}</div>
                          <div>
                            时间：{plan.startDate ? dayjs(plan.startDate).format('YYYY-MM-DD') : '未设置'} 至 {plan.endDate ? dayjs(plan.endDate).format('YYYY-MM-DD') : '未设置'}
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

      {/* 编辑模态框 */}
      <Modal
        title="编辑旅行计划"
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
            <DatePicker.RangePicker 
              style={{ width: '100%' }}
              placeholder={['出发日期', '返回日期']}
            />
          </Form.Item>

          <Form.Item
            name="travelType"
            label="旅行类型"
            rules={[{ required: true, message: '请选择旅行类型' }]}
          >
            <Select placeholder="请选择旅行类型">
              <Select.Option value="休闲">休闲</Select.Option>
              <Select.Option value="商务">商务</Select.Option>
              <Select.Option value="探险">探险</Select.Option>
              <Select.Option value="文化">文化</Select.Option>
              <Select.Option value="美食">美食</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="groupSize"
            label="出行人数"
            rules={[{ required: true, message: '请输入出行人数' }]}
          >
            <InputNumber 
              min={1} 
              max={20} 
              style={{ width: '100%' }}
              placeholder="请输入出行人数"
            />
          </Form.Item>

          <Form.Item
            name="budget"
            label="预算（元）"
          >
            <InputNumber 
              min={0} 
              style={{ width: '100%' }}
              placeholder="请输入预算金额"
            />
          </Form.Item>

          <Form.Item
            name="specialRequirements"
            label="特殊要求"
          >
            <Input.TextArea 
              rows={4}
              placeholder="请输入特殊要求，如饮食偏好、住宿要求等"
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Button onClick={() => setEditModalVisible(false)} style={{ marginRight: 8 }}>
              取消
            </Button>
            <Button type="primary" htmlType="submit">
              保存
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default DashboardPage;


