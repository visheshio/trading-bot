import type { NextFunction } from "express";
const JWT_SECRET = process.env.JWT_SECRET!;
import jwt, { type Jwt, type JwtPayload } from "jsonwebtoken";
import type { Request, Response } from "express";
export const runtime = 'nodejs'; // 'edge' is the default for middleware

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const header = req.headers["authorization"] as string;
    try {
        console.log( header);
        const response= jwt.verify(header, JWT_SECRET) as JwtPayload;
        req.userid = response.id;
        next();
    } catch (e) {   
        return res.status(403).json({ message: "You are not logged in" });
    }
}