import { Button, Flex, message, Typography } from "antd";
import { useCallback, useEffect, useMemo, useState } from "react";
import { PLATFORMS } from "@/assets/assets";
import { Plus } from "lucide-react";
import AccountList from "./components/AccountList/AccountList";
import PlatformModal from "./components/PlatformModal/PlatformModal";
import api from "@/api/axios";
import type { Account as AccountType } from "@/types";
import { API_ENDPOINTS } from "@/constants/paths";
import styles from "./Account.module.scss";

const Account: React.FC = () => {
  const [accounts, setAccounts] = useState<AccountType[]>([]);
  const [connecting, setConnecting] = useState<string | null>(null);
  const [showPlatformPicker, setShowPlatformPicker] = useState<boolean>(false);

  const fetchAccounts = useCallback(
    async (isSync = false, platform?: string | null, successMsg?: string) => {
      if (isSync) {
        const label = platform
          ? platform.charAt(0).toUpperCase() + platform.slice(1)
          : "Social Media";
        message.loading(`Syncing ${label} accounts...`);
        await api.get(API_ENDPOINTS.ACCOUNTS.SYNC);
        message.success(successMsg || `${label} accounts synced successfully`);
      }
      const { data } = await api.get(API_ENDPOINTS.ACCOUNTS.BASE);
      setAccounts(data);
    },
    [],
  );

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const connectedPlatform = params.get("connected");
    const username = params.get("username");
    const syncNeeded = params.get("sync") === "true";
    const errorMsg = params.get("error");

    window.history.replaceState({}, document.title, window.location.pathname);

    if (connectedPlatform) {
      const label =
        connectedPlatform.charAt(0).toUpperCase() + connectedPlatform.slice(1);
      const handle = username ? `(@${username})` : "";
      fetchAccounts(
        true,
        connectedPlatform,
        `Successfully connected ${label} account ${handle}`,
      );
    } else if (errorMsg) {
      message.error(`Connection failed: ${decodeURIComponent(errorMsg)}`);
      fetchAccounts();
    } else if (syncNeeded) {
      fetchAccounts(true, null, "Accounts synced successfully");
    } else {
      fetchAccounts();
    }
  }, [fetchAccounts]);

  const handleConnect = async (platformId: string) => {
    setConnecting(platformId);
    try {
      const { data } = await api.get(
        API_ENDPOINTS.ACCOUNTS.OAUTH_URL(platformId),
      );
      window.location.href = data.authUrl;
    } finally {
      setConnecting(null);
    }
  };

  const handleDisconnect = async (accountId: string) => {
    await api.delete(`${API_ENDPOINTS.ACCOUNTS.BASE}/${accountId}`);
    message.success("Account disconnected successfully");
    await fetchAccounts();
  };

  const connectedIds = useMemo(
    () => accounts.map((account) => account.platform),
    [accounts],
  );

  return (
    <Flex gap={16} vertical>
      <Flex justify="space-between" align="center">
        <Flex vertical>
          <Typography.Title level={4} className={styles.titleMargin}>
            Connected Accounts
          </Typography.Title>
          <Typography.Text type="secondary" strong>
            {accounts.length} of {PLATFORMS.length} platforms connected
          </Typography.Text>
        </Flex>
        <Button
          color="danger"
          variant="solid"
          onClick={() => setShowPlatformPicker(true)}
        >
          <Plus size={16} /> Connect Account
        </Button>
      </Flex>
      <PlatformModal
        connectedIds={connectedIds}
        connecting={connecting}
        open={showPlatformPicker}
        onClose={() => setShowPlatformPicker(false)}
        onConnect={handleConnect}
      />
      <AccountList accounts={accounts} onDisconnect={handleDisconnect} />
    </Flex>
  );
};

export default Account;
