import { Button, Card, Flex, Image, Tag, Typography } from "antd";
import type { Generation } from "@/types";
import styles from "./GenerationCard.module.scss";

interface GenerationCardProps {
  generation: Generation;
  onSchedule: (gen: Generation) => void;
}

const GenerationCard = ({ generation, onSchedule }: GenerationCardProps) => {
  return (
    <Card className={styles.card}>
      <Flex
        vertical
        gap={16}
        justify="space-between"
        className={styles.flexContainer}
      >
        <Flex justify="space-between">
          <Typography.Text type="secondary">
            {new Date(generation.createdAt).toLocaleDateString()}
          </Typography.Text>
          <Tag color="error">{generation.tone}</Tag>
        </Flex>

        <Typography.Paragraph ellipsis={{ rows: generation.mediaUrl ? 3 : 6 }}>
          {generation.content}
        </Typography.Paragraph>

        {generation.mediaUrl && (
          <Image
            src={generation.mediaUrl}
            alt="Image"
            className={styles.generationImage}
          />
        )}

        <Button
          className={styles.scheduleButton}
          variant="filled"
          color="default"
          block
          onClick={() => onSchedule(generation)}
        >
          Schedule Post
        </Button>
      </Flex>
    </Card>
  );
};

export default GenerationCard;
