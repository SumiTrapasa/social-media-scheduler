//register user

import User from "../models/User.js";
import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const generateToken = (id: string): string => {
  return jwt.sign({ id }, process.env.JWT_SECRET!, {
    expiresIn: "30d",
  });
};
//POST /api/auth/register
export const registerUser = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { email, name, password } = req.body;
    const userExists = await User.findOne({ email });
    if (userExists) {
      res.status(400).json({ error: "User already exists" });
      return;
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const user = await User.create({
      email,
      name,
      password: hashedPassword,
    });
    if (user) {
      res.status(201).json({
        _id: user._id,
        email: user.email,
        name: user.name,
        tokens: generateToken(user._id.toString()),
      });
    } else {
      res.status(400).json({ error: "Invalid user data" });
    }
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

//Login user
// POST /api/auth/login
export const loginUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }
    res.status(200).json({
      _id: user._id,
      email: user.email,
      name: user.name,
      tokens: generateToken(user._id.toString()),
    });
  } catch (error) {
    console.error("Error logging in user:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
