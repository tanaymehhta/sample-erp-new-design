# Enhanced MRPL Price Table

A sophisticated MRPL pricing table with dual-mode discounts, global and per-row controls, and reference tables.

## Features

### 🎛️ **Dual-Mode Discounts**
- **QD (Quantity Discount)**: Monthly vs Annual rates
- **MOU Discount**: Monthly vs Annual rates
- **Global Controls**: Toggle all rows simultaneously
- **Per-Row Override**: Individual row-level control

### 📊 **Interactive UI**
- **Global Toggle Bar**: Blue controls at the top
- **Column Headers**: Show current global mode
- **Row Toggles**: Mini buttons with visual indicators
- **Reference Tables**: Always-visible MOU and QD tables

### 🔄 **Real-Time Calculations**
- **Dynamic Final Price**: Updates based on selected modes
- **Visual Feedback**: Color-coded mode indicators
- **Override Indicators**: Yellow dots for row-level overrides

### 📋 **Layout Design**
```
┌─────────────────────────────────┬─────────────────┐
│        Global Controls          │                 │
│ QD: [Monthly] [Annual]          │   MOU Table     │
│ MOU: [Monthly] [Annual] [Reset] │   ┌───────────┐ │
│                                 │   │Monthly│0.9│ │
│           Main Table            │   │Yearly │0.5│ │
│  ┌─────────────────────────┐    │   └───────────┘ │
│  │Loc│Prod│QD ↻│MOU ↻│Final│    │                 │
│  │Mum│PP  │0.5 │1.6  │98.2 │    │   QD Table      │
│  │Del│PP  │0.4 │0.9  │97.8 │    │ ┌─────────────┐ │
│  └─────────────────────────┘    │ │A│5-8  │0.4  │ │
└─────────────────────────────────┴─┴─────────────┴─┘
```

## Usage

```tsx
import EnhancedMRPLPriceTable from './EnhancedMRPLPriceTable'

<EnhancedMRPLPriceTable
  data={mrplData}
  rateType="stockPoint"
  loading={false}
/>
```

## Data Structure

### MRPLPriceRow
```typescript
interface MRPLPriceRow {
  qd: {
    monthly: number
    annual: number
    currentMode: 'monthly' | 'annual'
  }
  mouDiscount: {
    monthly: number
    annual: number
    currentMode: 'monthly' | 'annual'
  }
  // ... other fields
}
```

### Toggle State
```typescript
interface MRPLToggleState {
  global: {
    qd: 'monthly' | 'annual'
    mou: 'monthly' | 'annual'
  }
  perRow: Record<string, {
    qd?: 'monthly' | 'annual'
    mou?: 'monthly' | 'annual'
  }>
}
```

## Key Components

1. **MRPLToggleControls**: Global toggle bar with reset
2. **MRPLRowToggle**: Individual row toggle buttons
3. **MRPLReferenceTables**: Side-by-side MOU and QD tables
4. **EnhancedMRPLPriceTable**: Main container component

## Interactive Features

- **Click global toggles**: Changes all rows at once
- **Click row toggles**: Override individual rows
- **Reset button**: Return all to monthly mode
- **Visual indicators**: Mode badges, override dots
- **Real-time updates**: Final prices recalculate instantly

## Responsive Design

- **Desktop**: 70/30 split (main table / reference tables)
- **Mobile**: Stacked layout with horizontal scroll
- **Hover effects**: Smooth transitions and scaling