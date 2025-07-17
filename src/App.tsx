import {
  HashRouter as Router,
  Routes,
  Route,
  useNavigate,
  useLocation,
} from 'react-router-dom';
import { useState } from 'react';

import { Layout, Menu, theme, Button, Space } from 'antd';
import {
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  GithubOutlined,
  VideoCameraOutlined, // Import a suitable icon for Jitsi meeting
} from '@ant-design/icons';

import JitsiMeeting from './pages/jitsi-meeting'; // Import the new JitsiMeeting component
import './App.css';
const { Header, Content, Sider } = Layout;

const menuItems = [
  {
    key: '/', // Keep root path for Jitsi Meeting
    icon: <VideoCameraOutlined />,
    label: 'Jitsi Meeting',
    title: 'Jitsi Meeting',
  },
];

function MainLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  // 获取当前路由对应的菜单项的title
  const currentMenuItem = menuItems.find(
    item => item.key === location.pathname,
  );
  const currentTitle = currentMenuItem?.title || 'JEDI';

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={value => setCollapsed(value)}
        breakpoint="lg"
        collapsedWidth="0"
        style={{ zIndex: 2 }}
        trigger={null}
      >
        <div
          style={{
            height: 40,
            margin: 16,
            borderRadius: 6,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-start',
            overflow: 'hidden',
            transition: 'all 0.2s',
          }}
        >
          {!collapsed && (
            <span
              style={{
                color: '#fff',
                fontSize: 16,
                fontWeight: 600,
                opacity: collapsed ? 0 : 1,
                transition: 'opacity 0.2s',
              }}
            >
              JEDI
            </span>
          )}
        </div>
        <Menu
          theme="dark"
          selectedKeys={[location.pathname]}
          mode="inline"
          items={menuItems}
          onClick={({ key }) => navigate(key)}
        />
      </Sider>
      <Layout>
        <Header
          style={{
            padding: 0,
            background: colorBgContainer,
            position: 'sticky',
            top: 0,
            zIndex: 1,
          }}
          className="responsive-header"
        >
          <div className="header-content">
            <div className="header-left">
              <Button
                type="text"
                icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                onClick={() => setCollapsed(!collapsed)}
                style={{
                  fontSize: '16px',
                  width: 40,
                  height: 64,
                }}
              />
              <h3
                style={{
                  fontSize: '16px',
                  marginBottom: '0',
                  lineHeight: '64px',
                }}
              >
                {currentTitle}
              </h3>
            </div>

            <div className="header-right">
              <Space size={2} style={{ display: 'flex' }}>
                <Button
                  type="link"
                  icon={<GithubOutlined />}
                  href="https://github.com/orgs/JEDI-AI-meeting-participant/repositories"
                  target="_blank"
                  style={{ padding: '0 8px' }}
                >
                  GitHub
                </Button>
              </Space>
            </div>
          </div>
        </Header>
        <Content style={{ margin: '16px' }}>
          <div
            style={{
              // padding: 24, // Original padding commented out, adjust as needed
              minHeight: 360,
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
              height: '100%',
            }}
          >
            <Routes>
              <Route path="/" element={<JitsiMeeting />} />
            </Routes>
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}

function App() {
  return (
    <Router>
      <MainLayout />
    </Router>
  );
}

export default App;