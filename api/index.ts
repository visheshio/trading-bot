import serverless from "serverless-http";
import app from "../apps/backend/index.js";

const serverlessHandler = serverless(app as any);

export default async function handler(req: any, res: any) {
  return serverlessHandler(req, res);
}
