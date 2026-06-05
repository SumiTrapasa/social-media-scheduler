import {
  Button,
  Card,
  DatePicker,
  Flex,
  Image,
  message,
  Modal,
  Tag,
  TimePicker,
  Typography,
} from "antd";
import { PLATFORMS } from "@/assets/assets";
import { useState, useEffect } from "react";
import { TimerIcon } from "lucide-react";
import api from "@/api/axios";
import type { Dayjs } from "dayjs";
import type { Account, Generation } from "@/types";
import { API_ENDPOINTS } from "@/constants/paths";
import styles from "./ScheduleModal.module.scss";

interface ScheduleModalProps {
  open: boolean;
  onClose: () => void;
  gen: Generation | null;
}

const ScheduleModal = ({ open, onClose, gen }: ScheduleModalProps) => {
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [scheduleDate, setScheduleDate] = useState<Dayjs | null>(null);
  const [scheduleTime, setScheduleTime] = useState<Dayjs | null>(null);
  const [scheduling, setScheduling] = useState(false);
  const [connectedPlatforms, setConnectedPlatforms] = useState<string[]>([]);

  useEffect(() => {
    if (open) {
      const fetchConnected = async () => {
        try {
          const { data } = await api.get(API_ENDPOINTS.ACCOUNTS.BASE);
          const connected = data
            .filter((acc: Account) => acc.status === "connected")
            .map((acc: Account) => acc.platform);
          setConnectedPlatforms(connected);
        } catch (error) {
          console.error("Failed to fetch connected accounts", error);
        }
      };
      fetchConnected();
    } else {
      setSelectedPlatforms([]);
      setScheduleDate(null);
      setScheduleTime(null);
    }
  }, [open]);

  if (!open || !gen) {
    return null;
  }

  const togglePlatform = (platformId: string) => {
    setSelectedPlatforms((prev) => {
      if (prev.includes(platformId)) {
        return prev.filter((id) => id !== platformId);
      } else {
        return [...prev, platformId];
      }
    });
  };

  const handleSchedule = async () => {
    if (!gen) return;
    if (selectedPlatforms.length === 0) {
      message.error("Please select at least one platform");
      return;
    }
    if (!scheduleDate || !scheduleTime) {
      message.error("Please select a date and time");
      return;
    }
    const scheduleFor = scheduleDate
      .hour(scheduleTime.hour())
      .minute(scheduleTime.minute())
      .toISOString();

    setScheduling(true);
    try {
      await api.post(API_ENDPOINTS.POSTS.BASE, {
        content: gen.content,
        mediaUrl: gen.mediaUrl,
        mediaType: gen.mediaType,
        scheduledFor: scheduleFor,
        platforms: JSON.stringify(selectedPlatforms),
        status: "scheduled",
      });
      message.success("AI Post scheduled successfully");
      onClose();
    } finally {
      setScheduling(false);
    }
  };

  return (
    <Modal
      title={
        <Typography.Title level={5} className={styles.modalTitle}>
          Schedule Generation
        </Typography.Title>
      }
      centered
      closable
      width={800}
      open={open}
      footer={null}
      onCancel={onClose}
    >
      <Flex vertical gap={16}>
        <Flex vertical gap={16} className={styles.previewContainer}>
          <Card title={gen.prompt} type="inner" />
          <Card type="inner">
            <Typography.Paragraph className={styles.contentText}>
              {gen.content}
            </Typography.Paragraph>
            {gen.mediaUrl && <Image src={gen.mediaUrl} alt="Image" />}
          </Card>
        </Flex>
        <Flex vertical gap={16}>
          <Typography.Text strong type="secondary">
            SELECT CHANNELS
          </Typography.Text>
          <Flex gap={16}>
            {PLATFORMS.map((platform) => {
              const active = selectedPlatforms.includes(platform.id);
              const isConnected = connectedPlatforms.includes(platform.id);
              return (
                <Tag
                  variant={!active ? "filled" : "solid"}
                  color={active ? "error" : "default"}
                  className={`${styles.platformTag} ${!active ? styles.platformTagInactive : ""}`}
                  style={{
                    opacity: isConnected ? 1 : 0.4,
                    cursor: isConnected ? "pointer" : "not-allowed",
                    filter: isConnected ? "none" : "grayscale(1)",
                  }}
                  onClick={() => isConnected && togglePlatform(platform.id)}
                >
                  <platform.icon size={24} className={styles.iconFontSize} />
                </Tag>
              );
            })}
          </Flex>
          <Flex gap={16}>
            <DatePicker
              className={styles.halfWidth}
              value={scheduleDate}
              size="large"
              onChange={(date) => setScheduleDate(date)}
            />
            <TimePicker
              className={styles.halfWidth}
              value={scheduleTime}
              size="large"
              onChange={(date) => setScheduleTime(date)}
            />
          </Flex>
          <Button
            size="large"
            variant="solid"
            color="danger"
            block
            icon={<TimerIcon />}
            loading={scheduling}
            onClick={handleSchedule}
          >
            Schedule Post
          </Button>
        </Flex>
      </Flex>
    </Modal>
  );
};

export default ScheduleModal;
