'use client'

import { useState } from 'react'
import Link from 'next/link'

type FormState = {
  clientName: string
  company: string
  phone: string
  email: string
  origin: string
  destination: string
  weightKg: string
  volumeM3: string
  cargoType: string
  urgency: string
  comment: string
}

export default function ClientPage() {
  const [form, setForm] = useState<FormState>({
    clientName: '',
    company: '',
    phone: '',
    email: '',
    origin: 'Almaty',
    destination: 'Dubai',
    weightKg: '250',
    volumeM3: '2.5',
    cargoType: 'general',
    urgency: 'balanced',
    comment: ''
  })
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [requestId, setRequestId] = useState('')

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setDone(false)

    const res = await fetch('/api/request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    })
    const data = await res.json()

    if (data.success) {
      setRequestId(data.requestId)
      setDone(true)
      // AI analysis starts automatically for logist panel. Client does not see options.
      fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId: data.requestId })
      }).catch(() => {})
    } else {
      alert(data.error || 'Ошибка отправки заявки')
    }

    setLoading(false)
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,#1f5d91,transparent_30%),#07152f] px-6 py-8">
      <div className="mx-auto max-w-4xl">
        <Link href="/" className="text-white/70">← Главная</Link>
        <form onSubmit={submit} className="card mt-8 p-6 md:p-8">
          <span className="badge">Client role</span>
          <h1 className="mt-4 text-3xl font-black">Заявка на авиаперевозку</h1>
          <p className="mt-2 text-white/65">Клиент заполняет данные груза. Варианты рейсов клиенту не показываются — они доступны только логисту после AI-анализа.</p>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <input className="input" placeholder="Имя клиента" value={form.clientName} onChange={e => setForm({ ...form, clientName: e.target.value })} required />
            <input className="input" placeholder="Компания" value={form.company} onChange={e => setForm({ ...form, company: e.target.value })} />
            <input className="input" placeholder="Телефон" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} required />
            <input className="input" type="email" placeholder="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
            <input className="input" placeholder="Откуда" value={form.origin} onChange={e => setForm({ ...form, origin: e.target.value })} required />
            <input className="input" placeholder="Куда" value={form.destination} onChange={e => setForm({ ...form, destination: e.target.value })} required />
            <input className="input" type="number" placeholder="Вес, кг" value={form.weightKg} onChange={e => setForm({ ...form, weightKg: e.target.value })} required />
            <input className="input" type="number" step="0.1" placeholder="Объём, м³" value={form.volumeM3} onChange={e => setForm({ ...form, volumeM3: e.target.value })} />
            <select className="input" value={form.cargoType} onChange={e => setForm({ ...form, cargoType: e.target.value })}>
              <option value="general">General cargo</option>
              <option value="fragile">Fragile</option>
              <option value="pharma">Pharma</option>
              <option value="dangerous">Dangerous goods</option>
              <option value="valuable">Valuable cargo</option>
            </select>
            <select className="input" value={form.urgency} onChange={e => setForm({ ...form, urgency: e.target.value })}>
              <option value="balanced">Balanced</option>
              <option value="fastest">Fastest</option>
              <option value="cheapest">Cheapest</option>
            </select>
          </div>

          <textarea className="input mt-4 min-h-28" placeholder="Комментарий" value={form.comment} onChange={e => setForm({ ...form, comment: e.target.value })} />
          <button className="btn btn-primary mt-5 w-full" disabled={loading}>{loading ? 'Отправка...' : 'Отправить заявку'}</button>

          {done && <div className="mt-5 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-4 text-emerald-100">Заявка отправлена. Номер заявки: <b>{requestId}</b>. Логист получит AI-рекомендации в своём кабинете.</div>}
        </form>
      </div>
    </main>
  )
}
