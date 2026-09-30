import { createFakeSupabase } from '../test/fakeSupabase'
import { DuplicateCategoryError } from './errors'

const fake = createFakeSupabase()
vi.mock('./supabase', () => ({ supabase: fake.client }))

const { createCategory, listCategories } = await import('./categories')

beforeEach(() => {
  fake.calls.length = 0
})

describe('categories service', () => {
  it('assigns the next chart color from the total category count', async () => {
    fake.queue({ count: 12 }, { error: null })
    await createCategory({ name: 'Pets', type: 'expense', icon: 'dog' })
    expect(fake.find('insert')?.args[0]).toEqual({ name: 'Pets', type: 'expense', icon: 'dog', color: '#C58B1A' })
  })

  it('maps unique violation to DuplicateCategoryError', async () => {
    fake.queue({ count: 0 }, { error: { code: '23505', message: 'duplicate key' } })
    await expect(createCategory({ name: 'Food', type: 'expense', icon: 'utensils' })).rejects.toBeInstanceOf(DuplicateCategoryError)
  })

  it('lists all categories with archived flag', async () => {
    fake.queue({ data: [{ id: 1, name: 'Old', type: 'expense', icon: 'bus', color: '#3F7D58', deleted_at: '2026-09-01T00:00:00Z' }] })
    expect(await listCategories()).toEqual([{ id: 1, name: 'Old', type: 'expense', icon: 'bus', color: '#3F7D58', archived: true }])
  })
})
