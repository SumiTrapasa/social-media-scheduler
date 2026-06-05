import React from "react";
import { Flex, Typography } from "antd";

const DashboardHeader: React.FC = () => {
  // Dynamic greeting based on the current time
  const hours = new Date().getHours();
  const greeting =
    hours < 12
      ? "Good Morning! 🌞"
      : hours < 18
        ? "Good Afternoon! ☀️"
        : "Good Evening! 🌙";

  return (
    <Flex vertical>
      <Typography.Title level={2}>{greeting}</Typography.Title>
      <Typography.Text type="secondary">
        Here's what's happening with your social accounts today.
      </Typography.Text>
    </Flex>
  );
};

export default DashboardHeader;
