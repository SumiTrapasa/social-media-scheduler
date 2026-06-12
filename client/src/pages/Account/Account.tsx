import { Button, Flex, message, Typography } from "antd";
import { useCallback, useEffect, useMemo, useState } from "react";
import { PLATFORMS, dummyAccountsData } from "@/assets/assets";
import { Plus } from "lucide-react";
import AccountList from "./components/AccountList/AccountList";
import PlatformModal from "./components/PlatformModal/PlatformModal";
import type { Account as AccountType } from "@/types";
import styles from "./Account.module.scss";

const Account: React.FC = () => {
  const [accounts, setAccounts] = useState<AccountType[]>([]);
  const [connecting, setConnecting] = useState<string | null>(null);
  const [showPlatformPicker, setShowPlatformPicker] = useState<boolean>(false);

  const fetchAccounts = useCallback(
    (isSync = false, platform?: string | null, successMsg?: string) => {
      if (isSync) {
        const label = platform
          ? platform.charAt(0).toUpperCase() + platform.slice(1)
          : "Social Media";
        message.success(successMsg || `${label} accounts synced successfully`);
      }
      setAccounts(dummyAccountsData);
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

  const handleConnect = (platformId: string) => {
    setConnecting(platformId);
    setTimeout(() => {
      message.success(`(Demo) Successfully connected ${platformId}!`);
      setConnecting(null);
    }, 1200);
  };

  const handleDisconnect = (accountId: string) => {
    message.success("Account disconnected successfully");
    setAccounts((prev) => prev.filter((a) => a._id !== accountId));
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
