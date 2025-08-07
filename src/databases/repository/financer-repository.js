import { PrismaClient } from "@prisma/client";
import { APIError, STATUS_CODE } from "../../Utils/app-error.js";

const prisma = new PrismaClient();

class FinancerRepository {
  async createFinancer({ name, contactName, phone, email, address }) {
    try {
      const financer = await prisma.financer.create({
        data: {
          name,
          contactName,
          phone,
          email,
          address,
        },
      });
      return financer;
    } catch (err) {
      if (err.code === "P2002") {
        throw new APIError(
          "Duplicate Key Error",
          STATUS_CODE.BAD_REQUEST,
          `A financer with the same ${err.meta.target[0]} already exists.`
        );
      }
      throw new APIError(
        "Database Error",
        STATUS_CODE.INTERNAL_ERROR,
        "Unable to create financer"
      );
    }
  }

  async findFinancerById(id) {
    try {
      const financer = await prisma.financer.findUnique({
        where: { id: parseInt(id) },
      });
      if (!financer) {
        throw new APIError(
          "Not Found",
          STATUS_CODE.NOT_FOUND,
          "Financer not found"
        );
      }
      return financer;
    } catch (err) {
      if (err instanceof APIError) {
        throw err;
      }
      throw new APIError(
        "Database Error",
        STATUS_CODE.INTERNAL_ERROR,
        "Unable to find financer"
      );
    }
  }

  async findAllFinancers() {
    try {
      const financers = await prisma.financer.findMany();
      return financers;
    } catch (err) {
      throw new APIError(
        "Database Error",
        STATUS_CODE.INTERNAL_ERROR,
        "Unable to retrieve financers"
      );
    }
  }

  async updateFinancer(id, updates) {
    try {
      const updatedFinancer = await prisma.financer.update({
        where: { id: parseInt(id) },
        data: updates,
      });
      return updatedFinancer;
    } catch (err) {
      if (err.code === "P2002") {
        throw new APIError(
          "Duplicate Key Error",
          STATUS_CODE.BAD_REQUEST,
          `A financer with the same ${err.meta.target[0]} already exists.`
        );
      }
      if (err.code === "P2025") {
        throw new APIError(
          "Not Found",
          STATUS_CODE.NOT_FOUND,
          "Financer not found for update"
        );
      }
      throw new APIError(
        "Database Error",
        STATUS_CODE.INTERNAL_ERROR,
        "Unable to update financer"
      );
    }
  }

  async deleteFinancer(id) {
    try {
      await prisma.financer.delete({ where: { id: parseInt(id) } });
      return { message: "Financer deleted successfully" };
    } catch (err) {
      if (err.code === "P2025") {
        throw new APIError(
          "Not Found",
          STATUS_CODE.NOT_FOUND,
          "Financer not found for deletion"
        );
      }
      throw new APIError(
        "Database Error",
        STATUS_CODE.INTERNAL_ERROR,
        "Unable to delete financer"
      );
    }
  }
}

export { FinancerRepository };
