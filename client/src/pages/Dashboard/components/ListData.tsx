import { useMemo, useState } from "react";
import { Avatar, Tag, Button, List, Typography } from "antd";
import { SendIcon, CalendarIcon, Wand2Icon, ActivityIcon } from "lucide-react";
import type { Activity } from "@/types";

const INITIAL_PAGE_SIZE = 5;

const ListData = ({ activities }: { activities: Activity[] }) => {
  const [displayCount, setDisplayCount] = useState(INITIAL_PAGE_SIZE);

  // Since activities are passed from the parent, we handle pagination locally.
  const visibleActivities = useMemo(
    () => activities.slice(0, displayCount),
    [activities, displayCount],
  );

  const hasMore = displayCount < activities.length;

  const onLoadMore = () => {
    setDisplayCount((prev) => prev + INITIAL_PAGE_SIZE);
  };

  const loadMore = hasMore ? (
    <div
      style={{
        textAlign: "center",
        marginTop: 12,
        height: 32,
        lineHeight: "32px",
      }}
    >
      <Button type="text" onClick={onLoadMore}>
        See more
      </Button>
    </div>
  ) : null;

  const getActivityConfig = (type: Activity["actionType"]) => {
    switch (type) {
      case "POST_PUBLISHED":
        return {
          icon: <SendIcon size={14} />,
          color: "success",
          label: "Published Post",
        };
      case "AI_REPLY":
        return {
          icon: <Wand2Icon size={14} />,
          color: "processing",
          label: "AI Generated Post",
        };
      case "POST_SCHEDULED":
        return {
          icon: <CalendarIcon size={14} />,
          color: "warning",
          label: "Scheduled Post",
        };
      default:
        return {
          icon: <ActivityIcon size={14} />,
          color: "default",
          label: "Activity",
        };
    }
  };

  return (
    <List
      itemLayout="horizontal"
      loadMore={loadMore}
      dataSource={visibleActivities}
      renderItem={(item) => {
        const config = getActivityConfig(item.actionType);
        return (
          <List.Item
            actions={[
              <Typography.Text
                type="secondary"
                style={{ fontSize: 12 }}
                key="date"
              >
                {new Date(item.createdAt).toLocaleString()}
              </Typography.Text>,
            ]}
          >
            <List.Item.Meta
              avatar={<Avatar icon={config.icon} />}
              title={<Tag color={config.color}>{config.label}</Tag>}
              description={item.description}
            />
          </List.Item>
        );
      }}
    />
  );
};

export default ListData;
