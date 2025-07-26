import { ApiResponse } from '../../../shared/types/api'
import { ApiServiceInterface } from '../../../shared/services/apiService'
import { EventBusInterface, EVENT_TYPES } from '../../../shared/services/eventBus'
import { Customer, Supplier, CreateCustomerRequest, CreateSupplierRequest } from '../types'

export interface CustomerServiceInterface {
  getCustomers(): Promise<ApiResponse<Customer[]>>
  getSuppliers(): Promise<ApiResponse<Supplier[]>>
  createCustomer(customerData: CreateCustomerRequest): Promise<ApiResponse<Customer>>
  createSupplier(supplierData: CreateSupplierRequest): Promise<ApiResponse<Supplier>>
  getCustomer(id: string): Promise<ApiResponse<Customer>>
  getSupplier(id: string): Promise<ApiResponse<Supplier>>
}

class CustomerService implements CustomerServiceInterface {
  private readonly customersEndpoint = '/customers'
  private readonly suppliersEndpoint = '/suppliers'

  constructor(
    private apiService: ApiServiceInterface,
    private eventBus: EventBusInterface
  ) {}

  async getCustomers(): Promise<ApiResponse<Customer[]>> {
    try {
      console.log('👥 CustomerService: Fetching customers')
      
      const response = await this.apiService.get<Customer[]>(this.customersEndpoint)
      
      console.log('✅ CustomerService: Customers fetched successfully')
      return response
    } catch (error) {
      console.error('❌ CustomerService: Failed to fetch customers', error)
      throw error
    }
  }

  async getSuppliers(): Promise<ApiResponse<Supplier[]>> {
    try {
      console.log('🏭 CustomerService: Fetching suppliers')
      
      const response = await this.apiService.get<Supplier[]>(this.suppliersEndpoint)
      
      console.log('✅ CustomerService: Suppliers fetched successfully')
      return response
    } catch (error) {
      console.error('❌ CustomerService: Failed to fetch suppliers', error)
      throw error
    }
  }

  async createCustomer(customerData: CreateCustomerRequest): Promise<ApiResponse<Customer>> {
    try {
      console.log('👥 CustomerService: Creating customer', customerData.partyName)
      
      const response = await this.apiService.post<Customer>(this.customersEndpoint, customerData)
      
      if (response.success && response.data) {
        this.eventBus.emit(EVENT_TYPES.CUSTOMER_ADDED, response.data, 'CustomerService')
        console.log('✅ CustomerService: Customer created successfully')
      }
      
      return response
    } catch (error) {
      console.error('❌ CustomerService: Failed to create customer', error)
      throw error
    }
  }

  async createSupplier(supplierData: CreateSupplierRequest): Promise<ApiResponse<Supplier>> {
    try {
      console.log('🏭 CustomerService: Creating supplier', supplierData.partyName)
      
      const response = await this.apiService.post<Supplier>(this.suppliersEndpoint, supplierData)
      
      if (response.success && response.data) {
        this.eventBus.emit('supplier.added', response.data, 'CustomerService')
        console.log('✅ CustomerService: Supplier created successfully')
      }
      
      return response
    } catch (error) {
      console.error('❌ CustomerService: Failed to create supplier', error)
      throw error
    }
  }

  async getCustomer(id: string): Promise<ApiResponse<Customer>> {
    try {
      console.log('👥 CustomerService: Fetching customer', id)
      
      const response = await this.apiService.get<Customer>(`${this.customersEndpoint}/${id}`)
      
      console.log('✅ CustomerService: Customer fetched successfully')
      return response
    } catch (error) {
      console.error('❌ CustomerService: Failed to fetch customer', error)
      throw error
    }
  }

  async getSupplier(id: string): Promise<ApiResponse<Supplier>> {
    try {
      console.log('🏭 CustomerService: Fetching supplier', id)
      
      const response = await this.apiService.get<Supplier>(`${this.suppliersEndpoint}/${id}`)
      
      console.log('✅ CustomerService: Supplier fetched successfully')
      return response
    } catch (error) {
      console.error('❌ CustomerService: Failed to fetch supplier', error)
      throw error
    }
  }
}

// Export class for dependency injection
export default CustomerService

// Temporary backward compatibility without DI container to avoid circular dependency
import { apiService } from '../../../shared/services/apiService'
import { eventBus } from '../../../shared/services/eventBus'

export const customerService = new CustomerService(apiService, eventBus)