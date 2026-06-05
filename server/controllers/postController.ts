import { Response } from "express";
import { GoogleGenAI } from "@google/genai";
import cloudinary from "../config/cloudinary.js";
import hf from "../config/huggingface.js";
import Generation from "../models/Generation.js";
import { AuthRequest } from "../middleware/authMiddleware.js";
import Post from "../models/posts.js";
import ActivityLog from "../models/activity.js";

//generate post
// POST /api/posts/generate
export const generatePost = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const { prompt, tone, generateImage } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      res.status(400).json({ error: "Gemini API key not configured" });
      return;
    }

    const ai = new GoogleGenAI({ apiKey });
    const textResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Generate a social media post based on this prompt: ${prompt}.
      Tone: ${tone}. 
      Include relevant hashtags. 
      Format the response as JSON with "content" and "ImagePrompt" fields.
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
        // Call the text-to-image API
        const responseBlob = await hf.textToImage({
          model: "black-forest-labs/FLUX.1-schnell",
          inputs: imagePrompt,
          parameters: {
            negative_prompt: "blurry, low quality, distorted",
          },
        });

        const buffer = Buffer.from(await (responseBlob as any).arrayBuffer());
        const dataUri = `data:image/png;base64,${buffer.toString("base64")}`;

        const uploadResult = await cloudinary.uploader.upload(dataUri, {
          folder: "ai-generations",
        });
        mediaUrl = uploadResult.secure_url;
        console.log("Image generated and uploaded successfully");
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        console.error(
          "Error generating image with Hugging Face:",
          errorMessage,
        );
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

    await ActivityLog.create({
      user: req.user._id,
      actionType: "AI_REPLY",
      description: `Generated AI post content with tone: ${tone}`,
      aiGeneratedText: content,
    });

    res.status(200).json(generations);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Internal Server Error";
    res.status(500).json({ error: errorMessage });
  }
};

//get generations
// GET /api/posts/generations
export const getGenerations = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    const generations = await Generation.find({ user: req.user._id }).sort({
      createdAt: -1,
    });
    console.log(generations);
    res.status(200).json(generations);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Internal Server Error";
    res.status(500).json({ error: errorMessage });
  }
};

//get post
// GET /api/posts
export const getPost = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    const posts = await Post.find({ user: req.user._id });
    res.json(posts);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Internal Server Error";
    res.status(500).json({ error: errorMessage });
  }
};

//schedules post
// POST /api/posts
export const schedulePost = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const { content, platforms, scheduledFor, status } = req.body;
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
      const result: { secure_url: string; resource_type: string } =
        await new Promise((resolve, reject) => {
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
      platforms: Array.isArray(parsePlatform) ? parsePlatform : [parsePlatform],
      scheduledFor,
      status,
    });

    await ActivityLog.create({
      user: req.user._id,
      actionType: "POST_SCHEDULED",
      description: `Scheduled a new post for ${new Date(scheduledFor).toLocaleString()}`,
      relatedPost: post._id,
    });

    res.status(201).json(post);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Internal Server Error";
    res.status(500).json({ error: errorMessage });
  }
};
