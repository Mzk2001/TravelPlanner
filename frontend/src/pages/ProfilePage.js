import React, { useState, useEffect } from 'react';
import { Card, Form, Input, Button, message, Avatar, Upload } from 'antd';
import { UserOutlined, CameraOutlined } from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';
import { userAPI } from '../services/api';

const ProfilePage = () => {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const { user, handleLogin } = useAuth();

  useEffect(() => {
    if (user) {
      form.setFieldsValue({
        username: user.username,
        email: user.email,
        phone: user.phone,
        fullName: user.fullName
      });
    }
  }, [user, form]);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const response = await userAPI.updateUser(user.id, values);
      const updatedUser = response.data;
      
      // 更新本地用户信息
      handleLogin(updatedUser, localStorage.getItem('token'));
      message.success('更新成功');
    } catch (error) {
      message.error('更新失败');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = (info) => {
    if (info.file.status === 'done') {
      message.success('头像上传成功');
      // 这里可以处理头像上传成功的逻辑
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <Card title="个人资料">
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <Upload
            name="avatar"
            listType="picture-circle"
            showUploadList={false}
            onChange={handleAvatarChange}
            beforeUpload={() => false} // 暂时不上传，只预览
          >
            <Avatar 
              size={80} 
              icon={<UserOutlined />}
              src={user?.avatarUrl}
            />
            <div style={{ marginTop: '8px' }}>
              <CameraOutlined /> 点击更换头像
            </div>
          </Upload>
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          autoComplete="off"
        >
          <Form.Item
            label="用户名"
            name="username"
            rules={[
              { required: true, message: '请输入用户名!' },
              { min: 3, message: '用户名至少3个字符!' }
            ]}
          >
            <Input disabled />
          </Form.Item>

          <Form.Item
            label="邮箱"
            name="email"
            rules={[
              { required: true, message: '请输入邮箱!' },
              { type: 'email', message: '请输入有效的邮箱地址!' }
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="手机号"
            name="phone"
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="姓名"
            name="fullName"
          >
            <Input />
          </Form.Item>

          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading}
              style={{ width: '100%' }}
            >
              更新资料
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default ProfilePage;


