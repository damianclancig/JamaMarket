

import './globals.css';
import type { Metadata, Viewport } from 'next';
import { Providers } from '@/components/providers/providers';
import { Analytics } from '@vercel/analytics/react';

export const metadata: Metadata = {
  metadataBase: new URL('https://jamamarket.clancig.com.ar'),
  title: {
    default: 'JamaMarket - Todo para tu Mascota',
    template: `%s | JamaMarket`,
  },
  description: 'Alimento premium, accesorios, juguetes y los mejores consejos para el cuidado de tus amigos peludos. JamaMarket: Calidad y amor en cada producto.',
  openGraph: {
    title: 'JamaMarket - Todo para tu Mascota',
    description: 'Alimento premium, accesorios y juguetes para tus mascotas.',
    url: 'https://jamamarket.clancig.com.ar',
    siteName: 'JamaMarket',
    images: [
      {
        url: 'https://res.cloudinary.com/dqh1coa3c/image/upload/v1754482844/ajal-de-raiz/Varias_Especies_ofsqvv.jpg', // TODO: Update to JamaMarket image
        width: 1200,
        height: 630,
        alt: 'JamaMarket Store',
      },
    ],
    locale: 'es_AR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'JamaMarket - Todo para tu Mascota',
    description: 'Alimento premium, accesorios y juguetes para tus mascotas.',
    images: ['https://res.cloudinary.com/dqh1coa3c/image/upload/v1754482844/ajal-de-raiz/Varias_Especies_ofsqvv.jpg'], // TODO: Update to JamaMarket image
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f0f1eb' },
    { media: '(prefers-color-scheme: dark)', color: '#1b5030' },
  ],
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
