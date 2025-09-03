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
router.get("/get/:id", verifyUser, getFinancerById);
router.get("/all", verifyUser, getAllFinancers);
router.put("/financer/:id", verifyUser, updateFinancer);
router.delete("/financer/:id", verifyUser, deleteFinancer);

export default router;
