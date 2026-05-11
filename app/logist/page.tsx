'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { collection, doc, getDocs, onSnapshot, orderBy, query, setDoc, updateDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { Flight } from '@/lib/types'

export default function LogistPage() {
  const [requests, setRequests] = useState<any[]>([])
  const [quotes, setQuotes] = useState<Record<string, any>>({})
  const [flights, setFlights] = useState<Flight[]>([])
  const [selectedRequestId, setSelectedRequestId] = useState('')
  const [manualFlightId, setManualFlightId] = useState('')

  useEffect(() => {
    const q = query(collection(db, 'requests'), orderBy('createdAt', 'desc'))
    const unsub = onSnapshot(q, snap => {
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      setRequests(list)
      if (!selectedRequestId && list[0]) setSelectedRequestId(list[0].id)
    })
    return () => unsub()
  }, [selectedRequestId])

  useEffect(() => {
    async function load() {
      const flightsSnap = await getDocs(collection(db, 'flights'))
      setFlights(flightsSnap.docs.map(d => ({ id: d.id, ...d.data() })) as Flight[])
      const quotesSnap = await getDocs(collection(db, 'quotes'))
      const map: Record<string, any> = {}
      quotesSnap.docs.forEach(d => { map[d.id] = { id: d.id, ...d.data() } })
      setQuotes(map)
    }
    load()
  }, [])

  const selectedRequest = requests.find(r => r.id === selectedRequestId)
  const quote = selectedRequestId ? quotes[selectedRequestId] : null
  const recommended = flights.find(f => f.id === quote?.recommendedFlightId)
  const fastest = flights.find(f => f.id === quote?.fastestFlightId)
  const cheapest = flights.find(f => f.id === quote?.cheapestFlightId)

  const suitableFlights = useMemo(() => {
    if (!selectedRequest) return flights
    return flights.filter(f =>
      f.origin?.toLowerCase() === selectedRequest.origin?.toLowerCase() &&
      f.destination?.toLowerCase() === selectedRequest.destination?.toLowerCase() &&
      f.maxWeightKg >= Number(selectedRequest.weightKg || 0) &&
      f.maxVolumeM3 >= Number(selectedRequest.volumeM3 || 0)
    )
  }, [flights, selectedRequest])

  async function runAi(requestId: string) {
    const res = await fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ requestId })
    })
    const data = await res.json()
    if (data.success) setQuotes(prev => ({ ...prev, [requestId]: data.quote }))
    else alert(data.error || 'AI analysis failed')
  }

  async function approve(flightId?: string) {
    if (!selectedRequestId || !flightId) return alert('Выберите рейс')
    await setDoc(doc(db, 'quotes', selectedRequestId), {
      ...(quote || {}),
      approvedFlightId: flightId,
      status: 'approved',
      approvedAt: new Date().toISOString()
    }, { merge: true })
    await updateDoc(doc(db, 'requests', selectedRequestId), { status: 'approved' })
    alert('Рейс утверждён логистом')
  }

  function FlightCard({ title, flight }: { title: string, flight?: Flight }) {
    if (!flight) return <div className="card p-4 text-white/60">{title}: нет данных</div>
    return (
      <div className="card p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="badge">{title}</p>
            <h3 className="mt-3 text-xl font-black">{flight.airline} · {flight.flightNo}</h3>
            <p className="mt-2 text-white/70">{flight.origin} → {flight.hub} → {flight.destination}</p>
          </div>
          <b className="rounded-full bg-skyblue px-3 py-1 text-navy">${flight.pricePerKg}/kg</b>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
          <div className="rounded-xl bg-white/10 p-3">ETA <b>{flight.etaHours}h</b></div>
          <div className="rounded-xl bg-white/10 p-3">Max <b>{flight.maxWeightKg}kg</b></div>
          <div className="rounded-xl bg-white/10 p-3">Score <b>{flight.reliabilityScore}%</b></div>
        </div>
        <button onClick={() => approve(flight.id)} className="btn btn-primary mt-4 w-full">Утвердить этот рейс</button>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_right,#1f5d91,transparent_30%),#07152f] px-6 py-8">
      <div className="mx-auto max-w-7xl">
        <Link href="/" className="text-white/70">← Главная</Link>
        <h1 className="mt-8 text-4xl font-black">Кабинет логиста</h1>
        <p className="mt-2 text-white/65">Логист видит заявки клиентов, AI-рекомендации и может утвердить или выбрать другой рейс.</p>

        <div className="mt-8 grid gap-6 md:grid-cols-[340px_1fr]">
          <aside className="card h-fit p-4">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-black">Заявки</h2>
              <span className="badge">{requests.length}</span>
            </div>
            <div className="space-y-3">
              {requests.map(r => (
                <button key={r.id} onClick={() => setSelectedRequestId(r.id)} className={`w-full rounded-2xl border p-4 text-left ${selectedRequestId === r.id ? 'border-skyblue bg-skyblue/10' : 'border-white/10 bg-white/5'}`}>
                  <b>{r.origin} → {r.destination}</b>
                  <p className="mt-1 text-sm text-white/60">{r.clientName || 'Client'} · {r.weightKg} кг · {r.status}</p>
                </button>
              ))}
            </div>
          </aside>

          <section>
            {!selectedRequest ? <div className="card p-6">Пока нет заявок. Создайте заявку в кабинете клиента.</div> : (
              <div className="space-y-6">
                <div className="card p-6">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <span className="badge">Request</span>
                      <h2 className="mt-3 text-2xl font-black">{selectedRequest.origin} → {selectedRequest.destination}</h2>
                      <p className="mt-2 text-white/65">{selectedRequest.company} · {selectedRequest.clientName} · {selectedRequest.phone}</p>
                      <p className="mt-2 text-white/65">Груз: {selectedRequest.weightKg} кг, {selectedRequest.volumeM3} м³, {selectedRequest.cargoType}, срочность: {selectedRequest.urgency}</p>
                    </div>
                    <button onClick={() => runAi(selectedRequest.id)} className="btn btn-primary">Запустить AI анализ</button>
                  </div>
                  {quote?.explanation && <p className="mt-5 rounded-2xl bg-white/10 p-4 text-white/75"><b>AI explanation:</b> {quote.explanation}</p>}
                </div>

                <div className="grid gap-4 lg:grid-cols-3">
                  <FlightCard title="Recommended" flight={recommended} />
                  <FlightCard title="Fastest" flight={fastest} />
                  <FlightCard title="Cheapest" flight={cheapest} />
                </div>

                <div className="card p-6">
                  <h2 className="text-2xl font-black">Выбрать другой рейс</h2>
                  <p className="mt-2 text-white/60">Подходящих рейсов по фильтрам: {suitableFlights.length}</p>
                  <select className="input mt-4" value={manualFlightId} onChange={e => setManualFlightId(e.target.value)}>
                    <option value="">Выберите рейс</option>
                    {suitableFlights.map(f => <option key={f.id} value={f.id}>{f.airline} {f.flightNo} · {f.origin} → {f.hub} → {f.destination} · {f.etaHours}h · ${f.pricePerKg}/kg</option>)}
                  </select>
                  <button onClick={() => approve(manualFlightId)} className="btn btn-ghost mt-4 w-full">Утвердить выбранный вручную рейс</button>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  )
}
