import { MenuOutlined } from "@ant-design/icons";
import { Button, Drawer, Flex, Layout, Spin, theme, Typography } from "antd";
import { Outlet, useLocation, Navigate } from "react-router-dom";
import "./Layout.scss";
import { useState, useMemo } from "react";
import { useAuth } from "@/context/authContext";
import SidebarContent, { NAV_ITEMS } from "../SideBar/SideBar";
import { ROUTES } from "@/constants/paths";

const { Header, Content, Sider } = Layout;

const DEFAULT_PAGE_CONFIG = {
  label: "Social Media Platform",
  description: "AI-Powered Automation & Scheduling",
};

const CustomLayout = () => {
  const {
    token: { colorBgContainer },
  } = theme.useToken();
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);

  const currentConfig = useMemo(() => {
    return (
      NAV_ITEMS.find((item) => item.key === location.pathname) ||
      DEFAULT_PAGE_CONFIG
    );
  }, [location.pathname]);

  if (isLoading) {
    return (
      <Flex justify="center" align="center" className="custom-sider">
        <Spin size="large" />
      </Flex>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  return (
    <Layout className="main-layout">
      <Sider
        breakpoint="lg"
        collapsedWidth="0"
        className="custom-sider"
        width={250}
        trigger={null}
        onBreakpoint={(broken) => setIsMobile(broken)}
        collapsed={isMobile}
      >
        <SidebarContent
          pathname={location.pathname}
          setDrawerVisible={setDrawerVisible}
        />
      </Sider>

      <Drawer
        placement="left"
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
        width={250}
        styles={{ body: { padding: 0 } }}
        closable={false}
      >
        <SidebarContent
          pathname={location.pathname}
          setDrawerVisible={setDrawerVisible}
        />
      </Drawer>

      <Layout className="inner-layout">
        <Header
          className="custom-header"
          style={{ background: colorBgContainer }}
        >
          <Flex align="center" gap={16}>
            {isMobile && (
              <Button
                type="text"
                icon={<MenuOutlined />}
                onClick={() => setDrawerVisible(true)}
                className="header-button"
              />
            )}
            <Flex vertical>
              <Typography.Title level={4} className="header-title">
                {currentConfig.label}
              </Typography.Title>
              <Typography.Text type="secondary" className="header-description">
                {currentConfig.description}
              </Typography.Text>
            </Flex>
          </Flex>
        </Header>
        <Content className="custom-content">
          <div className="content-inner">
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};
export default CustomLayout;
