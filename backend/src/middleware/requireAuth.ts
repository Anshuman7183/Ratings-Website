import { Request, Response, NextFunction } from "express";

/**
 * Minimal auth: expects "Authorization: Bearer <token>".
 * For the challenge, we just check token exists; replace with real JWT if needed.
 */
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const auth = req.header("authorization");
  if (!auth || !auth.toLowerCase().startsWith("bearer ")) {
    return res.status(401).json({ status: 401, error: "Unauthorized" });
  }
  const token = auth.split(" ")[1];
  if (!token) return res.status(401).json({ status: 401, error: "Unauthorized" });

  // attach minimal user (stub). Replace with JWT verify if needed.
  (req as any).user = { id: "u_stub" };
  next();
}
