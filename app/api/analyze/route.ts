import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import { initializeApp, getApps } from 'firebase/app'
import { getFirestore, collection, doc, getDoc, getDocs, setDoc, updateDoc } from 'firebase/firestore/lite'
import { fallbackRecommendation, filterSuitableFlights } from '@/lib/flightLogic'
import type { CargoRequest, Flight } from '@/lib/types'

// firebase/firestore/lite использует HTTP вместо gRPC — работает в serverless без зависаний
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

const app = getApps().find(a => a.name === 'server') ?? initializeApp(firebaseConfig, 'server')
const db = getFirestore(app)

const client = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const requestId = body.requestId

    if (!requestId) {
      return NextResponse.json({ success: false, error: 'requestId is required' }, { status: 400 })
    }

    const requestSnap = await getDoc(doc(db, 'requests', requestId))
    if (!requestSnap.exists()) {
      return NextResponse.json({ success: false, error: 'Request not found' }, { status: 404 })
    }

    const cargoRequest = { id: requestSnap.id, ...requestSnap.data() } as CargoRequest

    const flightsSnap = await getDocs(collection(db, 'flights'))
    const flights = flightsSnap.docs.map(d => ({ id: d.id, ...d.data() })) as Flight[]

    const suitable = filterSuitableFlights(cargoRequest, flights).slice(0, 20)
    let recommendation = fallbackRecommendation(cargoRequest, suitable.length ? suitable as any : flights)

    if (client && suitable.length > 0) {
      const prompt = `
You are an AI logistics assistant for air cargo.
Choose best flight options for this cargo request. Return only valid JSON.
Cargo request:
${JSON.stringify(cargoRequest, null, 2)}
Available suitable flights:
${JSON.stringify(suitable, null, 2)}
Return JSON in this exact structure:
{
  "recommendedFlightId": "flight id",
  "fastestFlightId": "flight id",
  "cheapestFlightId": "flight id",
  "score": 0-100,
  "explanation": "short Russian explanation for logist"
}
`
      try {
        const completion = await client.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.2,
          response_format: { type: 'json_object' }
        })
        const content = completion.choices[0]?.message?.content || '{}'
        recommendation = { ...recommendation, ...JSON.parse(content) }
      } catch (e) {
        // fallback если OpenAI недоступен
      }
    }

    const quotePayload = {
      requestId,
      ...recommendation,
      status: 'ai_recommended',
      createdAt: new Date().toISOString(),
    }

    await setDoc(doc(db, 'quotes', requestId), quotePayload)
    await updateDoc(doc(db, 'requests', requestId), { status: 'ai_analyzed' })

    return NextResponse.json({ success: true, quote: quotePayload })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'AI analysis failed' }, { status: 500 })
  }
}