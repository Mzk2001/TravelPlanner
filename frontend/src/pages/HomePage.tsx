import React from 'react';
import { Layout, Card, Row, Col, Typography, Button, Space, Statistic } from 'antd';
import { 
  PlusOutlined, 
  MessageOutlined, 
  CalendarOutlined, 
  EnvironmentOutlined,
  RobotOutlined,
  GlobalOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/Header';

const { Content } = Layout;
const { Title, Paragraph, Text } = Typography;

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const features = [
    {
      icon: <RobotOutlined style={{ fontSize: '24px', color: '#1890ff' }} />,
      title: 'AI智能规划',
      description: '基于大语言模型的智能旅游规划，为您推荐个性化行程',
      action: () => navigate('/chat')
    },
    {
      icon: <CalendarOutlined style={{ fontSize: '24px', color: '#52c41a' }} />,
      title: '计划管理',
      description: '创建、编辑和管理您的旅游计划，随时查看和修改',
      action: () => navigate('/plans')
    },
    {
      icon: <EnvironmentOutlined style={{ fontSize: '24px', color: '#fa8c16' }} />,
      title: '地图服务',
      description: '集成高德地图，提供地点搜索、路线规划等服务',
      action: () => navigate('/chat')
    },
    {
      icon: <MessageOutlined style={{ fontSize: '24px', color: '#722ed1' }} />,
      title: '语音交互',
      description: '支持语音输入和输出，让旅游规划更加便捷',
      action: () => navigate('/chat')
    }
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header />
      <Content style={{ padding: '0 24px' }}>
        {/* Hero Section */}
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: '12px',
          padding: '60px 40px',
          margin: '24px 0',
          color: 'white',
          textAlign: 'center'
        }}>
          <Title level={1} style={{ color: 'white', marginBottom: 16 }}>
            🗺️ 智能旅游助手
          </Title>
          <Paragraph style={{ 
            fontSize: '18px', 
            color: 'rgba(255,255,255,0.9)',
            marginBottom: 32,
            maxWidth: '600px',
            margin: '0 auto 32px'
          }}>
            基于AI大语言模型的智能旅游规划平台，为您提供个性化的旅游建议和完整的行程规划
          </Paragraph>
          <Space size="large">
            {isAuthenticated ? (
              <>
                <Button 
                  type="primary" 
                  size="large"
                  icon={<PlusOutlined />}
                  onClick={() => navigate('/plans')}
                  style={{ height: '48px', padding: '0 32px' }}
                >
                  创建计划
                </Button>
                <Button 
                  size="large"
                  icon={<MessageOutlined />}
                  onClick={() => navigate('/chat')}
                  style={{ 
                    height: '48px', 
                    padding: '0 32px',
                    background: 'rgba(255,255,255,0.2)',
                    border: '1px solid rgba(255,255,255,0.3)',
                    color: 'white'
                  }}
                >
                  AI助手
                </Button>
              </>
            ) : (
              <>
                <Button 
                  type="primary" 
                  size="large"
                  onClick={() => navigate('/register')}
                  style={{ height: '48px', padding: '0 32px' }}
                >
                  立即开始
                </Button>
                <Button 
                  size="large"
                  onClick={() => navigate('/login')}
                  style={{ 
                    height: '48px', 
                    padding: '0 32px',
                    background: 'rgba(255,255,255,0.2)',
                    border: '1px solid rgba(255,255,255,0.3)',
                    color: 'white'
                  }}
                >
                  登录
                </Button>
              </>
            )}
          </Space>
        </div>

        {/* Features Section */}
        <div style={{ margin: '48px 0' }}>
          <Title level={2} style={{ textAlign: 'center', marginBottom: 48 }}>
            核心功能
          </Title>
          <Row gutter={[24, 24]}>
            {features.map((feature, index) => (
              <Col xs={24} sm={12} lg={6} key={index}>
                <Card
                  hoverable
                  style={{ 
                    height: '100%',
                    textAlign: 'center',
                    borderRadius: '12px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                  }}
                  onClick={feature.action}
                >
                  <div style={{ marginBottom: 16 }}>
                    {feature.icon}
                  </div>
                  <Title level={4} style={{ marginBottom: 12 }}>
                    {feature.title}
                  </Title>
                  <Paragraph type="secondary">
                    {feature.description}
                  </Paragraph>
                </Card>
              </Col>
            ))}
          </Row>
        </div>

        {/* Stats Section */}
        <div style={{ margin: '48px 0' }}>
          <Row gutter={[24, 24]}>
            <Col xs={24} sm={8}>
              <Card style={{ textAlign: 'center', borderRadius: '12px' }}>
                <Statistic
                  title="用户数量"
                  value={1234}
                  suffix="+"
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card style={{ textAlign: 'center', borderRadius: '12px' }}>
                <Statistic
                  title="旅游计划"
                  value={5678}
                  suffix="+"
                  valueStyle={{ color: '#52c41a' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card style={{ textAlign: 'center', borderRadius: '12px' }}>
                <Statistic
                  title="AI对话"
                  value={9876}
                  suffix="+"
                  valueStyle={{ color: '#fa8c16' }}
                />
              </Card>
            </Col>
          </Row>
        </div>

        {/* Footer */}
        <div style={{
          textAlign: 'center',
          padding: '40px 0',
          borderTop: '1px solid #f0f0f0',
          marginTop: '48px'
        }}>
          <Space direction="vertical" size="small">
            <Text type="secondary">
              © 2024 旅游助手. 基于AI大语言模型的智能旅游规划平台
            </Text>
            <Space>
              <Button type="link" size="small">关于我们</Button>
              <Button type="link" size="small">帮助中心</Button>
              <Button type="link" size="small">联系我们</Button>
            </Space>
          </Space>
        </div>
      </Content>
    </Layout>
  );
};

export default HomePage;
