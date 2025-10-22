import React from 'react';
import { Layout, Menu, Avatar, Dropdown, Button } from 'antd';
import { 
  DashboardOutlined, 
  MessageOutlined, 
  UserOutlined, 
  LogoutOutlined,
  PlusOutlined,
  SettingOutlined
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const { Header: AntHeader } = Layout;

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, handleLogout } = useAuth();

  const menuItems = [
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: '仪表盘',
    },
    {
      key: '/chat',
      icon: <MessageOutlined />,
      label: 'AI助手',
    },
  ];

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '个人资料',
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: '设置',
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
    },
  ];

  const handleMenuClick = ({ key }) => {
    navigate(key);
  };

  const handleUserMenuClick = ({ key }) => {
    if (key === 'profile') {
      navigate('/profile');
    } else if (key === 'settings') {
      navigate('/settings');
    } else if (key === 'logout') {
      handleLogout();
    }
  };

  const handleCreatePlan = () => {
    navigate('/chat');
  };

  return (
    <AntHeader style={{ 
      background: '#fff', 
      padding: '0 24px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <div style={{ 
          fontSize: '20px', 
          fontWeight: 'bold', 
          color: '#1890ff',
          marginRight: '40px'
        }}>
          旅游助手
        </div>
        <Menu
          mode="horizontal"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={handleMenuClick}
          style={{ border: 'none', background: 'transparent' }}
        />
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <Button 
          type="primary" 
          icon={<PlusOutlined />}
          onClick={handleCreatePlan}
        >
          创建计划
        </Button>
        
        <Dropdown
          menu={{ 
            items: userMenuItems,
            onClick: handleUserMenuClick 
          }}
          placement="bottomRight"
        >
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            cursor: 'pointer',
            padding: '8px 12px',
            borderRadius: '6px',
            transition: 'background-color 0.3s'
          }}>
            <Avatar 
              size="small" 
              icon={<UserOutlined />}
              style={{ marginRight: '8px' }}
            />
            <span>{user?.username || '用户'}</span>
          </div>
        </Dropdown>
      </div>
    </AntHeader>
  );
};

export default Header;


