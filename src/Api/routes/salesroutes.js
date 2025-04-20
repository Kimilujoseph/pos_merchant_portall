import express from "express";
import { verifyUser } from "../../middleware/verification.js";
import {
  getCategorySales,
  getShopSales,
  getgeneralsales,
  getUserSales,
} from "../controllers/sales-contoller.js";
import { makesales } from "../controllers/make-sales-managment.contoller.js";

const route = express.Router();
route.get("/report/category/:categoryId", verifyUser, getCategorySales);
route.get("/report/:shopId", verifyUser, getShopSales);
route.get("/all", verifyUser, getgeneralsales);
route.get("/user/:userId", verifyUser, getUserSales);
route.post("/items/sale", verifyUser, makesales);
export default route;
