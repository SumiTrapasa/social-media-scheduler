import "dotenv/config";
import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import connectDB from "./config/db.js";
import dns from "dns";
import authRouter from "./routes/authRouter.js";
import socialAuthRouter from "./routes/socialAuthRoute.js";
import accountRouter from "./routes/accountRoute.js";
import postRouter from "./routes/postRoute.js";
import activityRouter from "./routes/activityRoute.js";
import { initScheduler } from "./services/schedulerService.js";

dns.setServers(["1.1.1.1", "8.8.8.8"]);

const app = express();

//database connection
await connectDB();

// Middleware
app.use(cors());
app.use(express.json());

const port = process.env.PORT || 3000;

app.get("/", (_req: Request, res: Response) => {
  res.send("Server is Live!");
});

app.use("/api/auth", authRouter);
app.use("/api/oauth", socialAuthRouter);
app.use("/api/accounts", accountRouter);
app.use("/api/posts", postRouter);
app.use("/api/activity", activityRouter);

//initialised scheduler
initScheduler();

//global error handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  res.status(500).send(err?.message || "Internal Server Error");
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
