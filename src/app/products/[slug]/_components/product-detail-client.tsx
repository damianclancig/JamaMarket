


'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/hooks/use-language';
import type { Product, ProductVariant } from '@/lib/types';
import { cn, formatPrice } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/contexts/cart-context';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import JamaTips from '@/components/products/jama-tips';
import { Pencil, Dog, Cat, Minus, Plus } from 'lucide-react';
import Link from 'next/link';
import ProductBreadcrumb from '@/components/products/product-breadcrumb';

const PET_TYPE_CONFIG = {
  dog: { icon: Dog, label: 'Perros' },
  cat: { icon: Cat, label: 'Gatos' },
};

export default function ProductDetailClient({ product, isAdmin }: { product: Product, isAdmin?: boolean }) {
  const hasVariants = product.variants && product.variants.length > 0;
  const [selectedMedia, setSelectedMedia] = useState<string>(product.images[0]);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | undefined>(
    hasVariants ? product.variants![0] : undefined
  );
  const { t, language } = useLanguage();
  const { addToCart } = useCart();
  const { toast } = useToast();
  const { data: session } = useSession();
  const router = useRouter();

  const isVideo = (url: string) => /\.(mp4|webm)$/i.test(url);

  // Precio y stock según variante seleccionada
  const displayPrice = selectedVariant ? selectedVariant.price : product.price;
  const currentStock = selectedVariant ? selectedVariant.stock : product.countInStock;
  const isSoldOut = currentStock <= 0;

  const handleVariantSelect = (variant: ProductVariant) => {
    setSelectedVariant(variant);
    setQuantity(1);
    // Cambiar imagen si la variante tiene imageIndex
    if (variant.imageIndex !== undefined && product.images[variant.imageIndex]) {
      setSelectedMedia(product.images[variant.imageIndex]);
    }
  };

  const handleAddToCart = () => {
    if (!session) {
      router.push('/login');
      return;
    }
    if (hasVariants && !selectedVariant) {
      toast({
        title: t('Select_Variant'),
        description: t('Select_Variant'),
        variant: 'destructive',
      });
      return;
    }
    addToCart(product.id, quantity, selectedVariant?._id?.toString());
    toast({
      title: t('Product_Added_to_Cart_Title'),
      description: t('Product_Added_to_Cart_Desc', {
        quantity,
        name: selectedVariant ? `${product.name} — ${selectedVariant.attribute}` : product.name,
      }),
    });
  };

  if (!product) {
    return <div>Loading...</div>;
  }

  return (
    <div className="px-4 py-8 md:py-12">
      <div className="max-w-6xl mx-auto">
        <ProductBreadcrumb category={product.category} />
      </div>
      <div className="grid md:grid-cols-2 gap-8 lg:gap-12 max-w-6xl mx-auto">
        {/* Galería de imágenes */}
        <div className="flex flex-col gap-4">
          <div className="relative aspect-square w-full rounded-lg overflow-hidden shadow-lg bg-muted/20">
            {isAdmin && (
              <Button
                asChild
                variant="secondary"
                size="icon"
                className="absolute top-4 right-4 z-10 h-8 w-8 rounded-full transition-all duration-300 bg-neutral-950/90 border-2 border-primary text-white shadow-[0_0_10px_hsl(var(--primary)/0.5)] hover:bg-primary hover:text-primary-foreground hover:shadow-[0_0_20px_hsl(var(--primary))] hover:scale-105"
              >
                <Link href={`/admin/products/${product.id}/edit`}>
                  <Pencil className="h-4 w-4 stroke-2" />
                  <span className="sr-only">Editar Producto</span>
                </Link>
              </Button>
            )}
            {isVideo(selectedMedia) ? (
              <video
                key={selectedMedia}
                src={selectedMedia}
                controls
                autoPlay
                muted
                loop
                playsInline
                className="w-full h-full object-contain"
              >
                Tu navegador no soporta el tag de video.
              </video>
            ) : (
              <Image
                src={selectedMedia.replace(/\.heic$/i, '.png')}
                alt={product.name}
                fill
                className="object-contain"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
                data-ai-hint={product.dataAiHint || 'product image'}
              />
            )}
          </div>
          {product.images && product.images.length > 1 && (
            <div className="grid grid-cols-5 gap-2">
              {product.images.map((media, index) => (
                <button
                  key={media}
                  onClick={() => setSelectedMedia(media)}
                  className={cn(
                    "relative aspect-square w-full rounded-md overflow-hidden ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring",
                    selectedMedia === media && 'ring-2 ring-primary'
                  )}
                >
                  <Image
                    src={media.replace(/\.heic$/i, '.png').replace(/\.(mp4|webm)$/i, '.jpg')}
                    alt={`${product.name} thumbnail ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="20vw"
                  />
                  {isVideo(media) && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8 text-white"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Panel de detalles */}
        <div className="flex flex-col justify-start gap-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">{product.category}</p>
                  <CardTitle className="font-headline text-4xl md:text-5xl">{product.name}</CardTitle>
                  {product.brand && (
                    <p className="text-sm text-muted-foreground">{t('Brand')}: <span className="font-medium text-foreground">{product.brand}</span></p>
                  )}
                </div>
                <Badge variant={!isSoldOut ? "default" : "destructive"}>
                  {!isSoldOut ? t('Available') : t('Sold_Out')}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-lg text-muted-foreground whitespace-pre-line">{product.description}</p>

              {/* PetType badges */}
              {product.petType && product.petType.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium text-muted-foreground">{t('Pet_Type')}:</span>
                  {product.petType.map((type) => {
                    const config = PET_TYPE_CONFIG[type];
                    if (!config) return null;
                    const Icon = config.icon;
                    return (
                      <Badge key={type} variant="secondary" className="flex items-center gap-1">
                        <Icon className="h-3 w-3" />
                        {t(type === 'dog' ? 'PetType_Dog' : 'PetType_Cat')}
                      </Badge>
                    );
                  })}
                </div>
              )}

              {/* Selector de variantes */}
              {hasVariants && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">{t('Select_Variant')}:</p>
                  <div className="flex flex-wrap gap-2">
                    {product.variants!.map((variant, index) => {
                      const variantId = variant._id?.toString() ?? String(index);
                      const isSelected = selectedVariant?._id?.toString() === variantId ||
                        (!selectedVariant?._id && index === 0);
                      const isVariantSoldOut = variant.stock <= 0;
                      return (
                        <Button
                          key={variantId}
                          variant={isSelected ? 'default' : 'outline'}
                          size="sm"
                          disabled={isVariantSoldOut}
                          onClick={() => handleVariantSelect(variant)}
                          className={cn(
                            "transition-all",
                            isVariantSoldOut && "opacity-50 line-through cursor-not-allowed"
                          )}
                        >
                          {variant.attribute}
                          {isVariantSoldOut && (
                            <span className="ml-1 text-xs">({t('Variant_Soldout')})</span>
                          )}
                        </Button>
                      );
                    })}
                  </div>
                  {selectedVariant && (
                    <p className="text-xs text-muted-foreground">
                      {t('Stock_Available')}: {selectedVariant.stock} u.
                    </p>
                  )}
                </div>
              )}

              {/* Precio */}
              <div className="flex flex-col items-end">
                {product.oldPrice && product.oldPrice > 0 && (
                  <span className="text-2xl text-muted-foreground">
                    Antes: <span className="line-through">${formatPrice(product.oldPrice)}</span>
                  </span>
                )}
                <div className="text-4xl font-bold text-primary">
                  ${formatPrice(displayPrice)}
                </div>
              </div>

              {/* Botón de compra */}
              {isSoldOut ? (
                <Button size="lg" className="w-full" disabled>{t('Sold_Out')}</Button>
              ) : session ? (
                <div className="flex flex-row gap-3">
                  <div className="flex items-center border rounded-md h-11 bg-background shadow-sm overflow-hidden w-28 shrink-0">
                    <button 
                      type="button" 
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="h-full w-9 flex items-center justify-center hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors border-r shrink-0"
                      disabled={quantity <= 1}
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <Input
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, Math.min(currentStock, Number(e.target.value))))}
                      min="1"
                      max={currentStock}
                      className="w-10 border-none text-center h-full focus-visible:ring-0 focus-visible:ring-offset-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none p-0 text-sm"
                    />
                    <button 
                      type="button" 
                      onClick={() => setQuantity(Math.min(currentStock, quantity + 1))}
                      className="h-full w-9 flex items-center justify-center hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors border-l shrink-0"
                      disabled={quantity >= currentStock}
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  <Button size="lg" className="flex-1 h-11 px-2 text-sm sm:text-base" onClick={handleAddToCart}>
                    {t('Add_to_Cart')}
                  </Button>
                </div>
              ) : (
                <Button size="lg" className="w-full" onClick={handleAddToCart}>
                  {t('Login_to_Buy')}
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Tips de Jama */}
          {product.care && (
            <Accordion type="single" collapsible className="w-full border rounded-lg overflow-hidden bg-card" defaultValue="item-1">
              <AccordionItem value="item-1" className="border-none">
                <AccordionTrigger className="text-xl font-headline hover:no-underline px-4 py-2 hover:bg-primary/5 transition-colors group [&[data-state=open]>div>img]:rotate-0">
                  <div className="flex items-center gap-4 text-left">
                    <div className="relative w-16 h-16 flex-shrink-0 transition-transform group-hover:scale-110">
                      <Image 
                        src="/images/jama-tip.webp" 
                        alt="Jama Tip Sticker" 
                        width={64} 
                        height={64} 
                        className="object-contain -rotate-12 transition-transform duration-300"
                      />
                    </div>
                    <div className="flex flex-col justify-center">
                      <span className="block text-primary text-base md:text-lg font-sans font-bold uppercase tracking-wider">Tips de Jama</span>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-6">
                  <JamaTips text={product.care} />
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          )}
        </div>
      </div>
    </div>
  );
}
