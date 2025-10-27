import React, { useState, useEffect } from 'react';
import { Card, Button, Space, Typography, Divider, Alert, Row, Col, Tag, message } from 'antd';
import { SettingOutlined, KeyOutlined } from '@ant-design/icons';
import ApiKeyConfig from '../components/ApiKeyConfig';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../services/api';

const { Title, Text, Paragraph } = Typography;

const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const [apiKeyModalVisible, setApiKeyModalVisible] = useState(false);
  const [currentApiKey, setCurrentApiKey] = useState<string>('');
  const [apiKeyStatus, setApiKeyStatus] = useState<'none' | 'configured'>('none');
  const [loading, setLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    // 从后端获取API Key状态
    if (user?.id) {
      loadApiKeyStatus();
    }
  }, [user]);

  const loadApiKeyStatus = async () => {
    if (!user?.id) return;
    
    console.log('🔄 开始加载API Key状态，用户ID:', user.id);
    
    try {
      const response = await apiService.getApiKeyStatus(user.id);
      console.log('📡 API Key状态响应:', response);
      console.log('📋 响应详情:', {
        success: response.success,
        hasApiKey: response.hasApiKey,
        maskedApiKey: response.maskedApiKey,
        message: response.message
      });
      
      // API服务已经返回了response.data，直接使用response
      if (response.success) {
        if (response.hasApiKey) {
          // 即使maskedApiKey为空，只要hasApiKey为true，就表示已配置
          setCurrentApiKey(response.maskedApiKey || 'sk-****');
          setApiKeyStatus('configured');
          console.log('✅ API Key状态设置为已配置，maskedApiKey:', response.maskedApiKey);
        } else {
          setCurrentApiKey('');
          setApiKeyStatus('none');
          console.log('❌ API Key状态设置为未配置');
        }
      } else {
        console.error('❌ API Key状态获取失败:', response.message);
        setCurrentApiKey('');
        setApiKeyStatus('none');
      }
      
      // 强制重新渲染
      setRefreshKey(prev => prev + 1);
      console.log('🔄 强制重新渲染，refreshKey:', refreshKey + 1);
    } catch (error) {
      console.error('❌ 获取API Key状态失败:', error);
      setApiKeyStatus('none');
    }
  };

  const handleSaveApiKey = async (apiKey: string) => {
    if (!user?.id) {
      message.error('用户信息获取失败');
      return;
    }

    setLoading(true);
    try {
      const response = await apiService.saveApiKey(user.id, apiKey);
      console.log('保存API Key响应:', response); // 添加调试日志
      
      // API服务已经返回了response.data，直接使用response
      if (response.success) {
        // 保存成功后重新加载API Key状态，确保数据一致性
        await loadApiKeyStatus();
        message.success('API Key保存成功！');
      } else {
        console.error('API Key保存失败:', response.message);
        message.error(response.message || '保存失败');
      }
    } catch (error: any) {
      console.error('保存API Key失败:', error);
      message.error('保存失败，请重试');
    } finally {
      setLoading(false);
    }
  };


  const getApiKeyStatusTag = () => {
    console.log('🏷️ 获取API Key状态标签，当前状态:', apiKeyStatus);
    switch (apiKeyStatus) {
      case 'configured':
        console.log('🏷️ 返回已配置标签');
        return <Tag color="blue">已配置</Tag>;
      default:
        console.log('🏷️ 返回未配置标签');
        return <Tag color="default">未配置</Tag>;
    }
  };

  const getMaskedApiKey = (apiKey: string) => {
    if (apiKey.length <= 8) return apiKey;
    return `${apiKey.substring(0, 4)}****${apiKey.substring(apiKey.length - 4)}`;
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <Title level={2} style={{ marginBottom: '24px' }}>
        <SettingOutlined style={{ marginRight: '8px' }} />
        系统设置
      </Title>

      <Row gutter={[16, 16]} key={refreshKey}>
        <Col span={24}>
          <Card title="AI 服务配置" extra={getApiKeyStatusTag()}>
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              <div>
                <Title level={4}>阿里云百炼 API Key</Title>
                <Paragraph type="secondary">
                  配置您的阿里云百炼 API Key 以启用 AI 智能规划功能
                </Paragraph>
              </div>


              {apiKeyStatus === 'configured' ? (
                <Alert
                  message="API Key 已配置"
                  description={
                    <div>
                      <p>当前 API Key: <Text code>{currentApiKey ? getMaskedApiKey(currentApiKey) : 'sk-****'}</Text></p>
                      <Space style={{ marginTop: 8 }}>
                        <Button 
                          type="primary" 
                          icon={<KeyOutlined />}
                          onClick={() => setApiKeyModalVisible(true)}
                        >
                          重新配置
                        </Button>
                      </Space>
                    </div>
                  }
                  type="success"
                  showIcon
                />
              ) : (
                <Alert
                  message="API Key 未配置"
                  description={
                    <div>
                      <p>请先配置您的阿里云百炼 API Key 以使用 AI 功能</p>
                      <Button 
                        type="primary" 
                        icon={<KeyOutlined />}
                        onClick={() => setApiKeyModalVisible(true)}
                        style={{ marginTop: 8 }}
                      >
                        立即配置
                      </Button>
                    </div>
                  }
                  type="warning"
                  showIcon
                />
              )}
            </Space>
          </Card>
        </Col>
      </Row>

      <ApiKeyConfig
        visible={apiKeyModalVisible}
        onClose={() => setApiKeyModalVisible(false)}
        onSave={handleSaveApiKey}
        currentApiKey={currentApiKey}
        loading={loading}
      />

    </div>
  );
};

export default SettingsPage;