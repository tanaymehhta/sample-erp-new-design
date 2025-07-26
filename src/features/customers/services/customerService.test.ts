import { CustomerService } from './customerService'
import { ApiResponse } from '../../../shared/types/api'
import { Customer, Supplier, CreateCustomerRequest, CreateSupplierRequest } from '../types'

// Mock dependencies
const mockApiService = {
  post: jest.fn(),
  get: jest.fn(),
}

const mockEventBus = {
  emit: jest.fn(),
}

// Mock the imports
jest.mock('../../../shared/services/apiService', () => ({
  apiService: mockApiService,
}))

jest.mock('../../../shared/services/eventBus', () => ({
  eventBus: mockEventBus,
  EVENT_TYPES: {
    CUSTOMER_ADDED: 'customer.added',
    CUSTOMER_UPDATED: 'customer.updated',
  },
}))

describe('CustomerService', () => {
  let customerService: CustomerService
  
  beforeEach(() => {
    customerService = new CustomerService()
    jest.clearAllMocks()
  })

  describe('getCustomers', () => {
    it('should fetch customers without affecting other features', async () => {
      const mockCustomers: Customer[] = [
        { id: '1', partyName: 'Customer 1', contactPerson: 'John Doe', phone: '123456789' },
        { id: '2', partyName: 'Customer 2', contactPerson: 'Jane Smith', phone: '987654321' },
      ]
      
      const mockResponse: ApiResponse<Customer[]> = {
        success: true,
        data: mockCustomers,
      }

      mockApiService.get.mockResolvedValue(mockResponse)

      const result = await customerService.getCustomers()

      expect(mockApiService.get).toHaveBeenCalledWith('/customers')
      expect(result).toEqual(mockResponse)
    })

    it('should handle API errors gracefully', async () => {
      const error = new Error('Network error')
      mockApiService.get.mockRejectedValue(error)

      await expect(customerService.getCustomers()).rejects.toThrow('Network error')
    })
  })

  describe('getSuppliers', () => {
    it('should fetch suppliers without affecting other features', async () => {
      const mockSuppliers: Supplier[] = [
        { id: '1', partyName: 'Supplier 1', contactPerson: 'Bob Wilson', phone: '555123456' },
        { id: '2', partyName: 'Supplier 2', contactPerson: 'Alice Brown', phone: '555987654' },
      ]
      
      const mockResponse: ApiResponse<Supplier[]> = {
        success: true,
        data: mockSuppliers,
      }

      mockApiService.get.mockResolvedValue(mockResponse)

      const result = await customerService.getSuppliers()

      expect(mockApiService.get).toHaveBeenCalledWith('/suppliers')
      expect(result).toEqual(mockResponse)
    })
  })

  describe('createCustomer', () => {
    it('should create customer and emit event without affecting deals feature', async () => {
      const customerData: CreateCustomerRequest = {
        partyName: 'New Customer',
        contactPerson: 'John Doe',
        phone: '123456789',
        email: 'john@example.com',
      }

      const mockCustomer: Customer = { id: '1', ...customerData }
      const mockResponse: ApiResponse<Customer> = {
        success: true,
        data: mockCustomer,
      }

      mockApiService.post.mockResolvedValue(mockResponse)

      const result = await customerService.createCustomer(customerData)

      expect(mockApiService.post).toHaveBeenCalledWith('/customers', customerData)
      expect(mockEventBus.emit).toHaveBeenCalledWith('customer.added', mockCustomer, 'CustomerService')
      expect(result).toEqual(mockResponse)
    })

    it('should handle customer creation failure', async () => {
      const customerData: CreateCustomerRequest = {
        partyName: 'New Customer',
        contactPerson: 'John Doe',
        phone: '123456789',
      }

      const error = new Error('Validation error')
      mockApiService.post.mockRejectedValue(error)

      await expect(customerService.createCustomer(customerData)).rejects.toThrow('Validation error')
    })
  })

  describe('createSupplier', () => {
    it('should create supplier and emit event', async () => {
      const supplierData: CreateSupplierRequest = {
        partyName: 'New Supplier',
        contactPerson: 'Jane Smith',
        phone: '987654321',
        company: 'Supplier Corp',
      }

      const mockSupplier: Supplier = { id: '1', ...supplierData }
      const mockResponse: ApiResponse<Supplier> = {
        success: true,
        data: mockSupplier,
      }

      mockApiService.post.mockResolvedValue(mockResponse)

      const result = await customerService.createSupplier(supplierData)

      expect(mockApiService.post).toHaveBeenCalledWith('/suppliers', supplierData)
      expect(mockEventBus.emit).toHaveBeenCalledWith('supplier.added', mockSupplier, 'CustomerService')
      expect(result).toEqual(mockResponse)
    })
  })

  describe('getCustomer', () => {
    it('should fetch specific customer by ID', async () => {
      const customerId = '1'
      const mockCustomer: Customer = { 
        id: customerId, 
        partyName: 'Customer 1', 
        contactPerson: 'John Doe', 
        phone: '123456789' 
      }
      
      const mockResponse: ApiResponse<Customer> = {
        success: true,
        data: mockCustomer,
      }

      mockApiService.get.mockResolvedValue(mockResponse)

      const result = await customerService.getCustomer(customerId)

      expect(mockApiService.get).toHaveBeenCalledWith('/customers/1')
      expect(result).toEqual(mockResponse)
    })
  })

  describe('getSupplier', () => {
    it('should fetch specific supplier by ID', async () => {
      const supplierId = '1'
      const mockSupplier: Supplier = { 
        id: supplierId, 
        partyName: 'Supplier 1', 
        contactPerson: 'Jane Smith', 
        phone: '987654321' 
      }
      
      const mockResponse: ApiResponse<Supplier> = {
        success: true,
        data: mockSupplier,
      }

      mockApiService.get.mockResolvedValue(mockResponse)

      const result = await customerService.getSupplier(supplierId)

      expect(mockApiService.get).toHaveBeenCalledWith('/suppliers/1')
      expect(result).toEqual(mockResponse)
    })
  })

  describe('feature isolation', () => {
    it('should operate independently without affecting deals feature', async () => {
      const customerData: CreateCustomerRequest = {
        partyName: 'Test Customer',
        contactPerson: 'John Doe',
        phone: '123456789',
      }

      const mockResponse: ApiResponse<Customer> = {
        success: true,
        data: { id: '1', ...customerData },
      }

      mockApiService.post.mockResolvedValue(mockResponse)

      await customerService.createCustomer(customerData)

      // Verify only customer-specific endpoints are called
      expect(mockApiService.post).toHaveBeenCalledWith('/customers', customerData)
      expect(mockApiService.post).not.toHaveBeenCalledWith('/deals', expect.any(Object))
    })

    it('should not directly modify inventory or analytics data', async () => {
      const supplierData: CreateSupplierRequest = {
        partyName: 'Test Supplier',
        contactPerson: 'Jane Smith',
        phone: '987654321',
      }

      const mockResponse: ApiResponse<Supplier> = {
        success: true,
        data: { id: '1', ...supplierData },
      }

      mockApiService.post.mockResolvedValue(mockResponse)

      await customerService.createSupplier(supplierData)

      // Verify no direct calls to other feature endpoints
      expect(mockApiService.post).not.toHaveBeenCalledWith('/inventory', expect.any(Object))
      expect(mockApiService.post).not.toHaveBeenCalledWith('/analytics', expect.any(Object))
    })

    it('should use events for cross-feature communication', async () => {
      const customerData: CreateCustomerRequest = {
        partyName: 'Event Test Customer',
        contactPerson: 'John Doe',
        phone: '123456789',
      }

      const mockCustomer: Customer = { id: '1', ...customerData }
      const mockResponse: ApiResponse<Customer> = {
        success: true,
        data: mockCustomer,
      }

      mockApiService.post.mockResolvedValue(mockResponse)

      await customerService.createCustomer(customerData)

      // Verify event emission for loose coupling
      expect(mockEventBus.emit).toHaveBeenCalledWith('customer.added', mockCustomer, 'CustomerService')
    })
  })
})