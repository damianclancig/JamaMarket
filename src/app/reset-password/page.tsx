import type { Metadata } from 'next';
import ResetPasswordClient from './_components/reset-password-client';

export const metadata: Metadata = {
  title: 'Restablecer Contraseña',
  description: 'Establecé una nueva contraseña segura para tu cuenta de JamaMarket.',
  robots: { index: false, follow: false },
};

export default function ResetPasswordPage() {
  return <ResetPasswordClient />;
}
