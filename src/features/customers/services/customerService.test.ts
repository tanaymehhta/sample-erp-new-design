import CustomerServiceClass from './customerService' // Import the class directly
import { ApiResponse } from '../../../shared/types/api'
import { Customer, Supplier, CreateCustomerRequest, CreateSupplierRequest } from '../types'

// Mock dependencies
const mockApiService = {
  post: jest.fn(),
  get: jest.fn(),
  put: jest.fn(), // Added
  delete: jest.fn(), // Added
}

const mockEventBus = {
  emit: jest.fn(),
  subscribe: jest.fn(),
  getEventHistory: jest.fn(),
  clearHistory: jest.fn(),
  getSubscriptions: jest.fn(),
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
  let testCustomerServiceInstance: CustomerServiceClass // Renamed for clarity
  
  beforeEach(() => {
    testCustomerServiceInstance = new CustomerServiceClass(mockApiService, mockEventBus) // Correct instantiation
    jest.clearAllMocks()
  })

  describe('getCustomers', () => {
    it('should fetch customers without affecting other features', async () => {
      const mockCustomers: Customer[] = [
        { id: '1', partyName: 'Customer 1', contactPerson: 'John Doe', phone: '123456789', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { id: '2', partyName: 'Customer 2', contactPerson: 'Jane Smith', phone: '987654321', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      ]
      
      const mockResponse: ApiResponse<Customer[]> = {
        success: true,
        data: mockCustomers,
      }

      mockApiService.get.mockResolvedValue(mockResponse)

      const result = await testCustomerServiceInstance.getCustomers() // Use new instance name

      expect(mockApiService.get).toHaveBeenCalledWith('/customers')
      expect(result).toEqual(mockResponse)
    })

    it('should handle API errors gracefully', async () => {
      const error = new Error('Network error')
      mockApiService.get.mockRejectedValue(error)

      await expect(testCustomerServiceInstance.getCustomers()).rejects.toThrow('Network error') // Use new instance name
    })
  })

  describe('getSuppliers', () => {
    it('should fetch suppliers without affecting other features', async () => {
      const mockSuppliers: Supplier[] = [
        { id: '1', partyName: 'Supplier 1', contactPerson: 'Bob Wilson', phone: '555123456', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { id: '2', partyName: 'Supplier 2', contactPerson: 'Alice Brown', phone: '555987654', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      ]
      
      const mockResponse: ApiResponse<Supplier[]> = {
        success: true,
        data: mockSuppliers,
      }

      mockApiService.get.mockResolvedValue(mockResponse)

      const result = await testCustomerServiceInstance.getSuppliers() // Use new instance name

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

      const mockCustomer: Customer = { id: '1', ...customerData, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
      const mockResponse: ApiResponse<Customer> = {
        success: true,
        data: mockCustomer,
      }

      mockApiService.post.mockResolvedValue(mockResponse)

      const result = await testCustomerServiceInstance.createCustomer(customerData) // Use new instance name

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

      await expect(testCustomerServiceInstance.createCustomer(customerData)).rejects.toThrow('Validation error') // Use new instance name
    })
  })

  describe('createSupplier', () => {
    it('should create supplier and emit event', async () => {
      const supplierData: CreateSupplierRequest = {
        partyName: 'New Supplier',
        contactPerson: 'Jane Smith',
        phone: '987654321',
      }

      const mockSupplier: Supplier = { id: '1', ...supplierData, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
      const mockResponse: ApiResponse<Supplier> = {
        success: true,
        data: mockSupplier,
      }

      mockApiService.post.mockResolvedValue(mockResponse)

      const result = await testCustomerServiceInstance.createSupplier(supplierData) // Use new instance name

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
        phone: '123456789',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      
      const mockResponse: ApiResponse<Customer> = {
        success: true,
        data: mockCustomer,
      }

      mockApiService.get.mockResolvedValue(mockResponse)

      const result = await testCustomerServiceInstance.getCustomer(customerId) // Use new instance name

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
        phone: '987654321',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      
      const mockResponse: ApiResponse<Supplier> = {
        success: true,
        data: mockSupplier,
      }

      mockApiService.get.mockResolvedValue(mockResponse)

      const result = await testCustomerServiceInstance.getSupplier(supplierId) // Use new instance name

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
        data: { id: '1', ...customerData, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      }

      mockApiService.post.mockResolvedValue(mockResponse)

      await testCustomerServiceInstance.createCustomer(customerData) // Use new instance name

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
        data: { id: '1', ...supplierData, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      }

      mockApiService.post.mockResolvedValue(mockResponse)

      await testCustomerServiceInstance.createSupplier(supplierData) // Use new instance name

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

      const mockCustomer: Customer = { id: '1', ...customerData, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
      const mockResponse: ApiResponse<Customer> = {
        success: true,
        data: mockCustomer,
      }

      mockApiService.post.mockResolvedValue(mockResponse)

      await testCustomerServiceInstance.createCustomer(customerData) // Use new instance name

      // Verify event emission for loose coupling
      expect(mockEventBus.emit).toHaveBeenCalledWith('customer.added', mockCustomer, 'CustomerService')
    })
  })
})
