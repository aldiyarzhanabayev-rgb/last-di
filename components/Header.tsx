import Link from 'next/link'

export default function Header() {
  return (
    <header className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
      <Link href="/" className="text-xl font-black tracking-tight">Air Freight AI</Link>
      <nav className="flex gap-3 text-sm text-white/72">
        <Link href="/client" className="btn btn-ghost py-2">Клиент</Link>
        <Link href="/logist" className="btn btn-primary py-2">Логист</Link>
      </nav>
    </header>
  )
}
