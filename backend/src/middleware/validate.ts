import { Request, Response, NextFunction } from "express";
import { validationResult, ValidationError, Result } from "express-validator";

export function handleValidation(req: Request, res: Response, next: NextFunction) {
  const result: Result<ValidationError> = validationResult(req);
  if (result.isEmpty()) return next();

  return res.status(400).json({
    status: 400,
    error: "ValidationError",
    errors: result.array().map(err => ({
      field: "path" in err ? err.path : "unknown",
      message: "msg" in err ? String(err.msg) : "Invalid value",
      location: "location" in err ? err.location : "unknown",
    })),
  });
}
