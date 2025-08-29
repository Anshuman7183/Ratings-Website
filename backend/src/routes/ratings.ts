import { Router, Request, Response } from "express";
import { body, param, query } from "express-validator";
import { handleValidation } from "../middleware/validate";

const router = Router();

// Create rating for a store
router.post(
  "/:storeId",
  [
    param("storeId").isUUID().withMessage("storeId must be UUID"),
    body("rating").isInt({ min: 1, max: 5 }).withMessage("rating 1–5").toInt(),
    body("comment").optional().isString().trim(),
  ],
  handleValidation,
  async (req: Request, res: Response) => {
    res.status(201).json({ created: true });
  }
);

// List ratings for a store
router.get(
  "/:storeId",
  [
    param("storeId").isUUID().withMessage("storeId must be UUID"),
    query("page").optional().toInt().isInt({ min: 1 }),
    query("limit").optional().toInt().isInt({ min: 1, max: 100 }),
  ],
  handleValidation,
  async (_req: Request, res: Response) => {
    res.json({ items: [] });
  }
);

export default router;
