'use client'

import { useEffect, useRef } from 'react'
import { ArrowRight, Clock, Tag } from 'lucide-react'
import { BLOG_POSTS } from '@/lib/constants'
import { formatDate, cn } from '@/lib/utils'

const categoryColors: Record<string, string> = {
  'Direito Digital':    'text-emerald-400 bg-emerald-950/50 border-emerald-800/50',
  'Direito da Saúde':  'text-rose-400 bg-rose-950/50 border-rose-800/50',
  'Direito do Consumidor': 'text-blue-400 bg-blue-950/50 border-blue-800/50',
}

export default function BlogPreview() {
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
      id="blog"
      ref={sectionRef}
      className="section-padding bg-cream dark:bg-charcoal-950"
      aria-labelledby="blog-title"
    >
      <div className="container-wide">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 reveal">
          <div>
            <span className="section-label">Conteúdo Jurídico</span>
            <span className="divider-gold" />
            <h2
              id="blog-title"
              className="section-title mt-4"
            >
              Blog &amp;{' '}
              <span className="italic font-light text-gold">Artigos</span>
            </h2>
          </div>
          <a
            href="/blog"
            className="inline-flex items-center gap-2 text-sm font-sans font-semibold text-charcoal-700 dark:text-charcoal-300 hover:text-gold transition-colors group flex-shrink-0"
          >
            Ver todos os artigos
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" aria-hidden />
          </a>
        </div>

        {/* Posts grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {BLOG_POSTS.map((post, i) => (
            <article
              key={post.id}
              className={cn(
                'reveal group card-base rounded-sm overflow-hidden flex flex-col',
                i === 0 ? 'md:col-span-1 md:row-span-1' : ''
              )}
              style={{ transitionDelay: `${i * 100}ms` }}
            >
              {/* Category image area */}
              <div className="aspect-[16/9] bg-cream-200 dark:bg-charcoal-900 relative overflow-hidden flex-shrink-0">
                <div className={cn(
                  'absolute inset-0 flex items-center justify-center',
                  i === 0 ? 'bg-gradient-to-br from-emerald-950 to-charcoal-950' :
                  i === 1 ? 'bg-gradient-to-br from-rose-950 to-charcoal-950' :
                            'bg-gradient-to-br from-blue-950 to-charcoal-950'
                )}>
                  {/* SVG pattern */}
                  <svg viewBox="0 0 400 225" fill="none" className="w-full h-full opacity-60 absolute inset-0">
                    {[...Array(8)].map((_, j) => (
                      <line
                        key={j}
                        x1={-50 + j * 60}
                        y1="0"
                        x2={150 + j * 60}
                        y2="225"
                        stroke="rgba(196,149,42,0.06)"
                        strokeWidth="1"
                      />
                    ))}
                    <rect x="0" y="215" width="400" height="10" fill="rgba(196,149,42,0.3)" />
                  </svg>
                  <Tag className="w-8 h-8 text-gold/40" aria-hidden />
                </div>

                {/* Category badge */}
                <div className="absolute top-3 left-3">
                  <span className={cn(
                    'text-2xs font-sans font-semibold tracking-widest uppercase px-2.5 py-1 border rounded-sm',
                    categoryColors[post.category] ?? 'text-gold bg-charcoal-900 border-charcoal-700'
                  )}>
                    {post.category}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="flex flex-col flex-1 p-6">
                <div className="flex items-center gap-4 text-2xs text-charcoal-500 dark:text-charcoal-500 font-sans mb-3">
                  <span>{formatDate(post.date)}</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" aria-hidden />
                    {post.readTime} de leitura
                  </span>
                </div>

                <h3 className="font-serif text-lg text-charcoal-950 dark:text-cream-50 leading-snug mb-3 group-hover:text-gold transition-colors duration-200">
                  {post.title}
                </h3>
                <p className="text-sm text-charcoal-600 dark:text-charcoal-400 leading-relaxed flex-1">
                  {post.excerpt}
                </p>

                <a
                  href={`/blog/${post.slug}`}
                  className="inline-flex items-center gap-2 mt-5 text-sm font-sans font-semibold text-gold hover:text-gold-dark transition-colors group/link"
                  aria-label={`Ler artigo: ${post.title}`}
                >
                  Ler artigo
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover/link:translate-x-1" aria-hidden />
                </a>
              </div>
            </article>
          ))}
        </div>

        {/* Disclaimer */}
        <p className="text-center text-xs text-charcoal-400 dark:text-charcoal-600 mt-10 max-w-2xl mx-auto leading-relaxed reveal">
          Os artigos deste blog têm caráter exclusivamente informativo e educacional,
          não constituindo consulta ou orientação jurídica individualizada.
          Consulte um advogado para análise do seu caso específico.
        </p>
      </div>
    </section>
  )
}
