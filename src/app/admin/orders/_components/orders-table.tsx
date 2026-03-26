

'use client';

import { useLanguage } from '@/hooks/use-language';
import { Order } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Eye, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { translations } from '@/lib/translations';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { formatDate, formatPrice } from '@/lib/utils';
import { StatusBadge } from '@/components/ui/status-badge';


interface OrdersTableProps {
    orders: Order[];
}

export default function OrdersTable({ orders }: OrdersTableProps) {
    const { t, language } = useLanguage();
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    return (
        <Card>
            <CardContent className="p-0">
                <Table>
                    <TableHeader className="hidden md:table-header-group">
                        <TableRow>
                            <TableHead>{t('Customer')}</TableHead>
                            <TableHead>{t('Order_ID_Date')}</TableHead>
                            <TableHead>{t('Status')}</TableHead>
                            <TableHead className="text-right">{t('Total')}</TableHead>
                            <TableHead className="w-[100px] text-right">{t('Actions')}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {orders.map((order) => (
                            <TableRow key={order.id} className={cn("flex flex-col md:table-row p-4 md:p-0 border-b even:bg-muted/25", order.status === 'Pendiente de Confirmación' && 'bg-primary/10')}>
                                <TableCell className="p-0 md:p-4 flex justify-between items-center">
                                    <div className="font-medium">
                                        <div className="md:hidden text-xs text-muted-foreground mb-2">{t('Customer')}</div>
                                        <div>{order.user?.name || t('User_Not_Found')}</div>
                                        <div className="text-xs text-muted-foreground">{order.user?.email}</div>
                                    </div>
                                    <div className="md:hidden">
                                        <Button asChild variant="ghost" size="icon">
                                            <Link href={`/admin/orders/${order.id}`}>
                                                <Eye className="h-4 w-4" />
                                                <span className="sr-only">{t('View_Order')}</span>
                                            </Link>
                                        </Button>
                                    </div>
                                </TableCell>
                                <TableCell className="p-0 md:p-4 mt-2 md:mt-0">
                                    <div className="md:hidden text-xs text-muted-foreground mb-1">{t('Order_ID_Date')}</div>
                                    <div className="font-mono text-sm">{order.id.substring(0, 8)}...</div>
                                    <div className="text-xs text-muted-foreground">
                                        {isClient ? formatDate(order.createdAt, language) : <Loader2 className="h-4 w-4 animate-spin" />}
                                    </div>
                                </TableCell>
                                <TableCell className="p-0 md:p-4 mt-2 md:mt-0">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <div className="md:hidden text-xs text-muted-foreground mb-1">{t('Status')}</div>
                                            <StatusBadge status={order.status} />
                                        </div>
                                        <div className="text-right font-bold md:hidden">
                                            <div className="text-xs text-muted-foreground font-normal mb-1">{t('Total')}</div>
                                            {isClient ? `$${formatPrice(order.totalPrice, language)}` : <Loader2 className="h-4 w-4 animate-spin" />}
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="hidden md:table-cell text-right">
                                    {isClient ? `$${formatPrice(order.totalPrice, language)}` : <Loader2 className="h-4 w-4 animate-spin" />}
                                </TableCell>
                                <TableCell className="hidden md:table-cell text-right">
                                    <Button asChild variant="ghost" size="icon">
                                        <Link href={`/admin/orders/${order.id}`}>
                                            <Eye className="h-4 w-4" />
                                            <span className="sr-only">{t('View_Order')}</span>
                                        </Link>
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>

            </CardContent>
        </Card>
    );
}
