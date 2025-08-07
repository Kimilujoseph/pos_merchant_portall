import customerService from '../../services/customer-service.js';

class CustomerController {
  async handleCreateCustomer(req, res, next) {
    try {
      const customer = await customerService.createCustomer(req.body);
      res.status(201).json(customer);
    } catch (error) {
      next(error);
    }
  }

  async handleGetCustomerDetails(req, res, next) {
    try {
      const customer = await customerService.getCustomerById(req.params.id);
      if (!customer) {
        return res.status(404).json({ message: 'Customer not found' });
      }
      res.status(200).json(customer);
    } catch (error) {
      next(error);
    }
  }
}

export default new CustomerController();
