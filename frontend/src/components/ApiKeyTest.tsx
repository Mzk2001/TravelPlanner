import React, { useState } from 'react';
import { Card, Button, Input, message, Space, Typography, Alert } from 'antd';
import { ExperimentOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const ApiKeyTest: React.FC = () => {
  const [apiKey, setApiKey] = useState('');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const handleTest = async () => {
    if (!apiKey.trim()) {
      message.warning('请输入API Key');
      return;
    }

    setTesting(true);
    setTestResult(null);

    try {
      // 直接调用后端API测试
      const response = await fetch('http://localhost:8080/api/ai/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ apiKey })
      });
      
      const data = await response.json();
      console.log('API测试响应:', data);
      
      setTestResult({
        success: data.success,
        message: data.message || (data.success ? 'API Key验证成功' : 'API Key验证失败')
      });
      
      if (data.success) {
        message.success('API Key测试成功！');
        // 保存到本地存储
        localStorage.setItem('qwen_api_key', apiKey);
        // 触发页面刷新以更新状态
        window.location.reload();
      } else {
        message.error('API Key测试失败');
      }
    } catch (error: any) {
      console.error('API测试错误:', error);
      setTestResult({
        success: false,
        message: '测试失败，请检查网络连接和后端服务'
      });
      message.error('测试失败');
    } finally {
      setTesting(false);
    }
  };

  return (
    <Card title="API Key 测试" style={{ marginBottom: 16 }}>
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        <div>
          <Text strong>阿里云百炼 API Key 测试</Text>
          <br />
          <Text type="secondary">
            输入您的API Key进行测试，验证是否可以正常使用AI服务
          </Text>
        </div>

        <Input
          placeholder="请输入您的阿里云百炼 API Key"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          style={{ fontFamily: 'monospace' }}
        />

        <Button
          type="primary"
          icon={<ExperimentOutlined />}
          loading={testing}
          onClick={handleTest}
          disabled={!apiKey.trim()}
        >
          {testing ? '测试中...' : '测试连接'}
        </Button>

        {testResult && (
          <Alert
            message={testResult.success ? '测试成功' : '测试失败'}
            description={testResult.message}
            type={testResult.success ? 'success' : 'error'}
            icon={testResult.success ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
            showIcon
          />
        )}
      </Space>
    </Card>
  );
};

export default ApiKeyTest;