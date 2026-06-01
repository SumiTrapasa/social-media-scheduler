import mongoose from "mongoose";

const accountSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    platform: {
      type: String,
      enum: ["twitter", "instagram", "linkedin", "facebook"],
      required: true,
    },
    handle: { type: String, required: true },
    accessToken: { type: String, required: true },
    refreshToken: { type: String, required: true },
    zernioAccountId: { type: String },
    tokenExpiresAt: { type: Date },
    status: {
      type: String,
      enum: ["connected", "disconnected"],
      default: "connected",
    },
    avatarUrl: { type: String },
  },
  { timestamps: true },
);

const Account = mongoose.model("Account", accountSchema);

export default Account;
