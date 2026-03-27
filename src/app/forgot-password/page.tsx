import type { Metadata } from 'next';
import ForgotPasswordClient from './_components/forgot-password-client';

export const metadata: Metadata = {
  title: 'Olvidé mi Contraseña',
  description: 'Recuperá el acceso a tu cuenta de JamaMarket ingresando tu email.',
  robots: { index: false, follow: false },
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordClient />;
}
