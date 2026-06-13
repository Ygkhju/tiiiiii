import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function db() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) return null
  return createClient(url, key)
}

export async function POST(req: NextRequest) {
  const supabase = db()
  if (!supabase) return NextResponse.json({ error: 'DB not configured' }, { status: 503 })
  try {
    const body = await req.json()
    const subtotal = body.items.reduce((s: number, i: any) => s + i.price * i.qty, 0)
    const { data, error } = await supabase.from('orders').insert({
      ...body, subtotal: +subtotal.toFixed(3),
      delivery_fee: 2.5, total: +(subtotal + 2.5).toFixed(3),
      status: 'pending', payment_status: 'pending', estimated_minutes: 30,
    }).select().single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ data }, { status: 201 })
  } catch { return NextResponse.json({ error: 'Invalid request' }, { status: 400 }) }
}

export async function GET(req: NextRequest) {
  const supabase = db()
  if (!supabase) return NextResponse.json({ data: [] })
  const { searchParams } = new URL(req.url)
  const cid = searchParams.get('customer_id')
  const rid = searchParams.get('restaurant_id')
  let q = supabase.from('orders').select('*').order('created_at', { ascending: false }).limit(50)
  if (cid) q = q.eq('customer_id', cid)
  if (rid) q = q.eq('restaurant_id', rid)
  const { data, error } = await q
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}

export async function PATCH(req: NextRequest) {
  const supabase = db()
  if (!supabase) return NextResponse.json({ error: 'DB not configured' }, { status: 503 })
  const { id, status } = await req.json()
  const { error } = await supabase.from('orders').update({ status }).eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
