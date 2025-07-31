import { ApiResponse } from '../../../shared/types/api'
import { apiService } from '../../../shared/services/apiService'
import { eventBus } from '../../../shared/services/eventBus'
import { Product, CreateProductRequest } from '../types'

export interface ProductServiceInterface {
  getProducts(): Promise<ApiResponse<Product[]>>
  createProduct(productData: CreateProductRequest): Promise<ApiResponse<Product>>
  getProduct(id: string): Promise<ApiResponse<Product>>
  updateProduct(id: string, productData: Partial<CreateProductRequest>): Promise<ApiResponse<Product>>
  deleteProduct(id: string): Promise<ApiResponse<void>>
  searchProducts(query: string): Promise<ApiResponse<Product[]>>
}

class ProductService implements ProductServiceInterface {
  private readonly endpoint = '/products'

  async getProducts(): Promise<ApiResponse<Product[]>> {
    try {
      console.log('📦 ProductService: Fetching products')
      
      const response = await apiService.get<Product[]>(this.endpoint)
      
      console.log('✅ ProductService: Products fetched successfully')
      return response
    } catch (error) {
      console.error('❌ ProductService: Failed to fetch products', error)
      throw error
    }
  }

  async createProduct(productData: CreateProductRequest): Promise<ApiResponse<Product>> {
    try {
      console.log('📦 ProductService: Creating product', productData.productCode)
      
      const response = await apiService.post<Product>(this.endpoint, productData)
      
      if (response.success && response.data) {
        eventBus.emit('product.added', response.data, 'ProductService')
        console.log('✅ ProductService: Product created successfully')
      }
      
      return response
    } catch (error) {
      console.error('❌ ProductService: Failed to create product', error)
      throw error
    }
  }

  async getProduct(id: string): Promise<ApiResponse<Product>> {
    try {
      console.log('📦 ProductService: Fetching product', id)
      
      const response = await apiService.get<Product>(`${this.endpoint}/${id}`)
      
      console.log('✅ ProductService: Product fetched successfully')
      return response
    } catch (error) {
      console.error('❌ ProductService: Failed to fetch product', error)
      throw error
    }
  }

  async updateProduct(id: string, productData: Partial<CreateProductRequest>): Promise<ApiResponse<Product>> {
    try {
      console.log('📦 ProductService: Updating product', id)
      
      const response = await apiService.put<Product>(`${this.endpoint}/update`, { id, ...productData })
      
      if (response.success && response.data) {
        eventBus.emit('product.updated', response.data, 'ProductService')
        console.log('✅ ProductService: Product updated successfully')
      }
      
      return response
    } catch (error) {
      console.error('❌ ProductService: Failed to update product', error)
      throw error
    }
  }

  async deleteProduct(id: string): Promise<ApiResponse<void>> {
    try {
      console.log('📦 ProductService: Deleting product', id)
      
      const response = await apiService.delete<void>(`${this.endpoint}/remove/${id}`)
      
      if (response.success) {
        eventBus.emit('product.deleted', { id }, 'ProductService')
        console.log('✅ ProductService: Product deleted successfully')
      }
      
      return response
    } catch (error) {
      console.error('❌ ProductService: Failed to delete product', error)
      throw error
    }
  }

  async searchProducts(query: string): Promise<ApiResponse<Product[]>> {
    try {
      console.log('📦 ProductService: Searching products', query)
      
      const response = await apiService.get<Product[]>(`${this.endpoint}/search`, { q: query })
      
      console.log('✅ ProductService: Product search completed')
      return response
    } catch (error) {
      console.error('❌ ProductService: Failed to search products', error)
      throw error
    }
  }
}

// Create singleton instance
export const productService = new ProductService()

// Export class for dependency injection
export default ProductService