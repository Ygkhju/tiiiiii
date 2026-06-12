import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getClient() {
  const url  = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key  = process.env.SUPABASE_SERVICE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) return null
  return createClient(url, key)
}

export async function GET(req: Request) {
  const supabase = getClient()
  if (!supabase) return NextResponse.json({ data: [] })

  const { searchParams } = new URL(req.url)
  const cuisine = searchParams.get('cuisine')
  const search  = searchParams.get('q')

  let query = supabase
    .from('restaurants')
    .select('id,name,description,logo_url,cover_url,cuisine,address,lat,lng,rating,review_count,delivery_time,delivery_fee,min_order,verified')
    .eq('approved', true)
    .order('rating', { ascending: false })
    .limit(40)

  if (cuisine) query = query.contains('cuisine', [cuisine])
  if (search)  query = query.ilike('name', `%${search}%`)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}
