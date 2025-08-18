# Accounting and Financial Overview

This document provides a high-level overview of how to track the flow of money within the application to determine the overall financial health and profitability of the business.

## 1. Core Principle: Cash Flow

To understand the business's financial performance, we need to track two primary flows:
- **Money In (Revenue):** Cash coming into the business from sales.
- **Money Out (Expenses):** Cash leaving the business to cover costs.

**Net Profit = Total Revenue - Total Expenses**

---

## 2. Tracking Money In: Revenue

The primary source of revenue is the sale of products (mobiles and accessories).

- **Source of Truth:** The `DailySalesAnalytics` table provides the most efficient way to track total revenue over any period.
- **Key Metric:** `totalRevenue`
- **How to Calculate:** To find the total revenue for a given period (e.g., last month), you can run a simple query against the analytics table:
  ```sql
  SELECT SUM(totalRevenue)
  FROM DailySalesAnalytics
  WHERE date >= 'YYYY-MM-DD' AND date <= 'YYYY-MM-DD';
  ```

---

## 3. Tracking Money Out: Expenses

Expenses are broken down into several categories. To get the total expenses, you must sum up the costs from each of these categories.

### 3.1. Cost of Goods Sold (COGS)

This is the direct cost of the products that were sold.

- **Source of Truth:** The `DailySalesAnalytics` table.
- **Key Metric:** `totalCostOfGoods`
- **How to Calculate:**
  ```sql
  SELECT SUM(totalCostOfGoods)
  FROM DailySalesAnalytics
  WHERE date >= 'YYYY-MM-DD' AND date <= 'YYYY-MM-DD';
  ```
- **Note:** The `grossProfit` in the same table is simply `totalRevenue - totalCostOfGoods`.

### 3.2. Commission Payments

This is the amount paid out to sellers for their sales.

- **Source of Truth:** The `CommissionPayment` table. This table records the actual cash paid out.
- **Key Metric:** `amountPaid`
- **How to Calculate:**
  ```sql
  SELECT SUM(amountPaid)
  FROM CommissionPayment
  WHERE paymentDate >= 'YYYY-MM-DD' AND paymentDate <= 'YYYY-MM-DD';
  ```

### 3.3. Salary Payments

This is the amount paid to employees as base salary.

- **Source of Truth:** The `SalaryPayment` table.
- **Key Metric:** `amount`
- **How to Calculate:**
  ```sql
  SELECT SUM(amount)
  FROM SalaryPayment
  WHERE paymentDate >= 'YYYY-MM-DD' AND paymentDate <= 'YYYY-MM-DD';
  ```

### 3.4. Other Operational Expenses

This includes miscellaneous costs like rent, utilities, supplies, etc.

- **Source of Truth:** The `Expense` table.
- **Key Metric:** `amount`
- **How to Calculate:**
  ```sql
  SELECT SUM(amount)
  FROM Expense
  WHERE expenseDate >= 'YYYY-MM-DD' AND expenseDate <= 'YYYY-MM-DD';
  ```

---

## 4. Calculating Net Profit

To calculate the net profit for a specific period, you combine all the metrics above.

**Formula:**

`Net Profit = (Total Revenue) - (COGS + Commissions Paid + Salaries Paid + Other Expenses)`

**Example SQL Query (for a specific period):**

```sql
-- This is a conceptual query. You would run these as separate queries in the application and combine the results.

-- 1. Get Revenue and COGS
SELECT SUM(totalRevenue) as totalRevenue, SUM(totalCostOfGoods) as cogs
FROM DailySalesAnalytics
WHERE date >= '2025-07-01' AND date <= '2025-07-31';

-- 2. Get Commissions Paid
SELECT SUM(amountPaid) as commissionsPaid
FROM CommissionPayment
WHERE paymentDate >= '2025-07-01' AND paymentDate <= '2025-07-31';

-- 3. Get Salaries Paid
SELECT SUM(amount) as salariesPaid
FROM SalaryPayment
WHERE paymentDate >= '2025-07-01' AND paymentDate <= '2025-07-31';

-- 4. Get Other Expenses
SELECT SUM(amount) as otherExpenses
FROM Expense
WHERE expenseDate >= '2025-07-01' AND expenseDate <= '2025-07-31';

-- 5. Calculate Net Profit in your application code
const netProfit = totalRevenue - (cogs + commissionsPaid + salariesPaid + otherExpenses);
```
  Based on our discussion, here is the updated plan:

   1. Update Prisma Schema: Add the new Return model and add status fields to the CommissionPayment, SalaryPayment, mobilesales, and
      accessorysales models.
   2. Implement Product Returns:
       * Create a new repository, service, and controller for Return transactions.
       * Implement the POST /api/returns endpoint.
       * The service logic will handle the full transaction: creating the return record, updating inventory, updating the original sale's
          status, and creating the negative entry in DailySalesAnalytics.
   3. Implement Payment Voiding:
       * Create a POST /api/commissions/pay/{id}/void endpoint.
       * The service logic will handle the transaction: updating the payment status to VOIDED and decrementing the commissionPaid on all
         associated sales.
       * Do the same for salary payments with a POST /api/salaries/pay/{id}/void endpoint.

  This is a comprehensive plan that ensures your application's financial data remains accurate, auditable, and robust.

  Shall I begin by updating the Prisma schema with these changes?
