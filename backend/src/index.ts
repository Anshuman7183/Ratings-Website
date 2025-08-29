import "dotenv/config";
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";

import authRoutes from "./routes/auth";
import meRoutes from "./routes/me";
import storesRoutes from "./routes/stores";
import ratingsRoutes from "./routes/ratings";
import adminRoutes from "./routes/admin";

const app = express();

app.use(cors());
app.use(express.json());

// mount routes
app.use("/api/auth", authRoutes);
app.use("/api/me", meRoutes);
app.use("/api/stores", storesRoutes);
app.use("/api/ratings", ratingsRoutes);
app.use("/api/admin", adminRoutes);

// health
app.get("/health", (_req, res) => res.json({ ok: true }));

// 404
app.use((req, res) => {
  res.status(404).json({ status: 404, error: "NotFound", path: req.originalUrl });
});

// error handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  const status = err.status || 500;
  res.status(status).json({
    status,
    error: err.name || "InternalServerError",
    message: err.message || "Something went wrong"
  });
});

const PORT = Number(process.env.PORT || 4000);
app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
});
