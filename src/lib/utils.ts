import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateString: string): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day:   'numeric',
    month: 'long',
    year:  'numeric',
  }).format(new Date(dateString))
}

export function getWhatsAppLink(phone: string, message?: string): string {
  const msg = message
    ? encodeURIComponent(message)
    : encodeURIComponent('Olá! Gostaria de agendar uma consulta.')
  return `https://wa.me/55${phone.replace(/\D/g, '')}?text=${msg}`
}
