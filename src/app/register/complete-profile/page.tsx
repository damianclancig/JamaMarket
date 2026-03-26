

import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import CompleteProfileForm from "@/components/auth/complete-profile-form";
import { getCurrentUser } from "@/lib/user-service";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { updateUserProfile } from "@/lib/actions";

import { getLanguage } from "@/lib/utils-server";
import { translations } from "@/lib/translations";

export default async function CompleteProfilePage() {
    const user = await getCurrentUser();
    const lang = await getLanguage();
    const t = (key: keyof typeof translations) => (translations as any)[key]?.[lang] || key;

    if (!user) {
        redirect('/login');
    }
    
    return (
        <div className="flex min-h-[calc(100vh-10rem)] items-center justify-center p-4">
            <Card className="w-full max-w-2xl">
                <CardHeader className="text-center">
                    <CardTitle className="font-headline text-3xl">{t('One_Last_Step')}</CardTitle>
                    <CardDescription>
                        {t('Complete_Profile_Desc')}
                    </CardDescription>
                </CardHeader>
                <CompleteProfileForm 
                  user={user} 
                  isSubmitting={false} 
                  onSuccess={async () => {
                      "use server"
                      redirect('/');
                  }}
                />
                 <CardFooter className="flex justify-end bg-muted/30 p-4 border-t">
                    <Button asChild type="button" variant="ghost">
                        <Link href="/">{t('Skip_For_Now')}</Link>
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}

