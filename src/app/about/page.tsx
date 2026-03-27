import type { Metadata } from 'next';
import AboutClient from './_components/about-client';

export const metadata: Metadata = {
  title: 'Sobre Nosotros',
  description: 'Conocé la historia de JamaMarket, nuestra pasión por las mascotas y el compromiso que tenemos con tu familia peluda.',
};

export default function AboutPage() {
  return <AboutClient />;
}
