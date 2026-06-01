import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      throw new Error(
        "MONGODB_URI is not defined in the environment variables",
      );
    }

    mongoose.connection.on("connected", async () => {
      console.log("Connected to MongoDB");
    });

    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds
      family: 4, // Force IPv4 to resolve common DNS resolution issues
    });
  } catch (error: any) {
    if (error.code === "ECONNREFUSED" && error.syscall === "querySrv") {
      console.error(
        "DNS SRV Error: Your network cannot resolve MongoDB SRV records.",
      );
      console.error(
        "FIX: Switch your connection string in Atlas to 'Node.js 2.2.12 or earlier' (Standard Connection String).",
      );
    } else {
      console.error(
        "Failed to connect to MongoDB. Check IP whitelist (current: 0.0.0.0/0) and network access.",
      );
    }
    console.error("Detailed Error:", error);
    process.exit(1);
  }
};

export default connectDB;
