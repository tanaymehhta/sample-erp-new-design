import axios from 'axios'

interface DealSource {
  id: string
  quantityUsed: number
  costPerKg: number
  supplierName: string
  selectionOrder: number
  inventory?: {
    purchaseParty: string
  }
}

interface DealData {
  id: string
  date: string
  saleParty: string
  quantitySold: number
  saleRate: number
  deliveryTerms: string
  productCode: string
  grade: string
  company: string
  specificGrade: string
  purchaseParty: string
  purchaseQuantity: number
  purchaseRate: number
  saleComments?: string
  purchaseComments?: string
  finalComments?: string
  warehouse?: string
  sources?: DealSource[]
}

const WHATSAPP_API_URL = process.env.WHATSAPP_API_URL
const WHATSAPP_API_TOKEN = process.env.WHATSAPP_API_TOKEN
const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID

// Phone numbers from environment
const PHONE_ACCOUNTS = process.env.WHATSAPP_PHONE_ACCOUNTS
const PHONE_LOGISTICS = process.env.WHATSAPP_PHONE_LOGISTICS
const PHONE_BOSS1 = process.env.WHATSAPP_PHONE_BOSS1
const PHONE_BOSSOG = process.env.WHATSAPP_PHONE_BOSSOG

export async function sendWhatsAppMessage(phoneNumber: string, message: string) {
  try {
    const response = await axios.post(
      `${WHATSAPP_API_URL}/${WHATSAPP_PHONE_NUMBER_ID}/messages`,
      {
        messaging_product: 'whatsapp',
        to: phoneNumber,
        type: 'text',
        text: {
          body: message
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${WHATSAPP_API_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    )
    
    return response.data
  } catch (error) {
    console.error(`Failed to send WhatsApp message to ${phoneNumber}:`, error)
    throw error
  }
}

function generateAccountsMessage(deal: DealData): string {
  let purchaseDetails = ''
  
  if (deal.sources && deal.sources.length > 1) {
    // Multi-source deal
    purchaseDetails = `📦 Multi-Source Breakdown:
${deal.sources.map((source, index) => 
  `${index + 1}. ${source.quantityUsed.toLocaleString()}kg from ${source.supplierName} @ ₹${source.costPerKg}/kg = ₹${(source.quantityUsed * source.costPerKg).toLocaleString()}`
).join('\n')}

⚠️ Multi-supplier coordination required
Total Cost: ₹${deal.sources.reduce((sum, s) => sum + (s.quantityUsed * s.costPerKg), 0).toLocaleString()}
Deal ID: #${deal.id.slice(-8).toUpperCase()}`
  } else if (deal.sources && deal.sources.length === 1) {
    // Single source from inventory
    const source = deal.sources[0]
    purchaseDetails = `Purchase from **${source.supplierName}**
Quantity: ${source.quantityUsed} kg
Rate: ₹${source.costPerKg}`
  } else {
    // Traditional new material deal
    purchaseDetails = `Purchase from **${deal.purchaseParty}**
Quantity: ${deal.purchaseQuantity} kg
Rate: ₹${deal.purchaseRate}`
  }

  return `📊 DEAL REGISTERED - ACCOUNTS

Date: ${deal.date}

Sold to **${deal.saleParty}**
Quantity: ${deal.quantitySold} kg
Rate: ₹${deal.saleRate} ${deal.deliveryTerms}
${deal.saleComments ? `Comments: ${deal.saleComments}` : ''}

**${deal.productCode}** ${deal.company} ${deal.grade}

${purchaseDetails}
${deal.purchaseComments ? `Comments: ${deal.purchaseComments}` : ''}

---
Polymer Trading System
${new Date().toLocaleString()}`
}

function generateLogisticsMessage(deal: DealData): string {
  let supplierInfo = ''
  
  if (deal.sources && deal.sources.length > 1) {
    // Multi-source logistics
    supplierInfo = `📦 Multiple Suppliers:
${deal.sources.map((source, index) => 
  `${index + 1}. ${source.quantityUsed.toLocaleString()}kg from ${source.supplierName}`
).join('\n')}

⚠️ Coordinate multiple pickups/deliveries`
  } else if (deal.sources && deal.sources.length === 1) {
    supplierInfo = `Purchase from **${deal.sources[0].supplierName}**`
  } else {
    supplierInfo = `Purchase from **${deal.purchaseParty}**`
  }

  return `🚚 LOGISTICS UPDATE

Date: ${deal.date}

Sold to **${deal.saleParty}**
**${deal.productCode}** ${deal.company} ${deal.grade}
${deal.quantitySold} kg

${supplierInfo}
${deal.warehouse ? `Warehouse: ${deal.warehouse}` : ''}

---
Polymer Trading System
${new Date().toLocaleString()}`
}

function generateBossMessage(deal: DealData): string {
  let purchaseDetails = ''
  
  if (deal.sources && deal.sources.length > 1) {
    // Multi-source summary for boss
    const totalCost = deal.sources.reduce((sum, s) => sum + (s.quantityUsed * s.costPerKg), 0)
    const avgCostPerKg = totalCost / deal.quantitySold
    
    purchaseDetails = `📦 Multi-Source Purchase:
${deal.sources.map((source, index) => 
  `${index + 1}. ${source.quantityUsed.toLocaleString()}kg from ${source.supplierName} @ ₹${source.costPerKg}/kg`
).join('\n')}

Total Purchase Cost: ₹${totalCost.toLocaleString()}
Avg Cost: ₹${avgCostPerKg.toFixed(2)}/kg
Sale Revenue: ₹${(deal.quantitySold * deal.saleRate).toLocaleString()}
Profit: ₹${((deal.quantitySold * deal.saleRate) - totalCost).toLocaleString()}

⚠️ Multi-supplier deal - requires coordination`
  } else if (deal.sources && deal.sources.length === 1) {
    const source = deal.sources[0]
    const profit = (deal.quantitySold * deal.saleRate) - (source.quantityUsed * source.costPerKg)
    purchaseDetails = `Purchase from **${source.supplierName}**
Quantity: ${source.quantityUsed} kg
Rate: ₹${source.costPerKg}
Sale Revenue: ₹${(deal.quantitySold * deal.saleRate).toLocaleString()}
Profit: ₹${profit.toLocaleString()}`
  } else {
    const profit = (deal.quantitySold * deal.saleRate) - (deal.purchaseQuantity * deal.purchaseRate)
    purchaseDetails = `Purchase from **${deal.purchaseParty}**
Quantity: ${deal.purchaseQuantity} kg
Rate: ₹${deal.purchaseRate}
Sale Revenue: ₹${(deal.quantitySold * deal.saleRate).toLocaleString()}
Profit: ₹${profit.toLocaleString()}`
  }

  return `📊 DEAL SUMMARY FOR BOSS 📊

Date: ${deal.date}

Sold to **${deal.saleParty}**
Quantity: ${deal.quantitySold} kg
Rate: ₹${deal.saleRate} ${deal.deliveryTerms}

**${deal.productCode}** ${deal.company} ${deal.grade}

${purchaseDetails}

${deal.warehouse ? `Warehouse: ${deal.warehouse}` : ''}

---
Sent from Polymer Trading System
${new Date().toLocaleString()}`
}

export async function sendWhatsAppNotifications(deal: DealData) {
  const notifications = []
  
  try {
    // Send to Accounts Team
    if (PHONE_ACCOUNTS) {
      const accountsMessage = generateAccountsMessage(deal)
      notifications.push(
        sendWhatsAppMessage(PHONE_ACCOUNTS, accountsMessage)
          .then(() => ({ recipient: 'accounts', status: 'success' }))
          .catch((error) => ({ recipient: 'accounts', status: 'failed', error: error.message }))
      )
    }
    
    // Send to Logistics Team
    if (PHONE_LOGISTICS) {
      const logisticsMessage = generateLogisticsMessage(deal)
      notifications.push(
        sendWhatsAppMessage(PHONE_LOGISTICS, logisticsMessage)
          .then(() => ({ recipient: 'logistics', status: 'success' }))
          .catch((error) => ({ recipient: 'logistics', status: 'failed', error: error.message }))
      )
    }
    
    // Send to Boss 1
    if (PHONE_BOSS1) {
      const bossMessage = generateBossMessage(deal)
      notifications.push(
        sendWhatsAppMessage(PHONE_BOSS1, bossMessage)
          .then(() => ({ recipient: 'boss1', status: 'success' }))
          .catch((error) => ({ recipient: 'boss1', status: 'failed', error: error.message }))
      )
    }
    
    // Send to Boss OG
    if (PHONE_BOSSOG) {
      const bossMessage = generateBossMessage(deal)
      notifications.push(
        sendWhatsAppMessage(PHONE_BOSSOG, bossMessage)
          .then(() => ({ recipient: 'bossog', status: 'success' }))
          .catch((error) => ({ recipient: 'bossog', status: 'failed', error: error.message }))
      )
    }
    
    // Wait for all notifications to complete
    const results = await Promise.allSettled(notifications)
    
    console.log('WhatsApp notifications sent:', results)
    return results
    
  } catch (error) {
    console.error('Error sending WhatsApp notifications:', error)
    throw error
  }
}