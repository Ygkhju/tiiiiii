'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { Search, ShoppingCart, Store, ShieldCheck, LogIn, Heart, Bell, UserRound, Menu, X } from 'lucide-react'

const LINKS = [
  { href: '/',           label: 'Explorer',    Icon: Search       },
  { href: '/customer',   label: 'Client',      Icon: ShoppingCart },
  { href: '/restaurant', label: 'Restaurant',  Icon: Store        },
  { href: '/admin',      label: 'Admin',       Icon: ShieldCheck  },
]

export function Nav() {
  const path = usePathname()
  const [open, setOpen] = useState(false)

  return (
    <nav className="sticky top-0 z-50 border-b border-white/[0.07] bg-[#080808]/85 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 select-none group">
          <span className="grid h-9 w-9 place-items-center rounded-lg border border-savora-orange/20 bg-savora-orange/8 shadow-glow transition group-hover:bg-savora-orange/15">
            <svg width="20" height="20" viewBox="0 0 32 32" fill="none">
              <path d="M7 8 C7 8 11 4 16 4 C21 4 25 8 25 8 L27 16 C27 16 22 13 16 13 C10 13 5 16 5 16 Z" fill="#FF6B1A"/>
              <path d="M5 18 C5 18 10 16 16 16 C22 16 27 18 27 18 L25 26 C25 26 21 28 16 28 C11 28 7 26 7 26 Z" fill="#FF6B1A" opacity="0.55"/>
              <circle cx="16" cy="16" r="4" fill="#FFAB40"/>
            </svg>
          </span>
          <span className="font-display text-[17px] font-bold tracking-wide">Savora</span>
        </Link>

        {/* Desktop links */}
        <div className="hidden items-center gap-0.5 md:flex">
          {LINKS.map(({ href, label, Icon }) => {
            const active = path === href || (href !== '/' && path.startsWith(href))
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition-all ${
                  active
                    ? 'bg-savora-orange/12 text-savora-orange'
                    : 'text-white/55 hover:bg-white/[0.05] hover:text-white'
                }`}
              >
                <Icon size={15} />
                {label}
                {active && <span className="ml-0.5 h-1 w-1 rounded-full bg-savora-orange" />}
              </Link>
            )
          })}
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          <button
            aria-label="Favoris"
            className="hidden md:grid h-9 w-9 place-items-center rounded-lg border border-white/[0.07] text-white/45 hover:text-white transition-colors"
          >
            <Heart size={15} />
          </button>
          <button
            aria-label="Notifications"
            className="hidden md:grid h-9 w-9 place-items-center rounded-lg border border-white/[0.07] text-white/45 hover:text-white transition-colors"
          >
            <Bell size={15} />
          </button>
          <Link
            href="/login"
            aria-label="Profil"
            className={`grid h-9 w-9 place-items-center rounded-lg transition-all ${
              path === '/login'
                ? 'bg-savora-orange/80 text-black'
                : 'bg-savora-orange text-black hover:bg-orange-400'
            }`}
          >
            <UserRound size={15} />
          </Link>
          {/* Mobile burger */}
          <button
            onClick={() => setOpen(!open)}
            aria-label="Menu"
            className="grid h-9 w-9 place-items-center rounded-lg border border-white/[0.07] md:hidden"
          >
            {open ? <X size={16} /> : <Menu size={16} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="border-t border-white/[0.06] bg-[#080808] px-4 pb-4 pt-2 md:hidden">
          {[...LINKS, { href: '/login', label: 'Connexion', Icon: LogIn }].map(({ href, label, Icon }) => {
            const active = path === href
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium mb-1 transition-all ${
                  active
                    ? 'bg-savora-orange/10 text-savora-orange'
                    : 'text-white/55 hover:bg-white/[0.04] hover:text-white'
                }`}
              >
                <Icon size={16} />
                {label}
              </Link>
            )
          })}
        </div>
      )}
    </nav>
  )
}
