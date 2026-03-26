

import './globals.css';
import type { Metadata, Viewport } from 'next';
import { Providers } from '@/components/providers/providers';
import { Analytics } from '@vercel/analytics/react';

export const metadata: Metadata = {
  metadataBase: new URL('http://jamamarket.clancig.com.ar'),
  title: {
    default: 'JamaMarket - Alimento y Accesorios Premium para tu Mascota',
    template: `%s | JamaMarket`,
  },
  description: 'Descubrí la mejor selección de alimento premium, accesorios y juguetes para perros y gatos. JamaMarket: Todo lo que tu mascota necesita en un solo lugar con envíos a todo el país. Calidad, amor y consejos expertos para tus amigos peludos.',
  keywords: ['alimento para mascotas', 'accesorios para mascotas', 'alimento premium perros', 'alimento premium gatos', 'juguetes para perros', 'juguetes para gatos', 'pet shop argentina', 'jamamarket', 'cuidado de mascotas'],
  authors: [{ name: 'JamaMarket Team' }],
  creator: 'JamaMarket',
  publisher: 'JamaMarket',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: '/',
    languages: {
      'es-AR': '/es',
      'en-US': '/en',
      'pt-BR': '/pt',
    },
  },
  openGraph: {
    title: 'JamaMarket - Alimento y Accesorios Premium para tu Mascota',
    description: 'Descubrí la mejor selección de alimento premium, accesorios y juguetes para perros y gatos. Calidad y amor en cada producto.',
    url: 'http://jamamarket.clancig.com.ar',
    siteName: 'JamaMarket',
    images: [
      {
        url: '/images/jama-logo-full.webp',
        width: 1200,
        height: 630,
        alt: 'JamaMarket - Todo para tu mascota',
      },
    ],
    locale: 'es_AR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'JamaMarket - Alimento y Accesorios Premium para tu Mascota',
    description: 'Todo lo que tu mascota necesita, en un solo lugar. Alimento premium y accesorios.',
    images: ['/images/jama-logo-full.webp'],
    creator: '@jamamarket',
  },
  robots: {
    index: true,
    follow: true,
    nocache: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/images/jama-logo.webp',
    shortcut: '/images/jama-logo.webp',
    apple: '/images/jama-logo.webp',
  },
};



export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f0f1eb' },
    { media: '(prefers-color-scheme: dark)', color: '#1b5030' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Belleza&family=Cormorant+Garamond:ital,wght@0,400;0,700;1,400;1,700&family=PT+Sans:ital,wght@0,400;0,700;1,400;1,700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <Providers>
           {children}
        </Providers>
        <Analytics />
      </body>
    </html>
  );
}
