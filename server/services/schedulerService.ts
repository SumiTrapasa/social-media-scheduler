import cron from "node-cron";
import Post from "../models/posts.js";
import Account from "../models/account.js";
import { platform } from "node:os";
import zernio from "../config/zernio.js";
import ActivityLog from "../models/activity.js";

export const initScheduler = () => {
  cron.schedule("* * * * *", async () => {
    try {
      const now = new Date();
      const postsToPublish = await Post.find({
        scheduledFor: { $lte: now },
        status: "scheduled",
      });

      for (const post of postsToPublish) {
        try {
          const accounts = await Account.find({
            user: post.user,
            platform: post.platform,
            status: "connected",
            zernioAccountId: { $exists: true },
          });

          if (accounts.length === 0) {
            console.log(
              `no connected zernio accounts found for post ${post._id}`,
            );
            continue;
          }

          const zernioPlatforms = accounts.map((acc) => ({
            platform: acc.platform,
            accountId: acc.zernioAccountId!,
          }));
          const payload = {
            content: post.content,
            publishNow: true,
            ...(post.mediaUrl && {
              mediaItems: [
                { type: post.mediaType || "image", url: post.mediaUrl },
              ],
            }),
            platforms: zernioPlatforms,
          };

          console.log(
            `publishing post ${post._id} to zernio with media: ${post.mediaUrl || "none"}`,
          );

          const response = await zernio.posts.createPost({ body: payload });
          const publishPost = (response.data as any)?.post || response.data;

          if (!publishPost) {
            throw new Error("Failed to get post from Zernio response");
          }

          console.log(`Post ${post._id} published successfully to Zernio`);

          post.status = "published";
          await post.save();

          await ActivityLog.create({
            user: post.user,
            actionType: "POST_PUBLISHED",
            description: `published post to ${accounts.map((acc) => acc.platform).join(",")}`,
            relatedPost: post._id,
          });
        } catch (error: any) {
          console.error(
            `Error processing post ${post._id}:`,
            error?.response?.data || error?.message || error,
          );
          post.status = "failed";
          await post.save();
        }
      }
      if (postsToPublish.length > 0) {
        console.log(
          `Published ${postsToPublish.length} posts at ${now.toISOString()} `,
        );
      }
    } catch (error) {
      console.error("Scheduler error:", error);
    }
  });
  console.log("Scheduler started");
};
