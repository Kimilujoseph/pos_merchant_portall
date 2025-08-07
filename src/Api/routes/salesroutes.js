import express from "express";
import verifyUser from "../../middleware/verification.js";
import { handleGetSales, handleBulkSale } from "../controllers/sales-contoller.js";
import { parseSalesQuery } from "../../middleware/query-parser.js";

const route = express.Router();

// Consolidated Sales Report Routes
route.get("/report/category/:categoryId", verifyUser, parseSalesQuery, handleGetSales);
route.get("/report/shop/:shopId", verifyUser, parseSalesQuery, handleGetSales);
route.get("/report/user/:userId", verifyUser, parseSalesQuery, handleGetSales);
route.get("/report", verifyUser, parseSalesQuery, handleGetSales);

// Make a sale route
route.post("/items/sale", verifyUser, handleBulkSale);

export default route;
