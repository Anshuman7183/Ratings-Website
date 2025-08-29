import { Request, RequestHandler } from "express";
import jwt from "jsonwebtoken";

declare module "express-serve-static-core" {
  interface Request {
    user?: { id: number | string; role?: "USER" | "OWNER" | "ADMIN" };
  }
}

export type AuthedRequest = Request & {
  user?: { id: number | string; role?: "USER" | "OWNER" | "ADMIN" };
};

export const requireAuth: RequestHandler = (req, res, next) => {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7) : undefined;
  if (!token) return res.status(401).json({ error: "Unauthorized" });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as {
      id: number | string;
      role?: "USER" | "OWNER" | "ADMIN";
    };
    req.user = { id: payload.id, role: payload.role };
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
};

export const requireRole =
  (...roles: Array<"USER" | "OWNER" | "ADMIN">): RequestHandler =>
  (req, res, next) => {
    const role = req.user?.role;
    if (!role) return res.status(401).json({ error: "Unauthorized" });
    if (!roles.includes(role)) return res.status(403).json({ error: "Forbidden" });
    next();
  };
