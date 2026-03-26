'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { Ban, Loader2 } from 'lucide-react';
import { cancelOrder } from '@/lib/actions';
import { useRouter } from 'next/navigation';
import { useNotification } from '@/contexts/notification-context';
import { useLanguage } from '@/hooks/use-language';

interface CancelOrderButtonProps {
    orderId: string;
}

export default function CancelOrderButton({ orderId }: CancelOrderButtonProps) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const router = useRouter();
  const { refreshPendingCount } = useNotification();
  const { t } = useLanguage();

  const handleCancel = () => {
    startTransition(async () => {
        const result = await cancelOrder(orderId);
        if (result.success) {
            toast({ 
                title: t('Order_Cancelled_Title'), 
                description: t('Order_Cancelled_Desc')
            });
            await refreshPendingCount();
            router.refresh(); 
        } else {
            toast({
                title: t('Error_Title'),
                description: result.message,
                variant: "destructive"
            });
        }
    });
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size="sm">
          <Ban className="mr-2 h-4 w-4" />
          {t('Cancel_Order')}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('Are_you_sure')}</AlertDialogTitle>
          <AlertDialogDescription>
            {t('Cancel_Order_Warning_Desc')}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="sm:justify-center sm:gap-4">
          <AlertDialogCancel disabled={isPending}>{t('No')}</AlertDialogCancel>
          <AlertDialogAction onClick={handleCancel} disabled={isPending} variant="destructive">
             {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {t('Yes_Cancel')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

