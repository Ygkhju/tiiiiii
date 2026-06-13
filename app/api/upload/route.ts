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
    const formData = await req.formData()
    const file     = formData.get('file') as File
    const bucket   = formData.get('bucket') as string ?? 'documents'
    const path     = formData.get('path') as string ?? `${Date.now()}.jpg`
    if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 })
    const buffer = Buffer.from(await file.arrayBuffer())
    const { error } = await supabase.storage.from(bucket).upload(path, buffer, {
      contentType: file.type, upsert: true,
    })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(path)
    return NextResponse.json({ url: publicUrl })
  } catch { return NextResponse.json({ error: 'Upload failed' }, { status: 500 }) }
}
