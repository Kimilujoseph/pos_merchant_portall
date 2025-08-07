import express from "express";
import verifyUser from "../../middleware/verification.js";
import {
  createSupplier,
  getSupplierById,
  getAllSuppliers,
  updateSupplier,
  deleteSupplier,
} from "../controllers/supplier-management-controller.js";

const router = express.Router();

router.post("/create", verifyUser, createSupplier);
router.get("/supplier/:id", verifyUser, getSupplierById);
router.get("/supplier", verifyUser, getAllSuppliers);
router.put("/update-profile/:id", verifyUser, updateSupplier);
router.delete("/supplier/:id", verifyUser, deleteSupplier);

export default router;
