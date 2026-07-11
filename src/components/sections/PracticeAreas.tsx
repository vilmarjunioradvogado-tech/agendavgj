'use client'

import { useEffect, useRef, useState } from 'react'
import { Shield, Globe, Heart, ChevronRight, ArrowRight } from 'lucide-react'
import { PRACTICE_AREAS, SITE } from '@/lib/constants'
import { getWhatsAppLink, cn } from '@/lib/utils'

const iconMap: Record<string, React.ElementType> = {
  Shield, Globe, Heart,
}

export default function PracticeAreas() {
  const sectionRef = useRef<HTMLElement>(null)
  const [activeArea, setActiveArea] = useState(0)

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

  const area = PRACTICE_AREAS[activeArea]
  const Icon = iconMap[area.icon]

  return (
    <section
      id="areas-de-atuacao"
      ref={sectionRef}
      className="section-padding bg-charcoal-950 relative overflow-hidden"
      aria-labelledby="areas-title"
    >
      {/* Background decoration */}
      <div className="absolute inset-0 geo-lines opacity-40" aria-hidden />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" aria-hidden />

      <div className="container-wide relative z-10">

        {/* Header */}
        <div className="text-center mb-16 reveal">
          <span className="section-label">Especialidades</span>
          <span className="divider-gold mx-auto" />
          <h2
            id="areas-title"
            className="mt-4 font-serif text-3xl md:text-4xl lg:text-5xl text-cream-50 text-balance"
          >
            Áreas de{' '}
            <span className="italic font-light text-gold">Atuação</span>
          </h2>
          <p className="mt-4 text-charcoal-400 max-w-2xl mx-auto text-base leading-relaxed">
            Atuação especializada e técnica nas áreas do direito que mais impactam
            o cotidiano dos cidadãos brasileiros.
          </p>
        </div>

        {/* Area Tabs */}
        <div className="flex flex-col sm:flex-row gap-2 mb-10 reveal">
          {PRACTICE_AREAS.map((a, i) => {
            const TabIcon = iconMap[a.icon]
            return (
              <button
                key={a.id}
                onClick={() => setActiveArea(i)}
                className={cn(
                  'flex-1 flex items-center gap-3 px-5 py-4 rounded-sm border text-left transition-all duration-300',
                  activeArea === i
                    ? 'bg-gold border-gold text-charcoal-950'
                    : 'bg-charcoal-900 border-charcoal-700 text-charcoal-300 hover:border-gold/50 hover:text-cream-50'
                )}
                aria-pressed={activeArea === i}
              >
                <TabIcon
                  className={cn('w-5 h-5 flex-shrink-0', activeArea === i ? 'text-charcoal-950' : 'text-gold')}
                  aria-hidden
                />
                <span className="font-sans text-sm font-medium leading-snug">
                  {a.title}
                </span>
              </button>
            )
          })}
        </div>

        {/* Active Area Detail */}
        <div
          key={area.id}
          className="rounded-sm border border-charcoal-700 overflow-hidden grid grid-cols-1 lg:grid-cols-12 transition-all duration-300"
        >
          {/* Left panel */}
          <div className="lg:col-span-5 p-8 md:p-12 flex flex-col justify-between gap-8 bg-charcoal-900">
            <div>
              <div className="w-14 h-14 rounded-sm border border-gold/30 bg-gold/10 flex items-center justify-center mb-6">
                <Icon className="w-7 h-7 text-gold" aria-hidden />
              </div>
              <h3 className="font-serif text-2xl md:text-3xl text-cream-50 font-medium">
                {area.title}
              </h3>
              <p className="text-gold text-sm font-sans mt-2 tracking-wide">
                {area.tagline}
              </p>
              <p className="text-charcoal-300 text-sm leading-relaxed mt-6">
                {area.description}
              </p>
            </div>

            <a
              href={getWhatsAppLink(
                SITE.whatsapp,
                `Olá! Tenho uma dúvida sobre ${area.title}.`
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-gold text-sm font-sans font-semibold tracking-wide group w-fit border border-gold/30 px-5 py-3 hover:bg-gold hover:text-charcoal-950 hover:border-gold transition-all duration-300"
            >
              Consultar sobre esta área
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" aria-hidden />
            </a>
          </div>

          {/* Right panel: topics */}
          <div className="lg:col-span-7 p-8 md:p-12 bg-charcoal-900/40 border-t border-charcoal-700 lg:border-t-0 lg:border-l">
            <p className="text-xs font-sans font-semibold tracking-[0.2em] uppercase text-gold mb-6">
              Principais Demandas Atendidas
            </p>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {area.topics.map((topic) => (
                <li
                  key={topic}
                  className="flex items-start gap-3 p-4 bg-charcoal-800/50 border border-charcoal-700/50 rounded-sm group hover:border-gold/30 hover:bg-charcoal-800 transition-all duration-200"
                >
                  <ChevronRight
                    className="w-4 h-4 text-gold flex-shrink-0 mt-0.5 transition-transform group-hover:translate-x-0.5"
                    aria-hidden
                  />
                  <span className="text-sm text-charcoal-300 leading-snug group-hover:text-charcoal-100 transition-colors">
                    {topic}
                  </span>
                </li>
              ))}
            </ul>

            <p className="mt-8 text-2xs text-charcoal-500 font-sans leading-relaxed border-t border-charcoal-700/50 pt-4">
              As informações acima são de caráter ilustrativo e geral.
              A análise do seu caso específico é necessária para orientação jurídica adequada.
            </p>
          </div>
        </div>

        {/* Area quick-nav cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          {PRACTICE_AREAS.map((a, i) => {
            const CardIcon = iconMap[a.icon]
            return (
              <button
                key={a.id}
                onClick={() => setActiveArea(i)}
                className={cn(
                  'p-5 border rounded-sm text-left transition-all duration-300 group reveal',
                  activeArea === i
                    ? 'border-gold bg-gold/10'
                    : 'border-charcoal-700 bg-charcoal-900/50 hover:border-charcoal-500 hover:bg-charcoal-900'
                )}
                style={{ transitionDelay: `${i * 80}ms` }}
              >
                <CardIcon
                  className={cn(
                    'w-6 h-6 mb-3 transition-colors',
                    activeArea === i ? 'text-gold' : 'text-charcoal-500 group-hover:text-gold/70'
                  )}
                  aria-hidden
                />
                <p className={cn(
                  'font-sans text-sm font-medium transition-colors',
                  activeArea === i ? 'text-gold' : 'text-charcoal-300 group-hover:text-cream-50'
                )}>
                  {a.title}
                </p>
                <p className="text-2xs text-charcoal-500 mt-1 leading-snug">
                  {a.tagline}
                </p>
              </button>
            )
          })}
        </div>
      </div>
    </section>
  )
}
