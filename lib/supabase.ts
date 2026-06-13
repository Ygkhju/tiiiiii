import { createClient } from '@supabase/supabase-js'

const url  = process.env.NEXT_PUBLIC_SUPABASE_URL  ?? ''
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''

export const supabase = createClient(
  url  || 'https://placeholder.supabase.co',
  anon || 'placeholder',
  { auth: { persistSession: true, autoRefreshToken: true } }
)

export type Role = 'customer' | 'restaurant' | 'admin'

export type Profile = {
  id: string
  email: string
  name: string
  phone?: string
  role: Role
  avatar_url?: string
  status: 'pending' | 'approved' | 'rejected' | 'banned'
  // customer fields
  id_card_url?: string
  address?: string
  // restaurant fields
  restaurant_name?: string
  restaurant_description?: string
  restaurant_address?: string
  restaurant_phone?: string
  restaurant_logo_url?: string
  restaurant_cover_url?: string
  restaurant_cuisine?: string[]
  id_doc_url?: string
  ownership_doc_url?: string
  // ratings
  rating?: number
  review_count?: number
  created_at: string
}

export type MenuItem = {
  id: string
  restaurant_id: string
  name: string
  description: string
  image_url?: string
  price: number
  category?: string
  available: boolean
  created_at: string
}

export type Order = {
  id: string
  customer_id: string
  restaurant_id: string
  items: OrderItem[]
  status: OrderStatus
  subtotal: number
  delivery_fee: number
  total: number
  payment_method: PaymentMethod
  payment_status: 'pending' | 'paid'
  delivery_address: string
  notes?: string
  estimated_minutes: number
  created_at: string
}

export type OrderItem = {
  item_id: string
  name: string
  price: number
  qty: number
}

export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'picked_up' | 'delivering' | 'delivered' | 'cancelled'
export type PaymentMethod = 'cash' | 'card' | 'd17' | 'sobflous' | 'postpay'

export type Review = {
  id: string
  customer_id: string
  restaurant_id: string
  order_id: string
  rating: number
  comment: string
  customer_name?: string
  created_at: string
}

/* ── Auth ── */
export async function signIn(email: string, password: string) {
  return supabase.auth.signInWithPassword({ email, password })
}
export async function signUp(email: string, password: string) {
  return supabase.auth.signUp({ email, password })
}
export async function signOut() {
  return supabase.auth.signOut()
}
export async function getSession() {
  const { data } = await supabase.auth.getSession()
  return data.session
}
export async function getProfile(id: string): Promise<Profile | null> {
  const { data } = await supabase.from('profiles').select('*').eq('id', id).single()
  return data
}

export async function updateOrderStatus(orderId: string, status: OrderStatus) {
  return supabase.from('orders').update({ status }).eq('id', orderId)
}
