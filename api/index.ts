import { app } from "../src/app";

// Export the express app as a Vercel Serverless Function handler.
// Use `any` for request/response to avoid requiring @vercel/node types during tsc build.
export default function handler(req: any, res: any) {
  return (app as any)(req, res);
}
