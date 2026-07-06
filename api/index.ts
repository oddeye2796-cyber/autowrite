// Vercel Serverless Function entry point
// Wraps the Express app for Vercel's serverless runtime
import { app } from "../dist/server.cjs";

export default app;
