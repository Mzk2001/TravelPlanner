import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Switch, Route, Redirect } from 'react-router-dom';
import { Layout, message } from 'antd';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import PlanDetailPage from './pages/PlanDetailPage';
import ChatPage from './pages/ChatPage';
import ProfilePage from './pages/ProfilePage';
import Header from './components/Header';
import './App.css';

const { Content } = Layout;

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 检查本地存储中的认证信息
    const token = localStorage.getItem('token');
    const userInfo = localStorage.getItem('user');
    
    if (token && userInfo) {
      try {
        const userData = JSON.parse(userInfo);
        setUser(userData);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('解析用户信息失败:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    
    setLoading(false);
  }, []);

  const handleLogin = (userData, token) => {
    setUser(userData);
    setIsAuthenticated(true);
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    message.success('登录成功！');
  };

  const handleLogout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    message.success('已退出登录');
  };

  if (loading) {
    return (
      <div className="loading-spinner">
        <div>加载中...</div>
      </div>
    );
  }

  return (
    <Router>
      <AuthProvider value={{ user, isAuthenticated, handleLogin, handleLogout }}>
        <div className="app-container">
          <Layout>
            {isAuthenticated && <Header />}
            <Content className="main-content">
              <Switch>
                <Route 
                  path="/login" 
                  render={() =>
                    isAuthenticated ? <Redirect to="/dashboard" /> : <LoginPage />
                  } 
                />
                <Route 
                  path="/register" 
                  render={() =>
                    isAuthenticated ? <Redirect to="/dashboard" /> : <RegisterPage />
                  } 
                />
                <Route 
                  path="/dashboard" 
                  render={() =>
                    <ProtectedRoute>
                      <DashboardPage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/plan/:id" 
                  render={() =>
                    <ProtectedRoute>
                      <PlanDetailPage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/chat/:planId?" 
                  render={() =>
                    <ProtectedRoute>
                      <ChatPage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/profile" 
                  render={() =>
                    <ProtectedRoute>
                      <ProfilePage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  exact
                  path="/" 
                  render={() => <Redirect to={isAuthenticated ? "/dashboard" : "/login"} />} 
                />
              </Switch>
            </Content>
          </Layout>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;


