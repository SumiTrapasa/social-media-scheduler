import { Card, Col, Flex, Row, Tag, Typography, message } from "antd";
import {
  ActivityIcon,
  CheckCircleIcon,
  ClockIcon,
  Share2Icon,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import ListData from "./components/ListData";
import DashboardHeader from "./components/DashboardHeader";
import StatCard from "./components/StatCard";
import api from "@/api/axios";
import type { Account, Activity, Post } from "@/types";
import { API_ENDPOINTS } from "@/constants/paths";

const Dashboard: React.FC = () => {
  const [states, setStates] = useState({
    scheduled: 0,
    published: 0,
    connectedAccounts: 0,
  });
  const [activities, setActivities] = useState<Activity[]>([]);

  const fetchDashboardData = useCallback(async () => {
    try {
      const [postRes, accountsRes, activitiesRes] = await Promise.all([
        api.get(API_ENDPOINTS.POSTS.BASE),
        api.get(API_ENDPOINTS.ACCOUNTS.BASE),
        api.get(API_ENDPOINTS.ACTIVITY.BASE),
      ]);
      const posts: Post[] = postRes.data;
      const accounts: Account[] = accountsRes.data;
      setStates({
        scheduled: posts.filter((post) => post.status === "scheduled").length,
        published: posts.filter((post) => post.status === "published").length,
        connectedAccounts: accounts.filter(
          (account) => account.status === "connected",
        ).length,
      });
      setActivities(activitiesRes.data);
    } catch (error) {
      console.error("Dashboard fetch error:", error);
      message.error("Failed to load dashboard data");
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const statCards = useMemo(
    () => [
      {
        label: "Scheduled Posts",
        value: states.scheduled,
        icon: ClockIcon,
        trend: "+2 today",
      },
      {
        label: "Published Posts",
        value: states.published,
        icon: CheckCircleIcon,
        trend: "All time",
      },
      {
        label: "Connected Accounts",
        value: states.connectedAccounts,
        icon: Share2Icon,
        trend: "Active",
      },
    ],
    [states],
  );

  return (
    <Flex gap={16} vertical>
      <DashboardHeader />

      <Row gutter={[16, 16]}>
        {statCards.map((card) => (
          <Col xs={24} sm={12} lg={8} key={card.label}>
            <StatCard {...card} />
          </Col>
        ))}
      </Row>

      <Card title="Recent Activities" extra={`${activities.length} events`}>
        {activities.length === 0 ? (
          <Flex justify="center" vertical align="center" gap={8}>
            <Tag style={{ padding: 12 }}>
              <ActivityIcon size={32} color="#5f5f5f" />
            </Tag>
            <Typography.Text type="secondary">No activity yet</Typography.Text>
            <Typography.Text type="secondary">
              Connect account and schedule posts to see events here.
            </Typography.Text>
          </Flex>
        ) : (
          <ListData activities={activities} />
        )}
      </Card>
    </Flex>
  );
};

export default Dashboard;
