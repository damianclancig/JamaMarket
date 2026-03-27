

"use client";

import React, { useTransition, useState } from 'react';
import type { Product, ProductVariant } from '@/lib/types';
import { useLanguage } from '@/hooks/use-language';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Edit, Trash2, CheckCircle, XCircle, Loader2, AlertTriangle, Minus, Plus, Bone, Heart, PawPrint } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import MultiMediaUploader from './image-uploader';
import { createProduct, updateProduct, physicallyDeleteProduct } from '@/lib/actions';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Separator } from '@/components/ui/separator';
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
import Link from 'next/link';

interface ProductFormProps {
  product?: Product | null;
  categories: string[];
}

interface VariantRow {
  attribute: string;
  price: string;
  stock: string;
  sku: string;
  imageIndex: string;
}

const emptyVariant = (): VariantRow => ({ attribute: '', price: '0', stock: '0', sku: '', imageIndex: '0' });

export default function ProductForm({ product, categories }: ProductFormProps) {
  const { t, language } = useLanguage();
  const [isPending, startTransition] = useTransition();
  const [isDeleting, startDeleteTransition] = useTransition();
  const { toast } = useToast();

  const initialPrice = product?.price ?? 0;
  const initialOldPrice = product?.oldPrice ?? 0;
  const [rawPrice, setRawPrice] = useState(Math.round(initialPrice * 100).toString());
  const [rawOldPrice, setRawOldPrice] = useState(Math.round(initialOldPrice * 100).toString());
  const [baseStock, setBaseStock] = useState(product?.countInStock ?? 0);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');

  // Variantes
  const [variants, setVariants] = useState<VariantRow[]>(
    product?.variants && product.variants.length > 0
      ? product.variants.map(v => ({
          attribute: v.attribute,
          price: Math.round(v.price * 100).toString(),
          stock: v.stock.toString(),
          sku: v.sku ?? '',
          imageIndex: (v.imageIndex ?? 0).toString(),
        }))
      : []
  );

  // PetType
  const [petTypeDog, setPetTypeDog] = useState(product?.petType?.includes('dog') ?? false);
  const [petTypeCat, setPetTypeCat] = useState(product?.petType?.includes('cat') ?? false);

  // ProductType
  const [productType, setProductType] = useState(product?.productType ?? 'simple');

  const getLocale = () => {
    switch (language) {
      case 'en': return 'en-US';
      case 'pt': return 'pt-BR';
      case 'es':
      default:
        return 'es-AR';
    }
  };

  const formatPrice = (value: string) => {
    const locale = getLocale();
    const numericValue = parseFloat(value) / 100;
    if (isNaN(numericValue)) {
      return new Intl.NumberFormat(locale, { minimumFractionDigits: 2 }).format(0);
    }
    return new Intl.NumberFormat(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(numericValue);
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>, isOldPrice = false) => {
    const digits = e.target.value.replace(/[^\d]/g, '');
    const setter = isOldPrice ? setRawOldPrice : setRawPrice;
    setter(digits || "0");
  };

  const handlePriceClick = (e: React.MouseEvent<HTMLInputElement>) => {
    const input = e.currentTarget;
    const length = input.value.length;
    input.setSelectionRange(length, length);
  };

  const addVariant = () => setVariants(prev => [...prev, emptyVariant()]);

  const removeVariant = (index: number) =>
    setVariants(prev => prev.filter((_, i) => i !== index));

  const updateVariant = (index: number, field: keyof VariantRow, value: string) => {
    let finalValue = value;
    if (field === 'price') {
      finalValue = value.replace(/[^\d]/g, '') || "0";
    }
    setVariants(prev => prev.map((v, i) => i === index ? { ...v, [field]: finalValue } : v));
  };

  const handleSubmit = (formData: FormData) => {
    const numericPrice = parseFloat(rawPrice) / 100;
    formData.set('price', numericPrice.toString());

    const numericOldPrice = parseFloat(rawOldPrice) / 100;
    formData.set('oldPrice', numericOldPrice.toString());

    // Sobrescribir petType y productType (no vienen automáticamente de selects/checkboxes controlados)
    if (petTypeDog) formData.set('petType_dog', 'on');
    if (petTypeCat) formData.set('petType_cat', 'on');
    formData.set('productType', productType);

    // Serializar variantes como campos indexados
    variants.forEach((v, i) => {
      formData.set(`variants[${i}][attribute]`, v.attribute);
      const numericVariantPrice = parseFloat(v.price) / 100;
      formData.set(`variants[${i}][price]`, numericVariantPrice.toString());
      formData.set(`variants[${i}][stock]`, v.stock);
      formData.set(`variants[${i}][sku]`, v.sku);
      formData.set(`variants[${i}][imageIndex]`, v.imageIndex);
    });

    // Sobrescribir stock base (si se actualizó por state)
    formData.set('countInStock', baseStock.toString());

    startTransition(async () => {
      const action = product
        ? updateProduct.bind(null, product.id)
        : createProduct;

      const result = await action(formData);

      if (result?.success === false) {
        toast({ title: t('Error_Title'), description: result.message, variant: "destructive" });
      } else {
        toast({
          title: product ? t('Product_Updated_Title') : t('Product_Created_Title'),
          description: t('Product_Saved_Desc')
        });
      }
    });
  };

  const handleDelete = () => {
    if (!product) return;

    startDeleteTransition(async () => {
      const result = await physicallyDeleteProduct(product.id);
      if (result.success) {
        toast({
          title: t('Product_Deleted_Permanently_Title'),
          description: t('Product_Deleted_Permanently_Desc'),
        });
      } else {
        toast({
          title: t('Error_Title'),
          description: result.message,
          variant: 'destructive',
        });
      }
    });
  }

  return (
    <div className="space-y-6">
      <form action={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>{product ? t('Update_Product') : t('Create_Product')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-4">
                <div>
                  <Label htmlFor="name">{t('Product_Name')}</Label>
                  <Input id="name" name="name" defaultValue={product?.name || ''} required />
                </div>
                <div>
                  <Label htmlFor="description">{t('Product_Description')}</Label>
                  <Textarea id="description" name="description" defaultValue={product?.description || ''} rows={5} />
                </div>
                <div>
                  <Label htmlFor="care">{t('Jama_Tips_Title')}</Label>
                  <Textarea id="care" name="care" defaultValue={product?.care || ''} rows={5} />
                  <p className="text-xs text-muted-foreground pt-1 flex items-center gap-4">
                    <span>{t('Available_Icons')}</span>
                    <span className="flex items-center gap-1"><Bone className="h-3 w-3" /> {t('Icon_General')}</span>
                    <span className="flex items-center gap-1"><Heart className="h-3 w-3" /> {t('Icon_Health')}</span>
                    <span className="flex items-center gap-1"><PawPrint className="h-3 w-3" /> {t('Icon_Activity')}</span>
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                <Label htmlFor="images">{t('Images_and_Videos')}</Label>
                <MultiMediaUploader name="images" defaultValues={product?.images || []} />
              </div>
            </div>

            {/* Categoría, Marca, Precios, Stock, Estado */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              <div>
                <Label htmlFor="category">{t('Category')}</Label>
                <Input
                  id="category"
                  name="category"
                  defaultValue={product?.category || ''}
                  list="category-list"
                />
                <datalist id="category-list">
                  {categories.filter(cat => cat !== 'All').map(cat => (
                    <option key={cat} value={cat} />
                  ))}
                </datalist>
              </div>
              <div>
                <Label htmlFor="brand">{t('Brand')}</Label>
                <Input id="brand" name="brand" defaultValue={product?.brand || ''} />
              </div>
              <div>
                <Label htmlFor="oldPrice">{t('Old_Price_Optional')}</Label>
                <Input
                  id="formattedOldPrice"
                  value={formatPrice(rawOldPrice)}
                  onChange={(e) => handlePriceChange(e, true)}
                  onClick={handlePriceClick}
                  inputMode="numeric"
                  className="text-right"
                />
                <input type="hidden" name="oldPrice" value={parseFloat(rawOldPrice) / 100} />
              </div>
              <div>
                <Label htmlFor="price">{t('Price')} (base)</Label>
                <Input
                  id="formattedPrice"
                  value={formatPrice(rawPrice)}
                  onChange={(e) => handlePriceChange(e)}
                  onClick={handlePriceClick}
                  inputMode="numeric"
                  className="text-right"
                />
                <input type="hidden" name="price" value={parseFloat(rawPrice) / 100} />
              </div>
              <div>
                <Label htmlFor="baseStock">{t('Stock')}</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="icon" 
                    className="h-10 w-10 shrink-0"
                    onClick={() => setBaseStock(prev => Math.max(0, prev - 1))}
                    disabled={isPending}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <Input
                    id="baseStock"
                    type="number"
                    value={baseStock}
                    onChange={(e) => setBaseStock(parseInt(e.target.value) || 0)}
                    className="text-center h-10"
                    min="0"
                    required
                    disabled={isPending}
                  />
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="icon"
                    className="h-10 w-10 shrink-0"
                    onClick={() => setBaseStock(prev => prev + 1)}
                    disabled={isPending}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div>
                <Label htmlFor="state">{t('State')}</Label>
                <Select name="state" defaultValue={product?.state || 'activo'}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('Select_a_state')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="activo">{t('activo')}</SelectItem>
                    <SelectItem value="inactivo">{t('inactivo')}</SelectItem>
                    <SelectItem value="vendido">{t('vendido')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Tipo de Producto, PetType, Destacado */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2">
              <div>
                <Label>{t('Product_Type')}</Label>
                <Select value={productType} onValueChange={(val) => setProductType(val as 'simple' | 'pack')}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="simple">{t('Product_Type_Simple')}</SelectItem>
                    <SelectItem value="pack">{t('Product_Type_Pack')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>{t('Pet_Type_Label')}</Label>
                <div className="flex gap-4 pt-2">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="petType_dog"
                      checked={petTypeDog}
                      onCheckedChange={(v) => setPetTypeDog(!!v)}
                    />
                    <Label htmlFor="petType_dog" className="cursor-pointer">{t('PetType_Dog')}</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="petType_cat"
                      checked={petTypeCat}
                      onCheckedChange={(v) => setPetTypeCat(!!v)}
                    />
                    <Label htmlFor="petType_cat" className="cursor-pointer">{t('PetType_Cat')}</Label>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4 pt-6">
                <Label htmlFor="isFeatured">{t('Featured')}</Label>
                <Switch id="isFeatured" name="isFeatured" defaultChecked={product?.isFeatured || false} />
              </div>
            </div>

            {/* FieldArray de Variantes */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">{t('Variants')}</Label>
                <Button type="button" variant="outline" size="sm" onClick={addVariant}>
                  <Plus className="h-4 w-4 mr-1" />
                  {t('Add_Variant')}
                </Button>
              </div>
              {variants.length === 0 && (
                <p className="text-sm text-muted-foreground">{t('No_Variants_Description')}</p>
              )}
              {variants.map((variant, index) => (
                <div key={index} className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 items-end p-3 border rounded-md bg-muted/30">
                  <div className="md:col-span-2">
                    <Label className="text-xs">{t('Variant_Attribute')}</Label>
                    <Input
                      value={variant.attribute}
                      onChange={(e) => updateVariant(index, 'attribute', e.target.value)}
                      placeholder={t('Variant_Attribute_Placeholder')}
                    />
                  </div>
                  <div>
                    <Label className="text-xs">{t('Variant_Price')}</Label>
                    <div className="relative">
                      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground text-[10px]">$</span>
                      <Input
                        value={formatPrice(variant.price)}
                        onChange={(e) => updateVariant(index, 'price', e.target.value)}
                        onClick={handlePriceClick}
                        inputMode="numeric"
                        className="text-right pl-4 pr-1 h-9 text-sm"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs">{t('Variant_Stock')}</Label>
                    <div className="flex items-center gap-1">
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="icon" 
                        className="h-8 w-8 shrink-0"
                        onClick={() => updateVariant(index, 'stock', (Math.max(0, parseInt(variant.stock) - 1)).toString())}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <Input
                        type="number"
                        value={variant.stock}
                        onChange={(e) => updateVariant(index, 'stock', e.target.value)}
                        className="text-center h-8 px-1"
                        min="0"
                      />
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="icon"
                        className="h-8 w-8 shrink-0"
                        onClick={() => updateVariant(index, 'stock', (parseInt(variant.stock) + 1).toString())}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs">{t('Image_Index')}</Label>
                    <Input
                      type="number"
                      value={variant.imageIndex}
                      onChange={(e) => updateVariant(index, 'imageIndex', e.target.value)}
                      min="0"
                      max="4"
                    />
                  </div>
                  <div className="flex items-end">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:bg-destructive hover:text-white transition-colors"
                        onClick={() => removeVariant(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                  </div>
                </div>
              ))}
            </div>

          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            <Button asChild variant="secondary" disabled={isPending}>
              <Link href="/admin/products">{t('Cancel')}</Link>
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? <Loader2 className="animate-spin" /> : t('Save')}
            </Button>
          </CardFooter>
        </Card>
      </form>

      {product && (
        <div className="space-y-4">
          <div className="relative">
            <Separator />
            <div className="absolute left-1/2 -translate-x-1/2 -top-3 bg-background px-2">
              <span className="text-sm font-medium text-destructive">{t('Danger_Zone')}</span>
            </div>
          </div>
          <Card className="border-destructive">
            <CardHeader>
              <CardTitle className="text-destructive">{t('Delete_Product_Permanently')}</CardTitle>
              <CardDescription>{t('Delete_Permanently_Warning')}</CardDescription>
            </CardHeader>
            <CardFooter>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" disabled={isDeleting}>
                    {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                    {t('Delete_Product_Permanently')}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2">
                      <AlertTriangle className="text-destructive" />
                      {t('Are_you_sure')}
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      {t('This_action_cannot_be_undone_permanently')}
                      <br />
                      {t('Type_DELETE_to_confirm', { word: t('Word_DELETE') })}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <Input
                    id="delete-confirm"
                    value={deleteConfirmation}
                    onChange={(e) => setDeleteConfirmation(e.target.value)}
                    placeholder={t('Word_DELETE')}
                  />
                  <AlertDialogFooter>
                    <AlertDialogCancel>{t('Cancel')}</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDelete}
                      disabled={deleteConfirmation !== t('Word_DELETE') || isDeleting}
                      className="bg-destructive hover:bg-destructive/90"
                    >
                      {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      {t('Delete_Permanently')}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  )
}
