export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  DASHBOARD: "/dashboard",
  ACCOUNT: "/account",
  AI_COMPOSER: "/ai-composer",
  SCHEDULER: "/scheduler",
} as const;

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: "/api/auth/login",
    REGISTER: "/api/auth/register",
  },
  POSTS: {
    BASE: "/api/posts",
    GENERATE: "/api/posts/generate",
    GENERATIONS: "/api/posts/generations",
  },
  ACCOUNTS: {
    BASE: "/api/accounts",
    SYNC: "/api/oauth/sync",
    OAUTH_URL: (platform: string) => `/api/oauth/${platform}/url`,
  },
  ACTIVITY: {
    BASE: "/api/activity",
  },
} as const;
