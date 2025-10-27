import React, { useState } from 'react';
import { Button, Card, Input, Space, Typography, message } from 'antd';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../services/api';

const { Title, Text } = Typography;

interface ApiKeyTestProps {
  onStatusUpdate?: () => void;
}

const ApiKeyTest: React.FC<ApiKeyTestProps> = ({ onStatusUpdate }) => {
  const { user } = useAuth();
  const [testApiKey, setTestApiKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<any>(null);

  const testApiKeyStatus = async () => {
    if (!user?.id) {
      message.error('用户未登录');
      return;
    }

    console.log('🧪 测试工具：开始测试API Key状态，用户ID:', user.id);
    setLoading(true);
    try {
      const response = await apiService.getApiKeyStatus(user.id);
      console.log('🧪 测试工具：API Key状态测试响应:', response);
      console.log('🧪 测试工具：响应详情:', {
        success: response.success,
        hasApiKey: response.hasApiKey,
        maskedApiKey: response.maskedApiKey,
        message: response.message
      });
      setStatus(response);
      message.success('API Key状态获取成功');
      
      // 通知父组件更新状态
      console.log('🧪 测试工具：准备调用onStatusUpdate回调');
      if (onStatusUpdate) {
        console.log('🧪 测试工具：调用onStatusUpdate回调');
        onStatusUpdate();
        console.log('🧪 测试工具：onStatusUpdate回调调用完成');
      } else {
        console.log('🧪 测试工具：onStatusUpdate回调未定义');
      }
    } catch (error: any) {
      console.error('🧪 测试工具：API Key状态测试失败:', error);
      message.error('测试失败: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const testSaveApiKey = async () => {
    if (!user?.id) {
      message.error('用户未登录');
      return;
    }

    if (!testApiKey.trim()) {
      message.error('请输入API Key');
      return;
    }

    setLoading(true);
    try {
      const response = await apiService.saveApiKey(user.id, testApiKey);
      console.log('保存API Key测试响应:', response);
      setStatus(response);
      message.success('API Key保存成功');
      
      // 通知父组件更新状态
      if (onStatusUpdate) {
        onStatusUpdate();
      }
    } catch (error: any) {
      console.error('保存API Key测试失败:', error);
      message.error('测试失败: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const testDeleteApiKey = async () => {
    if (!user?.id) {
      message.error('用户未登录');
      return;
    }

    setLoading(true);
    try {
      const response = await apiService.deleteApiKey(user.id);
      console.log('删除API Key测试响应:', response);
      setStatus(response);
      message.success('API Key删除成功');
      
      // 通知父组件更新状态
      if (onStatusUpdate) {
        onStatusUpdate();
      }
    } catch (error: any) {
      console.error('删除API Key测试失败:', error);
      message.error('测试失败: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title="API Key 测试工具" style={{ margin: '20px' }}>
      <Space direction="vertical" style={{ width: '100%' }}>
        <div>
          <Text strong>当前用户ID: </Text>
          <Text>{user?.id || '未登录'}</Text>
        </div>
        
        <div>
          <Text strong>用户名: </Text>
          <Text>{user?.username || '未登录'}</Text>
        </div>

        <Space>
          <Button 
            type="primary" 
            onClick={testApiKeyStatus}
            loading={loading}
          >
            测试获取API Key状态
          </Button>
          
          <Button 
            onClick={testDeleteApiKey}
            loading={loading}
            danger
          >
            测试删除API Key
          </Button>
        </Space>

        <div>
          <Text strong>测试保存API Key:</Text>
          <Input
            placeholder="输入API Key进行测试"
            value={testApiKey}
            onChange={(e) => setTestApiKey(e.target.value)}
            style={{ marginTop: 8 }}
          />
          <Button 
            type="primary" 
            onClick={testSaveApiKey}
            loading={loading}
            style={{ marginTop: 8 }}
          >
            测试保存API Key
          </Button>
        </div>

        {status && (
          <Card title="API响应结果" size="small">
            <pre style={{ whiteSpace: 'pre-wrap', fontSize: '12px' }}>
              {JSON.stringify(status, null, 2)}
            </pre>
          </Card>
        )}
      </Space>
    </Card>
  );
};

export default ApiKeyTest;
