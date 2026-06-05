import {
  Button,
  Card,
  Col,
  Flex,
  Modal,
  Row,
  Tag,
  Tooltip,
  Typography,
} from "antd";
import { PLATFORMS } from "@/assets/assets";
import { AlertCircleIcon, CheckCircleIcon, Plus, Unplug } from "lucide-react";
import { ExclamationCircleFilled } from "@ant-design/icons";
import type { Account } from "@/types";
import styles from "./AccountList.module.scss";

const PLATFORM_MAP = Object.fromEntries(PLATFORMS.map((p) => [p.id, p]));

interface AccountListProps {
  accounts: Account[];
  onDisconnect: (accountId: string) => void;
}

const AccountList = ({ accounts, onDisconnect }: AccountListProps) => {
  const showDeleteConfirm = async (accountId: string) => {
    Modal.confirm({
      content: "Are you sure you want to disconnect this account?",
      icon: <ExclamationCircleFilled />,
      okText: "Yes",
      okType: "danger",
      cancelText: "No",
      async onOk() {
        await onDisconnect(accountId);
      },
    });
  };

  if (accounts.length === 0) {
    return (
      <Card>
        <Flex justify="center" vertical align="center" gap={8}>
          <Tag className={styles.emptyStateTag}>
            <Plus size={32} className={styles.emptyStateIcon} />
          </Tag>
          <Typography.Title level={5}>No accounts connected</Typography.Title>
          <Typography.Text type="secondary" className={styles.emptyStateText}>
            connect your first social platform to start scheduling and
            automating your content.
          </Typography.Text>
        </Flex>
      </Card>
    );
  }
  return (
    <Row gutter={16}>
      {accounts.map((account) => {
        const meta = PLATFORM_MAP[account.platform];
        if (!meta) return null;
        return (
          <Col xs={24} sm={12} md={12} lg={12} xl={8} key={account._id}>
            <Card>
              <Flex align="center" justify="space-between" gap={8}>
                <Flex align="center" gap={16}>
                  <meta.icon size={32} className={styles.iconFontSize} />
                  <Flex vertical>
                    <Typography.Text strong>{account.handle}</Typography.Text>
                    <Typography.Text strong type="secondary">
                      {meta.name}
                    </Typography.Text>
                  </Flex>
                </Flex>
                {account.status === "connected" ? (
                  <Typography.Text
                    strong
                    type="success"
                    className={styles.statusTextSmall}
                  >
                    <Flex align="center" gap={4}>
                      <CheckCircleIcon size={16} />
                      Connected
                    </Flex>
                  </Typography.Text>
                ) : (
                  <Typography.Text
                    strong
                    type="danger"
                    className={styles.statusTextSmall}
                  >
                    <Flex align="center" gap={4}>
                      <AlertCircleIcon size={16} />
                      Disconnected
                    </Flex>
                  </Typography.Text>
                )}
                {account.status === "connected" && (
                  <Tooltip title="Disconnect">
                    <Button
                      onClick={() => showDeleteConfirm(account._id)}
                      className={styles.cursorPointer}
                      type="text"
                      icon={<Unplug size={16} />}
                    />
                  </Tooltip>
                )}
              </Flex>
            </Card>
          </Col>
        );
      })}
    </Row>
  );
};

export default AccountList;
