import express from "express";
import verifyUser from "../../middleware/verification.js";
import { handleGetFinancialSummary } from "../controllers/financial-report-controller.js";
import { checkRole } from "../../helpers/authorisation.js";

const route = express.Router();

const authorizeFinancials = (req, res, next) => {
  if (!checkRole(req.user.role, ["manager", "superuser"])) {
    return res.status(403).json({ message: "You are not authorized to view financial reports." });
  }
  next();
};

route.get("/report/financial-summary", verifyUser, authorizeFinancials, handleGetFinancialSummary);

export default route;
