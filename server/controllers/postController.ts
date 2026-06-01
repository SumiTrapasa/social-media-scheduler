import { Response } from "express";
import { GoogleGenAI } from "@google/genai";
import axios from "axios";
import cloudinary from "../config/cloudinary.js";
import Generation from "../models/Generation.js";
import { AuthRequest } from "../middleware/authMiddleware.js";
import Post from "../models/posts.js";

const pollLeonardoJob = async (
  generationId: string,
  apikey: string,
): Promise<string> => {
  const maxRetries = 5;
  const delay = 5000;
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await axios.get(
        `https://cloud.leonardo.ai/api/rest/v1/generations/${generationId}`,
        {
          headers: {
            Authorization: `Bearer ${apikey}`,
            accept: "application/json",
          },
        },
      );
      const generation = response.data.generations_by_pk;
      if (generation.status === "COMPLETE") {
        if (
          generation.generated_images &&
          generation.generated_images.length > 0
        ) {
          return generation.generated_images[0].url;
        }
        throw new Error("Generation complete but no images found");
      }
      if (generation.status === "FAILED") {
        throw new Error("Image generation failed");
      }
    } catch (error) {
      console.error(`Error polling Leonardo job (attempt ${i + 1}):`, error);
    }
    await new Promise((resolve) => setTimeout(resolve, delay));
  }
  throw new Error("Max retries reached while polling Leonardo job");
};

//generate post
// POST /api/posts/generate
export const generatePost = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { prompt, tone, generateImage } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      res.status(400).json({ error: "Gemini API key not configured" });
      return;
    }

    const ai = new GoogleGenAI({ apiKey });
    const textResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Generate a social media post based on this promt: ${prompt}.
      Tone: ${tone}. 
      Include relavent hastags. 
      Format the responce as JSON woth "content" and "ImagePrompt" fields.
      The "ImagePrompt" should be a highly descriptive prompt for an image generator that complements the post.
      `,
    });

    let content = "";
    let imagePrompt = prompt;

    try {
      const rawText = textResponse.text || "";
      const jsonMatch = rawText.match(/\{[\s\S]*}/);
      const data = jsonMatch
        ? JSON.parse(jsonMatch[0])
        : { content: rawText, imagePrompt: prompt };

      content = data.content;
      imagePrompt = data.ImagePrompt;
    } catch (error) {
      content = textResponse.text || "";
      console.error("Error parsing Gemini response:", error);
    }

    let mediaUrl = "";
    if (generateImage) {
      try {
        const leonardoKey = process.env.LEONARDO_API_KEY;
        if (leonardoKey) {
          const leoResponse = await axios.post(
            "https://cloud.leonardo.ai/api/rest/v2/generations",
            {
              public: false,
              model: "gpt-image-2",
              parameters: {
                prompt: imagePrompt,
                quality: "LOW",
                Quantity: 1,
                width: 1024,
                height: 1024,
                prompt_enhance: "OFF",
              },
            },
            {
              headers: {
                Authorization: `Bearer ${leonardoKey}`,
                "Content-Type": "application/json",
                accept: "application/json",
              },
            },
          );
          const generationId = leoResponse.data.generate.generationId;
          const tempUrl = await pollLeonardoJob(generationId, leonardoKey!);

          //upload to cloudinary for persostance
          const uploadResult = await cloudinary.uploader.upload(tempUrl, {
            folder: "ai-generations",
          });
          mediaUrl = uploadResult.secure_url;
        }
      } catch (error) {
        console.error("Error generating image:", error);
      }
    }
    const generations = await Generation.create({
      user: req.user._id,
      prompt,
      tone,
      content,
      mediaUrl,
      mediaType: mediaUrl ? "image" : undefined,
    });
    res.status(200).json(generations);
  } catch (error: any) {
    res.status(500).json({ error: error?.message || "Internal Server Error" });
  }
};

//get generations
// GET /api/posts/generations
export const getGenerations = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const generations = await Generation.find({ user: req.user._id }).sort({
      createdAt: -1,
    });
    res.status(200).json(generations);
  } catch (error: any) {
    res.status(500).json({ error: error?.message || "Internal Server Error" });
  }
};

//get post
// GET /api/posts
export const getPost = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const posts = Post.find({ user: req.user._id });
    res.json(posts);
  } catch (error: any) {
    res.status(500).json({ error: error?.message || "Internal Server Error" });
  }
};

//schedules post
// POST /api/posts
export const schedulePost = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { content, platforms, scheduleFor, status } = req.body;
    let parsePlatform = platforms;
    if (typeof platforms === "string") {
      try {
        parsePlatform = JSON.parse(platforms);
      } catch (error) {
        parsePlatform = platforms.split(",");
      }
    }
    let mediaUrl = req.body.mediaUrl;
    let mediaType = req.body.mediaType;

    if (req.file) {
      const result: any = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            resource_type: "auto",
            folder: "social-scheduler",
          },
          (error, result) => {
            if (result) {
              resolve(result);
            } else {
              reject(error);
            }
          },
        );
        stream.end(req.file!.buffer);
      });
      mediaUrl = result.secure_url;
      mediaType = result.resource_type == "video" ? "video" : "image";
    }

    const post = await Post.create({
      user: req.user._id,
      content,
      mediaUrl,
      mediaType,
      platform: parsePlatform,
      scheduledFor: scheduleFor,
      status,
    });
    res.status(201).json(post);
  } catch (error: any) {
    res.status(500).json({ error: error?.message || "Internal Server Error" });
  }
};
