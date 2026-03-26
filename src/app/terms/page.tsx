import type { Metadata } from 'next';
import TermsClient from './terms-client';

export const metadata: Metadata = {
    title: 'Términos y Condiciones | JamaMarket',
    description: 'Lee nuestros términos y condiciones antes de utilizar nuestro sitio y realizar compras en JamaMarket.',
};

export default function TermsAndConditionsPage() {
    return <TermsClient />;
}
