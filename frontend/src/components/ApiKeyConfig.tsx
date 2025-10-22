import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Button, message, Typography, Space, Alert } from 'antd';
import { KeyOutlined, InfoCircleOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

interface ApiKeyConfigProps {
  visible: boolean;
  onClose: () => void;
  onSave: (apiKey: string) => void;
  currentApiKey?: string;
}

const ApiKeyConfig: React.FC<ApiKeyConfigProps> = ({
  visible,
  onClose,
  onSave,
  currentApiKey = ''
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      form.setFieldsValue({
        apiKey: currentApiKey
      });
    }
  }, [visible, currentApiKey, form]);

  const handleSubmit = async (values: { apiKey: string }) => {
    setLoading(true);
    try {
      await onSave(values.apiKey);
      message.success('API Key 配置成功！');
      onClose();
    } catch (error) {
      message.error('配置失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  return (
    <Modal
      title={
        <Space>
          <KeyOutlined />
          <span>阿里云百炼 API Key 配置</span>
        </Space>
      }
      open={visible}
      onCancel={handleCancel}
      footer={null}
      width={600}
      destroyOnClose
    >
      <div style={{ marginBottom: 16 }}>
        <Alert
          message="配置说明"
          description={
            <div>
              <p>1. 请前往 <a href="https://dashscope.console.aliyun.com/" target="_blank" rel="noopener noreferrer">阿里云百炼控制台</a> 获取您的 API Key</p>
              <p>2. 将 API Key 粘贴到下方输入框中</p>
              <p>3. 配置完成后即可使用 AI 智能规划功能</p>
            </div>
          }
          type="info"
          showIcon
          icon={<InfoCircleOutlined />}
        />
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{ apiKey: currentApiKey }}
      >
        <Form.Item
          name="apiKey"
          label="API Key"
          rules={[
            { required: true, message: '请输入 API Key' },
            { min: 10, message: 'API Key 长度至少 10 位' }
          ]}
        >
          <Input.Password
            placeholder="请输入您的阿里云百炼 API Key"
            size="large"
            style={{ fontFamily: 'monospace' }}
          />
        </Form.Item>

        <Form.Item>
          <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
            <Button onClick={handleCancel}>
              取消
            </Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              保存配置
            </Button>
          </Space>
        </Form.Item>
      </Form>

      <div style={{ marginTop: 16, padding: 12, backgroundColor: '#f5f5f5', borderRadius: 6 }}>
        <Text type="secondary" style={{ fontSize: 12 }}>
          <InfoCircleOutlined style={{ marginRight: 4 }} />
          您的 API Key 将安全存储在本地，仅用于与阿里云百炼服务通信
        </Text>
      </div>
    </Modal>
  );
};

export default ApiKeyConfig;