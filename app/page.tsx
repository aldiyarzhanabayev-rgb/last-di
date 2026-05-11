import Link from 'next/link'
import Header from '@/components/Header'

export default function Home() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_right,#1f5d91,transparent_32%),#07152f]">
      <Header />
      <section className="mx-auto grid max-w-7xl items-center gap-10 px-6 py-16 md:grid-cols-2 md:py-24">
        <div>
          <p className="mb-4 inline-flex rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm text-white/80">Firebase + OpenAI для авиагрузоперевозок</p>
          <h1 className="text-4xl font-black leading-tight md:text-6xl">Клиент отправляет заявку — ИИ подбирает рейс для логиста</h1>
          <p className="mt-6 max-w-xl text-lg text-white/70">Клиент не видит варианты. Заявка сохраняется в Firebase, OpenAI анализирует 90 тестовых рейсов, а логист утверждает рекомендованный вариант или выбирает другой.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/client" className="btn btn-primary">Подать заявку</Link>
            <Link href="/logist" className="btn btn-ghost">Кабинет логиста</Link>
          </div>
        </div>
        <div className="card p-6">
          <div className="rounded-2xl bg-white/10 p-5">
            <div className="mb-4 flex items-center justify-between">
              <span className="font-bold">Workflow</span>
              <span className="badge">AI assisted</span>
            </div>
            <div className="space-y-3 text-sm text-white/78">
              <div className="rounded-xl bg-navy/60 p-4">1. Клиент заполняет форму</div>
              <div className="rounded-xl bg-navy/60 p-4">2. Firestore сохраняет заявку</div>
              <div className="rounded-xl bg-navy/60 p-4">3. OpenAI выбирает fastest / cheapest / recommended</div>
              <div className="rounded-xl bg-navy/60 p-4">4. Логист утверждает финальный рейс</div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
