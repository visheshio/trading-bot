import serverless from "serverless-http";

let cachedHandler: any = null;

export default async function handler(req: any, res: any) {
  if (!cachedHandler) {
    const backendModule = await import("../apps/backend/index.js");
    const app = backendModule.default || backendModule;
    cachedHandler = serverless(app);
  }
  return cachedHandler(req, res);
}
