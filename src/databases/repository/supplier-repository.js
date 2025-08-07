import { PrismaClient } from "@prisma/client";
import { APIError, STATUS_CODE } from "../../Utils/app-error.js";

const prisma = new PrismaClient();

class SupplierRepository {
  async createSupplier({ name, contactName, phone, email, address }) {
    try {
      const supplier = await prisma.supplier.create({
        data: {
          name,
          contactName,
          phone,
          email,
          address,
        },
      });
      return supplier;
    } catch (err) {
      if (err.code === "P2002") {
        throw new APIError(
          "Duplicate Key Error",
          STATUS_CODE.BAD_REQUEST,
          `A supplier with the same ${err.meta.target[0]} already exists.`
        );
      }
      throw new APIError(
        "Database Error",
        STATUS_CODE.INTERNAL_ERROR,
        "Unable to create supplier"
      );
    }
  }

  async findSupplierById(id) {
    try {
      const supplier = await prisma.supplier.findUnique({
        where: { id: parseInt(id) },
      });
      if (!supplier) {
        throw new APIError(
          "Not Found",
          STATUS_CODE.NOT_FOUND,
          "Supplier not found"
        );
      }
      return supplier;
    } catch (err) {
      if (err instanceof APIError) {
        throw err;
      }
      throw new APIError(
        "Database Error",
        STATUS_CODE.INTERNAL_ERROR,
        "Unable to find supplier"
      );
    }
  }

  async findAllSuppliers() {
    try {
      const suppliers = await prisma.supplier.findMany();
      return suppliers;
    } catch (err) {
      throw new APIError(
        "Database Error",
        STATUS_CODE.INTERNAL_ERROR,
        "Unable to retrieve suppliers"
      );
    }
  }

  async updateSupplier(id, updates) {
    try {
      const updatedSupplier = await prisma.supplier.update({
        where: { id: parseInt(id) },
        data: updates,
      });
      return updatedSupplier;
    } catch (err) {
      if (err.code === "P2002") {
        throw new APIError(
          "Duplicate Key Error",
          STATUS_CODE.BAD_REQUEST,
          `A supplier with the same ${err.meta.target[0]} already exists.`
        );
      }
      if (err.code === "P2025") {
        throw new APIError(
          "Not Found",
          STATUS_CODE.NOT_FOUND,
          "Supplier not found for update"
        );
      }
      throw new APIError(
        "Database Error",
        STATUS_CODE.INTERNAL_ERROR,
        "Unable to update supplier"
      );
    }
  }

  async deleteSupplier(id) {
    try {
      await prisma.supplier.delete({ where: { id: parseInt(id) } });
      return { message: "Supplier deleted successfully" };
    } catch (err) {
      if (err.code === "P2025") {
        throw new APIError(
          "Not Found",
          STATUS_CODE.NOT_FOUND,
          "Supplier not found for deletion"
        );
      }
      throw new APIError(
        "Database Error",
        STATUS_CODE.INTERNAL_ERROR,
        "Unable to delete supplier"
      );
    }
  }
}

export { SupplierRepository };
