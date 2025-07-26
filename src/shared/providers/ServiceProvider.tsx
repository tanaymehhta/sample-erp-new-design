import React, { createContext, useContext, ReactNode } from 'react'
import { DIContainer, ServiceRegistry, container } from '../di/container'

// React context for dependency injection
interface ServiceContextType {
  container: DIContainer
  getService: <K extends keyof ServiceRegistry>(name: K) => ServiceRegistry[K]
}

const ServiceContext = createContext<ServiceContextType | null>(null)

// Service provider component
interface ServiceProviderProps {
  children: ReactNode
  container?: DIContainer
}

export function ServiceProvider({ children, container: customContainer }: ServiceProviderProps) {
  const serviceContainer = customContainer || container
  
  const contextValue: ServiceContextType = {
    container: serviceContainer,
    getService: <K extends keyof ServiceRegistry>(name: K) => serviceContainer.get(name)
  }

  return (
    <ServiceContext.Provider value={contextValue}>
      {children}
    </ServiceContext.Provider>
  )
}

// Hook to use services in components
export function useServices(): ServiceContextType {
  const context = useContext(ServiceContext)
  if (!context) {
    throw new Error('useServices must be used within a ServiceProvider')
  }
  return context
}

// Convenience hooks for specific services
export function useService<K extends keyof ServiceRegistry>(name: K): ServiceRegistry[K] {
  const { getService } = useServices()
  return getService(name)
}

export function useDealService() {
  return useService('dealService')
}

export function useCustomerService() {
  return useService('customerService')
}

export function useInventoryService() {
  return useService('inventoryService')
}

export function useApiService() {
  return useService('apiService')
}

export function useEventBus() {
  return useService('eventBus')
}

// Higher-order component for class components
export function withServices<P extends object>(
  Component: React.ComponentType<P & { services: ServiceContextType }>
) {
  return function WithServicesComponent(props: P) {
    const services = useServices()
    return <Component {...props} services={services} />
  }
}