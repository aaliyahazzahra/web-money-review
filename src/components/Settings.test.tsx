import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DuplicateCategoryError, InvalidCredentialsError } from '../services/errors'
import type { Category } from '../types'
import { ToastProvider } from './Toast'

const categories: Category[] = [
  { id: 1, name: 'Food', type: 'expense', icon: 'utensils', color: '#2a78d6', archived: false },
  { id: 2, name: 'Old stuff', type: 'expense', icon: 'bus', color: '#eb6834', archived: true },
  { id: 3, name: 'Salary', type: 'income', icon: 'wallet', color: '#1baf7a', archived: false },
]
const create = vi.fn()
const update = vi.fn()
const archive = vi.fn()
const changePassword = vi.fn()

vi.mock('../hooks/useCategories', () => ({
  useCategories: () => ({ data: categories, isLoading: false, isError: false }),
  useCategoryMutations: () => ({
    create: { mutateAsync: create, isPending: false },
    update: { mutateAsync: update, isPending: false },
    archive: { mutateAsync: archive, isPending: false },
  }),
}))
vi.mock('../services/auth', () => ({ changePassword: (...a: unknown[]) => changePassword(...a) }))

const { CategoryManager } = await import('./CategoryManager')
const { ChangePasswordForm } = await import('./ChangePasswordForm')

beforeEach(() => {
  for (const fn of [create, update, archive, changePassword]) fn.mockReset().mockResolvedValue(undefined)
})

const renderWithToast = (ui: React.ReactNode) => render(<ToastProvider>{ui}</ToastProvider>)

describe('CategoryManager', () => {
  it('lists only active categories per type', () => {
    renderWithToast(<CategoryManager />)
    const expense = screen.getByRole('region', { name: 'Expense categories' })
    expect(within(expense).getByText('Food')).toBeInTheDocument()
    expect(within(expense).queryByText('Old stuff')).not.toBeInTheDocument()
    expect(within(screen.getByRole('region', { name: 'Income categories' })).getByText('Salary')).toBeInTheDocument()
  })

  it('archives only after confirmation', async () => {
    renderWithToast(<CategoryManager />)
    await userEvent.click(screen.getByRole('button', { name: 'Delete Food' }))
    expect(screen.getByText('Delete category? Existing transactions will keep it.')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(archive).not.toHaveBeenCalled()

    await userEvent.click(screen.getByRole('button', { name: 'Delete Food' }))
    await userEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Delete' }))
    expect(archive).toHaveBeenCalledWith(1)
    expect(await screen.findByText('Category deleted')).toBeInTheDocument()
  })

  it('requires a name', async () => {
    renderWithToast(<CategoryManager />)
    await userEvent.click(within(screen.getByRole('region', { name: 'Expense categories' })).getByRole('button', { name: 'Add category' }))
    await userEvent.click(screen.getByRole('button', { name: 'Save category' }))
    expect(screen.getByText('Name is required')).toBeInTheDocument()
    expect(create).not.toHaveBeenCalled()
  })

  it('creates with the chosen icon and reports duplicates', async () => {
    create.mockRejectedValueOnce(new DuplicateCategoryError())
    renderWithToast(<CategoryManager />)
    await userEvent.click(within(screen.getByRole('region', { name: 'Expense categories' })).getByRole('button', { name: 'Add category' }))
    await userEvent.type(screen.getByLabelText('Name'), 'food')
    await userEvent.click(screen.getByRole('radio', { name: 'dog' }))
    await userEvent.click(screen.getByRole('button', { name: 'Save category' }))
    expect(create).toHaveBeenCalledWith({ name: 'food', type: 'expense', icon: 'dog' })
    expect(await screen.findByText('Category already exists')).toBeInTheDocument()
  })

  it('edits name and icon but not type', async () => {
    renderWithToast(<CategoryManager />)
    await userEvent.click(screen.getByRole('button', { name: 'Edit Food' }))
    const name = screen.getByLabelText('Name')
    await userEvent.clear(name)
    await userEvent.type(name, 'Meals')
    await userEvent.click(screen.getByRole('button', { name: 'Save category' }))
    expect(update).toHaveBeenCalledWith({ id: 1, name: 'Meals', icon: 'utensils' })
    expect(await screen.findByText('Saved')).toBeInTheDocument()
  })
})

describe('ChangePasswordForm', () => {
  async function fill(current: string, next: string, confirm: string) {
    await userEvent.type(screen.getByLabelText('Current password'), current)
    await userEvent.type(screen.getByLabelText('New password'), next)
    await userEvent.type(screen.getByLabelText('Confirm new password'), confirm)
    await userEvent.click(screen.getByRole('button', { name: 'Change password' }))
  }

  it('enforces minimum length', async () => {
    renderWithToast(<ChangePasswordForm />)
    await fill('oldpass12', '1234567', '1234567')
    expect(screen.getByText('Password must be at least 8 characters')).toBeInTheDocument()
    expect(changePassword).not.toHaveBeenCalled()
  })

  it('requires matching confirmation', async () => {
    renderWithToast(<ChangePasswordForm />)
    await fill('oldpass12', '12345678', '12345679')
    expect(screen.getByText('Passwords do not match')).toBeInTheDocument()
  })

  it('reports a wrong current password', async () => {
    changePassword.mockRejectedValue(new InvalidCredentialsError())
    renderWithToast(<ChangePasswordForm />)
    await fill('wrongpass', '12345678', '12345678')
    expect(await screen.findByText('Current password is incorrect')).toBeInTheDocument()
  })

  it('changes the password and clears the form', async () => {
    renderWithToast(<ChangePasswordForm />)
    await fill('oldpass12', '12345678', '12345678')
    expect(changePassword).toHaveBeenCalledWith('oldpass12', '12345678')
    expect(await screen.findByText('Password changed')).toBeInTheDocument()
    expect(screen.getByLabelText('New password')).toHaveValue('')
  })
})
