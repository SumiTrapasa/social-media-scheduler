import { useCallback, useEffect, useMemo, useState } from "react";
import { Col, Flex, Row, Tag, Typography } from "antd";
import { Calendar, Send } from "lucide-react";
import api from "@/api/axios";
import type { Post } from "@/types";
import { API_ENDPOINTS } from "@/constants/paths";
import ComposePost from "./components/ComposePost/ComposePost";
import PostListCard from "./components/PostListCard/PostListCard";

const Scheduler: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);

  const fetchPosts = useCallback(async () => {
    try {
      const { data } = await api.get(API_ENDPOINTS.POSTS.BASE);
      setPosts(data.reverse());
    } catch (error) {
      console.error("Failed to fetch posts:", error);
    }
  }, []);

  useEffect(() => {
    fetchPosts();
    const interval = setInterval(fetchPosts, 10000);
    return () => clearInterval(interval);
  }, [fetchPosts]);

  const scheduled = useMemo(
    () => posts.filter((p) => p.status === "scheduled"),
    [posts],
  );
  const published = useMemo(
    () => posts.filter((p) => p.status === "published"),
    [posts],
  );

  return (
    <Row gutter={[16, 16]}>
      <Col xs={24} sm={24} md={24} lg={24} xl={12} xxl={8}>
        <ComposePost onSuccess={fetchPosts} />
      </Col>
      <Col xs={24} sm={24} md={24} lg={24} xl={12} xxl={16}>
        <Flex gap={16} vertical>
          <PostListCard
            title="Upcoming"
            icon={Calendar}
            posts={scheduled}
            emptyText="No scheduled posts yet"
            extra={
              <Tag>
                <Typography.Text strong>{scheduled.length}</Typography.Text>
              </Tag>
            }
          />
          <PostListCard
            title="Published"
            icon={Send}
            posts={published}
            emptyText="No published posts yet"
            className="xl:h-[500px] xl:overflow-auto"
            showStatusTag
            extra={
              <Tag>
                <Typography.Text strong>{published.length}</Typography.Text>
              </Tag>
            }
          />
        </Flex>
      </Col>
    </Row>
  );
};

export default Scheduler;
