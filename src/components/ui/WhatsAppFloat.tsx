'use client'

import { useEffect, useState } from 'react'
import { MessageCircle } from 'lucide-react'
import { SITE } from '@/lib/constants'
import { getWhatsAppLink, cn } from '@/lib/utils'

export default function WhatsAppFloat() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 500)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <a
      href={getWhatsAppLink(SITE.whatsapp, 'Olá! Gostaria de agendar uma consulta com o Dr. Vilmar.')}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Falar pelo WhatsApp"
      className={cn(
        'fixed bottom-6 right-6 z-50 flex items-center gap-2.5',
        'bg-[#25D366] text-white rounded-full shadow-lg',
        'px-5 py-3 transition-all duration-500 group',
        'hover:bg-[#1ebe5d] hover:shadow-xl hover:scale-105',
        visible
          ? 'opacity-100 translate-y-0'
          : 'opacity-0 translate-y-6 pointer-events-none'
      )}
    >
      <MessageCircle className="w-5 h-5 flex-shrink-0" aria-hidden />
      <span className="text-sm font-semibold font-sans whitespace-nowrap">
        Fale conosco
      </span>
    </a>
  )
}
