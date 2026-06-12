import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) return null
  return createClient(url, key)
}

export async function POST(req: NextRequest) {
  const supabase = getClient()
  if (!supabase) return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 })

  try {
    const body = await req.json()
    const { customer_id, restaurant_id, items, payment_method, delivery_address, delivery_lat, delivery_lng, notes } = body
    if (!customer_id || !restaurant_id || !items?.length)
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })

    const subtotal     = items.reduce((s: number, i: any) => s + i.price * i.qty, 0)
    const delivery_fee = 2.5
    const { data, error } = await supabase.from('orders').insert({
      customer_id, restaurant_id, items,
      subtotal: +subtotal.toFixed(3), delivery_fee,
      total: +(subtotal + delivery_fee).toFixed(3),
      payment_method: payment_method ?? 'cash',
      payment_status: 'pending', status: 'pending',
      delivery_address, delivery_lat, delivery_lng,
      notes: notes ?? null, estimated_minutes: 30,
    }).select().single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ data }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}

export async function GET(req: NextRequest) {
  const supabase = getClient()
  if (!supabase) return NextResponse.json({ data: [] })

  const { searchParams } = new URL(req.url)
  const customer_id   = searchParams.get('customer_id')
  const restaurant_id = searchParams.get('restaurant_id')
  if (!customer_id && !restaurant_id)
    return NextResponse.json({ error: 'Provide customer_id or restaurant_id' }, { status: 400 })

  let query = supabase.from('orders').select('*').order('created_at', { ascending: false }).limit(50)
  if (customer_id)   query = query.eq('customer_id', customer_id)
  if (restaurant_id) query = query.eq('restaurant_id', restaurant_id)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}
