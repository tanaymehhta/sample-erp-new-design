# Deal Actions Components

This directory contains modular components for handling deal row actions (edit and delete) with smooth animations and delightful user experience.

## Components

### DealRowActions.tsx
**Purpose:** Provides hover-based action buttons for each deal row.

**Features:**
- Desktop: Hover-reveal actions with spring animations
- Mobile: Dropdown menu with slide-in effects
- Icons rotate on hover for micro-interactions
- Responsive design (different UX for desktop/mobile)

**APIs:**
- `onEdit(deal: Deal)`: Triggered when edit button is clicked
- `onDelete(deal: Deal)`: Triggered when delete button is clicked

### EditDealModal.tsx
**Purpose:** Full-featured modal for editing deal information with form validation.

**Features:**  
- Form morphing animations with field focus effects
- Real-time validation with shake animations
- Save progress indicator with success animation
- Unsaved changes tracking
- Auto-close after successful save
- Reset functionality with spring transitions

**APIs:**
- `deal: Deal | null`: Deal to edit
- `isOpen: boolean`: Modal visibility state
- `onClose()`: Close modal callback
- `onSaved(updatedDeal: Deal)`: Success callback with updated deal

### DeleteConfirmation.tsx
**Purpose:** Multi-step delete confirmation with undo functionality.

**Features:**
- Two-step confirmation process
- Deal summary preview in confirmation
- Loading animation during deletion
- Success state with undo countdown (5 seconds)
- Progress bar animation for undo timer
- Particle/checkmark animations for visual feedback

**APIs:**
- `deal: Deal | null`: Deal to delete
- `isOpen: boolean`: Modal visibility state  
- `onClose()`: Close modal callback
- `onDeleted(dealId: string)`: Success callback with deleted deal ID

## Integration

The components are integrated into `DealsHistory.tsx`:

```tsx
// Action handlers
const handleEditDeal = (deal: Deal) => setEditingDeal(deal)
const handleDeleteDeal = (deal: Deal) => setDeletingDeal(deal)

// In table row
<DealRowActions
  deal={deal}
  onEdit={handleEditDeal}
  onDelete={handleDeleteDeal}
/>

// Modal components
<EditDealModal
  deal={editingDeal}
  isOpen={!!editingDeal}
  onClose={() => setEditingDeal(null)}
  onSaved={handleDealSaved}
/>

<DeleteConfirmation
  deal={deletingDeal}
  isOpen={!!deletingDeal}
  onClose={() => setDeletingDeal(null)}
  onDeleted={handleDealDeleted}
/>
```

## Dependencies

- **External:** `framer-motion` for animations, `lucide-react` for icons
- **Internal:** Deal service, event bus, shared components
- **Patterns:** Follows modular architecture from CLAUDE.md

## Animations

All components use spring physics for natural motion:
- **Hover effects:** Scale + rotation micro-interactions
- **Modals:** Scale + fade entrance/exit with backdrop
- **Forms:** Field focus scaling + validation shake
- **Loading states:** Rotation + pulse animations
- **Success states:** Checkmark drawing + particle effects

## Future Enhancements

- Keyboard shortcuts (E for edit, Delete for delete)
- Swipe gestures for mobile
- Batch operations for multiple deals
- Advanced undo/redo system
- Optimistic updates for faster perceived performance