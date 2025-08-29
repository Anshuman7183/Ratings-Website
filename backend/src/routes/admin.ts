import { Router, Request, Response } from "express";
import { param, query } from "express-validator";
import { handleValidation } from "../middleware/validate";

const router = Router();

// Minimal users list
router.get(
  "/users",
  [
    query("page").optional().toInt().isInt({ min: 1 }),
    query("limit").optional().toInt().isInt({ min: 1, max: 100 }),
  ],
  handleValidation,
  async (req: Request, res: Response) => {
    res.json({ users: [] });
  }
);

// Minimal toggle store
router.post(
  "/stores/:id/toggle",
  [param("id").isUUID().withMessage("id must be UUID")],
  handleValidation,
  async (req: Request, res: Response) => {
    res.json({ toggled: true });
  }
);

export default router;
