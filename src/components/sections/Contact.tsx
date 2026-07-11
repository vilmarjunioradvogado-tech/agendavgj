'use client'

import { useEffect, useRef, useState } from 'react'
import { Mail, Phone, MapPin, Send, CheckCircle, AlertCircle } from 'lucide-react'
import { SITE } from '@/lib/constants'
import { getWhatsAppLink, cn } from '@/lib/utils'

type FormState = 'idle' | 'loading' | 'success' | 'error'

const contactItems = [
  {
    icon: Phone,
    label: 'WhatsApp',
    value: SITE.whatsappDisplay,
    href: getWhatsAppLink(SITE.whatsapp),
    external: true,
  },
  {
    icon: Mail,
    label: 'E-mail',
    value: SITE.email,
    href: `mailto:${SITE.email}`,
    external: false,
  },
  {
    icon: MapPin,
    label: 'Localização',
    value: 'Belo Horizonte, MG\nAtendimento online em todo o Brasil',
    href: null,
    external: false,
  },
]

export default function Contact() {
  const sectionRef = useRef<HTMLElement>(null)
  const [formState, setFormState] = useState<FormState>('idle')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    area: '',
    message: '',
  })

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

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormState('loading')

    // Build WhatsApp message from form
    const msg = [
      `*Nova mensagem do site*`,
      `Nome: ${formData.name}`,
      `E-mail: ${formData.email}`,
      formData.phone ? `Telefone: ${formData.phone}` : null,
      formData.area ? `Área de interesse: ${formData.area}` : null,
      `\nMensagem:\n${formData.message}`,
    ]
      .filter(Boolean)
      .join('\n')

    // Redirect to WhatsApp (client-side form submission)
    await new Promise((r) => setTimeout(r, 600))
    window.open(getWhatsAppLink(SITE.whatsapp, msg), '_blank', 'noopener,noreferrer')
    setFormState('success')
    setFormData({ name: '', email: '', phone: '', area: '', message: '' })
    setTimeout(() => setFormState('idle'), 5000)
  }

  return (
    <section
      id="contato"
      ref={sectionRef}
      className="section-padding bg-charcoal-950 relative overflow-hidden"
      aria-labelledby="contato-title"
    >
      <div className="absolute inset-0 geo-lines opacity-40" aria-hidden />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" aria-hidden />

      <div className="container-wide relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">

          {/* Left */}
          <div className="lg:col-span-5 space-y-10 reveal-left">
            <div>
              <span className="section-label">Entre em Contato</span>
              <span className="divider-gold" />
              <h2 id="contato-title" className="mt-4 font-serif text-3xl md:text-4xl lg:text-5xl text-cream-50 text-balance">
                Fale com{' '}
                <span className="italic font-light text-gold">o Escritório</span>
              </h2>
              <p className="mt-4 text-charcoal-400 text-base leading-relaxed">
                Entre em contato para agendar sua consulta inicial.
                Respondemos com agilidade e com toda a discrição que seu caso merece.
              </p>
            </div>

            {/* Contact methods */}
            <ul className="space-y-4">
              {contactItems.map(({ icon: Icon, label, value, href, external }) => (
                <li key={label} className="flex items-start gap-4">
                  <div className="w-10 h-10 border border-charcoal-700 rounded-sm flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Icon className="w-4 h-4 text-gold" aria-hidden />
                  </div>
                  <div>
                    <p className="text-2xs font-sans font-semibold tracking-[0.15em] uppercase text-charcoal-500 mb-0.5">
                      {label}
                    </p>
                    {href ? (
                      <a
                        href={href}
                        {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                        className="text-charcoal-200 text-sm hover:text-gold transition-colors whitespace-pre-line"
                      >
                        {value}
                      </a>
                    ) : (
                      <p className="text-charcoal-200 text-sm whitespace-pre-line">{value}</p>
                    )}
                  </div>
                </li>
              ))}
            </ul>

            {/* OAB disclaimer */}
            <div className="p-5 border border-charcoal-700 rounded-sm bg-charcoal-900/50">
              <p className="text-2xs text-charcoal-500 leading-relaxed font-sans">
                <strong className="text-charcoal-400 font-medium">Importante:</strong>{' '}
                O envio desta mensagem não estabelece relação de clientela, não constitui
                consulta jurídica formal e não gera qualquer obrigação entre as partes.
                Em conformidade com o Provimento 205/2021 da OAB.
              </p>
            </div>
          </div>

          {/* Right: Form */}
          <div className="lg:col-span-7 reveal">
            <div className="bg-charcoal-900/60 border border-charcoal-700 rounded-sm p-8 md:p-10 backdrop-blur-sm relative overflow-hidden">
              {/* Gold corner */}
              <div className="absolute top-0 right-0 w-16 h-16" aria-hidden>
                <div className="absolute top-0 right-0 w-full h-px bg-gold opacity-50" />
                <div className="absolute top-0 right-0 w-px h-full bg-gold opacity-50" />
              </div>

              {formState === 'success' ? (
                <div className="flex flex-col items-center text-center py-10 gap-4">
                  <CheckCircle className="w-12 h-12 text-gold" />
                  <h3 className="font-serif text-xl text-cream-50">Mensagem enviada!</h3>
                  <p className="text-charcoal-400 text-sm leading-relaxed max-w-sm">
                    Sua mensagem foi encaminhada via WhatsApp. Responderemos em breve.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} noValidate className="space-y-5">
                  <h3 className="font-serif text-xl text-cream-50 mb-6">
                    Enviar Mensagem
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="contact-name" className="block text-2xs font-sans font-semibold tracking-widest uppercase text-charcoal-400 mb-2">
                        Nome *
                      </label>
                      <input
                        id="contact-name"
                        name="name"
                        type="text"
                        required
                        autoComplete="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Seu nome completo"
                        className="input-base"
                      />
                    </div>
                    <div>
                      <label htmlFor="contact-email" className="block text-2xs font-sans font-semibold tracking-widest uppercase text-charcoal-400 mb-2">
                        E-mail *
                      </label>
                      <input
                        id="contact-email"
                        name="email"
                        type="email"
                        required
                        autoComplete="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="seu@email.com"
                        className="input-base"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="contact-phone" className="block text-2xs font-sans font-semibold tracking-widest uppercase text-charcoal-400 mb-2">
                        Telefone
                      </label>
                      <input
                        id="contact-phone"
                        name="phone"
                        type="tel"
                        autoComplete="tel"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="(00) 00000-0000"
                        className="input-base"
                      />
                    </div>
                    <div>
                      <label htmlFor="contact-area" className="block text-2xs font-sans font-semibold tracking-widest uppercase text-charcoal-400 mb-2">
                        Área de interesse
                      </label>
                      <select
                        id="contact-area"
                        name="area"
                        value={formData.area}
                        onChange={handleChange}
                        className="input-base"
                      >
                        <option value="">Selecione...</option>
                        <option value="Direito do Consumidor">Direito do Consumidor</option>
                        <option value="Direito Digital">Direito Digital</option>
                        <option value="Direito da Saúde">Direito da Saúde</option>
                        <option value="Outro">Outro / Não sei</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="contact-message" className="block text-2xs font-sans font-semibold tracking-widest uppercase text-charcoal-400 mb-2">
                      Mensagem *
                    </label>
                    <textarea
                      id="contact-message"
                      name="message"
                      required
                      rows={5}
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Descreva brevemente sua situação..."
                      className="input-base resize-none"
                    />
                  </div>

                  {formState === 'error' && (
                    <div className="flex items-center gap-2 text-rose-400 text-sm">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" aria-hidden />
                      Ocorreu um erro. Por favor, tente novamente.
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={formState === 'loading'}
                    className={cn(
                      'btn-primary w-full justify-center group',
                      formState === 'loading' && 'opacity-70 cursor-wait'
                    )}
                  >
                    {formState === 'loading' ? (
                      <>
                        <span className="w-4 h-4 border-2 border-charcoal-950/30 border-t-charcoal-950 rounded-full animate-spin" aria-hidden />
                        Enviando...
                      </>
                    ) : (
                      <>
                        Enviar via WhatsApp
                        <Send className="w-4 h-4 transition-transform group-hover:translate-x-1" aria-hidden />
                      </>
                    )}
                  </button>

                  <p className="text-2xs text-charcoal-600 text-center leading-relaxed">
                    Seus dados são tratados com total confidencialidade e nunca são compartilhados com terceiros.
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
