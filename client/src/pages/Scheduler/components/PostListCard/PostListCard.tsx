import React from "react";
import { Card, Flex, List, Tag, Typography } from "antd";
import { PLATFORMS } from "@/assets/assets";
import type { Post } from "@/types";
import styles from "./PostListCard.module.scss";

interface PostListCardProps {
  title: string;
  icon: React.ElementType;
  posts: Post[];
  emptyText: string;
  extra?: React.ReactNode;
  className?: string;
  showStatusTag?: boolean;
}

const PostListCard: React.FC<PostListCardProps> = ({
  title,
  icon: Icon,
  posts,
  emptyText,
  extra,
  className,
  showStatusTag = false,
}) => {
  return (
    <Card
      title={
        <Flex align="center" gap={8}>
          <Icon size={20} />
          <Typography.Text className={styles.publishStatusText}>
            {title}
          </Typography.Text>
        </Flex>
      }
      extra={extra}
      className={className}
    >
      {posts.length === 0 ? (
        <Flex justify="center">
          <Typography.Text type="secondary">{emptyText}</Typography.Text>
        </Flex>
      ) : (
        <List
          dataSource={posts}
          renderItem={(post) => (
            <List.Item>
              <List.Item.Meta
                description={
                  <>
                    <Flex
                      justify="space-between"
                      align="center"
                      className={styles.scheduleDetailsMargin}
                    >
                      <Flex gap={4}>
                        {PLATFORMS.filter((p) =>
                          post.platforms.includes(p.id),
                        ).map((p) => (
                          <p.icon key={p.id} size={16} />
                        ))}
                      </Flex>
                      <Flex gap={8} align="center">
                        {post.mediaType && (
                          <Tag>
                            <Typography.Text strong className="capitalize">
                              {post.mediaType}
                            </Typography.Text>
                          </Tag>
                        )}
                        <Typography.Text
                          type="secondary"
                          className={styles.smallFontSize}
                        >
                          {new Date(post.scheduledFor).toLocaleString()}
                        </Typography.Text>
                        {showStatusTag && <Tag color="success">Published</Tag>}
                      </Flex>
                    </Flex>
                    <Typography.Paragraph
                      ellipsis={{ rows: 2 }}
                      type="secondary"
                      style={{ fontSize: 14 }}
                    >
                      {post.content}
                    </Typography.Paragraph>
                  </>
                }
              />
            </List.Item>
          )}
        />
      )}
    </Card>
  );
};

export default PostListCard;
