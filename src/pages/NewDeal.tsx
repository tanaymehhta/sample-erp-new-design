import NewDealForm from '../features/deals/components/NewDealForm'
import { ErrorBoundary } from '../shared/components'

export default function NewDeal() {
  return (
    <ErrorBoundary>
      <NewDealForm />
    </ErrorBoundary>
  )
}