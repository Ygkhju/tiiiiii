import { createClient } from '@supabase/supabase-js'

const supabaseUrl  = process.env.NEXT_PUBLIC_SUPABASE_URL  || ''
const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export const supabase = createClient(supabaseUrl, supabaseAnon)

/* ─── Database Types ─── */
export type Role = 'customer' | 'restaurant' | 'admin' | 'driver'

export type User = {
  id: string
  email: string
  phone?: string
  name: string
  role: Role
  avatar_url?: string
  verified: boolean
  created_at: string
}

export type Restaurant = {
  id: string
  owner_id: string
  name: string
  description: string
  logo_url?: string
  cover_url?: string
  cuisine: string[]
  address: string
  lat: number
  lng: number
  rating: number
  review_count: number
  delivery_time: string
  delivery_fee: number
  min_order: number
  verified: boolean
  approved: boolean
  commission_rate: number
  created_at: string
}

export type MenuItem = {
  id: string
  restaurant_id: string
  name: string
  description: string
  image_url?: string
  price: number
  category: string
  available: boolean
  created_at: string
}

export type Order = {
  id: string
  customer_id: string
  restaurant_id: string
  driver_id?: string
  items: OrderItem[]
  status: OrderStatus
  total: number
  delivery_fee: number
  payment_method: PaymentMethod
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded'
  address: string
  lat: number
  lng: number
  notes?: string
  estimated_delivery: string
  created_at: string
}

export type OrderItem = {
  item_id: string
  name: string
  price: number
  qty: number
}

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'ready'
  | 'picked_up'
  | 'delivering'
  | 'delivered'
  | 'cancelled'

export type PaymentMethod = 'card' | 'cash' | 'd17' | 'sobflous' | 'postpay'

export type Review = {
  id: string
  order_id: string
  customer_id: string
  restaurant_id: string
  rating: number
  comment: string
  created_at: string
}

export type Commission = {
  id: string
  restaurant_id: string
  order_id: string
  amount: number
  rate: number
  paid: boolean
  created_at: string
}
