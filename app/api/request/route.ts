import { NextResponse } from 'next/server'
import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const payload = {
      clientName: body.clientName || '',
      company: body.company || '',
      phone: body.phone || '',
      email: body.email || '',
      origin: body.origin || 'Almaty',
      destination: body.destination || 'Dubai',
      weightKg: Number(body.weightKg || 0),
      volumeM3: Number(body.volumeM3 || 0),
      cargoType: body.cargoType || 'general',
      urgency: body.urgency || 'balanced',
      comment: body.comment || '',
      status: 'new',
      createdAt: serverTimestamp()
    }

    const docRef = await addDoc(collection(db, 'requests'), payload)

    return NextResponse.json({ success: true, requestId: docRef.id })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Request failed' }, { status: 500 })
  }
}
