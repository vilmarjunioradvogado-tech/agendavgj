'use client'

import { useEffect, useRef } from 'react'
import { ArrowRight, Scale, ChevronDown } from 'lucide-react'
import { SITE } from '@/lib/constants'
import { getWhatsAppLink } from '@/lib/utils'

export default function Hero() {
  const lineRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const timer = setTimeout(() => {
      if (lineRef.current) lineRef.current.classList.add('visible')
    }, 300)
    return () => clearTimeout(timer)
  }, [])

  const scrollDown = () => {
    const el = document.getElementById('sobre')
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <section
      className="relative min-h-screen flex flex-col justify-center overflow-hidden bg-charcoal-950"
      aria-label="Apresentação"
    >
      {/* Background geometric pattern */}
      <div className="absolute inset-0 geo-lines opacity-60" aria-hidden />

      {/* Gold accent line - top */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold to-transparent opacity-60" aria-hidden />

      {/* Large background number */}
      <div
        className="absolute right-0 top-1/2 -translate-y-1/2 text-[20rem] md:text-[28rem] font-serif font-bold leading-none select-none pointer-events-none"
        style={{ color: 'rgba(196,149,42,0.03)' }}
        aria-hidden
      >
        VGJ
      </div>

      {/* Right decorative column */}
      <div className="absolute right-16 top-0 bottom-0 w-px bg-charcoal-800 hidden xl:block" aria-hidden>
        <div className="absolute top-1/3 w-full h-24 bg-gold opacity-40" />
      </div>

      {/* Content */}
      <div className="container-wide relative z-10 pt-32 pb-20 lg:pt-40 lg:pb-28">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

          {/* Left: Text */}
          <div className="lg:col-span-7 space-y-8">

            {/* Label */}
            <div
              className="flex items-center gap-4 opacity-0 animate-fade-in"
              style={{ animationDelay: '0.1s', animationFillMode: 'forwards' }}
            >
              <div className="w-8 h-px bg-gold" aria-hidden />
              <span className="section-label">{SITE.oab} · Advocacia Especializada</span>
            </div>

            {/* Main Heading */}
            <h1
              className="text-4xl sm:text-5xl md:text-6xl xl:text-7xl font-serif font-normal text-cream-50 leading-[1.05] tracking-tight opacity-0 animate-fade-up"
              style={{ animationDelay: '0.2s', animationFillMode: 'forwards' }}
            >
              Assessoria Jurídica{' '}
              <span className="relative inline-block">
                <span className="text-gold-gradient">Especializada</span>
              </span>{' '}
              e Comprometida com{' '}
              <span className="italic font-light text-gold-light">Seus Direitos.</span>
            </h1>

            {/* Subheading */}
            <p
              className="text-base md:text-lg text-charcoal-400 leading-relaxed max-w-xl opacity-0 animate-fade-up"
              style={{ animationDelay: '0.35s', animationFillMode: 'forwards' }}
            >
              Atuação nas áreas de{' '}
              <strong className="text-charcoal-200 font-medium">Direito do Consumidor</strong>,{' '}
              <strong className="text-charcoal-200 font-medium">Direito Digital</strong> e{' '}
              <strong className="text-charcoal-200 font-medium">Direito da Saúde</strong>,
              com atendimento humanizado, estratégia jurídica personalizada e ética inabalável.
            </p>

            {/* CTAs */}
            <div
              className="flex flex-col sm:flex-row gap-4 opacity-0 animate-fade-up"
              style={{ animationDelay: '0.5s', animationFillMode: 'forwards' }}
            >
              <a
                href={getWhatsAppLink(SITE.whatsapp, 'Olá! Gostaria de agendar uma consulta com o Dr. Vilmar Guimarães Júnior.')}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary group"
              >
                Agendar Consulta
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" aria-hidden />
              </a>
              <a
                href="#areas-de-atuacao"
                onClick={(e) => {
                  e.preventDefault()
                  document.querySelector('#areas-de-atuacao')?.scrollIntoView({ behavior: 'smooth' })
                }}
                className="btn-outline text-cream-50 border-charcoal-600 hover:bg-charcoal-800 hover:border-charcoal-500"
              >
                Áreas de Atuação
              </a>
            </div>

            {/* Stats bar */}
            <div
              className="flex flex-wrap gap-8 pt-4 border-t border-charcoal-800 opacity-0 animate-fade-up"
              style={{ animationDelay: '0.65s', animationFillMode: 'forwards' }}
            >
              {[
                { value: '3', label: 'Áreas Especializadas' },
                { value: 'OAB/MG', label: 'Inscrição Regular' },
                { value: 'Online', label: 'Atendimento Nacional' },
              ].map((stat) => (
                <div key={stat.label}>
                  <p className="font-serif text-2xl md:text-3xl font-semibold text-gold-light leading-none">
                    {stat.value}
                  </p>
                  <p className="text-xs text-charcoal-500 tracking-wide mt-1 font-sans">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Visual card */}
          <div
            className="lg:col-span-5 opacity-0 animate-slide-left"
            style={{ animationDelay: '0.4s', animationFillMode: 'forwards' }}
          >
            <div className="relative">
              {/* Main card */}
              <div className="relative bg-charcoal-900 border border-charcoal-700 rounded-sm p-8 overflow-hidden">
                {/* Gold corner accent */}
                <div className="absolute top-0 right-0 w-16 h-16" aria-hidden>
                  <div className="absolute top-0 right-0 w-full h-px bg-gold" />
                  <div className="absolute top-0 right-0 w-px h-full bg-gold" />
                </div>

                {/* Lawyer visual placeholder */}
                <div className="aspect-[4/5] bg-gradient-to-br from-charcoal-800 to-charcoal-900 rounded-sm mb-6 flex flex-col items-center justify-center relative overflow-hidden">
                  {/* Geometric SVG portrait placeholder */}
                  <svg viewBox="0 0 300 375" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full absolute inset-0">
                    <defs>
                      <linearGradient id="bgGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#1C1F28" />
                        <stop offset="100%" stopColor="#0F1117" />
                      </linearGradient>
                      <linearGradient id="goldGrad" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#C4952A" />
                        <stop offset="100%" stopColor="#E8C46A" />
                      </linearGradient>
                    </defs>
                    <rect width="300" height="375" fill="url(#bgGrad)" />
                    {/* Geometric lines */}
                    <line x1="0" y1="375" x2="300" y2="0" stroke="rgba(196,149,42,0.06)" strokeWidth="1" />
                    <line x1="0" y1="0" x2="300" y2="375" stroke="rgba(196,149,42,0.06)" strokeWidth="1" />
                    {/* Scale of justice icon */}
                    <g transform="translate(100, 140)" opacity="0.15">
                      <line x1="50" y1="0" x2="50" y2="80" stroke="#C4952A" strokeWidth="2" />
                      <line x1="10" y1="20" x2="90" y2="20" stroke="#C4952A" strokeWidth="2" />
                      <circle cx="10" cy="35" r="15" stroke="#C4952A" strokeWidth="2" fill="none" />
                      <circle cx="90" cy="35" r="15" stroke="#C4952A" strokeWidth="2" fill="none" />
                      <rect x="35" y="80" width="30" height="5" fill="#C4952A" opacity="0.5" />
                    </g>
                    {/* Gold bottom line */}
                    <rect x="0" y="370" width="300" height="5" fill="url(#goldGrad)" />
                  </svg>

                  <div className="relative z-10 text-center px-6">
                    <Scale className="w-12 h-12 text-gold mx-auto mb-4 opacity-40" aria-hidden />
                    <p className="text-charcoal-400 text-sm font-sans">Foto profissional</p>
                    <p className="text-charcoal-500 text-xs mt-1">Dr. Vilmar Guimarães Júnior</p>
                  </div>
                </div>

                <div className="text-center">
                  <p className="font-serif text-xl text-cream-50 font-medium">Vilmar Guimarães Júnior</p>
                  <p className="text-gold text-sm font-sans tracking-widest uppercase mt-1">Advogado · {SITE.oab}</p>
                </div>

                {/* Areas tags */}
                <div className="flex flex-wrap gap-2 mt-4 justify-center">
                  {['Consumidor', 'Digital', 'Saúde'].map((tag) => (
                    <span
                      key={tag}
                      className="text-2xs font-sans font-medium tracking-wide uppercase px-3 py-1 border border-charcoal-700 text-charcoal-400 rounded-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Floating accent card */}
              <div className="absolute -bottom-4 -left-4 bg-gold px-5 py-3 rounded-sm shadow-gold">
                <p className="text-charcoal-950 text-xs font-sans font-bold tracking-widest uppercase">
                  Atendimento Online
                </p>
                <p className="text-charcoal-800 text-2xs font-sans mt-0.5">
                  Todo o Brasil
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <button
        onClick={scrollDown}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-charcoal-500 hover:text-gold transition-colors animate-float"
        aria-label="Rolar para baixo"
      >
        <span className="text-2xs font-sans tracking-[0.2em] uppercase">Conheça</span>
        <ChevronDown className="w-4 h-4" />
      </button>

      {/* Gold accent line - bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold to-transparent opacity-40" aria-hidden />
    </section>
  )
}
