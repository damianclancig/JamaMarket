"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useLanguage } from '@/hooks/use-language';
import Image from 'next/image';

const contactEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'contacto@jamamarket.com';
const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '5491168793296';
const instagramUsername = process.env.NEXT_PUBLIC_INSTAGRAM_USERNAME || 'jamamarket';

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="space-y-3">
        <h2 className="font-headline text-2xl font-semibold text-primary">{title}</h2>
        <div className="space-y-2 text-muted-foreground">{children}</div>
        <Separator className="mt-6 !mb-8" />
    </div>
);

export default function TermsClient() {
    const { t } = useLanguage();

    return (
        <div className="container max-w-4xl mx-auto py-12">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-4xl text-center">{t('Terms_Title')}</CardTitle>
                </CardHeader>
                <CardContent className="prose prose-stone dark:prose-invert max-w-none space-y-8">
                    <p className="text-center text-muted-foreground">
                        {t('Terms_Intro')}
                    </p>
                    <Separator className="!my-8" />

                    <Section title={t('Terms_S1_Title')}>
                        <p>{t('Terms_S1_Body')}</p>
                    </Section>

                    <Section title={t('Terms_S2_Title')}>
                        <p>{t('Terms_S2_Body')}</p>
                    </Section>

                    <Section title={t('Terms_S3_Title')}>
                        <p>{t('Terms_S3_Body')}</p>
                    </Section>

                    <Section title={t('Terms_S4_Title')}>
                        <p>{t('Terms_S4_Body')}</p>
                    </Section>

                    <Section title={t('Terms_S5_Title')}>
                        <p>{t('Terms_S5_Body')}</p>
                    </Section>

                    <Section title={t('Terms_S6_Title')}>
                        <p>{t('Terms_S6_Body')}</p>
                    </Section>

                    <Section title={t('Terms_S7_Title')}>
                        <p>{t('Terms_S7_Body')}</p>
                        <ul className="list-disc pl-5 space-y-1 mt-2">
                            <li><strong>Email:</strong> <a href={`mailto:${contactEmail}`} className="text-primary hover:underline">{contactEmail}</a></li>
                            <li><strong>Teléfono/WhatsApp:</strong> <a href={`https://wa.me/${whatsappNumber}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">+{whatsappNumber}</a></li>
                            <li><strong>Redes Sociales:</strong> <a href={`https://instagram.com/${instagramUsername}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Instagram</a></li>
                        </ul>
                    </Section>

                    <div className="flex flex-col items-center justify-center pt-4 font-semibold text-foreground gap-3">
                        <p>{t('Terms_Slogan')}</p>
                        <Image 
                            src="/images/jama-ok.webp" 
                            alt="JamaMarket Mascot" 
                            width={80} 
                            height={80} 
                            className="drop-shadow-sm" 
                        />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
