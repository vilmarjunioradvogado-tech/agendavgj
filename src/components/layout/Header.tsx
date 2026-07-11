'use client'

import { useState, useEffect, useRef } from 'react'
import { Menu, X, Scale } from 'lucide-react'
import { NAV_LINKS, SITE } from '@/lib/constants'
import { getWhatsAppLink, cn } from '@/lib/utils'

export default function Header() {
  const [open,     setOpen]     = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [active,   setActive]   = useState('/')
  const headerRef = useRef<HTMLElement>(null)

  // Scroll background
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Scroll spy — track which section is in view
  useEffect(() => {
    const sectionIds = NAV_LINKS
      .filter(l => l.href.startsWith('#'))
      .map(l => l.href.slice(1))

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActive(`#${entry.target.id}`)
          }
        })
      },
      { rootMargin: '-80px 0px -55% 0px', threshold: 0 }
    )

    const sections: HTMLElement[] = []
    sectionIds.forEach(id => {
      const el = document.getElementById(id)
      if (el) { observer.observe(el); sections.push(el) }
    })

    // Reset to '/' when at top
    const onScroll = () => {
      if (window.scrollY < 100) setActive('/')
    }
    window.addEventListener('scroll', onScroll, { passive: true })

    return () => {
      observer.disconnect()
      window.removeEventListener('scroll', onScroll)
    }
  }, [])

  // Lock body scroll when mobile menu open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  const handleNav = (href: string) => {
    setOpen(false)
    setActive(href)
    if (href === '/') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }
    if (href.startsWith('#')) {
      const el = document.querySelector(href)
      if (el) {
        const top = (el as HTMLElement).getBoundingClientRect().top + window.scrollY - 80
        window.scrollTo({ top, behavior: 'smooth' })
      }
    }
  }

  return (
    <>
      <header
        ref={headerRef}
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-500',
          scrolled
            ? 'bg-cream/95 dark:bg-charcoal-950/95 backdrop-blur-md shadow-sm border-b border-cream-300/50 dark:border-charcoal-800/50'
            : 'bg-transparent'
        )}
      >
        <div className="container-wide">
          <div className="flex items-center justify-between h-20">

            {/* Logo */}
            <a
              href="/"
              onClick={(e) => { e.preventDefault(); handleNav('/') }}
              className="flex items-center gap-3 group"
              aria-label="Início"
            >
              <div className="flex items-center justify-center w-10 h-10 bg-charcoal-950 dark:bg-cream-50 rounded-sm transition-colors group-hover:bg-gold duration-300">
                <Scale className="w-5 h-5 text-gold group-hover:text-charcoal-950 transition-colors duration-300" aria-hidden />
              </div>
              <div className="hidden sm:block">
                <p className="font-serif text-base font-semibold leading-none text-charcoal-950 dark:text-cream-50 tracking-tight">
                  Vilmar Guimarães Júnior
                </p>
                <p className="font-sans text-2xs font-medium tracking-[0.2em] uppercase text-gold mt-0.5">
                  Advogado
                </p>
              </div>
            </a>

            {/* Desktop Navigation */}
            <nav
              className="hidden lg:flex items-center gap-1"
              aria-label="Navegação principal"
            >
              {NAV_LINKS.slice(1, -1).map((link) => (
                <button
                  key={link.href}
                  onClick={() => handleNav(link.href)}
                  className={cn(
                    'relative px-4 py-2 text-sm font-sans font-medium tracking-wide transition-colors duration-200 rounded-sm',
                    'hover:text-gold dark:hover:text-gold-light',
                    active === link.href
                      ? 'text-gold dark:text-gold-light'
                      : 'text-charcoal-700 dark:text-charcoal-300'
                  )}
                >
                  {link.label}
                  {/* Active indicator */}
                  <span
                    className={cn(
                      'absolute bottom-0 left-4 right-4 h-px bg-gold transition-all duration-300',
                      active === link.href ? 'opacity-100 scale-x-100' : 'opacity-0 scale-x-0'
                    )}
                  />
                </button>
              ))}
            </nav>

            {/* CTA + Mobile toggle */}
            <div className="flex items-center gap-4">
              <a
                href={getWhatsAppLink(SITE.whatsapp, 'Olá! Gostaria de agendar uma consulta com o Dr. Vilmar.')}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden lg:inline-flex btn-primary text-xs py-3 px-6"
                aria-label="Agendar consulta pelo WhatsApp"
              >
                Agendar Consulta
              </a>

              <button
                onClick={() => setOpen(!open)}
                className="lg:hidden p-2 rounded-sm text-charcoal-950 dark:text-cream-50 hover:bg-cream-200 dark:hover:bg-charcoal-800 transition-colors"
                aria-label={open ? 'Fechar menu' : 'Abrir menu'}
                aria-expanded={open}
              >
                {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <div
        className={cn(
          'fixed inset-0 z-40 lg:hidden transition-all duration-500',
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        )}
        aria-hidden={!open}
      >
        <div
          className="absolute inset-0 bg-charcoal-950/60 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
        <div
          className={cn(
            'absolute top-0 right-0 h-full w-80 max-w-full bg-cream dark:bg-charcoal-950',
            'border-l border-cream-300 dark:border-charcoal-800',
            'transition-transform duration-500 ease-out-expo',
            open ? 'translate-x-0' : 'translate-x-full'
          )}
        >
          <div className="flex flex-col h-full p-8 pt-24">
            <nav className="flex flex-col gap-1" aria-label="Navegação mobile">
              {NAV_LINKS.map((link) => (
                <button
                  key={link.href}
                  onClick={() => handleNav(link.href)}
                  className={cn(
                    'text-left px-4 py-3 text-base font-sans font-medium rounded-sm transition-colors',
                    'hover:bg-cream-200 dark:hover:bg-charcoal-800 hover:text-gold',
                    active === link.href
                      ? 'text-gold bg-cream-200 dark:bg-charcoal-800 border-l-2 border-gold'
                      : 'text-charcoal-800 dark:text-charcoal-200'
                  )}
                >
                  {link.label}
                </button>
              ))}
            </nav>

            <div className="mt-auto space-y-4">
              <a
                href={getWhatsAppLink(SITE.whatsapp)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary w-full justify-center text-xs"
              >
                Agendar Consulta
              </a>
              <p className="text-2xs text-center text-charcoal-400 dark:text-charcoal-500 font-sans tracking-wide">
                {SITE.oab} · Atendimento Presencial e Online
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
