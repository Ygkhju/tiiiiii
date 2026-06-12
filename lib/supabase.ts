import { createClient } from '@supabase/supabase-js'

const url  = process.env.NEXT_PUBLIC_SUPABASE_URL  ?? ''
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''

// Guard: don't crash if env vars missing — just warn
if (!url || !anon) {
  if (typeof window !== 'undefined') {
    console.warn('[Savora] Supabase env vars missing. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.')
  }
}

export const supabase = createClient(url || 'https://placeholder.supabase.co', anon || 'placeholder', {
  auth: { persistSession: true, autoRefreshToken: true },
})

/* ─── Types ─── */
export type Role = 'customer' | 'restaurant' | 'admin' | 'driver'

export type Profile = {
  id: string
  email: string
  phone?: string
  name: string
  role: Role
  avatar_url?: string
  verified: boolean
  banned: boolean
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
  category_id?: string
  category?: string
  name: string
  description: string
  image_url?: string
  price: number
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
  subtotal: number
  delivery_fee: number
  total: number
  payment_method: PaymentMethod
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded'
  delivery_address: string
  delivery_lat?: number
  delivery_lng?: number
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

export type OrderStatus =
  | 'pending' | 'confirmed' | 'preparing'
  | 'ready'   | 'picked_up' | 'delivering'
  | 'delivered'| 'cancelled'

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
  revenue: number
  rate: number
  amount: number
  paid: boolean
  paid_at?: string
  created_at: string
}

/* ─── Auth helpers ─── */
export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  return { data, error }
}

export async function signUp(email: string, password: string, name: string, role: Role = 'customer') {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { name, role } },
  })
  return { data, error }
}

export async function signOut() {
  return supabase.auth.signOut()
}

export async function getSession() {
  const { data } = await supabase.auth.getSession()
  return data.session
}

export async function getProfile(userId: string): Promise<Profile | null> {
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  return data
}

/* ─── Data helpers ─── */
export async function getRestaurants() {
  const { data, error } = await supabase
    .from('restaurants')
    .select('*')
    .eq('approved', true)
    .order('rating', { ascending: false })
  return { data: data as Restaurant[] | null, error }
}

export async function getMenuItems(restaurantId: string) {
  const { data, error } = await supabase
    .from('menu_items')
    .select('*')
    .eq('restaurant_id', restaurantId)
    .eq('available', true)
  return { data: data as MenuItem[] | null, error }
}

export async function createOrder(order: Omit<Order, 'id' | 'created_at'>) {
  const { data, error } = await supabase
    .from('orders')
    .insert(order)
    .select()
    .single()
  return { data: data as Order | null, error }
}

export async function getMyOrders(customerId: string) {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('customer_id', customerId)
    .order('created_at', { ascending: false })
  return { data: data as Order[] | null, error }
}

export async function getRestaurantOrders(restaurantId: string) {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('restaurant_id', restaurantId)
    .order('created_at', { ascending: false })
  return { data: data as Order[] | null, error }
}

export async function updateOrderStatus(orderId: string, status: OrderStatus) {
  const { error } = await supabase
    .from('orders')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', orderId)
  return { error }
}
