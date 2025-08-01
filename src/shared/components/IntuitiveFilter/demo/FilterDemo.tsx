import { TableWithFilters, ColumnDefinition } from '../index'

// Sample data matching your screenshot
const sampleData = [
  {
    id: 14,
    date: '27-07-2025',
    saleParty: 'Alpine Coolers Pvt Ltd',
    quantitySold: 20000,
    saleRate: 91,
    product: '1018MK LLM 1 Mfi Non-Slip',
    purchaseParty: 'Agarwal Granules House',
    quantityPurchased: 20000,
    purchaseRate: 90,
    action: 'View'
  },
  {
    id: 15,
    date: '27-07-2025',
    saleParty: 'Date Format Test',
    quantitySold: 5000,
    saleRate: 95,
    product: 'TESTDATE Test Grade',
    purchaseParty: 'Test Supplier',
    quantityPurchased: 5000,
    purchaseRate: 85,
    action: 'View'
  },
  {
    id: 16,
    date: '26-07-2025',
    saleParty: 'Alpine Coolers Pvt Ltd',
    quantitySold: 15000,
    saleRate: 88,
    product: '1018MK Alpha Additive',
    purchaseParty: 'Alpha Additive',
    quantityPurchased: 15000,
    purchaseRate: 87,
    action: 'View'
  }
]

const columns: ColumnDefinition[] = [
  { key: 'id', label: 'Sr.No', type: 'number', sortable: true },
  { key: 'date', label: 'Date', type: 'date', sortable: true },
  { key: 'saleParty', label: 'Sale Party', type: 'text', sortable: true },
  { key: 'quantitySold', label: 'Quantity Sold', type: 'number', sortable: true },
  { key: 'saleRate', label: 'Sale Rate', type: 'currency', sortable: true },
  { key: 'product', label: 'Product', type: 'text', sortable: true },
  { key: 'purchaseParty', label: 'Purchase Party', type: 'text', sortable: true },
  { key: 'quantityPurchased', label: 'Quantity Purchased', type: 'number', sortable: true },
  { key: 'purchaseRate', label: 'Purchase Rate', type: 'currency', sortable: true },
  { key: 'action', label: 'Action', type: 'text', sortable: false }
]

export default function FilterDemo() {
  const renderRow = (item: any, _index: number, isHighlighted?: boolean) => (
    <div className={`grid grid-cols-10 gap-4 px-4 py-3 text-sm ${isHighlighted ? 'bg-blue-50' : ''}`}>
      <div className="font-medium text-gray-700">{item.id}</div>
      <div className="text-gray-900">{item.date}</div>
      <div className="font-medium text-gray-900">{item.saleParty}</div>
      <div className="text-right text-gray-900">{item.quantitySold.toLocaleString()} kg</div>
      <div className="text-right text-gray-900">₹{item.saleRate.toLocaleString()}</div>
      <div className="text-gray-600">
        <div className="font-medium">{item.product.split(' ')[0]}</div>
        <div className="text-xs text-gray-500">{item.product.split(' ').slice(1).join(' ')}</div>
      </div>
      <div className="font-medium text-gray-900">{item.purchaseParty}</div>
      <div className="text-right text-gray-900">{item.quantityPurchased.toLocaleString()} kg</div>
      <div className="text-right text-gray-900">₹{item.purchaseRate.toLocaleString()}</div>
      <div className="text-center">
        <button className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200 transition-colors">
          {item.action}
        </button>
      </div>
    </div>
  )

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Intuitive Filter System Demo</h1>
        <p className="text-gray-600">
          Hover over column headers to see the filter options. Try different interactions:
        </p>
        <ul className="text-sm text-gray-500 mt-2 space-y-1">
          <li>• <strong>Hover</strong> column headers to see filter bar</li>
          <li>• <strong>Click sort icon</strong> to toggle sorting</li>
          <li>• <strong>Click advanced menu</strong> for smart filters</li>
          <li>• <strong>Right-click rows</strong> to filter by cell value</li>
          <li>• <strong>Double-click rows</strong> to sort by first column</li>
        </ul>
      </div>

      <TableWithFilters
        data={sampleData}
        columns={columns}
        renderRow={renderRow}
        className="shadow-lg"
        onRowClick={(item) => console.log('Row clicked:', item)}
        onRowDoubleClick={(item) => console.log('Row double-clicked:', item)}
        onRowRightClick={(item) => console.log('Row right-clicked:', item)}
      />
    </div>
  )
}