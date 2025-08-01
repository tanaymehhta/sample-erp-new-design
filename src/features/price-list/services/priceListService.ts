import { 
  PriceListData, 
  CompanyType, 
  RateType, 
  MRPLPriceRow, 
  NayaraPriceRow, 
  SupremePriceRow,
  SupremeDiscountRow 
} from '../types'

class PriceListService {
  private static instance: PriceListService
  private mockData: PriceListData

  private constructor() {
    this.mockData = this.generateMockData()
  }

  static getInstance(): PriceListService {
    if (!PriceListService.instance) {
      PriceListService.instance = new PriceListService()
    }
    return PriceListService.instance
  }

  async getPriceData(company: CompanyType, rateType: RateType): Promise<any[]> {
    await new Promise(resolve => setTimeout(resolve, 300))
    
    if (company === 'supreme') {
      return this.mockData.supreme[rateType].current.main
    }
    
    return this.mockData[company][rateType].current as any[]
  }

  async getHistoricalData(company: CompanyType, rateType: RateType, month: string): Promise<any[]> {
    await new Promise(resolve => setTimeout(resolve, 200))
    
    if (company === 'supreme') {
      return this.mockData.supreme[rateType].historical[month]?.main || []
    }
    
    return this.mockData[company][rateType].historical[month] as any[] || []
  }

  async getSupremeDiscounts(rateType: RateType): Promise<SupremeDiscountRow[]> {
    await new Promise(resolve => setTimeout(resolve, 100))
    return this.mockData.supreme[rateType].current.discounts
  }

  getAvailableMonths(): string[] {
    return ['2024-01', '2024-02', '2024-03', '2024-04', '2024-05', '2024-06', '2024-07']
  }

  private generateMockData(): PriceListData {
    return {
      mrpl: {
        stockPoint: {
          current: this.generateMRPLData('stock'),
          historical: {
            '2024-01': this.generateMRPLData('stock', -2),
            '2024-02': this.generateMRPLData('stock', -1.5),
            '2024-03': this.generateMRPLData('stock', -1),
            '2024-04': this.generateMRPLData('stock', -0.5),
            '2024-05': this.generateMRPLData('stock', 0.2),
            '2024-06': this.generateMRPLData('stock', 0.5),
          }
        },
        exPlant: {
          current: this.generateMRPLData('exPlant'),
          historical: {
            '2024-01': this.generateMRPLData('exPlant', -2),
            '2024-02': this.generateMRPLData('exPlant', -1.5),
            '2024-03': this.generateMRPLData('exPlant', -1),
            '2024-04': this.generateMRPLData('exPlant', -0.5),
            '2024-05': this.generateMRPLData('exPlant', 0.2),
            '2024-06': this.generateMRPLData('exPlant', 0.5),
          }
        }
      },
      nayara: {
        stockPoint: {
          current: this.generateNayaraData('stock'),
          historical: {
            '2024-01': this.generateNayaraData('stock', -1.8),
            '2024-02': this.generateNayaraData('stock', -1.2),
            '2024-03': this.generateNayaraData('stock', -0.8),
            '2024-04': this.generateNayaraData('stock', -0.3),
            '2024-05': this.generateNayaraData('stock', 0.1),
            '2024-06': this.generateNayaraData('stock', 0.4),
          }
        },
        exPlant: {
          current: this.generateNayaraData('exPlant'),
          historical: {
            '2024-01': this.generateNayaraData('exPlant', -1.8),
            '2024-02': this.generateNayaraData('exPlant', -1.2),
            '2024-03': this.generateNayaraData('exPlant', -0.8),
            '2024-04': this.generateNayaraData('exPlant', -0.3),
            '2024-05': this.generateNayaraData('exPlant', 0.1),
            '2024-06': this.generateNayaraData('exPlant', 0.4),
          }
        }
      },
      supreme: {
        stockPoint: {
          current: {
            main: this.generateSupremeData('stock'),
            discounts: this.generateSupremeDiscounts()
          },
          historical: {
            '2024-01': { main: this.generateSupremeData('stock', -1.5), discounts: this.generateSupremeDiscounts() },
            '2024-02': { main: this.generateSupremeData('stock', -1), discounts: this.generateSupremeDiscounts() },
            '2024-03': { main: this.generateSupremeData('stock', -0.5), discounts: this.generateSupremeDiscounts() },
            '2024-04': { main: this.generateSupremeData('stock', 0), discounts: this.generateSupremeDiscounts() },
            '2024-05': { main: this.generateSupremeData('stock', 0.3), discounts: this.generateSupremeDiscounts() },
            '2024-06': { main: this.generateSupremeData('stock', 0.6), discounts: this.generateSupremeDiscounts() },
          }
        },
        exPlant: {
          current: {
            main: this.generateSupremeData('exPlant'),
            discounts: this.generateSupremeDiscounts()
          },
          historical: {
            '2024-01': { main: this.generateSupremeData('exPlant', -1.5), discounts: this.generateSupremeDiscounts() },
            '2024-02': { main: this.generateSupremeData('exPlant', -1), discounts: this.generateSupremeDiscounts() },
            '2024-03': { main: this.generateSupremeData('exPlant', -0.5), discounts: this.generateSupremeDiscounts() },
            '2024-04': { main: this.generateSupremeData('exPlant', 0), discounts: this.generateSupremeDiscounts() },
            '2024-05': { main: this.generateSupremeData('exPlant', 0.3), discounts: this.generateSupremeDiscounts() },
            '2024-06': { main: this.generateSupremeData('exPlant', 0.6), discounts: this.generateSupremeDiscounts() },
          }
        }
      }
    }
  }

  private generateMRPLData(type: 'stock' | 'exPlant', priceAdjustment = 0): MRPLPriceRow[] {
    const locations = ['Bhiwandi', 'Mangalore']
    const products = ['PP Raffia', 'PP TQ', 'PP Moulding', 'PP Lamination', 'PP Thermofoaming']
    const grades = ['HR003', 'HF010', 'HM012T', 'HY035R', 'HT003']
    
    return locations.flatMap(location => 
      products.map((product, idx) => {
        const basePrice = 100 + Math.random() * 5 + priceAdjustment
        const cd = 1.1 // Always fixed
        const xyzDiscount = Math.random() * 0.5 + priceAdjustment * 0.1
        const sd = Math.random() * 0.3 + priceAdjustment * 0.05
        const transport = type === 'exPlant' ? 2.75 : 0
        
        // Dual-mode values
        const qd = {
          monthly: 0.5,
          annual: 0.5,
          currentMode: 'monthly' as const
        }
        
        const mouDiscount = {
          monthly: 0.9,
          annual: 1.4,
          currentMode: 'monthly' as const
        }
        
        const priceAfterCD = basePrice - cd
        const currentQD = qd.currentMode === 'monthly' ? qd.monthly : qd.annual
        const currentMOU = mouDiscount.currentMode === 'monthly' ? mouDiscount.monthly : mouDiscount.annual
        const finalPrice = priceAfterCD - currentQD - currentMOU - xyzDiscount - sd - transport
        const totalDiscount = cd + currentQD + currentMOU + xyzDiscount + sd
        
        return {
          location,
          product,
          grade: grades[idx],
          basic: Number(basePrice.toFixed(3)),
          cd,
          priceAfterCD: Number(priceAfterCD.toFixed(3)),
          qd,
          mouDiscount,
          sd: Number(sd.toFixed(3)),
          xyzDiscount: Number(xyzDiscount.toFixed(3)),
          additionalDiscount: type === 'stock' ? Number((Math.random() * 0.2).toFixed(3)) : undefined,
          priceProtection: type === 'stock' ? Number((Math.random() * 0.1).toFixed(3)) : undefined,
          transport: type === 'exPlant' ? transport : undefined,
          finalPrice: Number(finalPrice.toFixed(3)),
          totalDiscount: Number(totalDiscount.toFixed(3))
        }
      })
    )
  }

  getMRPLReferenceTables(): { mou: any[], qd: any[] } {
    return {
      mou: [
        { type: 'Monthly', value: 0.9 },
        { type: 'Yearly', value: 0.5 }
      ],
      qd: [
        { grade: 'A', range: '5 TO 8.975', discount: 0.4 },
        { grade: 'A', range: '9 TO 24.975', discount: 0.45 },
        { grade: 'B', range: '25 TO 49.975', discount: 0.5 },
        { grade: 'C', range: '50 TO 99.975', discount: 0.55 },
        { grade: 'D', range: '100 TO 199.975', discount: 0.65 },
        { grade: 'E', range: '200 TO 299.975', discount: 0.75 },
        { grade: 'F', range: '300 TO 399.975', discount: 0.85 },
        { grade: 'G', range: '400 TO 499.975', discount: 0.95 },
        { grade: 'H', range: '500 TO 599.975', discount: 1.0 },
        { grade: 'I', range: '600 TO 699.975', discount: 1.05 },
        { grade: 'J', range: '700 TO 799.975', discount: 1.1 },
        { grade: 'K', range: '800 TO 899.975', discount: 1.2 }
      ]
    }
  }

  private generateNayaraData(type: 'stock' | 'exPlant', priceAdjustment = 0): NayaraPriceRow[] {
    const locations = ['Bhiwandi', 'Daman']
    const products = ['PP Raffia', 'PP Moulding', 'PP TQ']
    const grades = ['H036RG', 'H120IG', 'H110QS', 'NH036RG', 'NH120IG', 'NH110QS']
    
    return locations.flatMap(location =>
      products.flatMap(product =>
        grades.slice(0, 3).map(grade => {
          const basePrice = 99 + Math.random() * 4 + priceAdjustment
          const cd = 1.1
          const mouDiscount = 1.5
          const introductoryDiscount = 2.0
          const qd = 0.5
          const transport = type === 'exPlant' ? 2.0 : 0
          const postSaleDiscount = type === 'exPlant' ? 2.0 : 0
          const xyzDiscount = type === 'exPlant' ? 3.5 : 0
          
          const priceToPay = basePrice - cd - mouDiscount - introductoryDiscount
          const finalPrice = priceToPay - postSaleDiscount - xyzDiscount - transport
          const totalDiscount = cd + mouDiscount + introductoryDiscount + postSaleDiscount + xyzDiscount
          
          return {
            location,
            product,
            grade,
            basic: Number(basePrice.toFixed(2)),
            cd,
            priceAfterCD: Number((basePrice - cd).toFixed(2)),
            qd,
            mouDiscount,
            sd: 0,
            introductoryDiscount,
            priceToPay: Number(priceToPay.toFixed(2)),
            postSaleDiscount: type === 'exPlant' ? postSaleDiscount : undefined,
            xyzDiscount: type === 'exPlant' ? xyzDiscount : 0,
            transport: type === 'exPlant' ? transport : undefined,
            finalPrice: type === 'exPlant' ? Number(finalPrice.toFixed(2)) : Number(priceToPay.toFixed(2)),
            totalDiscount: Number(totalDiscount.toFixed(2))
          }
        })
      )
    )
  }

  private generateSupremeData(_type: 'stock' | 'exPlant', priceAdjustment = 0): SupremePriceRow[] {
    const locations = ['Daman', 'Bhiwandi']
    const products = ['GPPS', 'HIPS']
    const grades = ['SC203EL', 'SC202EC', 'SC200', 'SC206', 'SC201LV', 'SH300', 'SH731E', 'SH450', 'SH03']
    
    return locations.flatMap(location =>
      products.flatMap((product, prodIdx) =>
        grades.slice(prodIdx * 4, (prodIdx + 1) * 5).map(grade => {
          const basePrice = 105 + Math.random() * 15 + priceAdjustment
          const cd = 1.6
          const discount = 0.3
          const transport = location === 'Bhiwandi' ? 0.915 : 1.1
          
          const priceToPay = basePrice - cd - discount
          const finalPrice = priceToPay - transport
          
          return {
            location,
            product,
            grade,
            basic: Number(basePrice.toFixed(0)),
            cd,
            discount,
            transport: Number(transport.toFixed(3)),
            priceToPay: Number(priceToPay.toFixed(3)),
            finalPrice: Number(finalPrice.toFixed(3))
          }
        })
      )
    )
  }

  private generateSupremeDiscounts(): SupremeDiscountRow[] {
    return [
      { qty: 200, discount: 0, perKgDiscount: 0 },
      { qty: 250, discount: 25000, perKgDiscount: 0.100 },
      { qty: 300, discount: 50000, perKgDiscount: 0.167 },
      { qty: 350, discount: 75000, perKgDiscount: 0.214 },
      { qty: 400, discount: 112500, perKgDiscount: 0.281 },
      { qty: 450, discount: 150000, perKgDiscount: 0.333 },
      { qty: 500, discount: 187500, perKgDiscount: 0.375 },
      { qty: 550, discount: 237500, perKgDiscount: 0.432 },
      { qty: 600, discount: 287500, perKgDiscount: 0.479 },
      { qty: 650, discount: 337500, perKgDiscount: 0.519 },
      { qty: 700, discount: 400000, perKgDiscount: 0.571 },
      { qty: 750, discount: 462500, perKgDiscount: 0.617 },
      { qty: 800, discount: 525000, perKgDiscount: 0.656 },
      { qty: 850, discount: 600000, perKgDiscount: 0.706 },
      { qty: 900, discount: 675000, perKgDiscount: 0.750 },
      { qty: 950, discount: 750000, perKgDiscount: 0.789 },
      { qty: 1000, discount: 825000, perKgDiscount: 0.825 },
      { qty: 1050, discount: 905000, perKgDiscount: 0.862 },
      { qty: 1100, discount: 985000, perKgDiscount: 0.895 }
    ]
  }
}

export default PriceListService