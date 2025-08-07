import customerRepository from '../databases/repository/customer-repository.js';

class CustomerService {
  async createCustomer(customerData) {
    const existingCustomer = await customerRepository.findCustomerByPhone(customerData.phone);
    if (existingCustomer) {
      throw new Error('Customer with this phone number already exists.');
    }
    return await customerRepository.createCustomer(customerData);
  }

  async getCustomerById(customerId) {
    return await customerRepository.findCustomerById(customerId);
  }

  async getCustomerByPhone(phone) {
    return await customerRepository.findCustomerByPhone(phone);
  }

  async findOrCreateCustomer(customerData) {
    if (!customerData || !customerData.phone) {
      throw new Error('Customer phone number is required.');
    }
    let customer = await this.getCustomerByPhone(customerData.phone);
    if (!customer) {
      customer = await this.createCustomer(customerData);
    }
    return customer;
  }
}

export default new CustomerService();
