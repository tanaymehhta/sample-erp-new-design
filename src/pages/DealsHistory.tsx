import DealsHistoryComponent from '../features/deals/components/DealsHistory'
import { ErrorBoundary } from '../shared/components'

export default function DealsHistory() {
  return (
    <ErrorBoundary>
      <DealsHistoryComponent />
    </ErrorBoundary>
  )
}