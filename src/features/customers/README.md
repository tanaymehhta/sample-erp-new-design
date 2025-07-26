# Customers Feature

## Purpose
Manages customer and supplier data for the Polymer Trading System. Handles CRUD operations for parties involved in trading transactions.

## Dependencies
- **ApiService** (for HTTP requests to customer/supplier endpoints)
- **EventBus** (for emitting customer lifecycle events)

## Components
- Customer management forms
- Supplier management forms
- Customer/supplier search and selection components

## Services
- **CustomerService**: Manages customer and supplier data operations
- **ProductService**: Handles product catalog management

## APIs

### CustomerService
- `getCustomers()`: Fetches all customers
- `getSuppliers()`: Fetches all suppliers  
- `createCustomer(data)`: Creates a new customer
- `createSupplier(data)`: Creates a new supplier
- `getCustomer(id)`: Fetches specific customer by ID
- `getSupplier(id)`: Fetches specific supplier by ID

### ProductService
- `getProducts()`: Fetches all products
- `createProduct(data)`: Creates a new product
- `updateProduct(id, data)`: Updates existing product
- `deleteProduct(id)`: Removes a product

## Events Emitted
- `customer.added`: When a new customer is created
- `supplier.added`: When a new supplier is created
- `customer.updated`: When customer data is modified

## Types
- `Customer`: Customer entity with contact and business details
- `Supplier`: Supplier entity with company information
- `Product`: Product catalog item with specifications

## State Management
Uses feature-specific state for customer/supplier selection and form data.