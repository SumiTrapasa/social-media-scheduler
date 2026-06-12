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
import { PLATFORMS } from "@/assets/assets";
import styles from "./ComposePost.module.scss";

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
    // Demo mode: assume all platforms are connected
    setConnectedPlatforms(["twitter", "linkedin", "facebook", "instagram"]);
  }, []);

  const togglePlatform = (platformId: string) => {
    setSelectedPlatforms((prev) =>
      prev.includes(platformId)
        ? prev.filter((id) => id !== platformId)
        : [...prev, platformId],
    );
  };

  const handleSchedule = async () => {
    if (selectedPlatforms.length === 0) {
      message.error("Please select at least one platform");
      return;
    }
    if (selectedPlatforms.includes("instagram") && !mediaFile) {
      message.error("Instagram requires an image or video. Please upload one.");
      return;
    }

    setLoading(true);
    try {
      // Simulate API success
      await new Promise((resolve) => setTimeout(resolve, 1000));
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
