'use client'

import { useEffect, useRef } from 'react'
import { MessageCircle, Search, FileText, Headphones, ArrowRight } from 'lucide-react'
import { HOW_IT_WORKS, SITE } from '@/lib/constants'
import { getWhatsAppLink, cn } from '@/lib/utils'

const stepIcons = [MessageCircle, Search, FileText, Headphones]

export default function HowItWorks() {
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.querySelectorAll('.reveal, .reveal-left, .reveal-right').forEach((el, i) => {
              setTimeout(() => el.classList.add('visible'), i * 120)
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
      id="como-funciona"
      ref={sectionRef}
      className="section-padding bg-charcoal-950 relative overflow-hidden"
      aria-labelledby="como-funciona-title"
    >
      {/* Decorations */}
      <div className="absolute inset-0 geo-lines opacity-30" aria-hidden />
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none select-none"
        style={{
          backgroundImage: 'radial-gradient(circle at 70% 50%, rgba(196,149,42,0.4) 0%, transparent 60%)',
        }}
        aria-hidden
      />

      <div className="container-wide relative z-10">

        {/* Header */}
        <div className="text-center mb-16 reveal">
          <span className="section-label">Processo</span>
          <span className="divider-gold mx-auto" />
          <h2
            id="como-funciona-title"
            className="mt-4 font-serif text-3xl md:text-4xl lg:text-5xl text-cream-50 text-balance"
          >
            Como Funciona o{' '}
            <span className="italic font-light text-gold">Atendimento</span>
          </h2>
          <p className="mt-4 text-charcoal-400 max-w-xl mx-auto text-base leading-relaxed">
            Um processo claro, transparente e orientado para oferecer a melhor
            assessoria jurídica para o seu caso.
          </p>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Connecting line (desktop) */}
          <div
            className="absolute top-12 left-0 right-0 h-px bg-gradient-to-r from-transparent via-charcoal-700 to-transparent hidden lg:block"
            aria-hidden
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
            {HOW_IT_WORKS.map(({ step, title, description }, i) => {
              const Icon = stepIcons[i]
              return (
                <div
                  key={step}
                  className={cn(
                    'reveal group relative',
                    'flex flex-col items-start p-6 md:p-8',
                    'bg-charcoal-900/60 border border-charcoal-700/60 rounded-sm',
                    'hover:border-gold/40 hover:bg-charcoal-900 transition-all duration-300'
                  )}
                  style={{ transitionDelay: `${i * 100}ms` }}
                >
                  {/* Step number */}
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-gold rounded-sm flex items-center justify-center flex-shrink-0">
                      <Icon className="w-5 h-5 text-charcoal-950" aria-hidden />
                    </div>
                    <span className="font-serif text-3xl font-bold text-charcoal-800 group-hover:text-charcoal-700 transition-colors leading-none">
                      {step}
                    </span>
                  </div>

                  <h3 className="font-serif text-lg text-cream-50 mb-3 leading-snug">
                    {title}
                  </h3>
                  <p className="text-sm text-charcoal-400 leading-relaxed flex-1">
                    {description}
                  </p>

                  {/* Arrow for mobile */}
                  {i < HOW_IT_WORKS.length - 1 && (
                    <ArrowRight
                      className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 text-charcoal-700 hidden lg:block"
                      aria-hidden
                    />
                  )}

                  {/* Bottom accent */}
                  <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-gold transition-all duration-500 group-hover:w-full rounded-b-sm" aria-hidden />
                </div>
              )
            })}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-14 reveal">
          <p className="text-charcoal-400 text-sm mb-6 font-sans">
            Pronto para dar o primeiro passo?
          </p>
          <a
            href={getWhatsAppLink(SITE.whatsapp, 'Olá! Gostaria de iniciar meu atendimento.')}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary group"
          >
            Iniciar Meu Atendimento
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" aria-hidden />
          </a>
        </div>
      </div>
    </section>
  )
}
