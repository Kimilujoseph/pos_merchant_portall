The Logic: A Phased Implementation Plan

Your current architecture follows a clear pattern: routes call controllers, which use services to orchestrate business logic, and services rely on repositories for database interactions. We will follow this same pattern for each new feature.

Here is the implementation plan:

---

**Phase 1: Foundational Schema and Customer Management (Completed)**

1.  **Update `schema.prisma`**: Added `Customer`, `Payment`, `Return`, and `Notification` models. Modified sales tables to link to the new models.
2.  **Create and Run Migrations**: Generated and applied a new database migration.
3.  **Implement Customer Management**:
    *   Repository (`CustomerRepository`): Created methods to `createCustomer`, `findCustomerById`, and `findCustomerByPhone`.
    *   Service (`CustomerService`): Created a service to handle the business logic for customer creation and retrieval.
    *   Controller (`CustomerController`): Created a controller with functions like `handleCreateCustomer` and `handleGetCustomerDetails`.
    *   Routes: Added new routes in `customer-management-routes.js`.
    *   Syntax: Updated all related files to use ES Module syntax.

---

**Phase 2: Refactor Sales Logic and Implement Payment Processing**

**Part A: Refactor the Sales Controller (A Necessary First Step)**

Before adding new features, we will refactor the existing sales reporting to make it more efficient and maintainable.

1.  **Consolidate into a Single Controller:**
    *   Replace the four separate `get...Sales` functions in `sales-contoller.js` with a single, unified `handleGetSales` controller.
    *   This controller will dynamically call the appropriate service method (`generategeneralsales`, `generateCategorySales`, etc.) based on the parameters present in the request (e.g., `shopId`, `categoryId`, `userId`).

2.  **Create a Query Parsing Middleware:**
    *   A new middleware function will be created to handle the parsing, validating, and sanitizing of common query parameters (`page`, `limit`, `period`, `date`).
    *   This middleware will calculate the `startDate` and `endDate` and attach all processed values to the `req` object, removing this repetitive logic from the controller.

3.  **Standardize Responses and Errors:**
    *   All responses from the new `handleGetSales` controller will use the existing `handleResponse` and `handleError` utility functions to ensure consistency.

**Part B: Integrate Payments into the Sales Process**

With a cleaner sales module, we can now integrate the customer and payment logic.

1.  **Update the "Make Sale" Workflow:**
    *   The primary "make sale" controller (`make-sales-managment.contoller.js`) and its associated services (`MobileSalesService`, `AccessorySalesService`) will be modified.
    *   The new workflow will be as follows:
        1.  **Find or Create Customer:** The controller will first use the `CustomerService` to check if a customer exists with the provided phone number. If not, a new customer will be created.
        2.  **Create Payment Record:** A `Payment` record will be created with the total sale amount, payment method, and a link to the `customerId`.
        3.  **Create Sale Record:** The `MobileSalesService` and `AccessorySalesService` will be updated to accept the `customerId` and `paymentId` when creating a new sale, and the old, redundant customer fields will be removed.

2.  **Implement Payment Management Features:**
    *   **Repository (`PaymentRepository`):** A new repository will be created with methods to `createPayment`, `updatePaymentStatus` (e.g., from "pending" to "paid"), and `findPaymentsByCustomerId`.
    *   **Service & Controller:** A new `PaymentService` and `PaymentController` will be created to manage payment-related business logic.
    *   **Routes:** New routes will be added for managing payments, such as `POST /api/payment/update-status`.

---

**Phase 3: Implement Returns and Notifications**

1.  **Implement the Returns System:**
    *   Repository (`ReturnRepository`): Create methods to `createReturn` and log the returned item.
    *   Service (`ReturnService`): This service will contain the core logic:
        1.  Validate the original sale.
        2.  Create a `Return` record.
        3.  Update inventory: Add the returned item back to the correct shop's stock.
        4.  If applicable, create a corresponding "refund" transaction in the `Payment` model.
    *   Controller & Routes: Create a `ReturnController` and add routes like `POST /api/return/create`.

2.  **Implement the Notification System:**
    *   Repository (`NotificationRepository`): Add methods to `createNotification` and `getNotifications`.
    *   Service (`NotificationService`): This service will be called from other services whenever a notable event occurs.
    *   Controller & Routes: Create a `NotificationController` with a `getNotifications` endpoint.

---