import app from "../apps/backend/index.js";

export default function handler(req: any, res: any) {
  return app(req, res);
}
