import CartClient from './_components/cart-client';
import { getCurrentUser } from '@/lib/user-service';
import type { Metadata } from 'next';
import { getLanguage } from '@/lib/utils-server';
import { translations } from '@/lib/translations';

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLanguage();
  const t = (key: keyof typeof translations) => translations[key]?.[lang] || key;

  return {
    title: t('Cart_Title'),
    description: t('Cart_Meta_Desc'),
    robots: {
      index: false,
      follow: false,
    }
  };
}

export default async function CartPage() {
  const user = await getCurrentUser();
  return <CartClient user={user} />;
}

