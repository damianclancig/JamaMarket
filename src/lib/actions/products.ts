'use server';

import { revalidatePath } from 'next/cache';
import { ObjectId } from 'mongodb';
import { redirect } from 'next/navigation';
import crypto from 'crypto';
import { getPaginatedProducts as getPaginatedProductsService } from '@/lib/product-service';
import { getDb } from '@/lib/mongodb';
import type { ActionResponse, Product, ProductState, PetType, ProductVariant } from '@/lib/types';
import { createSlug, getImagesFromFormData } from '@/lib/utils-server';

// Parsea las variantes enviadas desde el formulario como campos prefijados:
// variants[0][sku], variants[0][price], variants[0][stock], etc.
function parseVariantsFromFormData(formData: FormData): ProductVariant[] {
    const variants: ProductVariant[] = [];
    let index = 0;
    while (formData.has(`variants[${index}][attribute]`)) {
        const attribute = formData.get(`variants[${index}][attribute]`) as string;
        const price = parseFloat(formData.get(`variants[${index}][price]`) as string);
        const stock = parseInt(formData.get(`variants[${index}][stock]`) as string, 10);
        const sku = formData.get(`variants[${index}][sku]`) as string || undefined;
        const imageIndex = parseInt(formData.get(`variants[${index}][imageIndex]`) as string, 10);

        if (attribute && !isNaN(price) && !isNaN(stock)) {
            variants.push({
                _id: new ObjectId(),
                sku,
                price,
                stock,
                attribute,
                imageIndex: isNaN(imageIndex) ? 0 : imageIndex,
            });
        }
        index++;
    }
    return variants;
}

function parsePetTypeFromFormData(formData: FormData): PetType[] {
    const petTypes: PetType[] = [];
    if (formData.get('petType_dog') === 'on') petTypes.push('dog');
    if (formData.get('petType_cat') === 'on') petTypes.push('cat');
    return petTypes;
}

export async function createProduct(formData: FormData): Promise<ActionResponse> {
    try {
        const db = await getDb();
        const productsCollection = db.collection('products');

        const name = formData.get('name') as string;
        const price = parseFloat(formData.get('price') as string);
        const oldPrice = parseFloat(formData.get('oldPrice') as string);
        const countInStock = parseInt(formData.get('countInStock') as string, 10);
        const images = getImagesFromFormData(formData);
        const productType = (formData.get('productType') as string) || 'simple';
        const petType = parsePetTypeFromFormData(formData);
        const variants = parseVariantsFromFormData(formData);

        if (!name || isNaN(price)) {
            return { success: false, message: "Nombre y Precio son requeridos." };
        }

        let slug = createSlug(name);
        const slugExists = await productsCollection.findOne({ slug });
        if (slugExists) {
            const randomSuffix = crypto.randomBytes(3).toString('hex');
            slug = `${slug}-${randomSuffix}`;
        }

        // Calcular precio y stock desde variantes si las hay
        const finalPrice = variants.length > 0
            ? Math.min(...variants.map(v => v.price))
            : (!isNaN(price) ? price : 0);
        const finalStock = variants.length > 0
            ? variants.reduce((sum, v) => sum + v.stock, 0)
            : (isNaN(countInStock) ? 0 : countInStock);

        const newProductData = {
            name,
            slug,
            description: formData.get('description') as string || '',
            care: formData.get('care') as string || '',
            category: formData.get('category') as string || 'Sin categoría',
            price: finalPrice,
            oldPrice: !isNaN(oldPrice) && oldPrice > 0 ? oldPrice : undefined,
            images,
            brand: formData.get('brand') as string || 'JamaMarket',
            isFeatured: formData.get('isFeatured') === 'on',
            state: 'activo' as ProductState,
            rating: 0,
            numReviews: 0,
            countInStock: finalStock,
            dataAiHint: '',
            // Campos JamaMarket
            petType,
            productType,
            variants,
            packItems: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        const result = await productsCollection.insertOne(newProductData);

        if (!result.insertedId) {
            throw new Error('Failed to create product.');
        }

    } catch (error) {
        console.error(error);
        const message = error instanceof Error ? error.message : 'An unknown error occurred.';
        return { success: false, message: `Error al crear producto: ${message}` };
    }

    revalidatePath('/admin');
    revalidatePath('/products');
    revalidatePath('/');
    redirect('/admin/products');
}

export async function updateProduct(productId: string, formData: FormData): Promise<ActionResponse> {
    try {
        if (!ObjectId.isValid(productId)) {
            return { success: false, message: 'ID de producto inválido.' };
        }
        const db = await getDb();
        const productsCollection = db.collection('products');

        const name = formData.get('name') as string;
        const price = parseFloat(formData.get('price') as string);
        const oldPrice = parseFloat(formData.get('oldPrice') as string);
        const countInStock = parseInt(formData.get('countInStock') as string, 10);
        const state = formData.get('state') as ProductState;
        const images = getImagesFromFormData(formData);
        const productType = (formData.get('productType') as string) || 'simple';
        const petType = parsePetTypeFromFormData(formData);
        const variants = parseVariantsFromFormData(formData);

        if (!name || isNaN(price)) {
            return { success: false, message: "Nombre y Precio son requeridos." };
        }
        if (!['activo', 'inactivo', 'vendido'].includes(state)) {
            return { success: false, message: 'Estado inválido.' };
        }

        const finalPrice = variants.length > 0
            ? Math.min(...variants.map(v => v.price))
            : price;
        const finalStock = variants.length > 0
            ? variants.reduce((sum, v) => sum + v.stock, 0)
            : (isNaN(countInStock) ? 0 : countInStock);

        const updateFields: Record<string, any> = {
            name,
            description: formData.get('description') as string,
            care: formData.get('care') as string || '',
            category: formData.get('category') as string,
            price: finalPrice,
            images,
            brand: formData.get('brand') as string,
            isFeatured: formData.get('isFeatured') === 'on',
            state,
            countInStock: finalStock,
            // Campos JamaMarket
            petType,
            productType,
            variants,
            updatedAt: new Date().toISOString(),
        };

        const updateOperation: any = { $set: updateFields };

        if (!isNaN(oldPrice) && oldPrice > 0) {
            updateFields.oldPrice = oldPrice;
        } else {
            updateOperation.$unset = { oldPrice: 1 };
        }

        const result = await productsCollection.updateOne(
            { _id: new ObjectId(productId) },
            updateOperation
        );

        if (result.matchedCount === 0) {
            return { success: false, message: 'Producto no encontrado.' };
        }

    } catch (error) {
        console.error(error);
        const message = error instanceof Error ? error.message : 'An unknown error occurred.';
        return { success: false, message: `Error al actualizar producto: ${message}` };
    }

    revalidatePath('/admin');
    revalidatePath(`/admin/products/${productId}/edit`);
    revalidatePath('/products');
    revalidatePath('/');
    redirect('/admin/products');
}

export async function deleteProduct(productId: string): Promise<ActionResponse> {
    try {
        if (!ObjectId.isValid(productId)) {
            return { success: false, message: 'ID de producto inválido.' };
        }
        const db = await getDb();
        const productsCollection = db.collection('products');

        const result = await productsCollection.updateOne(
            { _id: new ObjectId(productId) },
            { $set: { state: 'inactivo' as ProductState, updatedAt: new Date().toISOString() } }
        );

        if (result.matchedCount === 0) {
            return { success: false, message: 'Producto no encontrado.' };
        }

        const updatedProductDoc = await productsCollection.findOne({ _id: new ObjectId(productId) });
        const product: Product = {
            id: updatedProductDoc!._id.toString(),
            name: updatedProductDoc!.name,
            slug: updatedProductDoc!.slug,
            category: updatedProductDoc!.category,
            images: updatedProductDoc!.images || [],
            price: updatedProductDoc!.price,
            brand: updatedProductDoc!.brand,
            rating: updatedProductDoc!.rating,
            numReviews: updatedProductDoc!.numReviews,
            countInStock: updatedProductDoc!.countInStock,
            description: updatedProductDoc!.description,
            care: updatedProductDoc!.care,
            isFeatured: updatedProductDoc!.isFeatured || false,
            state: updatedProductDoc!.state || 'inactivo',
            dataAiHint: updatedProductDoc!.dataAiHint || '',
            petType: updatedProductDoc!.petType || [],
            productType: updatedProductDoc!.productType || 'simple',
            variants: updatedProductDoc!.variants || [],
            oldPrice: updatedProductDoc!.oldPrice,
        };

        revalidatePath('/admin');
        revalidatePath('/products');
        revalidatePath('/');

        return { success: true, message: 'Producto desactivado.', product };
    } catch (error) {
        console.error(error);
        const message = error instanceof Error ? error.message : 'An unknown error occurred.';
        return { success: false, message: `Error al desactivar producto: ${message}` };
    }
}

export async function physicallyDeleteProduct(productId: string): Promise<ActionResponse> {
    try {
        if (!ObjectId.isValid(productId)) {
            return { success: false, message: 'ID de producto inválido.' };
        }
        const db = await getDb();
        const productsCollection = db.collection('products');

        const result = await productsCollection.deleteOne({ _id: new ObjectId(productId) });

        if (result.deletedCount === 0) {
            return { success: false, message: 'Producto no encontrado o ya eliminado.' };
        }

    } catch (error) {
        console.error(error);
        const message = error instanceof Error ? error.message : 'An unknown error occurred.';
        return { success: false, message: `Error al eliminar producto: ${message}` };
    }

    revalidatePath('/admin/products');
    revalidatePath('/products');
    revalidatePath('/');
    redirect('/admin/products');
}

export async function getPaginatedProducts(params: {
    offset: number;
    limit: number;
    searchTerm?: string;
    category?: string;
    sortOrder?: string;
    state?: ProductState;
}): Promise<ActionResponse> {
    try {
        const products = await getPaginatedProductsService(params);
        return { success: true, message: 'Products fetched', products };
    } catch (error) {
        const message = error instanceof Error ? error.message : 'An unknown error occurred.';
        return { success: false, message: `Failed to fetch products: ${message}` };
    }
}
