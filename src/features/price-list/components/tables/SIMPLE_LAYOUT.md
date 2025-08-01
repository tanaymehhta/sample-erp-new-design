# Simple MRPL Layout - Final Version

Clean, professional layout with optional reference tables.

## 🎯 **Layout Behavior**

### **Default State** (Reference Tables Hidden)
```
┌─────────────────────────────────────────────────────────────┐
│                    Global Controls                  [Show]  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│                   MAIN TABLE                                │
│                   (Full Width)                              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### **Toggled State** (Reference Tables Visible)
```
┌─────────────────────────────────┬───────────────────────────┐
│      Global Controls    [Hide]  │                           │
├─────────────────────────────────┤     REFERENCE TABLES      │
│                                 │                           │
│           MAIN TABLE            │   ┌─────────────────┐     │
│         (66% Width)             │   │   MOU TABLE     │     │
│                                 │   └─────────────────┘     │
│                                 │   ┌─────────────────┐     │
│                                 │   │   QD TABLE      │     │
│                                 │   └─────────────────┘     │
└─────────────────────────────────┴───────────────────────────┘
```

## ✨ **Key Features**

### **🔄 Simple Toggle**
- **Button**: Eye icon + "Show/Hide Reference Tables"
- **Position**: Top-right of controls bar
- **Action**: Single click to toggle

### **📊 Responsive Layout**
- **Hidden**: Main table uses full width (grid-cols-1)
- **Shown**: Main table 66% + Reference tables 33% (grid-cols-12, col-span-8/4)
- **Smooth transition**: 300ms duration with grid animation

### **🎨 Professional Design**
- **No overlays**: Everything inline, no z-index issues
- **Clean spacing**: 6-unit gap between main and reference
- **Consistent styling**: Same design language as existing tables

## 🚀 **User Experience**

1. **Default**: User sees full-width main table with all functionality
2. **Click "Show Reference Tables"**: Reference tables slide in from right, main table shrinks
3. **Click "Hide Reference Tables"**: Reference tables fade out, main table expands to full width
4. **All QD/MOU toggles work**: Functionality preserved throughout

## 💻 **Technical Implementation**

- **Grid System**: CSS Grid with dynamic column classes
- **Animation**: Framer Motion with smooth transitions
- **State**: Simple boolean toggle (showReferenceTables)
- **Performance**: Reference tables only render when visible
- **Mobile**: Responsive breakpoints maintained

Perfect balance of **functionality** and **simplicity**! 🎯