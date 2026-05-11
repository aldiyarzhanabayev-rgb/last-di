import { NextResponse } from 'next/server'

export async function POST() {
  return NextResponse.json({ success: false, error: 'Use client-side Firestore directly' }, { status: 410 })
}