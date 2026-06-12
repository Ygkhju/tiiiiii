'use client'
import { createContext, useContext, useReducer, ReactNode } from 'react'
import type { OrderItem, PaymentMethod } from './supabase'

type CartItem = OrderItem & { image_url?: string }

type State = {
  cart: CartItem[]
  restaurantId: string | null
  paymentMethod: PaymentMethod
  deliveryAddress: string
  toast: { msg: string; type: 'success' | 'error' | 'info' } | null
}

type Action =
  | { type: 'ADD_ITEM';    payload: CartItem }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'SET_QTY';     payload: { id: string; qty: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'SET_PAYMENT'; payload: PaymentMethod }
  | { type: 'SET_ADDRESS'; payload: string }
  | { type: 'SET_TOAST';   payload: State['toast'] }

const init: State = {
  cart: [],
  restaurantId: null,
  paymentMethod: 'cash',
  deliveryAddress: '',
  toast: null,
}

function reducer(s: State, a: Action): State {
  switch (a.type) {
    case 'ADD_ITEM': {
      const existing = s.cart.find(i => i.item_id === a.payload.item_id)
      if (existing) {
        return { ...s, cart: s.cart.map(i => i.item_id === a.payload.item_id ? { ...i, qty: i.qty + 1 } : i) }
      }
      return { ...s, cart: [...s.cart, a.payload], restaurantId: a.payload.item_id.split('-')[0] }
    }
    case 'REMOVE_ITEM':
      return { ...s, cart: s.cart.filter(i => i.item_id !== a.payload) }
    case 'SET_QTY':
      return {
        ...s,
        cart: a.payload.qty <= 0
          ? s.cart.filter(i => i.item_id !== a.payload.id)
          : s.cart.map(i => i.item_id === a.payload.id ? { ...i, qty: a.payload.qty } : i)
      }
    case 'CLEAR_CART':
      return { ...s, cart: [], restaurantId: null }
    case 'SET_PAYMENT':
      return { ...s, paymentMethod: a.payload }
    case 'SET_ADDRESS':
      return { ...s, deliveryAddress: a.payload }
    case 'SET_TOAST':
      return { ...s, toast: a.payload }
    default:
      return s
  }
}

const Ctx = createContext<{ state: State; dispatch: React.Dispatch<Action> } | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, init)
  return <Ctx.Provider value={{ state, dispatch }}>{children}</Ctx.Provider>
}

export function useApp() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}

export const cartTotal = (cart: CartItem[]) =>
  cart.reduce((sum, i) => sum + i.price * i.qty, 0)

export const cartCount = (cart: CartItem[]) =>
  cart.reduce((sum, i) => sum + i.qty, 0)
