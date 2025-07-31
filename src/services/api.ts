import axios from 'axios'

const API_BASE_URL = process.env.VITE_API_URL || 'http://localhost:3001/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
})

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log('API Request:', config.method?.toUpperCase(), config.url)
    return config
  },
  (error) => {
    console.error('API Request Error:', error)
    return Promise.reject(error)
  }
)

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.status, response.config.url)
    return response
  },
  (error) => {
    console.error('API Response Error:', error.response?.data || error.message)
    
    // Handle specific error cases
    if (error.response?.status === 401) {
      // Handle unauthorized
      console.error('Unauthorized access')
    } else if (error.response?.status >= 500) {
      // Handle server errors
      console.error('Server error occurred')
    }
    
    return Promise.reject(error)
  }
)

// Deal API functions
export const dealAPI = {
  // Get all deals
  getDeals: async () => {
    const response = await api.get('/deals')
    return response.data
  },

  // Create new deal
  createDeal: async (dealData: any) => {
    const response = await api.post('/deals', dealData)
    return response.data
  },

  // Get deal by ID
  getDeal: async (id: string) => {
    const response = await api.get(`/deals/${id}`)
    return response.data
  },
}

// WhatsApp API functions
export const whatsappAPI = {
  // Test WhatsApp message
  testMessage: async (phoneNumber: string, message: string) => {
    const response = await api.post('/whatsapp/test', { phoneNumber, message })
    return response.data
  },

  // Get WhatsApp status
  getStatus: async () => {
    const response = await api.get('/whatsapp/status')
    return response.data
  },
}

// Google Sheets API functions
export const sheetsAPI = {
  // Sync deal to Google Sheets
  syncDeal: async (dealData: any) => {
    const response = await api.post('/sheets/sync', { dealData })
    return response.data
  },

  // Get data from specific sheet
  getSheetData: async (sheetName: string) => {
    const response = await api.get(`/sheets/data/${sheetName}`)
    return response.data
  },

  // Test Google Sheets connection
  testConnection: async () => {
    const response = await api.get('/sheets/test')
    return response.data
  },
}

// Health check
export const healthAPI = {
  check: async () => {
    const response = await api.get('/health')
    return response.data
  },
}

export default api