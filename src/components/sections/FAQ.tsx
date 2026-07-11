'use client'

import { useEffect, useRef, useState } from 'react'
import { Plus, Minus } from 'lucide-react'
import { FAQ_ITEMS } from '@/lib/constants'
import { cn } from '@/lib/utils'

function FAQItem({
  question,
  answer,
  isOpen,
  onToggle,
  index,
}: {
  question: string
  answer: string
  isOpen: boolean
  onToggle: () => void
  index: number
}) {
  return (
    <div
      className={cn(
        'border-b border-cream-300 dark:border-charcoal-700 transition-colors',
        isOpen && 'border-gold/30 dark:border-gold/20'
      )}
    >
      <button
        onClick={onToggle}
        className="w-full flex items-start gap-4 py-5 text-left group"
        aria-expanded={isOpen}
        aria-controls={`faq-answer-${index}`}
        id={`faq-question-${index}`}
      >
        <span className="font-serif text-sm text-gold flex-shrink-0 w-6 leading-relaxed mt-0.5">
          {String(index + 1).padStart(2, '0')}
        </span>
        <span className={cn(
          'flex-1 font-sans text-base font-medium leading-snug transition-colors',
          isOpen
            ? 'text-gold'
            : 'text-charcoal-900 dark:text-cream-50 group-hover:text-gold'
        )}>
          {question}
        </span>
        <span
          className={cn(
            'flex-shrink-0 w-8 h-8 border rounded-sm flex items-center justify-center transition-all duration-300',
            isOpen
              ? 'bg-gold border-gold text-charcoal-950'
              : 'border-cream-300 dark:border-charcoal-600 text-charcoal-500 dark:text-charcoal-400 group-hover:border-gold/50 group-hover:text-gold'
          )}
        >
          {isOpen
            ? <Minus className="w-3.5 h-3.5" aria-hidden />
            : <Plus  className="w-3.5 h-3.5" aria-hidden />
          }
        </span>
      </button>

      <div
        id={`faq-answer-${index}`}
        role="region"
        aria-labelledby={`faq-question-${index}`}
        className={cn(
          'overflow-hidden transition-all duration-500 ease-out-expo',
          isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        )}
      >
        <div className="pb-6 pl-10 pr-12">
          <p className="text-charcoal-600 dark:text-charcoal-400 text-sm leading-relaxed">
            {answer}
          </p>
        </div>
      </div>
    </div>
  )
}

export default function FAQ() {
  const sectionRef = useRef<HTMLElement>(null)
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.querySelectorAll('.reveal, .reveal-left, .reveal-right').forEach((el, i) => {
              setTimeout(() => el.classList.add('visible'), i * 80)
            })
          }
        })
      },
      { threshold: 0.05 }
    )
    if (sectionRef.current) observer.observe(sectionRef.current)
    return () => observer.disconnect()
  }, [])

  const toggle = (i: number) => setOpenIndex(openIndex === i ? null : i)

  return (
    <section
      id="faq"
      ref={sectionRef}
      className="section-padding bg-cream dark:bg-charcoal-950 relative overflow-hidden"
      aria-labelledby="faq-title"
    >
      <div className="absolute inset-0 texture-diagonal opacity-50 dark:opacity-20" aria-hidden />

      <div className="container-wide relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">

          {/* Left */}
          <div className="lg:col-span-4 reveal-left lg:sticky lg:top-28 space-y-6">
            <span className="section-label">Perguntas Frequentes</span>
            <span className="divider-gold" />
            <h2 id="faq-title" className="section-title mt-4 text-balance">
              Dúvidas{' '}
              <span className="italic font-light text-gold">Comuns</span>
            </h2>
            <p className="text-charcoal-600 dark:text-charcoal-300 text-sm leading-relaxed">
              Reunimos as perguntas mais frequentes dos nossos clientes para
              ajudá-lo a entender melhor como funciona o atendimento jurídico.
            </p>
            <p className="text-charcoal-500 dark:text-charcoal-500 text-sm leading-relaxed">
              Não encontrou sua dúvida? Entre em contato — respondemos com agilidade.
            </p>
          </div>

          {/* Right: Accordion */}
          <div className="lg:col-span-8 reveal">
            <div className="divide-y-0">
              {FAQ_ITEMS.map((item, i) => (
                <FAQItem
                  key={i}
                  question={item.question}
                  answer={item.answer}
                  isOpen={openIndex === i}
                  onToggle={() => toggle(i)}
                  index={i}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
