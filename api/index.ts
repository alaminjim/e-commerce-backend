import { VercelRequest, VercelResponse } from "@vercel/node";
import { app } from "../src/app";

// Export the express app as a Vercel Serverless Function handler.
// Vercel will call this default export for API requests.
export default function handler(req: VercelRequest, res: VercelResponse) {
  return (app as any)(req, res);
}
