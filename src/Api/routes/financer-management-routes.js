import express from "express";
import verifyUser from "../../middleware/verification.js";
import {
  createFinancer,
  getFinancerById,
  getAllFinancers,
  updateFinancer,
  deleteFinancer,
} from "../controllers/financer-management-controller.js";

const router = express.Router();

router.post("/create", verifyUser, createFinancer);
router.get("/financer/:id", verifyUser, getFinancerById);
router.get("/financer", verifyUser, getAllFinancers);
router.put("/financer/:id", verifyUser, updateFinancer);
router.delete("/financer/:id", verifyUser, deleteFinancer);

export default router;
