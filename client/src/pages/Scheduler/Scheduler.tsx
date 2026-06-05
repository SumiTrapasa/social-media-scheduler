import { useEffect, useMemo, useState } from "react";
import { Col, Flex, Row, Tag, Typography } from "antd";
import { Calendar, Send } from "lucide-react";
import type { Post } from "@/types";
import { dummyPostsData } from "@/assets/assets";
import ComposePost from "./components/ComposePost/ComposePost";
import PostListCard from "./components/PostListCard/PostListCard";

const Scheduler: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);

  const fetchPosts = () => {
    setPosts([...dummyPostsData].reverse());
  };

  useEffect(() => {
    fetchPosts();
  }, []);

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
