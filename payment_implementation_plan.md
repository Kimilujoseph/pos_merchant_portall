# Plan for Implementing Commission and Salary Payments

This document outlines the development plan to build the missing business logic for handling commission and salary payments in the application.

## 1. Commission Payment Implementation

The goal is to create a system that allows for paying out commissions to sellers, with support for partial payments and a clear audit trail.

### 1.1. API Endpoint

A new endpoint will be created to handle the creation of a commission payment.

- **Endpoint:** `POST /api/commissions/pay`
- **Description:** Creates a new commission payment record for a specific seller, linking it to one or more unpaid sales commissions.
- **Request Body:**
  ```json
  {
    "sellerId": 123,
    "amountPaid": 500.00,
    "paymentDate": "2025-08-10T10:00:00Z",
    "periodStartDate": "2025-07-01T00:00:00Z",
    "periodEndDate": "2025-07-31T23:59:59Z",
    "processedById": 456,
    "salesIds": [
      {"type": "mobile", "id": 1},
      {"type": "accessory", "id": 5}
    ]
  }
  ```
- **Authorization:** This endpoint should be protected and accessible only to roles like `manager` or `superuser`.

### 1.2. Controller (`commission-controller.js`)

A new controller will be created to handle the logic for the `/api/commissions/pay` endpoint.

- **Function:** `handleCreateCommissionPayment(req, res)`
- **Logic:**
  1.  Validate the request body.
  2.  Call the `commissionService.createCommissionPayment()` with the payload.
  3.  Return a success response with the created payment record.

### 1.3. Service (`commission-service.js`)

A new service will encapsulate the core business logic for commission payments.

- **Function:** `createCommissionPayment(paymentData)`
- **Logic:**
  1.  Verify that the `sellerId` and `processedById` are valid users.
  2.  Fetch all the specified sales from `salesIds` to ensure they exist and belong to the seller.
  3.  Calculate the total commission owed for the selected sales and verify that `amountPaid` does not exceed this total.
  4.  Create the `CommissionPayment` record in the database.
  5.  For each sale in `salesIds`, create a corresponding entry in the appropriate linking table (`CommissionPaymentsOnMobileSales` or `CommissionPaymentsOnAccessorySales`).
  6.  Update the `commissionPaid` and `commisssionStatus` fields on each sale record.
  7.  Return the newly created commission payment.

### 1.4. Repository (`commission-repository.js`)

A new repository will handle all database interactions related to commissions.

- **Functions:**
  - `createCommissionPayment(data)`: Creates a new `CommissionPayment` and the associated linking table records in a transaction.
  - `findUnpaidCommissions(sellerId)`: A helper function to get all sales for a seller where `commission > commissionPaid`.
  - `updateSaleCommissionStatus(saleId, type, amount, status)`: Updates the `commissionPaid` and `commisssionStatus` for a given sale.

## 2. Salary Payment Implementation

The goal is to create a straightforward system for recording salary payments to employees.

### 2.1. API Endpoint

- **Endpoint:** `POST /api/salaries/pay`
- **Description:** Records a new salary payment for an employee.
- **Request Body:**
  ```json
  {
    "employeeId": 789,
    "amount": 5000.00,
    "paymentDate": "2025-08-10T10:00:00Z",
    "payPeriodMonth": 7,
    "payPeriodYear": 2025,
    "processedById": 456
  }
  ```
- **Authorization:** Protected and accessible only to `manager` or `superuser`.

### 2.2. Controller (`salary-controller.js`)

- **Function:** `handleCreateSalaryPayment(req, res)`
- **Logic:**
  1.  Validate the request body.
  2.  Call the `salaryService.createSalaryPayment()` with the payload.
  3.  Return a success response.

### 2.3. Service (`salary-service.js`)

- **Function:** `createSalaryPayment(paymentData)`
- **Logic:**
  1.  Verify that the `employeeId` and `processedById` are valid users.
  2.  Check if the `amount` matches the `baseSalary` defined in the employee's (`actors`) record. (This can be a soft check or a strict validation).
  3.  Create the `SalaryPayment` record in the database.
  4.  Return the created payment record.

### 2.4. Repository (`salary-repository.js`)

- **Function:** `createSalaryPayment(data)`: Creates a new `SalaryPayment` record in the database.

## 3. Next Steps

1.  **Create the new files:** `commission-controller.js`, `commission-service.js`, `commission-repository.js`, `salary-controller.js`, `salary-service.js`, and `salary-repository.js`.
2.  **Implement the repository layer** for both commissions and salaries first.
3.  **Implement the service layer**, adding the core business logic.
4.  **Implement the controller layer** to handle API requests.
5.  **Add new routes** in the API to expose the new endpoints.
6.  **Write tests** to verify the functionality.
