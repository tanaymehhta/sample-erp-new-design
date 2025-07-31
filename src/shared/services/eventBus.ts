import { SystemEvent } from '../types/api'

type EventCallback = (event: SystemEvent) => void

export interface EventBusInterface {
  subscribe(eventType: string, callback: EventCallback): () => void
  emit(eventType: string, payload: any, source?: string): void
  getEventHistory(eventType?: string): SystemEvent[]
  clearHistory(): void
  getSubscriptions(): string[]
}

class EventBus implements EventBusInterface {
  private subscribers: Map<string, EventCallback[]> = new Map()
  private eventHistory: SystemEvent[] = []
  private maxHistorySize = 100

  // Subscribe to events
  subscribe(eventType: string, callback: EventCallback): () => void {
    if (!this.subscribers.has(eventType)) {
      this.subscribers.set(eventType, [])
    }
    
    this.subscribers.get(eventType)!.push(callback)
    console.log(`📡 EventBus: Subscribed to '${eventType}'`)
    
    // Return unsubscribe function
    return () => {
      const callbacks = this.subscribers.get(eventType)
      if (callbacks) {
        const index = callbacks.indexOf(callback)
        if (index > -1) {
          callbacks.splice(index, 1)
          console.log(`📡 EventBus: Unsubscribed from '${eventType}'`)
        }
      }
    }
  }

  // Emit events
  emit(eventType: string, payload: any, source: string = 'unknown'): void {
    const event: SystemEvent = {
      type: eventType,
      payload,
      timestamp: new Date(),
      source
    }

    // Add to history
    this.eventHistory.push(event)
    if (this.eventHistory.length > this.maxHistorySize) {
      this.eventHistory.shift()
    }

    console.log(`📡 EventBus: Emitting '${eventType}' from '${source}'`, payload)

    // Notify subscribers
    const callbacks = this.subscribers.get(eventType)
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(event)
        } catch (error) {
          console.error(`📡 EventBus: Error in callback for '${eventType}':`, error)
        }
      })
    }
  }

  // Get event history
  getEventHistory(eventType?: string): SystemEvent[] {
    if (eventType) {
      return this.eventHistory.filter(event => event.type === eventType)
    }
    return [...this.eventHistory]
  }

  // Clear history
  clearHistory(): void {
    this.eventHistory = []
    console.log('📡 EventBus: History cleared')
  }

  // Get active subscriptions
  getSubscriptions(): string[] {
    return Array.from(this.subscribers.keys())
  }
}

// Export class for dependency injection
export { EventBus }

// Create singleton instance
export const eventBus = new EventBus()

// Event types constants
export const EVENT_TYPES = {
  // Deal events
  DEAL_CREATED: 'deal.created',
  DEAL_UPDATED: 'deal.updated',
  DEAL_DELETED: 'deal.deleted',
  
  // Inventory events
  INVENTORY_UPDATED: 'inventory.updated',
  INVENTORY_LOW_STOCK: 'inventory.low_stock',
  
  // Customer events
  CUSTOMER_ADDED: 'customer.added',
  CUSTOMER_UPDATED: 'customer.updated',
  
  // System events
  SYNC_STARTED: 'sync.started',
  SYNC_COMPLETED: 'sync.completed',
  SYNC_FAILED: 'sync.failed',
  
  // Notification events
  WHATSAPP_SENT: 'whatsapp.sent',
  WHATSAPP_FAILED: 'whatsapp.failed',
} as const

export type EventType = typeof EVENT_TYPES[keyof typeof EVENT_TYPES]