// ...new file...
export type Role = 'tenant' | 'landlord' | 'admin' | 'owner' | 'broker'

export interface UserProfile {
  id: string
  email: string
  full_name: string
  phone_number?: string | null
  role: Role
  is_active: boolean
  preferred_language: 'en' | 'am' | 'om'
  preferred_currency: 'ETB' | 'USD'
  created_at: string
  updated_at: string
}