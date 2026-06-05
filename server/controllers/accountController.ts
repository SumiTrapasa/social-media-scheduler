//GET all accounts

import zernio from "../config/zernio.js";
import { AuthRequest } from "../middleware/authMiddleware.js";
import Account from "../models/account.js";
import { Response } from "express";

// GET /api/accounts
export const getAccounts = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    const accounts = await Account.find({ user: req.user._id });
    res.json(accounts);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Internal Server Error";
    res.status(500).json({ error: errorMessage });
  }
};

//add account
// POST /api/accounts
export const addAccount = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    const { platform, handle, avatarUrl } = req.body;
    const account = await Account.create({
      user: req.user._id,
      platform,
      handle,
      avatarUrl,
    });
    res.status(201).json(account);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Internal Server Error";
    res.status(500).json({ error: errorMessage });
  }
};

//Disconnect account
// DELETE /api/accounts/:id
export const disconnectAccount = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    const account = await Account.findOne({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!account) {
      res.status(404).json({ error: "Account not found" });
      return;
    }
    if (account.zernioAccountId) {
      try {
        await zernio.accounts.deleteAccount({
          path: { accountId: account.zernioAccountId },
        });
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Internal Server Error";
        res.status(500).json({ error: errorMessage });
      }
    }
    await account.deleteOne();
    res.json({ message: "Account deleted successfully" });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Internal Server Error";
    res.status(500).json({ error: errorMessage });
  }
};
