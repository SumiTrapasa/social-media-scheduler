import { Request, Response } from "express";
import zernio from "../config/zernio.js";
import User from "../models/User.js";
import Account from "../models/account.js";
import { AuthRequest } from "../middleware/authMiddleware.js";

const getOrCraeteZernioProfile = async (user: any): Promise<string> => {
  // Logic to get or create Zernio profile and return profile ID
  try {
    const result = await zernio.profiles.listProfiles();
    const data = result.data;
    const profiles = Array.isArray(data)
      ? data
      : data?.profiles || data?.data || [];
    if (profiles.length > 0) {
      const pid = profiles[0]._id || profiles[0].id;
      await User.findByIdAndUpdate(user._id, { zernioProfileId: pid });
      return pid;
    } else {
    }
    const createResult = await zernio.profiles.createProfile({
      body: {
        name: `${user.name || user.email}'s workspace`,
      },
    });
    const created = createResult.data?.profile || createResult.data;
    const pid = created._id || created.id;
    if (!pid) {
      throw new Error(
        "Failed to create Zernio profile: No profile ID returned",
      );
    }
    await User.findByIdAndUpdate(user._id, { zernioProfileId: pid });
    return pid;
  } catch (error) {
    console.error("Error getting or creating Zernio profile:", error);
    throw error;
  }
};

//generate OAuth URL
// GET /api/auth/:platform
export const getOAuthURL = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { platform } = req.params;
    const profileId = await getOrCraeteZernioProfile(req.user);
    const origin = req.headers.origin;
    const redirectUri = `${origin}/accounts`;
    const results = await zernio.connect.getConnectUrl({
      path: { platform: platform },
      query: {
        profileId,
        redirectUri: redirectUri,
      },
    });
    const data = results.data;
    console.log("Zernio Connect URL Response:", JSON.stringify(data, null, 2));

    const authUrl = data.authUrl;

    if (!authUrl) {
      throw new Error("Failed to get auth URL from Zernio response");
    }

    res.status(200).json({ authUrl });
  } catch (error) {
    console.error("Error generating OAuth URL:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

//sync connected accounts with mongodb
//GET /api/auth/sync
export const syncAccounts = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const profileId = await getOrCraeteZernioProfile(req.user);
    const result = await zernio.accounts.listAccounts({ query: { profileId } });

    const data = result.data;
    const zernioAccounts = data?.accounts || Array.isArray(data) ? data : [];
    const supportedPlatforms = ["twitter", "instagram", "linkedin", "facebook"];
    const syncedAccounts = [];

    for (const acc of zernioAccounts) {
      const zid = acc._id || acc.id;
      if (!zid) {
        console.warn("Skipping account with missing ID:", acc);
        continue;
      }
      const rawPlatform = (acc.platform || acc.type || "").toLowerCase();
      const normalizedPlatform = supportedPlatforms.find((p) =>
        rawPlatform.includes(p),
      );
      if (!normalizedPlatform) {
        console.log("Skipping unsupported platform account:", rawPlatform);
        continue;
      }

      const account = await Account.findOneAndUpdate(
        { zernioAccountId: zid },
        {
          user: req.user._id,
          platform: normalizedPlatform,
          handle: acc.username || acc.name || acc.handle || "unknown",
          zernioAccountId: zid,
          avatarUrl: acc.avatarUrl || acc.picture || acc.profile_image_url,
          status: "connected",
        },
        { upsert: true, returnDocument: "after" },
      );
      syncedAccounts.push(account);
    }
    res.status(200).json({ accounts: syncedAccounts });
  } catch (error) {
    console.error("Error syncing accounts:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
