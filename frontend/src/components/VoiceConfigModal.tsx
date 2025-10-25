import React, { useState } from 'react';
import { Modal, Form, Input, Button, message, Space, Typography, Divider } from 'antd';
import { SettingOutlined, InfoCircleOutlined } from '@ant-design/icons';

const { Text, Link } = Typography;

interface VoiceConfigModalProps {
  visible: boolean;
  onCancel: () => void;
  onSave: (config: VoiceConfig) => void;
}

interface VoiceConfig {
  appId: string;
  apiKey: string;
  apiSecret: string;
}

const VoiceConfigModal: React.FC<VoiceConfigModalProps> = ({ visible, onCancel, onSave }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      
      // 保存配置到localStorage
      localStorage.setItem('xunfei_voice_config', JSON.stringify(values));
      
      onSave(values);
      message.success('语音配置保存成功！');
      onCancel();
    } catch (error) {
      console.error('配置保存失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadConfig = () => {
    const savedConfig = localStorage.getItem('xunfei_voice_config');
    if (savedConfig) {
      try {
        const config = JSON.parse(savedConfig);
        form.setFieldsValue(config);
      } catch (error) {
        console.error('加载配置失败:', error);
      }
    }
  };

  React.useEffect(() => {
    if (visible) {
      loadConfig();
    }
  }, [visible]);

  return (
    <Modal
      title={
        <Space>
          <SettingOutlined />
          <span>语音识别配置</span>
        </Space>
      }
      open={visible}
      onCancel={onCancel}
      onOk={handleSave}
      confirmLoading={loading}
      width={600}
      okText="保存配置"
      cancelText="取消"
    >
      <div style={{ marginBottom: 16 }}>
        <Text type="secondary">
          配置科大讯飞语音识别API，用于将语音转换为文字。
        </Text>
      </div>

      <Divider />

      <div style={{ 
        background: '#f6ffed', 
        border: '1px solid #b7eb8f', 
        borderRadius: '6px', 
        padding: '12px',
        marginBottom: '16px'
      }}>
        <Space>
          <InfoCircleOutlined style={{ color: '#52c41a' }} />
          <Text type="secondary" style={{ fontSize: '13px' }}>
            如何获取科大讯飞API密钥？
          </Text>
        </Space>
        <div style={{ marginTop: '8px', fontSize: '13px', color: '#666' }}>
          1. 访问 <Link href="https://www.xfyun.cn/" target="_blank">科大讯飞开放平台</Link><br/>
          2. 注册账号并创建应用<br/>
          3. 在应用管理页面获取 APPID、API Key 和 API Secret<br/>
          4. 开通语音识别服务
        </div>
      </div>

      <Form
        form={form}
        layout="vertical"
        requiredMark={false}
      >
        <Form.Item
          name="appId"
          label="APPID"
          rules={[
            { required: true, message: '请输入科大讯飞APPID' },
            { min: 8, message: 'APPID长度至少8位' }
          ]}
        >
          <Input 
            placeholder="请输入科大讯飞APPID"
            style={{ fontFamily: 'monospace' }}
          />
        </Form.Item>

        <Form.Item
          name="apiKey"
          label="API Key"
          rules={[
            { required: true, message: '请输入API Key' },
            { min: 16, message: 'API Key长度至少16位' }
          ]}
        >
          <Input 
            placeholder="请输入科大讯飞API Key"
            style={{ fontFamily: 'monospace' }}
          />
        </Form.Item>

        <Form.Item
          name="apiSecret"
          label="API Secret"
          rules={[
            { required: true, message: '请输入API Secret' },
            { min: 16, message: 'API Secret长度至少16位' }
          ]}
        >
          <Input.Password 
            placeholder="请输入科大讯飞API Secret"
            style={{ fontFamily: 'monospace' }}
          />
        </Form.Item>
      </Form>

      <div style={{ 
        background: '#fff7e6', 
        border: '1px solid #ffd591', 
        borderRadius: '6px', 
        padding: '12px',
        marginTop: '16px'
      }}>
        <Text type="secondary" style={{ fontSize: '13px' }}>
          <strong>注意：</strong>配置信息将保存在浏览器本地存储中，不会上传到服务器。
          请确保您的API密钥安全，不要在不安全的网络环境下使用。
        </Text>
      </div>
    </Modal>
  );
};

export default VoiceConfigModal;
