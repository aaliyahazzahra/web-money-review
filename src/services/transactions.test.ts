import { createFakeSupabase } from '../test/fakeSupabase'

const fake = createFakeSupabase()
vi.mock('./supabase', () => ({ supabase: fake.client }))

const { deleteTransaction, listTransactions, createTransaction } = await import('./transactions')

beforeEach(() => {
  fake.calls.length = 0
})

describe('transactions service', () => {
  it('soft-deletes by setting deleted_at and never calls delete', async () => {
    fake.queue({ error: null })
    await deleteTransaction(7)
    expect(fake.find('from')?.args).toEqual(['tb_transactions'])
    const update = fake.find('update')
    expect(typeof (update?.args[0] as { deleted_at: unknown }).deleted_at).toBe('string')
    expect(fake.find('eq')?.args).toEqual(['id', 7])
    expect(fake.methods()).not.toContain('delete')
  })

  it('lists from vw_transactions in a date range and maps to camelCase', async () => {
    fake.queue({
      data: [{
        id: 1, type: 'expense', amount: 25000, category_id: 3, transaction_date: '2026-09-30', note: null,
        category_name: 'Old', category_icon: 'bus', category_color: '#2F6B9A', category_archived: true,
      }],
    })
    const rows = await listTransactions({ from: '2026-09-01', to: '2026-09-30' })
    expect(fake.find('from')?.args).toEqual(['vw_transactions'])
    expect(fake.find('gte')?.args).toEqual(['transaction_date', '2026-09-01'])
    expect(fake.find('lte')?.args).toEqual(['transaction_date', '2026-09-30'])
    expect(rows).toEqual([{
      id: 1, type: 'expense', amount: 25000, categoryId: 3, date: '2026-09-30', note: null,
      categoryName: 'Old', categoryIcon: 'bus', categoryColor: '#2F6B9A', categoryArchived: true,
    }])
  })

  it('throws when supabase returns an error', async () => {
    fake.queue({ error: { message: 'network down' } })
    await expect(createTransaction({ type: 'expense', amount: 1, categoryId: 1, date: '2026-09-30', note: null }))
      .rejects.toThrow('network down')
  })
})
