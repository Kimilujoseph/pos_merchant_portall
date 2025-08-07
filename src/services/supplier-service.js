import { SupplierRepository } from "../databases/repository/supplier-repository.js";
import { APIError, STATUS_CODE } from "../Utils/app-error.js";

class SupplierService {
  constructor() {
    this.repository = new SupplierRepository();
  }

  async createSupplier(supplierDetails) {
    try {
      const { name, contactName, phone, email, address } = supplierDetails;

      const supplier = await this.repository.createSupplier({
        name,
        contactName,
        phone,
        email,
        address,
      });
      return supplier;
    } catch (err) {
      if (err instanceof APIError) {
        throw err;
      }
      throw new APIError(
        "Service Error",
        STATUS_CODE.INTERNAL_ERROR,
        "Failed to create supplier"
      );
    }
  }

  async getSupplierById(id) {
    try {
      const supplier = await this.repository.findSupplierById(id);
      return supplier;
    } catch (err) {
      if (err instanceof APIError) {
        throw err;
      }
      throw new APIError(
        "Service Error",
        STATUS_CODE.INTERNAL_ERROR,
        "Failed to retrieve supplier"
      );
    }
  }

  async getAllSuppliers() {
    try {
      const suppliers = await this.repository.findAllSuppliers();
      return suppliers;
    } catch (err) {
      if (err instanceof APIError) {
        throw err;
      }
      throw new APIError(
        "Service Error",
        STATUS_CODE.INTERNAL_ERROR,
        "Failed to retrieve all suppliers"
      );
    }
  }

  async updateSupplier(id, updates) {
    try {
      const updatedSupplier = await this.repository.updateSupplier(id, updates);
      return updatedSupplier;
    } catch (err) {
      if (err instanceof APIError) {
        throw err;
      }
      throw new APIError(
        "Service Error",
        STATUS_CODE.INTERNAL_ERROR,
        "Failed to update supplier"
      );
    }
  }

  async deleteSupplier(id) {
    try {
      const result = await this.repository.deleteSupplier(id);
      return result;
    } catch (err) {
      if (err instanceof APIError) {
        throw err;
      }
      throw new APIError(
        "Service Error",
        STATUS_CODE.INTERNAL_ERROR,
        "Failed to delete supplier"
      );
    }
  }
}

export { SupplierService };
