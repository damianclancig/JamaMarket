import type { Metadata } from 'next';
import RegisterClient from './_components/register-client';

export const metadata: Metadata = {
  title: 'Crear Cuenta',
  description: 'Creá tu cuenta en JamaMarket y empezá a disfrutar de los mejores productos para tu mascota.',
  robots: { index: false, follow: false },
};

export default function RegisterPage() {
  return <RegisterClient />;
}
