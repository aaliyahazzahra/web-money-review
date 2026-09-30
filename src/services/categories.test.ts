import { createFakeSupabase } from '../test/fakeSupabase'
import { CATEGORY_COLORS } from '../lib/icons'
import { DuplicateCategoryError } from './errors'

const fake = createFakeSupabase()
vi.mock('./supabase', () => ({ supabase: fake.client }))

const { createCategory, listCategories } = await import('./categories')

beforeEach(() => {
  fake.calls.length = 0
})

describe('categories service', () => {
  it('assigns the least-used palette color among active categories of the same type', async () => {
    fake.queue({ data: [{ color: '#2a78d6' }, { color: '#eb6834' }, { color: '#2a78d6' }] }, { error: null })
    await createCategory({ name: 'Pets', type: 'expense', icon: 'dog' })
    expect(fake.find('eq')?.args).toEqual(['type', 'expense'])
    expect(fake.find('is')?.args).toEqual(['deleted_at', null])
    expect(fake.find('insert')?.args[0]).toEqual({ name: 'Pets', type: 'expense', icon: 'dog', color: '#1baf7a' })
  })

  it('reuses the palette in order once every color is taken', async () => {
    fake.queue({ data: CATEGORY_COLORS.map((color) => ({ color })) }, { error: null })
    await createCategory({ name: 'Extra', type: 'expense', icon: 'dog' })
    expect((fake.find('insert')?.args[0] as { color: string }).color).toBe(CATEGORY_COLORS[0])
  })

  it('maps unique violation to DuplicateCategoryError', async () => {
    fake.queue({ data: [] }, { error: { code: '23505', message: 'duplicate key' } })
    await expect(createCategory({ name: 'Food', type: 'expense', icon: 'utensils' })).rejects.toBeInstanceOf(DuplicateCategoryError)
  })

  it('lists all categories with archived flag', async () => {
    fake.queue({ data: [{ id: 1, name: 'Old', type: 'expense', icon: 'bus', color: '#3F7D58', deleted_at: '2026-09-01T00:00:00Z' }] })
    expect(await listCategories()).toEqual([{ id: 1, name: 'Old', type: 'expense', icon: 'bus', color: '#3F7D58', archived: true }])
  })
})
