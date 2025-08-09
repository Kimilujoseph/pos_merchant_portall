# Refactoring and Accounting Logic Summary

This document summarizes the recent refactoring efforts and clarifies the accounting logic implemented in the application.

## 1. Sales Creation and Testing

- **Revised Sales Logic:** The sales creation process was refactored to handle bulk sales more efficiently. It now creates a single, consolidated payment record for a transaction and links all individual sales to it.
- **Postman Collection:** A `postman_collection.json` file was created to provide a ready-to-use testing suite for the sales creation endpoint (`/api/sales/items/sale`).

## 2. Data Model Refactoring

- **Reduced Redundancy:** The `mobilesales` and `accessorysales` models were streamlined by removing redundant customer and payment fields. Customer information is now solely managed through the `Customer` model, and payment details are handled by the `Payment` model, creating a single source of truth.
- **Schema Migrations:** New Prisma migrations were created to apply these schema changes to the database.

## 3. Profit and Expense Accounting Strategy

### Profit Calculation
The profit for each sale is calculated and stored at the time of the transaction.
- **Formula:** `Gross Profit = (Sold Price - Product Cost) * Quantity`
- **Implementation:** The `createBulkSale` service now fetches the `productCost` for each item, calculates the gross profit, and saves it directly into the `profit` field of the corresponding sales record.

### Commission Handling
Commissions are treated as a variable expense linked to a sale.
- **Liability:** The `commission` field on a sales record represents the total amount owed to the seller for that sale (a liability).
- **Partial Payments:** To handle partial payments, a ledger-like system was implemented:
    - The `commissionPaid` field was added to sales tables to track how much of the commission has been settled.
    - The `CommissionPayment` table records every payment transaction.
    - Two linking tables (`CommissionPaymentsOnMobileSales` and `CommissionPaymentsOnAccessorySales`) create a many-to-many relationship, allowing a single payment to cover multiple sales commissions or a single commission to be paid off by multiple partial payments.
- **Expense Recognition:** The actual commission expense is recognized only when a payment is made, which is recorded in the `CommissionPayment` table.

### Salary Handling
Salaries are treated as a fixed operating expense.
- **Fixed Cost:** Unlike commissions, salaries are not tied to individual sales. They are recorded as a fixed, periodic expense.
- **Recording Payments:** The `SalaryPayment` model is used to log all salary disbursements, providing a clear history of payments to employees.
- **Net Profit Calculation:** For overall business accounting, Net Profit is calculated by subtracting all operating expenses (total commissions paid, total salaries paid, rent, etc.) from the Gross Profit over a specific period.
