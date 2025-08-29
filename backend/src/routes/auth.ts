import { Router, Request, Response } from "express";
import { body } from "express-validator";
import { handleValidation } from "../middleware/validate";

const router = Router();

router.post(
  "/register",
  [
    body("name").trim().notEmpty().withMessage("name is required"),
    body("email").isEmail().withMessage("valid email required").normalizeEmail(),
    body("password").isString().isLength({ min: 8 }).withMessage("min 8 chars"),
  ],
  handleValidation,
  async (req: Request, res: Response) => {
    res.status(201).json({ ok: true, id: "user_1" });
  }
);

router.post(
  "/login",
  [
    body("email").isEmail().withMessage("valid email required").normalizeEmail(),
    body("password").isString().notEmpty().withMessage("password required"),
  ],
  handleValidation,
  async (req: Request, res: Response) => {
    res.json({ ok: true, token: "fake_token_for_challenge" });
  }
);

export default router;
