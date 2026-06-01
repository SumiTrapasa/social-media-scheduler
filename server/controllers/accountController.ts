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
    const accounts = await Account.find({ user: req.user._id });
    res.json(accounts);
  } catch (error: any) {
    res.status(500).json({ error: error?.message || "Internal Server Error" });
  }
};

//add account
// POST /api/accounts
export const addAccount = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { platform, handle, avatarUrl } = req.body;
    const account = await Account.create({
      user: req.user._id,
      platform,
      handle,
      avatarUrl,
    });
    res.status(201).json(account);
  } catch (error: any) {
    res.status(500).json({ error: error?.message || "Internal Server Error" });
  }
};

//Disconnect account
// DELETE /api/accounts/:id
export const disconnectAccount = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
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
      } catch (error: any) {
        res
          .status(500)
          .json({ error: error?.message || "Internal Server Error" });
      }
    }
    await account.deleteOne();
    res.json({ message: "Account deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ error: error?.message || "Internal Server Error" });
  }
};
