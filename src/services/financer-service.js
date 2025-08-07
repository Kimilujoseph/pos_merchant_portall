import { FinancerRepository } from "../databases/repository/financer-repository.js";
import { APIError, STATUS_CODE } from "../Utils/app-error.js";

class FinancerService {
  constructor() {
    this.repository = new FinancerRepository();
  }

  async createFinancer(financerDetails) {
    try {
      const { name, contactName, phone, email, address } = financerDetails;
      // For now, relying on Prisma's unique constraint error (P2002) handled in repository

      const financer = await this.repository.createFinancer({
        name,
        contactName,
        phone,
        email,
        address,
      });
      return financer;
    } catch (err) {
      if (err instanceof APIError) {
        throw err;
      }
      throw new APIError(
        "Service Error",
        STATUS_CODE.INTERNAL_ERROR,
        "Failed to create financer"
      );
    }
  }

  async getFinancerById(id) {
    try {
      const financer = await this.repository.findFinancerById(id);
      return financer;
    } catch (err) {
      if (err instanceof APIError) {
        throw err;
      }
      throw new APIError(
        "Service Error",
        STATUS_CODE.INTERNAL_ERROR,
        "Failed to retrieve financer"
      );
    }
  }

  async getAllFinancers() {
    try {
      const financers = await this.repository.findAllFinancers();
      return financers;
    } catch (err) {
      if (err instanceof APIError) {
        throw err;
      }
      throw new APIError(
        "Service Error",
        STATUS_CODE.INTERNAL_ERROR,
        "Failed to retrieve all financers"
      );
    }
  }

  async updateFinancer(id, updates) {
    try {
      const updatedFinancer = await this.repository.updateFinancer(id, updates);
      return updatedFinancer;
    } catch (err) {
      if (err instanceof APIError) {
        throw err;
      }
      throw new APIError(
        "Service Error",
        STATUS_CODE.INTERNAL_ERROR,
        "Failed to update financer"
      );
    }
  }

  async deleteFinancer(id) {
    try {
      const result = await this.repository.deleteFinancer(id);
      return result;
    } catch (err) {
      if (err instanceof APIError) {
        throw err;
      }
      throw new APIError(
        "Service Error",
        STATUS_CODE.INTERNAL_ERROR,
        "Failed to delete financer"
      );
    }
  }
}

export { FinancerService };
