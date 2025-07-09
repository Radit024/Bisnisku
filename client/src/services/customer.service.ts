/**
 * Customer service
 */

import { ApiService } from './api';
import { queryClient } from '@/lib/queryClient';
import type { Customer, InsertCustomer } from '@/types';

class CustomerService extends ApiService {
  constructor() {
    super(import.meta.env.VITE_API_URL || '', queryClient);
  }

  async getCustomers(): Promise<Customer[]> {
    return this.get<Customer[]>('/customers');
  }

  async getCustomerById(id: number): Promise<Customer> {
    return this.get<Customer>(`/customers/${id}`);
  }

  async createCustomer(customerData: InsertCustomer): Promise<Customer> {
    const customer = await this.post<Customer>('/customers', customerData);
    this.invalidateQueries(['customers']);
    return customer;
  }

  async updateCustomer(id: number, customerData: Partial<InsertCustomer>): Promise<Customer> {
    const customer = await this.patch<Customer>(`/customers/${id}`, customerData);
    this.invalidateQueries(['customers']);
    return customer;
  }

  async deleteCustomer(id: number): Promise<void> {
    await this.delete(`/customers/${id}`);
    this.invalidateQueries(['customers']);
  }

  async searchCustomers(query: string): Promise<Customer[]> {
    const customers = await this.getCustomers();
    return customers.filter(customer => 
      customer.name.toLowerCase().includes(query.toLowerCase()) ||
      customer.email?.toLowerCase().includes(query.toLowerCase()) ||
      customer.phone?.includes(query)
    );
  }

  // Cache management
  invalidateCustomerCache(): void {
    this.invalidateQueries(['customers']);
  }
}

export const customerService = new CustomerService();