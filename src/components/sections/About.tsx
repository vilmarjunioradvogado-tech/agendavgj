'use client'

import { useEffect, useRef } from 'react'
import { Award, GraduationCap, Users, CheckCircle } from 'lucide-react'
import { SITE } from '@/lib/constants'

const highlights = [
  { icon: GraduationCap, text: 'Formação jurídica sólida e especializada' },
  { icon: Award,         text: 'Inscrito regularmente na OAB/MG' },
  { icon: Users,         text: 'Atendimento humanizado e personalizado' },
  { icon: CheckCircle,   text: 'Atuação ética e transparente' },
]

export default function About() {
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
      { threshold: 0.1 }
    )
    if (sectionRef.current) observer.observe(sectionRef.current)
    return () => observer.disconnect()
  }, [])

  return (
    <section
      id="sobre"
      ref={sectionRef}
      className="section-padding bg-cream dark:bg-charcoal-950"
      aria-labelledby="sobre-title"
    >
      <div className="container-wide">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-20 items-center">

          {/* Left: Visual */}
          <div className="lg:col-span-5 reveal-left">
            <div className="relative">
              {/* Photo frame */}
              <div className="aspect-[3/4] bg-cream-200 dark:bg-charcoal-900 rounded-sm overflow-hidden relative">
                {/* Placeholder SVG */}
                <svg viewBox="0 0 450 600" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                  <defs>
                    <linearGradient id="aboutBg" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#F0EDE6" />
                      <stop offset="100%" stopColor="#E8E2D6" />
                    </linearGradient>
                    <linearGradient id="aboutBgDark" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#1C1F28" />
                      <stop offset="100%" stopColor="#0F1117" />
                    </linearGradient>
                  </defs>
                  <rect width="450" height="600" fill="#E8E2D6" className="dark:fill-charcoal-900" />
                  {/* Diagonal lines */}
                  {[...Array(12)].map((_, i) => (
                    <line
                      key={i}
                      x1={-100 + i * 60}
                      y1="0"
                      x2={200 + i * 60}
                      y2="600"
                      stroke="rgba(196,149,42,0.06)"
                      strokeWidth="1"
                    />
                  ))}
                  {/* Lawyer silhouette placeholder */}
                  <g transform="translate(125, 80)" opacity="0.25">
                    {/* Head */}
                    <circle cx="100" cy="80" r="60" fill="#9a7d47" />
                    {/* Suit body */}
                    <path d="M 20 200 Q 100 160 180 200 L 200 400 L 0 400 Z" fill="#4a4a4a" />
                    {/* Tie */}
                    <path d="M 90 195 L 110 195 L 115 280 L 100 300 L 85 280 Z" fill="#C4952A" />
                    {/* Collar */}
                    <path d="M 70 195 L 100 220 L 130 195" stroke="#6b6b6b" strokeWidth="3" fill="none" />
                  </g>
                  {/* Gold bar at bottom */}
                  <rect x="0" y="580" width="450" height="20" fill="#C4952A" opacity="0.8" />
                </svg>

                {/* Overlay hint */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center bg-white/80 dark:bg-charcoal-950/80 backdrop-blur-sm px-6 py-4 rounded-sm">
                    <p className="text-charcoal-500 text-sm font-sans">Dr. Vilmar Guimarães Júnior</p>
                    <p className="text-charcoal-400 text-xs mt-1">Foto profissional</p>
                  </div>
                </div>
              </div>

              {/* Gold border accent */}
              <div className="absolute -bottom-3 -right-3 w-full h-full border border-gold rounded-sm -z-10" aria-hidden />

              {/* Experience badge */}
              <div className="absolute -top-4 -right-4 bg-charcoal-950 dark:bg-gold border border-gold dark:border-transparent text-cream-50 dark:text-charcoal-950 px-5 py-4 rounded-sm text-center shadow-gold">
                <p className="font-serif text-2xl font-bold text-gold dark:text-charcoal-950 leading-none">
                  OAB
                </p>
                <p className="text-2xs font-sans tracking-widest uppercase mt-1 text-charcoal-300 dark:text-charcoal-700">
                  Inscrito
                </p>
              </div>
            </div>
          </div>

          {/* Right: Content */}
          <div className="lg:col-span-7 space-y-8">
            <div className="reveal">
              <span className="section-label">Sobre o Advogado</span>
              <span className="divider-gold" />
              <h2 id="sobre-title" className="section-title mt-4 text-balance">
                Dedicação ao Exercício{' '}
                <span className="italic font-light text-gold">Ético da Advocacia</span>
              </h2>
            </div>

            <div className="reveal space-y-5 text-charcoal-600 dark:text-charcoal-300">
              <p>
                Vilmar Guimarães Júnior é advogado inscrito na OAB/MG, com atuação dedicada nas áreas
                de <strong className="text-charcoal-900 dark:text-cream-100 font-medium">Direito do Consumidor</strong>,{' '}
                <strong className="text-charcoal-900 dark:text-cream-100 font-medium">Direito Digital</strong> e{' '}
                <strong className="text-charcoal-900 dark:text-cream-100 font-medium">Direito da Saúde</strong>.
              </p>
              <p>
                Comprometido com a prestação de serviços jurídicos de excelência, pauta sua atuação pela
                ética, transparência e respeito à dignidade de cada cliente. Acredita que a advocacia deve
                ser acessível, compreensível e orientada genuinamente ao melhor interesse do assistido.
              </p>
              <p>
                Com formação técnica sólida e atualização constante, oferece assessoria jurídica personalizada,
                orientada para cada caso específico, evitando soluções genéricas e apostando na estratégia
                mais adequada para cada situação.
              </p>
            </div>

            {/* Highlights */}
            <div className="reveal grid grid-cols-1 sm:grid-cols-2 gap-4">
              {highlights.map(({ icon: Icon, text }) => (
                <div
                  key={text}
                  className="flex items-start gap-3 p-4 bg-cream-100 dark:bg-charcoal-900 border border-cream-300 dark:border-charcoal-700 rounded-sm"
                >
                  <Icon className="w-5 h-5 text-gold flex-shrink-0 mt-0.5" aria-hidden />
                  <span className="text-sm text-charcoal-700 dark:text-charcoal-300 leading-snug">
                    {text}
                  </span>
                </div>
              ))}
            </div>

            {/* OAB note */}
            <div className="reveal flex items-center gap-3 pt-2">
              <div className="w-10 h-px bg-gold flex-shrink-0" aria-hidden />
              <p className="text-sm text-charcoal-500 dark:text-charcoal-400 font-sans">
                {SITE.oab} · Inscrito regularmente na Ordem dos Advogados do Brasil
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
