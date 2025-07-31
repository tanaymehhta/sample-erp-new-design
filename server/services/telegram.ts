import axios from 'axios';

const TELEGRAM_API_TOKEN = process.env.TELEGRAM_API_TOKEN;
const TELEGRAM_API_URL = `https://api.telegram.org/bot${TELEGRAM_API_TOKEN}`;

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

export interface DealData {
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

export async function sendTelegramMessage(chatId: string, message: string) {
  if (!TELEGRAM_API_TOKEN) {
    console.warn('Telegram API token is not configured. Skipping message.');
    return;
  }

  try {
    const response = await axios.post(`${TELEGRAM_API_URL}/sendMessage`, {
      chat_id: chatId,
      text: message,
      parse_mode: 'Markdown', // Using Markdown for formatting consistency with WhatsApp
    });
    return response.data;
  } catch (error) {
    console.error(`Failed to send Telegram message to chat ID ${chatId}:`, error);
    throw error;
  }
}

export function generateTelegramAccountsMessage(deal: DealData): string {
  let purchaseDetails = ''
  
  if (deal.sources && deal.sources.length > 1) {
    // Multi-source deal
    purchaseDetails = `📦 Multi-Source Breakdown:\n${deal.sources.map((source, index) => 
  `${index + 1}. ${source.quantityUsed.toLocaleString()}kg from ${source.supplierName} @ ₹${source.costPerKg}/kg = ₹${(source.quantityUsed * source.costPerKg).toLocaleString()}`
).join('\n')}\n\n⚠️ Multi-supplier coordination required\nTotal Cost: ₹${deal.sources.reduce((sum, s) => sum + (s.quantityUsed * s.costPerKg), 0).toLocaleString()}\nDeal ID: #${deal.id.slice(-8).toUpperCase()}`
  } else if (deal.sources && deal.sources.length === 1) {
    // Single source from inventory
    const source = deal.sources[0]
    purchaseDetails = `Purchase from *${source.supplierName}*\nQuantity: ${source.quantityUsed} kg\nRate: ${source.costPerKg}\n${deal.purchaseComments ? `Comments: ${deal.purchaseComments}` : ''}`
  } else {
    // Traditional new material deal
    purchaseDetails = `Purchase from *${deal.purchaseParty}*\nQuantity: ${deal.purchaseQuantity} kg\nRate: ${deal.purchaseRate}\n${deal.purchaseComments ? `Comments: ${deal.purchaseComments}` : ''}`
  }

  return `Date: ${deal.date}\n\nSold to *${deal.saleParty}*\nQuantity: ${deal.quantitySold} kg\nRate: ${deal.saleRate} ${deal.deliveryTerms}\n${deal.saleComments ? `Comments: ${deal.saleComments}` : ''}\n\n*${deal.productCode}*  ${deal.company} ${deal.grade}\n\n${purchaseDetails}`
}

export function generateTelegramLogisticsMessage(deal: DealData): string {
  let supplierInfo = ''
  
  if (deal.sources && deal.sources.length > 1) {
    // Multi-source logistics
    supplierInfo = `📦 Multiple Suppliers:\n${deal.sources.map((source, index) => 
  `${index + 1}. ${source.quantityUsed.toLocaleString()}kg from ${source.supplierName}`
).join('\n')}\n\n⚠️ Coordinate multiple pickups/deliveries`
  } else if (deal.sources && deal.sources.length === 1) {
    supplierInfo = `Purchase from *${deal.sources[0].supplierName}*`
  } else {
    supplierInfo = `Purchase from *${deal.purchaseParty}*`
  }

  return `Sold to *${deal.saleParty}*\n${deal.company} ${deal.grade} *${deal.productCode}* \n${deal.quantitySold} kg\n${supplierInfo}\n${deal.warehouse ? `Warehouse: ${deal.warehouse}` : ''}`
}

export function generateTelegramBossMessage(deal: DealData): string {
  let purchaseDetails = ''
  
  if (deal.sources && deal.sources.length > 1) {
    // Multi-source summary for boss
    const totalCost = deal.sources.reduce((sum, s) => sum + (s.quantityUsed * s.costPerKg), 0)
    
    purchaseDetails = `📦 Multi-Source Purchase:\n${deal.sources.map((source, index) => 
  `${index + 1}. ${source.quantityUsed.toLocaleString()}kg from ${source.supplierName} @ ₹${source.costPerKg}/kg`
).join('\n')}\n\nTotal Purchase Cost: ₹${totalCost.toLocaleString()}\nSale Revenue: ₹${(deal.quantitySold * deal.saleRate).toLocaleString()}\nProfit: ₹${((deal.quantitySold * deal.saleRate) - totalCost).toLocaleString()}`
  } else if (deal.sources && deal.sources.length === 1) {
    const source = deal.sources[0]
    purchaseDetails = `Purchase from *${source.supplierName}*\nQuantity: ${source.quantityUsed} kg\nRate: ${source.costPerKg}\n${deal.purchaseComments ? `Comments: ${deal.purchaseComments}` : ''}`
  } else {
    purchaseDetails = `Purchase from *${deal.purchaseParty}*\nQuantity: ${deal.purchaseQuantity} kg\nRate: ${deal.purchaseRate}\n${deal.purchaseComments ? `Comments: ${deal.purchaseComments}` : ''}`
  }

  return `📊 DEAL SUMMARY FOR BOSS 📊\n\nDate: ${deal.date}\n\nSold to *${deal.saleParty}*\nQuantity: ${deal.quantitySold} kg\nRate: ${deal.saleRate} ${deal.deliveryTerms}\n${deal.saleComments ? `Comments: ${deal.saleComments}` : ''}\n\n*${deal.productCode}*  ${deal.company} ${deal.grade}\n\n${purchaseDetails}\n\nSold to *${deal.saleParty}*\n*${deal.productCode}*  ${deal.company} ${deal.grade}\n${deal.quantitySold} kg\nPurchase from *${deal.sources && deal.sources.length > 0 ? deal.sources[0].supplierName : deal.purchaseParty}*\n${deal.warehouse ? `Warehouse: ${deal.warehouse}` : ''}\n\n---\nSent from Polymer Trading System\n${new Date().toLocaleString()}`
}