# Price List Feature

A comprehensive price list management system for different companies (MRPL, Nayara, Supreme) with support for different rate types and historical data viewing.

## Features

### 🏢 **Multi-Company Support**
- **MRPL**: Stock Point & Ex-Plant rates with MOU discounts, additional discounts
- **Nayara**: Stock Point & Ex-Plant rates with introductory discounts, post-sale discounts
- **Supreme**: Unique layout with main price table + quantity discount table

### 📊 **Rate Types**
- **Stock Point Rate**: Pricing at stock/warehouse locations
- **Ex-Plant Rate**: Pricing direct from manufacturing plant (includes transport)

### 📅 **Historical Data**
- Monthly historical data from January 2024 onwards
- Expandable/collapsible historical view
- Month selector dropdown
- Smooth animations and transitions

### 🎨 **Professional UI**
- Color-coded columns (yellow for basic prices, green for final prices)
- Responsive design works on all screen sizes
- Modern cards and smooth animations
- Loading states and error handling

## Architecture

### Component Structure
```
components/
├── PriceListMain.tsx           # Main container with company/rate selection
├── BasePriceTable.tsx          # Shared table component
├── MonthlyDataToggle.tsx       # Historical data toggle
└── tables/
    ├── MRPLPriceTable.tsx      # MRPL-specific table layout
    ├── NayaraPriceTable.tsx    # Nayara-specific table layout
    └── SupremePriceTable.tsx   # Supreme with main + discount tables
```

### Data Flow
```
PriceListService ← → usePriceList Hook ← → PriceListMain
                                      ↓
                            Company-Specific Tables
```

### Key Features Implementation
- **Modular Design**: Each company has its own table component
- **Service Layer**: Centralized data management with mock data
- **Hook-based State**: React hooks for state management
- **TypeScript**: Full type safety with comprehensive interfaces
- **Responsive**: Mobile-first design approach

## Usage

```tsx
import { PriceListMain } from '../features/price-list'

// Use in a page
<PriceListMain />
```

## Data Structure

### Company Data
Each company has:
- Current month data
- Historical data by month
- Company-specific pricing structure
- Different discount types

### Mock Data
Realistic mock data generated for:
- 10+ products per company
- 6+ months of historical data
- Different pricing adjustments over time
- Location-based pricing variations

## Navigation Integration

Added to main navigation with:
- Route: `/price-list`
- Icon: DollarSign (💰)
- Color: Yellow theme
- Position: Between Inventory and Analytics

## Future Enhancements

1. **Real API Integration**: Replace mock service with actual API calls
2. **Export Features**: PDF/Excel export of price lists
3. **Price Comparison**: Side-by-side company comparisons
4. **Pricing Analytics**: Trends and insights
5. **User Permissions**: Role-based access to different companies
6. **Price Alerts**: Notifications for price changes

## Development Notes

- Follows CLAUDE.md modular architecture guidelines
- Loosely coupled components
- Easy to add new companies or rate types
- Comprehensive TypeScript typing
- Error boundaries and loading states
- Smooth animations with Framer Motion