'use client'

import { useEffect, useRef } from 'react'
import { ArrowRight, Phone } from 'lucide-react'
import { SITE } from '@/lib/constants'
import { getWhatsAppLink } from '@/lib/utils'

export default function CallToAction() {
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.querySelectorAll('.reveal').forEach((el, i) => {
              setTimeout(() => el.classList.add('visible'), i * 100)
            })
          }
        })
      },
      { threshold: 0.2 }
    )
    if (sectionRef.current) observer.observe(sectionRef.current)
    return () => observer.disconnect()
  }, [])

  return (
    <section
      ref={sectionRef}
      className="py-24 relative overflow-hidden"
      aria-label="Chamada para ação"
    >
      {/* Gold gradient background */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(135deg, #8B6E2A 0%, #C4952A 50%, #E8C46A 100%)',
        }}
        aria-hidden
      />
      {/* Pattern overlay */}
      <div className="absolute inset-0 geo-lines opacity-20" aria-hidden />

      <div className="container-wide relative z-10 text-center">
        <div className="reveal">
          <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl text-charcoal-950 mb-6 text-balance font-medium">
            Precisa de Orientação Jurídica?
          </h2>
          <p className="text-charcoal-800 text-base md:text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
            Entre em contato agora mesmo e agende sua consulta. O primeiro passo
            para proteger seus direitos começa com uma conversa.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href={getWhatsAppLink(SITE.whatsapp, 'Olá! Gostaria de agendar uma consulta com o Dr. Vilmar.')}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-charcoal-950 text-cream-50 px-8 py-4 text-xs font-sans font-semibold tracking-widest uppercase hover:bg-charcoal-900 transition-colors group"
            >
              <Phone className="w-4 h-4" aria-hidden />
              Falar pelo WhatsApp
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" aria-hidden />
            </a>
            <a
              href={`mailto:${SITE.email}`}
              className="inline-flex items-center justify-center gap-2 bg-transparent border-2 border-charcoal-950/30 text-charcoal-950 px-8 py-4 text-xs font-sans font-semibold tracking-widest uppercase hover:bg-charcoal-950/10 transition-colors"
            >
              Enviar E-mail
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
