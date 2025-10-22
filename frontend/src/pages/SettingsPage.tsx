import React, { useState, useEffect } from 'react';
import { Card, Button, Space, Typography, Divider, Alert, Row, Col, Tag } from 'antd';
import { SettingOutlined, KeyOutlined, ExperimentOutlined, CheckCircleOutlined } from '@ant-design/icons';
import ApiKeyConfig from '../components/ApiKeyConfig';
import ApiKeyTest from '../components/ApiKeyTest';

const { Title, Text, Paragraph } = Typography;

const SettingsPage: React.FC = () => {
  const [apiKeyModalVisible, setApiKeyModalVisible] = useState(false);
  const [currentApiKey, setCurrentApiKey] = useState<string>('');
  const [apiKeyStatus, setApiKeyStatus] = useState<'none' | 'configured' | 'testing' | 'valid' | 'invalid'>('none');

  useEffect(() => {
    // 从本地存储获取API Key
    const savedApiKey = localStorage.getItem('qwen_api_key');
    if (savedApiKey) {
      setCurrentApiKey(savedApiKey);
      setApiKeyStatus('configured');
    }
  }, []);

  const handleSaveApiKey = async (apiKey: string) => {
    // 保存到本地存储
    localStorage.setItem('qwen_api_key', apiKey);
    setCurrentApiKey(apiKey);
    setApiKeyStatus('configured');
  };

  const handleTestApiKey = async () => {
    if (!currentApiKey) {
      return;
    }

    setApiKeyStatus('testing');
    try {
      // 直接调用后端API测试
      const response = await fetch('http://localhost:8080/api/ai/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ apiKey: currentApiKey })
      });
      
      const data = await response.json();
      if (data.success) {
        setApiKeyStatus('valid');
      } else {
        setApiKeyStatus('invalid');
      }
    } catch (error) {
      setApiKeyStatus('invalid');
    }
  };

  const getApiKeyStatusTag = () => {
    switch (apiKeyStatus) {
      case 'configured':
        return <Tag color="blue">已配置</Tag>;
      case 'testing':
        return <Tag color="orange">测试中</Tag>;
      case 'valid':
        return <Tag color="green" icon={<CheckCircleOutlined />}>验证成功</Tag>;
      case 'invalid':
        return <Tag color="red">验证失败</Tag>;
      default:
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

      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card title="AI 服务配置" extra={getApiKeyStatusTag()}>
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              <div>
                <Title level={4}>阿里云百炼 API Key</Title>
                <Paragraph type="secondary">
                  配置您的阿里云百炼 API Key 以启用 AI 智能规划功能
                </Paragraph>
              </div>

              <ApiKeyTest />

              {currentApiKey ? (
                <Alert
                  message="API Key 已配置"
                  description={
                    <div>
                      <p>当前 API Key: <Text code>{getMaskedApiKey(currentApiKey)}</Text></p>
                      <Space style={{ marginTop: 8 }}>
                        <Button 
                          type="primary" 
                          icon={<KeyOutlined />}
                          onClick={() => setApiKeyModalVisible(true)}
                        >
                          重新配置
                        </Button>
                        <Button 
                          icon={<ExperimentOutlined />}
                          onClick={handleTestApiKey}
                          loading={apiKeyStatus === 'testing'}
                        >
                          测试连接
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
      />
    </div>
  );
};

export default SettingsPage;