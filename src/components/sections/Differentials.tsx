'use client'

import { useEffect, useRef } from 'react'
import {
  UserCheck, Eye, BookOpen, MessageSquare, Scale, Laptop,
} from 'lucide-react'
import { DIFFERENTIALS } from '@/lib/constants'
import { cn } from '@/lib/utils'

const iconMap: Record<string, React.ElementType> = {
  UserCheck, Eye, BookOpen, MessageSquare, Scale, Laptop,
}

export default function Differentials() {
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.querySelectorAll('.reveal, .reveal-left, .reveal-right').forEach((el, i) => {
              setTimeout(() => el.classList.add('visible'), i * 100)
            })
          }
        })
      },
      { threshold: 0.05 }
    )
    if (sectionRef.current) observer.observe(sectionRef.current)
    return () => observer.disconnect()
  }, [])

  return (
    <section
      id="diferenciais"
      ref={sectionRef}
      className="section-padding bg-cream-100 dark:bg-charcoal-900 relative overflow-hidden"
      aria-labelledby="diferenciais-title"
    >
      {/* Background */}
      <div className="absolute inset-0 texture-diagonal opacity-60 dark:opacity-30" aria-hidden />
      <div className="absolute right-0 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-gold/20 to-transparent hidden lg:block" aria-hidden />

      <div className="container-wide relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">

          {/* Left: Header (sticky) */}
          <div className="lg:col-span-4 lg:sticky lg:top-28 space-y-6 reveal-left">
            <span className="section-label">Por que nos escolher</span>
            <span className="divider-gold" />
            <h2 id="diferenciais-title" className="section-title mt-4 text-balance">
              O que nos{' '}
              <span className="italic font-light text-gold">Diferencia</span>
            </h2>
            <p className="text-charcoal-600 dark:text-charcoal-300 text-base leading-relaxed">
              Mais do que representação jurídica, oferecemos uma parceria baseada em
              confiança, ética e comprometimento com seus interesses.
            </p>

            <div className="flex items-center gap-3 pt-4">
              <div className="w-10 h-px bg-gold" aria-hidden />
              <p className="text-sm text-charcoal-500 dark:text-charcoal-400 font-sans">
                Advocacia com propósito
              </p>
            </div>

            {/* Gold quote */}
            <blockquote className="border-l-2 border-gold pl-5 py-2 italic text-charcoal-500 dark:text-charcoal-400 text-sm leading-relaxed mt-6">
              &ldquo;A advocacia ética não é apenas uma obrigação profissional,
              é o fundamento de cada relação com o cliente.&rdquo;
            </blockquote>
          </div>

          {/* Right: Grid */}
          <div className="lg:col-span-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {DIFFERENTIALS.map(({ icon, title, description }, i) => {
                const Icon = iconMap[icon]
                return (
                  <div
                    key={title}
                    className={cn(
                      'reveal group p-6 bg-white dark:bg-charcoal-950 border border-cream-300 dark:border-charcoal-800',
                      'rounded-sm card-hover relative overflow-hidden'
                    )}
                    style={{ transitionDelay: `${i * 80}ms` }}
                  >
                    {/* Number background */}
                    <span
                      className="absolute top-4 right-4 font-serif text-5xl font-bold text-cream-200 dark:text-charcoal-800 select-none leading-none"
                      aria-hidden
                    >
                      {String(i + 1).padStart(2, '0')}
                    </span>

                    {/* Icon */}
                    <div className="w-11 h-11 bg-cream-100 dark:bg-charcoal-900 border border-cream-300 dark:border-charcoal-700 rounded-sm flex items-center justify-center mb-5 group-hover:bg-gold group-hover:border-gold transition-colors duration-300">
                      <Icon
                        className="w-5 h-5 text-gold group-hover:text-charcoal-950 transition-colors duration-300"
                        aria-hidden
                      />
                    </div>

                    <h3 className="font-serif text-lg text-charcoal-950 dark:text-cream-50 mb-2 leading-snug">
                      {title}
                    </h3>
                    <p className="text-sm text-charcoal-600 dark:text-charcoal-400 leading-relaxed relative z-10">
                      {description}
                    </p>

                    {/* Bottom gold accent */}
                    <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-gold transition-all duration-500 group-hover:w-full" aria-hidden />
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
