
"use client";

import React, { useTransition } from 'react';
import type { User } from '@/lib/types';
import { useLanguage } from '@/hooks/use-language';
import { Button } from '@/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Edit, ShieldCheck, User as UserIcon, Phone, Trash2 } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { cn } from '@/lib/utils';
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
import { deleteUser } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface UserTableProps {
  users: User[];
}

export default function UserTable({ users }: UserTableProps) {
  const { t } = useLanguage();
  const [isDeleting, startDeleteTransition] = useTransition();
  const { toast } = useToast();

  const handleDelete = (userId: string) => {
    startDeleteTransition(async () => {
      const result = await deleteUser(userId);
      if (result.success) {
        toast({ title: t('Success'), description: t('User_deleted_successfully') });
      } else {
        toast({ title: t('Error_Title'), description: result.message, variant: "destructive" });
      }
    });
  };

  return (
    <TooltipProvider>
      <Card>
        <CardContent className="p-0">
          <div className="flex flex-col">
            {users.map((user) => (
              <Collapsible key={user.id} asChild>
                <div className="border-b last:border-b-0 even:bg-muted/25 transition-colors hover:bg-muted/50">
                  <div className="flex items-center px-4 py-3">
                    <CollapsibleTrigger asChild className="flex-1 cursor-pointer group">
                      <div className="flex items-center gap-4 text-left">
                        <Avatar>
                          <AvatarImage src={user.profileImage} alt={user.name} />
                          <AvatarFallback>
                            <UserIcon className="h-5 w-5" />
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="font-medium group-hover:text-primary">{user.name}</div>
                          <div className="text-sm text-muted-foreground">{user.email}</div>
                          {user.phone && <div className="text-xs text-muted-foreground flex items-center gap-1"><Phone className="w-3 h-3" /> {user.phone}</div>}
                        </div>
                      </div>
                    </CollapsibleTrigger>

                    <div className="flex w-24 justify-end items-center gap-1">
                      <div className="md:hidden">
                        {user.isAdmin && <ShieldCheck className="h-5 w-5 text-primary" />}
                      </div>
                      <div className="hidden md:flex justify-center flex-1">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="cursor-default">
                                {user.isAdmin ? (
                                    <ShieldCheck className="h-5 w-5 text-primary" />
                                ) : (
                                    <ShieldCheck className="h-5 w-5 text-muted-foreground/30" />
                                )}
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{t('Is_Administrator')}</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button asChild variant="ghost" size="icon" className="h-8 w-8 hover:bg-primary hover:text-white transition-colors" onClick={(e) => e.stopPropagation()}>
                            <Link href={`/admin/users/${user.id}/edit`}>
                              <Edit className="h-4 w-4" />
                              <span className="sr-only">{t('Edit_User')}</span>
                            </Link>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{t('Edit_User')}</p>
                        </TooltipContent>
                      </Tooltip>

                      <AlertDialog>
                        <Tooltip>
                            <TooltipTrigger asChild onClick={(e) => e.stopPropagation()}>
                                <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive hover:text-white transition-colors" disabled={isDeleting}>
                                    <Trash2 className="h-4 w-4" />
                                    <span className="sr-only">{t('Delete_User')}</span>
                                    </Button>
                                </AlertDialogTrigger>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>{t('Delete_User')}</p>
                            </TooltipContent>
                        </Tooltip>
                        <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                          <AlertDialogHeader>
                            <AlertDialogTitle>{t('Are_you_sure')}</AlertDialogTitle>
                            <AlertDialogDescription>
                              {t('This_action_cannot_be_undone_permanently')}
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>{t('Cancel')}</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(user.id)} className="bg-destructive hover:bg-destructive/90">
                              {t('Delete')}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>

                    </div>
                  </div>

                  <CollapsibleContent className="overflow-hidden transition-all duration-300 data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
                    <div className="bg-muted/30 p-4 text-sm border-t">
                      <h4 className="font-semibold mb-2">{t('Shipping_Address')}</h4>
                      {user.address && (user.address.street || user.address.city) ? (
                        <div className="flex flex-col md:flex-row md:flex-wrap gap-x-6 gap-y-2 text-muted-foreground">
                          <div><strong>{t('Street')}:</strong> {user.address.street || '-'} {user.address.number || ''}</div>
                          <div><strong>{t('City')}:</strong> {user.address.city || '-'}</div>
                          <div><strong>{t('Zip_Code')}:</strong> {user.address.zipCode || '-'}</div>
                          <div><strong>{t('Province')}:</strong> {user.address.province || '-'}</div>
                          <div><strong>{t('Country')}:</strong> {user.address.country || '-'}</div>
                          {user.address.instructions && <div className="w-full pt-2"><strong>{t('Instructions')}:</strong> {user.address.instructions}</div>}
                        </div>
                      ) : (
                        <p className="text-muted-foreground">{t('No_Address_Registered')}</p>
                      )}
                    </div>
                  </CollapsibleContent>
                </div>
              </Collapsible>
            ))}
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}
