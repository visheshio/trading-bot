import type { VercelRequest, VercelResponse } from '@vercel/node';
import serverless from 'serverless-http';
import app, { connectToDatabase } from '../apps/backend/index';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  await connectToDatabase();
  const handler = serverless(app as any);
  return handler(req, res);
}
