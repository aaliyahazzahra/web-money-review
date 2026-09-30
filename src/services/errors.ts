export class InvalidCredentialsError extends Error {
  constructor() {
    super('Invalid email or password')
    this.name = 'InvalidCredentialsError'
  }
}

export class EmailNotConfirmedError extends Error {
  constructor() {
    super('Email not confirmed')
    this.name = 'EmailNotConfirmedError'
  }
}

export class DuplicateCategoryError extends Error {
  constructor() {
    super('Category already exists')
    this.name = 'DuplicateCategoryError'
  }
}

/** Lempar Error jika respons Supabase berisi error. */
export function throwIfError(error: { message: string } | null): void {
  if (error) throw new Error(error.message)
}
