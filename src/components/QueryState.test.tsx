import { render, screen } from '@testing-library/react'
import { QueryState } from './QueryState'

describe('QueryState', () => {
  it('keeps showing cached content when a background refetch fails', () => {
    render(<QueryState isLoading={false} isError hasData onRetry={() => {}}><p>content</p></QueryState>)
    expect(screen.getByText('content')).toBeInTheDocument()
    expect(screen.queryByText("Couldn't load data")).not.toBeInTheDocument()
  })

  it('shows the error view when nothing was loaded', () => {
    render(<QueryState isLoading={false} isError hasData={false} onRetry={() => {}}><p>content</p></QueryState>)
    expect(screen.getByText("Couldn't load data")).toBeInTheDocument()
  })
})
