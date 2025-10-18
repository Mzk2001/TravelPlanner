import React, { useState } from 'react';
import { 
  Layout, 
  Card, 
  Form, 
  Input, 
  Button, 
  Avatar, 
  Typography, 
  Space, 
  message,
  Upload,
  Row,
  Col,
  Divider
} from 'antd';
import { 
  UserOutlined, 
  MailOutlined, 
  PhoneOutlined, 
  CameraOutlined,
  SaveOutlined
} from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../services/api';
import Header from '../components/Header';
import { UpdateUserRequest } from '../types';

const { Content } = Layout;
const { Title, Text } = Typography;

const ProfilePage: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  if (!user) {
    return (
      <Layout style={{ minHeight: '100vh' }}>
        <Header />
        <Content style={{ padding: '24px', textAlign: 'center' }}>
          <div>请先登录</div>
        </Content>
      </Layout>
    );
  }

  const handleSubmit = async (values: UpdateUserRequest) => {
    setLoading(true);
    try {
      const updatedUser = await apiService.updateUser(user.id, values);
      updateUser(updatedUser);
      message.success('更新成功');
    } catch (error) {
      message.error('更新失败');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = (info: any) => {
    if (info.file.status === 'done') {
      // 这里应该上传头像到服务器并更新用户信息
      message.success('头像上传成功');
    } else if (info.file.status === 'error') {
      message.error('头像上传失败');
    }
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header />
      <Content style={{ padding: '24px' }}>
        <Row gutter={[24, 24]}>
          {/* 左侧：头像和基本信息 */}
          <Col xs={24} lg={8}>
            <Card>
              <div style={{ textAlign: 'center' }}>
                <Upload
                  name="avatar"
                  listType="picture-circle"
                  showUploadList={false}
                  onChange={handleAvatarChange}
                  beforeUpload={() => false} // 阻止默认上传
                >
                  <Avatar
                    size={120}
                    src={user.avatarUrl}
                    icon={<UserOutlined />}
                    style={{ cursor: 'pointer' }}
                  />
                </Upload>
                <div style={{ marginTop: 16 }}>
                  <Title level={4} style={{ margin: 0 }}>
                    {user.fullName || user.username}
                  </Title>
                  <Text type="secondary">@{user.username}</Text>
                </div>
                <div style={{ marginTop: 16 }}>
                  <Button 
                    icon={<CameraOutlined />}
                    onClick={() => {
                      // 触发文件选择
                      const input = document.createElement('input');
                      input.type = 'file';
                      input.accept = 'image/*';
                      input.click();
                    }}
                  >
                    更换头像
                  </Button>
                </div>
              </div>

              <Divider />

              <div>
                <Title level={5}>基本信息</Title>
                <Space direction="vertical" style={{ width: '100%' }}>
                  <div>
                    <Text strong>用户名：</Text>
                    <Text>{user.username}</Text>
                  </div>
                  <div>
                    <Text strong>邮箱：</Text>
                    <Text>{user.email}</Text>
                  </div>
                  <div>
                    <Text strong>手机：</Text>
                    <Text>{user.phone || '未设置'}</Text>
                  </div>
                  <div>
                    <Text strong>角色：</Text>
                    <Text>{user.role === 'ADMIN' ? '管理员' : '普通用户'}</Text>
                  </div>
                  <div>
                    <Text strong>注册时间：</Text>
                    <Text>{new Date(user.createdAt).toLocaleDateString()}</Text>
                  </div>
                </Space>
              </div>
            </Card>
          </Col>

          {/* 右侧：编辑表单 */}
          <Col xs={24} lg={16}>
            <Card title="编辑个人资料">
              <Form
                form={form}
                layout="vertical"
                initialValues={{
                  email: user.email,
                  phone: user.phone,
                  fullName: user.fullName,
                }}
                onFinish={handleSubmit}
              >
                <Form.Item
                  name="fullName"
                  label="姓名"
                >
                  <Input
                    prefix={<UserOutlined />}
                    placeholder="请输入您的姓名"
                  />
                </Form.Item>

                <Form.Item
                  name="email"
                  label="邮箱"
                  rules={[
                    { required: true, message: '请输入邮箱' },
                    { type: 'email', message: '请输入有效的邮箱地址' }
                  ]}
                >
                  <Input
                    prefix={<MailOutlined />}
                    placeholder="请输入邮箱地址"
                  />
                </Form.Item>

                <Form.Item
                  name="phone"
                  label="手机号码"
                  rules={[
                    { pattern: /^1[3-9]\d{9}$/, message: '请输入有效的手机号码' }
                  ]}
                >
                  <Input
                    prefix={<PhoneOutlined />}
                    placeholder="请输入手机号码"
                  />
                </Form.Item>

                <Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={loading}
                    icon={<SaveOutlined />}
                    size="large"
                  >
                    保存更改
                  </Button>
                </Form.Item>
              </Form>
            </Card>

            {/* 账户安全 */}
            <Card title="账户安全" style={{ marginTop: 24 }}>
              <Space direction="vertical" style={{ width: '100%' }}>
                <div>
                  <Text strong>密码</Text>
                  <div style={{ marginTop: 8 }}>
                    <Text type="secondary">定期更改密码可以保护您的账户安全</Text>
                    <Button 
                      type="link" 
                      style={{ padding: 0, marginLeft: 8 }}
                      onClick={() => message.info('密码修改功能开发中')}
                    >
                      修改密码
                    </Button>
                  </div>
                </div>
                
                <Divider style={{ margin: '16px 0' }} />
                
                <div>
                  <Text strong>账户状态</Text>
                  <div style={{ marginTop: 8 }}>
                    <Text type="secondary">
                      账户状态：{user.isActive ? '正常' : '已禁用'}
                    </Text>
                  </div>
                </div>
              </Space>
            </Card>
          </Col>
        </Row>
      </Content>
    </Layout>
  );
};

export default ProfilePage;
