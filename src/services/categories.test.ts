import { createFakeSupabase } from '../test/fakeSupabase'
import { DuplicateCategoryError } from './errors'

const fake = createFakeSupabase()
vi.mock('./supabase', () => ({ supabase: fake.client }))

const { createCategory, listCategories, updateCategory } = await import('./categories')

beforeEach(() => {
  fake.calls.length = 0
})

describe('categories service', () => {
  it('creates with the chosen color', async () => {
    fake.queue({ error: null })
    await createCategory({ name: ' Pets ', type: 'expense', icon: 'dog', color: '#a1b2c3' })
    expect(fake.find('insert')?.args[0]).toEqual({ name: 'Pets', type: 'expense', icon: 'dog', color: '#a1b2c3' })
  })

  it('updates name, icon and color', async () => {
    fake.queue({ error: null })
    await updateCategory(7, { name: 'Meals', icon: 'utensils', color: '#123456' })
    expect(fake.find('update')?.args[0]).toEqual({ name: 'Meals', icon: 'utensils', color: '#123456' })
    expect(fake.find('eq')?.args).toEqual(['id', 7])
  })

  it('maps unique violation to DuplicateCategoryError', async () => {
    fake.queue({ error: { code: '23505', message: 'duplicate key' } })
    await expect(createCategory({ name: 'Food', type: 'expense', icon: 'utensils', color: '#2a78d6' })).rejects.toBeInstanceOf(DuplicateCategoryError)
  })

  it('lists all categories with archived flag', async () => {
    fake.queue({ data: [{ id: 1, name: 'Old', type: 'expense', icon: 'bus', color: '#3F7D58', deleted_at: '2026-09-01T00:00:00Z' }] })
    expect(await listCategories()).toEqual([{ id: 1, name: 'Old', type: 'expense', icon: 'bus', color: '#3F7D58', archived: true }])
  })
})
