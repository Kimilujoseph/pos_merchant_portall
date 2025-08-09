 Brainstorming: Differentiating Direct vs. Financed Sales

  The core idea is to make the paymentmethod the primary driver of the sales logic. Based on its value, we will set a salesType and a
  financeStatus in the database, which will then allow for accurate profit and revenue reporting.

  Here is a step-by-step plan on how we can implement this, starting from the controller and moving down to the services and schema.

  ---

  Step 1: Enhance the Database Schema (`prisma.schema.prisma`)

  To ensure data integrity and clarity, we should use enums for the sale type and finance status.

   1. Create a `SaleType` Enum: This will formally distinguish between the two types of sales.

   1     enum SaleType {
   2       DIRECT
   3       FINANCE
   4     }
   2. Create a `FinanceStatus` Enum: This will allow us to track the state of financed sales more effectively.

   1     enum FinanceStatus {
   2       PENDING
   3       PAID
   4       OVERDUE
   5       DEFAULTED
   6       NA // Not Applicable, for direct sales
   7     }
   3. Update the `mobilesales` Model:
       * Change the salesType field to use the new SaleType enum.
       * Change the financeStatus field to use the new FinanceStatus enum.

  ---

  Step 2: Refine the API Payload (from Frontend)

  The makesales controller needs to receive a clear signal about the nature of the sale. We can enhance the JSON payload sent from the
  frontend.

   * For each item in the bulksales array, the paymentmethod will be the key.
   * If the paymentmethod is 'cash' or 'mpesa', it's a direct sale.
   * If the paymentmethod is 'finance', the frontend must also provide a financeDetails object within the sale item.

  Example Payload:

    1 {
    2   "bulksales": [
    3     {
    4       "itemType": "mobiles",
    5       "paymentmethod": "finance", // This signals a financed sale
    6       "financeDetails": {
    7         "financerName": "M-KOPA",
    8         "financeAmount": 25000
    9       },
   10       "items": [
   11         { "productId": 123, "soldprice": 30000, "soldUnits": 1 }
   12       ]
   13     },
   14     {
   15       "itemType": "accessories",
   16       "paymentmethod": "cash", // This is a direct sale
   17       "items": [
   18         { "productId": 456, "soldprice": 1500, "soldUnits": 1 }
   19       ]
   20     }
   21   ],
   22   // ... customerdetails and shopName
   23 }

  ---

  Step 3: Implement the Core Logic in the Services

  This is where we'll implement the main business rules.

   1. In `MobileSalesService.js` (`processMobileSale` method):
       * The method will inspect the paymentmethod for each sale.
       * If Direct Sale (`cash`, `mpesa`):
           * Set salesType to DIRECT.
           * Set financeStatus to NA.
           * The profit is realized immediately. The calculation remains as is: profit = soldPrice - productCost - commission.
       * If Financed Sale (`finance`):
           * The method must validate that financeDetails exists in the payload.
           * Set salesType to FINANCE.
           * Set financeStatus to PENDING.
           * Store the financerName and financeAmount in the mobilesales record.
           * The realized profit is initially 0. The profit field in the database will still store the potential profit (soldPrice - 
             productCost - commission), but our reporting will ignore it until the financeStatus is PAID.

   2. In `AccessorySalesService.js` (`processAccessorySale` method):
       * This service will operate under the assumption that all accessory sales are DIRECT. The logic will be simpler and will always
         calculate profit immediately.

  ---

  Step 4: Update Reporting and Analytics (`sales-services.js`)

  This is the final, crucial step to ensure the financial reports are accurate.

   1. Modify `generategeneralsales` (and other reporting functions):
       * Revenue Calculation: When summing up total revenue (totalSales), you should only include:
           * All DIRECT sales.
           * FINANCE sales where the financeStatus is PAID.
       * Profit Calculation: Similarly, totalProfit should only be calculated from:
           * All DIRECT sales.
           * FINANCE sales where the financeStatus is PAID.
       * New Metric - "Pending Finance": The reports should feature a new, important metric: totalFinancePending. This would be the sum
         of financeAmount for all sales where financeStatus is PENDING. This gives managers a clear view of expected, but not yet
         received, income.

  ---

  Summary of the Plan

  By following these steps, we will create a clear, robust, and auditable system. The paymentmethod will act as the trigger that
  cascades the correct logic through your services, ensuring each sale is correctly categorized and that your financial reports
  accurately reflect the state of the business's cash flow and profitability.

  If this plan aligns with your vision, I will begin by implementing the schema changes outlined in Step 1.
