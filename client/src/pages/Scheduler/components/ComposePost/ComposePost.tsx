import React, { useState, useEffect } from "react";
import {
  Button,
  Card,
  Col,
  DatePicker,
  Flex,
  Form,
  Input,
  message,
  Row,
  Tag,
  TimePicker,
  Typography,
  Upload,
} from "antd";
import { InboxOutlined } from "@ant-design/icons";
import { XIcon } from "lucide-react";
import type { Dayjs } from "dayjs";
import { PLATFORMS } from "@/assets/assets";
import api from "@/api/axios";
import { API_ENDPOINTS } from "@/constants/paths";
import styles from "./ComposePost.module.scss";
import type { Account } from "@/types";

interface ComposePostProps {
  onSuccess: () => void;
  className?: string;
}

const ComposePost: React.FC<ComposePostProps> = ({ onSuccess, className }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [contentLength, setContentLength] = useState(0);
  const [connectedPlatforms, setConnectedPlatforms] = useState<string[]>([]);

  useEffect(() => {
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
  }, []);

  const togglePlatform = (platformId: string) => {
    setSelectedPlatforms((prev) =>
      prev.includes(platformId)
        ? prev.filter((id) => id !== platformId)
        : [...prev, platformId],
    );
  };

  const handleSchedule = async (values: {
    content: string;
    date: Dayjs;
    time: Dayjs;
  }) => {
    if (selectedPlatforms.length === 0) {
      message.error("Please select at least one platform");
      return;
    }
    if (selectedPlatforms.includes("instagram") && !mediaFile) {
      message.error("Instagram requires an image or video. Please upload one.");
      return;
    }

    const scheduleFor = values.date
      .hour(values.time.hour())
      .minute(values.time.minute())
      .toISOString();

    const formData = new FormData();
    formData.append("content", values.content);
    formData.append("scheduledFor", scheduleFor);
    formData.append("status", "scheduled");
    formData.append("platforms", JSON.stringify(selectedPlatforms));
    if (mediaFile) {
      formData.append("media", mediaFile);
    }

    setLoading(true);
    try {
      await api.post(API_ENDPOINTS.POSTS.BASE, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      message.success("Post scheduled successfully");
      form.resetFields();
      setSelectedPlatforms([]);
      setMediaFile(null);
      setContentLength(0);
      onSuccess();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title="Compose Post" className={className}>
      <Form
        form={form}
        layout="vertical"
        variant="filled"
        onFinish={handleSchedule}
      >
        <Form.Item
          label={
            <Typography.Text strong type="secondary">
              PLATFORMS
            </Typography.Text>
          }
        >
          <Flex gap={16}>
            {PLATFORMS.map((platform) => {
              const active = selectedPlatforms.includes(platform.id);
              const isConnected = connectedPlatforms.includes(platform.id);
              return (
                <Tag
                  variant={active ? "solid" : "filled"}
                  key={platform.id}
                  color={active ? "error" : "#5f5f5f"}
                  className={styles.platformTag}
                  style={{
                    opacity: isConnected ? 1 : 0.4,
                    cursor: isConnected ? "pointer" : "not-allowed",
                    filter: isConnected ? "none" : "grayscale(1)",
                    pointerEvents: isConnected ? "auto" : "all", // allow click to be caught but handled by logic
                  }}
                  onClick={() =>
                    isConnected
                      ? togglePlatform(platform.id)
                      : message.warning(`${platform.name} is not connected`)
                  }
                >
                  <platform.icon size={20} className={styles.iconFontSize} />
                </Tag>
              );
            })}
          </Flex>
        </Form.Item>

        <Form.Item
          name="content"
          label={
            <Typography.Text strong type="secondary">
              CONTENT
            </Typography.Text>
          }
          rules={[{ required: true, message: "Please enter content!" }]}
        >
          <Input.TextArea
            rows={4}
            placeholder="What you want to share today?"
            maxLength={280}
            onChange={(e) => setContentLength(e.target.value.length)}
          />
        </Form.Item>
        <Flex justify="flex-end" style={{ marginTop: -20, marginBottom: 10 }}>
          <Typography.Text
            type="secondary"
            strong
            className={styles.smallFontSize}
          >
            {contentLength}/280
          </Typography.Text>
        </Flex>

        <Form.Item
          label={
            <Typography.Text strong type="secondary">
              MEDIA
            </Typography.Text>
          }
        >
          {mediaFile ? (
            <div className={styles.uploadArea}>
              <img
                src={URL.createObjectURL(mediaFile)}
                alt="preview"
                className={styles.imagePreview}
              />
              <Button
                type="primary"
                shape="circle"
                danger
                icon={<XIcon size={16} />}
                size="small"
                onClick={() => setMediaFile(null)}
                className={styles.removeButton}
              />
            </div>
          ) : (
            <Upload.Dragger
              accept="image/*,video/*"
              multiple={false}
              beforeUpload={(file) => {
                setMediaFile(file);
                return false;
              }}
              showUploadList={false}
            >
              <p className="ant-upload-drag-icon">
                <InboxOutlined style={{ color: "#ff4d4f" }} />
              </p>
              <p className="ant-upload-text">Click or drag file to upload</p>
            </Upload.Dragger>
          )}
        </Form.Item>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="date" label="DATE" rules={[{ required: true }]}>
              <DatePicker className={styles.fullWidth} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="time" label="TIME" rules={[{ required: true }]}>
              <TimePicker className={styles.fullWidth} />
            </Form.Item>
          </Col>
        </Row>

        <Button
          color="danger"
          variant="solid"
          className={styles.fullWidth}
          htmlType="submit"
          loading={loading}
        >
          {loading ? "Scheduling..." : "Schedule"}
        </Button>
      </Form>
    </Card>
  );
};

export default ComposePost;
