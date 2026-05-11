'use client'
import { useState } from 'react'
import Link from 'next/link'
import { db } from '@/lib/firebase'
import { addDoc, collection } from 'firebase/firestore'

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

    try {
      // Пишем напрямую в Firestore с клиента — минуя API route
      const docRef = await addDoc(collection(db, 'requests'), {
        ...form,
        status: 'new',
        createdAt: new Date().toISOString()
      })

      setRequestId(docRef.id)
      setDone(true)

      // Запускаем AI анализ для логиста
      fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId: docRef.id })
      }).catch(() => {})

    } catch (error: any) {
      alert(error?.message || 'Ошибка отправки заявки')
    }

    setLoading(false)
  }

  if (done) {
    return (
      <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,#1f5d91,transparent_30%),#07152f] px-6 py-8">
        <div className="mx-auto max-w-xl text-center mt-20">
          <div className="text-5xl mb-4">✅</div>
          <h1 className="text-3xl font-black text-white">Заявка отправлена!</h1>
          <p className="mt-4 text-white/65">ID заявки: <span className="text-white font-mono">{requestId}</span></p>
          <p className="mt-2 text-white/65">Логист получит AI-рекомендацию и свяжется с вами.</p>
          <Link href="/" className="mt-8 inline-block text-white/70 hover:text-white">← Главная</Link>
        </div>
      </main>
    )
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
            <input
              className="input"
              placeholder="Имя клиента"
              value={form.clientName}
              onChange={e => setForm(f => ({ ...f, clientName: e.target.value }))}
              required
            />
            <input
              className="input"
              placeholder="Компания"
              value={form.company}
              onChange={e => setForm(f => ({ ...f, company: e.target.value }))}
            />
            <input
              className="input"
              placeholder="Телефон"
              value={form.phone}
              onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
            />
            <input
              className="input"
              placeholder="Email"
              type="email"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              required
            />
            <input
              className="input"
              placeholder="Откуда"
              value={form.origin}
              onChange={e => setForm(f => ({ ...f, origin: e.target.value }))}
              required
            />
            <input
              className="input"
              placeholder="Куда"
              value={form.destination}
              onChange={e => setForm(f => ({ ...f, destination: e.target.value }))}
              required
            />
            <input
              className="input"
              placeholder="Вес (кг)"
              type="number"
              value={form.weightKg}
              onChange={e => setForm(f => ({ ...f, weightKg: e.target.value }))}
              required
            />
            <input
              className="input"
              placeholder="Объём (м³)"
              type="number"
              value={form.volumeM3}
              onChange={e => setForm(f => ({ ...f, volumeM3: e.target.value }))}
              required
            />
            <select
              className="input"
              value={form.cargoType}
              onChange={e => setForm(f => ({ ...f, cargoType: e.target.value }))}
            >
              <option value="general">General cargo</option>
              <option value="fragile">Fragile</option>
              <option value="pharma">Pharma</option>
              <option value="dangerous">Dangerous goods</option>
              <option value="valuable">Valuable cargo</option>
            </select>
            <select
              className="input"
              value={form.urgency}
              onChange={e => setForm(f => ({ ...f, urgency: e.target.value }))}
            >
              <option value="balanced">Balanced</option>
              <option value="fastest">Fastest</option>
              <option value="cheapest">Cheapest</option>
            </select>
          </div>

          <textarea
            className="input mt-4 w-full"
            placeholder="Комментарий"
            rows={3}
            value={form.comment}
            onChange={e => setForm(f => ({ ...f, comment: e.target.value }))}
          />

          <button
            type="submit"
            disabled={loading}
            className="btn-primary mt-6 w-full"
          >
            {loading ? 'Отправка...' : 'Отправить заявку'}
          </button>
        </form>
      </div>
    </main>
  )
}