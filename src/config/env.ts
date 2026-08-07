import "dotenv/config";

const defaultOrigins = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "https://ecomarce-client.vercel.app",
];

const parseOrigins = (value: string): string[] =>
  value
    .split(",")
    .map((item) => item.trim().replace(/\/$/, ""))
    .filter(Boolean);

export const env = {
  PORT: Number(process.env.PORT ?? 5000),
  NODE_ENV: process.env.NODE_ENV ?? "development",
  DATABASE_URL: process.env.DATABASE_URL ?? "",
  CLIENT_URL: process.env.CLIENT_URL ?? "https://ecomarce-client.vercel.app",
  CLIENT_ORIGINS: process.env.CLIENT_URL
    ? Array.from(new Set([...parseOrigins(process.env.CLIENT_URL), ...defaultOrigins]))
    : defaultOrigins,
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET ?? "omers_access_secret_key_12345",
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET ?? "omers_refresh_secret_key_67890",
  JWT_ACCESS_EXPIRES_IN: process.env.JWT_ACCESS_EXPIRES_IN ?? "1d",
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN ?? "7d",
  BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET ?? "omers_better_auth_secret_key_999",
  BETTER_AUTH_URL:
    process.env.BETTER_AUTH_URL ?? "http://localhost:5000/api/v1/auth",
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ?? "",
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET ?? "",
  FACEBOOK_CLIENT_ID: process.env.FACEBOOK_CLIENT_ID ?? "",
  FACEBOOK_CLIENT_SECRET: process.env.FACEBOOK_CLIENT_SECRET ?? "",
};

export const envConfig = env;
