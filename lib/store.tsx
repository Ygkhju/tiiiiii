'use client'
import { createContext, useContext, useReducer, useEffect, ReactNode } from 'react'
import type { OrderItem, PaymentMethod, Profile } from './supabase'
import { supabase } from './supabase'

export type CartItem = OrderItem & { image_url?: string; restaurant_id?: string }

type State = {
  cart: CartItem[]
  restaurantId: string | null
  paymentMethod: PaymentMethod
  deliveryAddress: string
  deliveryLat: number
  deliveryLng: number
  user: Profile | null
  loadingAuth: boolean
}

type Action =
  | { type: 'ADD_ITEM';     payload: CartItem }
  | { type: 'REMOVE_ITEM';  payload: string }
  | { type: 'SET_QTY';      payload: { id: string; qty: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'SET_PAYMENT';  payload: PaymentMethod }
  | { type: 'SET_ADDRESS';  payload: { address: string; lat?: number; lng?: number } }
  | { type: 'SET_USER';     payload: Profile | null }
  | { type: 'SET_LOADING';  payload: boolean }

const init: State = {
  cart: [],
  restaurantId: null,
  paymentMethod: 'cash',
  deliveryAddress: '',
  deliveryLat: 36.8065,
  deliveryLng: 10.1815,
  user: null,
  loadingAuth: true,
}

function reducer(s: State, a: Action): State {
  switch (a.type) {
    case 'ADD_ITEM': {
      // Block mixing restaurants
      if (s.restaurantId && a.payload.restaurant_id && s.restaurantId !== a.payload.restaurant_id) {
        return s // caller should warn user
      }
      const ex = s.cart.find(i => i.item_id === a.payload.item_id)
      if (ex) return { ...s, cart: s.cart.map(i => i.item_id === a.payload.item_id ? { ...i, qty: i.qty + 1 } : i) }
      return {
        ...s,
        cart: [...s.cart, { ...a.payload, qty: a.payload.qty ?? 1 }],
        restaurantId: a.payload.restaurant_id ?? s.restaurantId,
      }
    }
    case 'REMOVE_ITEM':
      return { ...s, cart: s.cart.filter(i => i.item_id !== a.payload) }
    case 'SET_QTY':
      return {
        ...s,
        cart: a.payload.qty <= 0
          ? s.cart.filter(i => i.item_id !== a.payload.id)
          : s.cart.map(i => i.item_id === a.payload.id ? { ...i, qty: a.payload.qty } : i),
      }
    case 'CLEAR_CART':
      return { ...s, cart: [], restaurantId: null }
    case 'SET_PAYMENT':
      return { ...s, paymentMethod: a.payload }
    case 'SET_ADDRESS':
      return {
        ...s,
        deliveryAddress: a.payload.address,
        deliveryLat: a.payload.lat ?? s.deliveryLat,
        deliveryLng: a.payload.lng ?? s.deliveryLng,
      }
    case 'SET_USER':
      return { ...s, user: a.payload, loadingAuth: false }
    case 'SET_LOADING':
      return { ...s, loadingAuth: a.payload }
    default:
      return s
  }
}

const Ctx = createContext<{ state: State; dispatch: React.Dispatch<Action> } | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, init)

  // Listen to Supabase auth changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()
        dispatch({ type: 'SET_USER', payload: data ?? null })
      } else {
        dispatch({ type: 'SET_USER', payload: null })
      }
    })
    return () => subscription.unsubscribe()
  }, [])

  return <Ctx.Provider value={{ state, dispatch }}>{children}</Ctx.Provider>
}

export function useApp() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useApp must be inside AppProvider')
  return ctx
}

export const cartTotal = (cart: CartItem[]) =>
  cart.reduce((s, i) => s + i.price * i.qty, 0)

export const cartCount = (cart: CartItem[]) =>
  cart.reduce((s, i) => s + i.qty, 0)
