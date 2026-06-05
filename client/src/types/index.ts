import React from "react";

export interface User {
  _id: string;
  name: string;
  email: string;
}

export interface Platform {
  id: string;
  name: string;
  icon: React.ElementType;
  description: string;
}

export type PostStatus = "scheduled" | "published" | "failed";
export type MediaType = "image" | "video";

export interface Post {
  _id: string;
  user: string;
  content: string;
  platforms: string[];
  mediaUrl?: string;
  mediaType?: MediaType;
  scheduledFor: string;
  status: PostStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Generation {
  _id: string;
  id?: string;
  user: string;
  prompt: string;
  content: string;
  mediaUrl?: string;
  mediaType?: MediaType;
  tone: string;
  createdAt: string;
  updatedAt: string;
}

export interface Account {
  _id: string;
  user: string;
  handle: string;
  platform: string;
  status: "connected" | "disconnected";
  zernioAccountId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Activity {
  _id: string;
  user: string;
  actionType: "POST_PUBLISHED" | "AI_REPLY" | "POST_SCHEDULED";
  description: string;
  relatedPost?: {
    _id: string;
    content: string;
  } | null;
  createdAt: string;
  updatedAt: string;
}
