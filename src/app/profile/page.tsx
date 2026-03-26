
import { getCurrentUser } from "@/lib/user-service";
import ProfileClientPage from "./_components/profile-client-page";
import { notFound } from "next/navigation";
import type { Metadata } from 'next';

import { getLanguage } from "@/lib/utils-server";
import { translations } from "@/lib/translations";

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLanguage();
  const t = (key: keyof typeof translations) => (translations as any)[key]?.[lang] || key;

  return {
    title: t('My_Profile'),
    description: t('Profile_Meta_Desc'),
    robots: {
      index: false,
      follow: false,
    }
  };
}


export default async function ProfilePage() {
    const user = await getCurrentUser();

    if (!user) {
        notFound();
    }
    
    return <ProfileClientPage user={user} />;
}
