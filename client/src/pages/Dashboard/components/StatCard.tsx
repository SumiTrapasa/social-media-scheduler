import React from "react";
import { Card, Flex, Typography } from "antd";
import { TrendingUp, type LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: number;
  icon: LucideIcon;
  trend: string;
}

const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  icon: Icon,
  trend,
}) => {
  return (
    <Card variant="borderless">
      <Flex justify="space-between">
        <Typography.Title level={2}>{value}</Typography.Title>
        <div>
          <Typography.Text type="danger" style={{ fontSize: 12 }}>
            <Flex align="center" gap={8}>
              <TrendingUp size={16} />
              {trend}
            </Flex>
          </Typography.Text>
        </div>
      </Flex>
      <Typography.Text strong type="secondary">
        <Flex align="center" gap={8}>
          <Icon size={16} /> {label}
        </Flex>
      </Typography.Text>
    </Card>
  );
};

export default StatCard;
