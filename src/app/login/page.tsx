import { Suspense } from "react";
import LoginClientPage from './_components/login-client';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Iniciar Sesión',
  description: 'Ingresá a tu cuenta de JamaMarket para ver tus pedidos, gestionar tu perfil y más.',
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginClientPage />
    </Suspense>
  );
}
