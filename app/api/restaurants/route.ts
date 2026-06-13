import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function db() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) return null
  return createClient(url, key)
}

export async function GET(req: Request) {
  const supabase = db()
  if (!supabase) return NextResponse.json({ data: [] })
  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q')
  let query = supabase.from('profiles')
    .select('id,restaurant_name,restaurant_description,restaurant_logo_url,restaurant_cover_url,restaurant_cuisine,restaurant_address,rating,review_count')
    .eq('role', 'restaurant').eq('status', 'approved')
    .order('rating', { ascending: false }).limit(40)
  if (q) query = query.ilike('restaurant_name', `%${q}%`)
  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}
