import type { Metadata } from 'next';
import PrivacyClient from './privacy-client';

export const metadata: Metadata = {
    title: 'Política de Privacidad | JamaMarket',
    description: 'Lee nuestra política de privacidad para entender cómo manejamos tus datos personales en JamaMarket.',
};

export default function PrivacyPolicyPage() {
    return <PrivacyClient />;
}
