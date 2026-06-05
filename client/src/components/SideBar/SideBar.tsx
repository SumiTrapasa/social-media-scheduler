import { LogoutOutlined } from "@ant-design/icons";
import { Avatar, Button, Divider, Flex, Menu, Typography } from "antd";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/authContext";
import {
  AimOutlined,
  CalendarOutlined,
  DashboardOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import styles from "./Sidebar.module.scss";
import { ROUTES } from "@/constants/paths";

export const NAV_ITEMS = [
  {
    key: ROUTES.DASHBOARD,
    icon: <DashboardOutlined />,
    label: "Dashboard",
    description: "Real-time overview of your performance",
  },
  {
    key: ROUTES.ACCOUNT,
    icon: <TeamOutlined />,
    label: "Accounts",
    description: "Manage your connected social media profiles",
  },
  {
    key: ROUTES.SCHEDULER,
    icon: <CalendarOutlined />,
    label: "Scheduler",
    description: "Plan and schedule your future posts",
  },
  {
    key: ROUTES.AI_COMPOSER,
    icon: <AimOutlined />,
    label: "AI Composer",
    description: "Generate creative content using AI",
  },
];

const SidebarContent = ({
  pathname,
  setDrawerVisible,
}: {
  pathname: string;
  setDrawerVisible: (visible: boolean) => void;
}) => {
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  if (!user) {
    return null;
  }

  return (
    <Flex vertical className={styles.sidebarContainer}>
      <div className={styles.sidebarContent}>
        <Flex align="center" gap={16} justify="center" className="sidebar-logo">
          <img src="/logo.svg" alt="Logo" className="size-6.5" />
          <div>MEDIA SCHEDULER</div>
        </Flex>
        <Menu
          theme="light"
          selectedKeys={[pathname]}
          items={NAV_ITEMS.map(
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            ({ description: _description, ...item }) => item,
          )}
          onClick={({ key }) => {
            navigate(key);
            setDrawerVisible(false);
          }}
        />
      </div>
      <div className={styles.sidebarFooter}>
        <Divider />
        <Flex align="center" gap={16}>
          <Avatar className={styles.avatar}>{user.name[0]}</Avatar>
          <Flex vertical>
            <Typography.Text strong>{user.name}</Typography.Text>
            <Typography.Text>{user.email}</Typography.Text>
          </Flex>
        </Flex>
        <Button
          type="text"
          icon={<LogoutOutlined />}
          className={styles.logoutButton}
          onClick={logout}
        >
          <Typography.Text strong>Logout</Typography.Text>
        </Button>
      </div>
    </Flex>
  );
};

export default SidebarContent;
