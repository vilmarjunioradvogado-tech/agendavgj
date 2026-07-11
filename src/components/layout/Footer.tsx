import { Scale, Mail, MapPin, Phone, Instagram, Linkedin } from 'lucide-react'
import { SITE, NAV_LINKS, PRACTICE_AREAS } from '@/lib/constants'
import { getWhatsAppLink } from '@/lib/utils'

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="bg-charcoal-950 text-charcoal-300 font-sans">

      {/* Main Footer */}
      <div className="container-wide py-20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 border-b border-charcoal-800">

        {/* Brand */}
        <div className="lg:col-span-1 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gold flex items-center justify-center rounded-sm flex-shrink-0">
              <Scale className="w-5 h-5 text-charcoal-950" aria-hidden />
            </div>
            <div>
              <p className="font-serif text-base font-semibold text-cream-50 leading-none">
                Vilmar Guimarães Júnior
              </p>
              <p className="text-2xs font-medium tracking-[0.2em] uppercase text-gold mt-1">
                Advogado
              </p>
            </div>
          </div>

          <p className="text-sm text-charcoal-400 leading-relaxed">
            Assessoria jurídica especializada em Direito do Consumidor,
            Direito Digital e Direito da Saúde, com atendimento humanizado
            e comprometido.
          </p>

          <div className="flex items-center gap-3">
            <a
              href={SITE.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 border border-charcoal-700 rounded-sm flex items-center justify-center text-charcoal-400 hover:text-gold hover:border-gold transition-colors"
              aria-label="Instagram"
            >
              <Instagram className="w-4 h-4" />
            </a>
            <a
              href={SITE.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 border border-charcoal-700 rounded-sm flex items-center justify-center text-charcoal-400 hover:text-gold hover:border-gold transition-colors"
              aria-label="LinkedIn"
            >
              <Linkedin className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Navigation */}
        <div className="space-y-4">
          <h3 className="text-xs font-semibold tracking-[0.2em] uppercase text-gold font-sans">
            Navegação
          </h3>
          <ul className="space-y-2">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="text-sm text-charcoal-400 hover:text-cream-50 transition-colors link-underline"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Areas */}
        <div className="space-y-4">
          <h3 className="text-xs font-semibold tracking-[0.2em] uppercase text-gold font-sans">
            Áreas de Atuação
          </h3>
          <ul className="space-y-2">
            {PRACTICE_AREAS.map((area) => (
              <li key={area.id}>
                <a
                  href={`#areas-de-atuacao`}
                  className="text-sm text-charcoal-400 hover:text-cream-50 transition-colors link-underline"
                >
                  {area.title}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div className="space-y-4">
          <h3 className="text-xs font-semibold tracking-[0.2em] uppercase text-gold font-sans">
            Contato
          </h3>
          <ul className="space-y-3">
            <li>
              <a
                href={getWhatsAppLink(SITE.whatsapp)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-charcoal-400 hover:text-gold transition-colors group"
              >
                <Phone className="w-4 h-4 flex-shrink-0 group-hover:text-gold" />
                {SITE.whatsappDisplay}
              </a>
            </li>
            <li>
              <a
                href={`mailto:${SITE.email}`}
                className="flex items-center gap-2 text-sm text-charcoal-400 hover:text-gold transition-colors group"
              >
                <Mail className="w-4 h-4 flex-shrink-0 group-hover:text-gold" />
                {SITE.email}
              </a>
            </li>
            <li className="flex items-start gap-2 text-sm text-charcoal-400">
              <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>Belo Horizonte, MG<br />Atendimento online em todo o Brasil</span>
            </li>
          </ul>

          <a
            href={getWhatsAppLink(SITE.whatsapp)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-xs font-semibold tracking-widest uppercase text-gold border border-gold px-5 py-3 hover:bg-gold hover:text-charcoal-950 transition-colors mt-2"
          >
            Fale Conosco
          </a>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="container-wide py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-xs text-charcoal-500 text-center sm:text-left">
          © {year} {SITE.name} — Advogado. {SITE.oab}. Todos os direitos reservados.
        </p>
        <p className="text-xs text-charcoal-600 text-center sm:text-right leading-relaxed max-w-lg">
          Este site tem caráter meramente informativo e não configura consulta jurídica.
          Em conformidade com o Provimento 205/2021 do Conselho Federal da OAB.
        </p>
      </div>
    </footer>
  )
}
