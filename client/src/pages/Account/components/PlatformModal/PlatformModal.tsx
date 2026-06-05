import { Card, Flex, Modal, Typography } from "antd";
import { CheckCircleIcon, ExternalLinkIcon } from "lucide-react";
import { PLATFORMS } from "@/assets/assets";
import { LoadingOutlined } from "@ant-design/icons";
import styles from "./PlatformModal.module.scss";

interface PlatformModalProps {
  connectedIds: string[];
  connecting: string | null;
  onClose: () => void;
  open: boolean;
  onConnect: (platformId: string) => void;
}

const PlatformModal = ({
  connectedIds,
  connecting,
  onClose,
  open,
  onConnect,
}: PlatformModalProps) => {
  return (
    <Modal
      title="Choose a Platform"
      centered
      closable
      open={open}
      footer={null}
      onCancel={onClose}
    >
      <Flex vertical gap={16}>
        {PLATFORMS.map((platform) => {
          const isConnected = connectedIds.includes(platform.id);
          const isConnecting = connecting === platform.id;
          return (
            <Card
              onClick={() =>
                !isConnected && !isConnecting && onConnect(platform.id)
              }
              className={`${styles.card} ${isConnected ? styles.cardConnected : ""}`}
              key={platform.id}
            >
              <Flex justify="space-between" align="center">
                <Flex align="center" gap={16}>
                  <platform.icon size={30} className={styles.iconFontSize} />
                  <Flex vertical>
                    <Typography.Text strong>{platform.name}</Typography.Text>
                    {isConnected ? (
                      <Typography.Text strong type="secondary">
                        Connected
                      </Typography.Text>
                    ) : (
                      <Typography.Text type="secondary">
                        {platform.description}
                      </Typography.Text>
                    )}
                  </Flex>
                </Flex>
                {isConnected && <CheckCircleIcon size={16} />}
                {isConnecting && (
                  <LoadingOutlined className={styles.loadingIcon} />
                )}
                {!isConnected && !isConnecting && (
                  <ExternalLinkIcon size={16} />
                )}
              </Flex>
            </Card>
          );
        })}
      </Flex>
    </Modal>
  );
};

export default PlatformModal;
