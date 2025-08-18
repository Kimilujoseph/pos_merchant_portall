import { ReturnRepository } from '../databases/repository/return-repository.js';
import { APIError, STATUS_CODE } from '../Utils/app-error.js';

class ReturnService {
  constructor() {
    this.repository = new ReturnRepository();
  }

  async createReturn(returnData) {
    try {
      const { saleId, saleType, quantity } = returnData;
      if (!saleId || !saleType || !quantity) {
        throw new APIError('Bad Request', STATUS_CODE.BAD_REQUEST, 'Sale ID, Sale Type, and Quantity are required.');
      }
      if (saleType !== 'mobile' && saleType !== 'accessory') {
        throw new APIError('Bad Request', STATUS_CODE.BAD_REQUEST, 'Invalid sale type specified. Must be "mobile" or "accessory".');
      }
      if (saleType === 'mobile' && quantity !== 1) {
          throw new APIError('Bad Request', STATUS_CODE.BAD_REQUEST, 'Mobiles can only be returned one at a time (quantity must be 1).');
      }
      
      return await this.repository.createReturn(returnData);
    } catch (err) {
      console.log('Error in ReturnService.createReturn:', err);
      if (err instanceof APIError) {
        throw err;
      }
      throw new APIError(
        'Service Error',
        STATUS_CODE.INTERNAL_ERROR,
        'Failed to process the return.'
      );
    }
  }
}

export { ReturnService };
