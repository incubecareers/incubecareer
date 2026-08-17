'use client'

/* eslint-disable @next/next/no-img-element */
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { signOut } from 'next-auth/react'
import { LogOut, Menu, X } from 'lucide-react'
import useAuthStatus from '@/components/useAuthStatus'

const DEFAULT_LINKS = [
  { label: 'Courses', href: '/courses' },
  { label: 'Learn', href: '/learn' },
  { label: 'Login', href: '/login' },
]

async function handleLogout() {
  try {
    await fetch('/api/logout', { method: 'POST' })
  } catch {}
  try {
    await signOut({ redirect: false })
  } catch {}
  window.location.href = '/'
}

function isLoginLink(link) {
  return link.href === '/login' || link.label?.toLowerCase() === 'login'
}

export default function SiteNavbar({ links = DEFAULT_LINKS }) {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { loading, authenticated } = useAuthStatus()

  const visibleLinks = links.filter((l) => !isLoginLink(l))

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  return (
    <header
      className={`sticky top-0 z-50 border-b transition-all duration-300 ${
        scrolled
          ? 'border-brand-dark-border bg-brand-dark-bg/95 shadow-lg backdrop-blur-xl'
          : 'border-brand-dark-border/50 bg-brand-dark-bg/80 backdrop-blur-md'
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-3 py-4">
          <Link href="/" className="shrink-0" aria-label="Incube Careers home">
            <img src="/logo.png" alt="Incube Careers" className="h-12 w-auto sm:h-14" />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-1 md:flex">
            {visibleLinks.map((link) => (
              <Link
                key={`${link.label}-${link.href}`}
                href={link.href}
                className="rounded-lg px-4 py-2 text-sm font-medium text-brand-dark-textSecondary transition hover:bg-brand-dark-surface hover:text-brand-dark-text"
              >
                {link.label}
              </Link>
            ))}
            {loading ? null : authenticated ? (
              <>
                <Link
                  href="/dashboard"
                  className="ml-2 inline-flex items-center justify-center gap-2 rounded-xl bg-brand-accent px-5 py-2.5 text-sm font-bold text-white transition-all hover:scale-105 hover:shadow-lg hover:shadow-brand-accent/30"
                >
                  Dashboard
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="ml-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-brand-dark-border bg-brand-dark-surface px-4 py-2.5 text-sm font-semibold text-brand-dark-text transition hover:bg-brand-dark-card"
                >
                  <LogOut className="h-4 w-4" /> Logout
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="ml-2 inline-flex items-center justify-center gap-2 rounded-xl bg-brand-accent px-5 py-2.5 text-sm font-bold text-white transition-all hover:scale-105 hover:shadow-lg hover:shadow-brand-accent/30"
              >
                Sign in
              </Link>
            )}
          </nav>

          {/* Mobile toggle */}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-brand-dark-border bg-brand-dark-surface text-brand-dark-text shadow-sm transition hover:bg-brand-dark-card md:hidden"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu overlay */}
      <div
        className={`fixed inset-0 top-[var(--nav-h,72px)] z-40 md:hidden ${
          open ? 'pointer-events-auto' : 'pointer-events-none'
        }`}
      >
        <div
          onClick={() => setOpen(false)}
          className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
            open ? 'opacity-100' : 'opacity-0'
          }`}
        />
        <div
          className={`relative mx-4 mt-3 origin-top rounded-3xl border border-brand-dark-border bg-brand-dark-card p-4 shadow-2xl transition-all duration-300 ${
            open ? 'translate-y-0 opacity-100' : '-translate-y-3 opacity-0'
          }`}
        >
          <div className="space-y-1.5">
            {visibleLinks.map((link) => (
              <Link
                key={`${link.label}-${link.href}`}
                href={link.href}
                onClick={() => setOpen(false)}
                className="block rounded-2xl px-4 py-3 text-sm font-medium text-brand-dark-textSecondary transition hover:bg-brand-dark-surface hover:text-brand-dark-text"
              >
                {link.label}
              </Link>
            ))}
            {loading ? null : authenticated ? (
              <>
                <Link
                  href="/dashboard"
                  onClick={() => setOpen(false)}
                  className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-accent px-4 py-3 text-sm font-bold text-white shadow-lg shadow-brand-accent/20"
                >
                  Dashboard
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false)
                    handleLogout()
                  }}
                  className="flex w-full items-center justify-center gap-1.5 rounded-2xl border border-brand-dark-border bg-brand-dark-surface px-4 py-3 text-sm font-semibold text-brand-dark-text transition hover:bg-brand-dark-card"
                >
                  <LogOut className="h-4 w-4" /> Logout
                </button>
              </>
            ) : (
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-accent px-4 py-3 text-sm font-bold text-white shadow-lg shadow-brand-accent/20"
              >
                Sign in
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
