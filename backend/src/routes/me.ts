import { Router } from "express";
// no validation needed here, just example protected route
const router = Router();

router.get("/", (req, res) => {
  // return current user profile
  res.json({ id: "u_1", email: "user@example.com" });
});

export default router;
