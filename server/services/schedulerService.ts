import cron from "node-cron";
import Post from "../models/posts.js";
import Account from "../models/account.js";
import zernio from "../config/zernio.js";
import ActivityLog from "../models/activity.js";

interface PublishPostResponse {
  post?: Record<string, unknown>;
}

interface ErrorResponse {
  response?: {
    data?: Record<string, unknown>;
  };
  message?: string;
}

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
            platform: { $in: post.platforms },
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
          const publishPost =
            (response.data as PublishPostResponse)?.post || response.data;

          if (!publishPost) {
            throw new Error("Failed to get post from Zernio response");
          }

          console.log(`Post ${post._id} published successfully to Zernio`);

          post.status = "published";
          await post.save();

          await ActivityLog.create({
            user: post.user,
            actionType: "POST_PUBLISHED",
            description: `Published post to ${accounts.map((acc) => acc.platform).join(",")}`,
            relatedPost: post._id,
          });
        } catch (error) {
          const err = error as ErrorResponse;
          console.error(
            `Error processing post ${post._id}:`,
            err?.response?.data || err?.message || error,
          );
          post.status = "failed";
          await post.save();
        }
      }
      if (postsToPublish.length > 0) {
        console.log(
          `Evaluated ${postsToPublish.length} posts at ${now.toISOString()} `,
        );
      }
    } catch (error) {
      console.error("Scheduler error:", error);
    }
  });
  console.log("Scheduler started");
};
