import { Router, Request, Response } from "express";
import { body, param, query } from "express-validator";
import { handleValidation } from "../middleware/validate";

const router = Router();

// Create store
router.post(
  "/",
  [
    body("name").trim().notEmpty().withMessage("name required"),
    body("address").trim().notEmpty().withMessage("address required"),
    body("ownerEmail").isEmail().withMessage("valid ownerEmail required").normalizeEmail(),
    body("phone").optional().isMobilePhone("any").withMessage("invalid phone"),
    body("isActive").optional().isBoolean().toBoolean(),
  ],
  handleValidation,
  async (req: Request, res: Response) => {
    res.status(201).json({ created: true });
  }
);

// List stores
router.get(
  "/",
  [
    query("page").optional().toInt().isInt({ min: 1 }).withMessage("page >= 1"),
    query("limit").optional().toInt().isInt({ min: 1, max: 100 }).withMessage("limit 1–100"),
  ],
  handleValidation,
  async (_req: Request, res: Response) => {
    res.json({ items: [] });
  }
);

// Get store by id
router.get(
  "/:id",
  [param("id").isUUID().withMessage("id must be UUID")],
  handleValidation,
  async (req: Request, res: Response) => {
    res.json({ id: req.params.id });
  }
);

// Update store
router.patch(
  "/:id",
  [
    param("id").isUUID().withMessage("id must be UUID"),
    body("name").optional().isString().trim().notEmpty(),
    body("address").optional().isString().trim().notEmpty(),
    body("ownerEmail").optional().isEmail().normalizeEmail(),
    body("phone").optional().isMobilePhone("any"),
    body("isActive").optional().isBoolean().toBoolean(),
  ],
  handleValidation,
  async (_req: Request, res: Response) => {
    res.json({ updated: true });
  }
);

export default router;
