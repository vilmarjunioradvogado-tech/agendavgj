import type { Metadata, Viewport } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import './globals.css'
import { SITE } from '@/lib/constants'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: SITE.title,
    template: `%s | ${SITE.name} – Advogado`,
  },
  description: SITE.description,
  keywords: [
    'advogado',
    'advocacia',
    'direito do consumidor',
    'direito digital',
    'direito da saúde',
    'LGPD',
    'plano de saúde',
    'negativação indevida',
    'Belo Horizonte',
    'MG',
    'Vilmar Guimarães',
  ],
  authors: [{ name: SITE.name }],
  creator: SITE.name,
  openGraph: {
    type:        'website',
    locale:      'pt_BR',
    url:         SITE.baseUrl,
    title:       SITE.title,
    description: SITE.description,
    siteName:    SITE.title,
  },
  twitter: {
    card:        'summary_large_image',
    title:       SITE.title,
    description: SITE.description,
  },
  robots: {
    index:  true,
    follow: true,
    googleBot: {
      index:              true,
      follow:             true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet':       -1,
    },
  },
  verification: {
    google: '',
  },
}

export const viewport: Viewport = {
  width:        'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#FAFAF8' },
    { media: '(prefers-color-scheme: dark)',  color: '#0F1117' },
  ],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="pt-BR"
      className={`${inter.variable} ${playfair.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-screen bg-cream text-charcoal-950 antialiased">
        {children}
      </body>
    </html>
  )
}
