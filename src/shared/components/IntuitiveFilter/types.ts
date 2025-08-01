export type ColumnType = 'text' | 'number' | 'date' | 'currency'

export interface ColumnDefinition {
  key: string
  label: string
  type: ColumnType
  sortable?: boolean
  filterable?: boolean
}

export interface FilterValue {
  text?: string[]
  number?: {
    min?: number
    max?: number
    values?: number[]
  }
  date?: {
    from?: string
    to?: string
    presets?: DatePreset[]
  }
  currency?: {
    min?: number
    max?: number
    values?: number[]
  }
}

export type DatePreset = 
  | 'today'
  | 'yesterday' 
  | 'this-week'
  | 'last-week'
  | 'this-month'
  | 'last-month'
  | 'last-30-days'
  | 'this-quarter'
  | 'this-year'

export interface ActiveFilter {
  column: string
  value: FilterValue
  label: string
}

export interface SortState {
  column: string
  direction: 'asc' | 'desc'
}

export interface FilterBarProps {
  columns: ColumnDefinition[]
  data: any[]
  onFilterChange: (filters: ActiveFilter[]) => void
  onSortChange: (sort: SortState | null) => void
  activeFilters: ActiveFilter[]
  sortState: SortState | null
}