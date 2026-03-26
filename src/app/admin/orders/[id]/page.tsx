

import { getOrderById } from '@/lib/order-service';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cookies } from 'next/headers';
import { translations } from '@/lib/translations';
import Image from 'next/image';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { StatusBadge } from '@/components/ui/status-badge';
import { Badge } from '@/components/ui/badge';
import OrderStatusForm from './_components/order-status-form';
import Link from 'next/link';
import { NO_IMAGE_URL, formatDate, formatPrice } from '@/lib/utils';
import { getLanguage } from '@/lib/utils-server';

export default async function OrderDetailPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const order = await getOrderById(params.id);

    if (!order) {
        notFound();
    }

    const lang = await getLanguage();
    const t = (key: keyof typeof translations) => translations[key][lang] || key;

    return (
        <div className="space-y-6 px-4">
            <h1 className="font-headline text-4xl font-bold">{t('Order_Detail')}</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-6">
                    {order.receiptUrl && (
                        <Card className="border-primary">
                            <CardHeader>
                                <CardTitle>{t('Payment_Proof')}</CardTitle>
                                <CardDescription>{t('Order_Receipt_Description')}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Link href={order.receiptUrl} target="_blank" rel="noopener noreferrer">
                                    <div className="relative aspect-video w-full rounded-md overflow-hidden border">
                                        <Image src={order.receiptUrl} alt={t('Payment_Proof')} fill className="object-contain" />
                                    </div>
                                </Link>
                            </CardContent>
                        </Card>
                    )}
                    <Card>
                        <CardHeader>
                            <CardTitle>{t('Products')}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[80px] hidden md:table-cell">{t('Image')}</TableHead>
                                        <TableHead>{t('Product_Singular')}</TableHead>
                                        <TableHead>{t('Quantity_Simplified') || 'Qty'}</TableHead>
                                        <TableHead className="text-right">{t('Price')}</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {order.items.map(item => (
                                        <TableRow key={item.productId}>
                                            <TableCell className="hidden md:table-cell">
                                                <Image
                                                    src={item.image}
                                                    alt={item.name}
                                                    width={64}
                                                    height={64}
                                                    className="rounded-md object-cover"
                                                />
                                            </TableCell>
                                            <TableCell className="font-medium">{item.name}</TableCell>
                                            <TableCell>{item.quantity}</TableCell>
                                            <TableCell className="text-right">${formatPrice(item.price, lang)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>{t('Order_Summary')}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">{t('Order_ID_Label')}</span>
                                <span className="font-mono text-sm">{order.id.substring(0, 8)}...</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">{t('Date')}</span>
                                <span>{formatDate(order.createdAt, lang)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">{t('Status')}</span>
                                <StatusBadge status={order.status} className="text-sm px-3 py-1" />
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">{t('Payment_Method')}</span>
                                <Badge variant="outline">{t(order.paymentMethod as keyof typeof translations)}</Badge>
                            </div>
                            {order.mercadoPagoPaymentId && (
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">ID MP</span>
                                    <span className="font-mono text-sm">{order.mercadoPagoPaymentId}</span>
                                </div>
                            )}
                            <div className="flex justify-between font-bold text-xl">
                                <span>{t('Total')}</span>
                                <span>${formatPrice(order.totalPrice, lang)}</span>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>{t('Update_Status')}</CardTitle>
                            <CardDescription>{t('Update_Status_Desc')}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <OrderStatusForm order={order} />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>

    )
}
