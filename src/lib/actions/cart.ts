'use server';

import { revalidatePath } from 'next/cache';
import { ObjectId } from 'mongodb';
import { getProductById } from '@/lib/product-service';
import { getDb } from '@/lib/mongodb';
import { auth } from '@/auth';
import type { Cart, PopulatedCart, PopulatedCartItem, ActionResponse } from '@/lib/types';

export async function getPopulatedCart(userId: string): Promise<PopulatedCart | null> {
    const db = await getDb();
    const cartsCollection = db.collection<Cart>('carts');
    const cart = await cartsCollection.findOne({ userId: new ObjectId(userId) });

    if (!cart) {
        return {
            id: '',
            userId,
            items: [],
            totalPrice: 0,
        };
    }

    const populatedItems: PopulatedCartItem[] = await Promise.all(
        cart.items.map(async (item) => {
            const product = await getProductById(item.productId.toString());
            if (!product) return null;

            let price = product.price;
            let variantAttribute: string | undefined;
            let countInStock = product.countInStock;

            // Si el ítem tiene variantId, buscar la variante específica
            if (item.variantId && product.variants && product.variants.length > 0) {
                const variantIdStr = item.variantId.toString();
                const variant = product.variants.find(
                    (v) => v._id?.toString() === variantIdStr
                );
                if (variant) {
                    price = variant.price;
                    variantAttribute = variant.attribute;
                    countInStock = variant.stock;
                }
            }

            return {
                productId: product.id,
                variantId: item.variantId?.toString(),
                variantAttribute,
                name: product.name,
                slug: product.slug,
                price,
                quantity: item.quantity,
                image: product.images[0],
                countInStock,
            } as PopulatedCartItem;
        })
    ).then(items => items.filter((item): item is PopulatedCartItem => item !== null));

    const totalPrice = populatedItems.reduce((total, item) => total + item.price * item.quantity, 0);

    return {
        id: cart._id.toString(),
        userId,
        items: populatedItems,
        totalPrice,
    };
}

export async function getCart(): Promise<PopulatedCart | null> {
    const session = await auth();
    if (!session?.user?.id) {
        return null;
    }

    return getPopulatedCart(session.user.id);
}

export async function addToCart(productId: string, quantity: number, variantId?: string): Promise<ActionResponse> {
    const session = await auth();
    if (!session?.user?.id) {
        return { success: false, message: "User not authenticated." };
    }

    try {
        const db = await getDb();
        const cartsCollection = db.collection<Cart>('carts');
        const product = await getProductById(productId);

        if (!product) {
            return { success: false, message: "Product not found." };
        }

        // Validar stock según tipo de producto
        if (variantId) {
            if (!product.variants || product.variants.length === 0) {
                return { success: false, message: "Product has no variants." };
            }

            const variant = product.variants.find(v => v._id?.toString() === variantId);
            if (!variant) {
                return { success: false, message: "Variant not found." };
            }
            if (variant.stock < quantity) {
                return { success: false, message: "Insufficient stock for this variant." };
            }

            // Validar pack: verificar stock de cada componente
            if (product.productType === 'pack' && product.packItems && product.packItems.length > 0) {
                for (const packItem of product.packItems) {
                    const componentProduct = await getProductById(packItem.productId.toString());
                    if (!componentProduct || !componentProduct.variants) {
                        return { success: false, message: `Pack component not available.` };
                    }
                    const componentVariant = componentProduct.variants.find(
                        v => v._id?.toString() === packItem.variantId.toString()
                    );
                    if (!componentVariant || componentVariant.stock < packItem.quantity * quantity) {
                        return { success: false, message: `Insufficient stock in pack component: ${componentProduct.name}.` };
                    }
                }
            }
        } else {
            // Producto sin variante (retrocompatible)
            if (product.countInStock < quantity) {
                return { success: false, message: "Product not available or insufficient stock." };
            }
        }

        const userId = new ObjectId(session.user.id);
        const variantObjectId = variantId ? new ObjectId(variantId) : undefined;
        let cart = await cartsCollection.findOne({ userId });

        if (cart) {
            // Buscar ítem existente por productId + variantId
            const itemIndex = cart.items.findIndex(item => {
                const sameProduct = item.productId.toString() === productId;
                const sameVariant = variantObjectId
                    ? item.variantId?.toString() === variantId
                    : !item.variantId;
                return sameProduct && sameVariant;
            });

            if (itemIndex > -1) {
                cart.items[itemIndex].quantity += quantity;
            } else {
                cart.items.push({
                    productId: new ObjectId(productId),
                    variantId: variantObjectId,
                    quantity,
                });
            }
            await cartsCollection.updateOne({ _id: cart._id }, { $set: { items: cart.items } });
        } else {
            const newCart: Omit<Cart, '_id'> = {
                userId,
                items: [{
                    productId: new ObjectId(productId),
                    variantId: variantObjectId,
                    quantity,
                }],
            };
            await cartsCollection.insertOne(newCart as any);
        }

        revalidatePath('/cart');
        const populatedCart = await getPopulatedCart(session.user.id);
        return { success: true, message: "Product added to cart", cart: populatedCart };

    } catch (error) {
        const message = error instanceof Error ? error.message : 'An unknown error occurred.';
        return { success: false, message: `Failed to add to cart: ${message}` };
    }
}

export async function updateCartItemQuantity(productId: string, quantity: number, variantId?: string): Promise<ActionResponse> {
    const session = await auth();
    if (!session?.user?.id) {
        return { success: false, message: "User not authenticated." };
    }
    if (quantity <= 0) {
        return removeFromCart(productId, variantId);
    }

    try {
        const db = await getDb();
        const cartsCollection = db.collection<Cart>('carts');
        const product = await getProductById(productId);

        if (!product) {
            return { success: false, message: "Product not found." };
        }

        // Validar stock
        if (variantId) {
            const variant = product.variants?.find(v => v._id?.toString() === variantId);
            if (!variant || variant.stock < quantity) {
                return { success: false, message: "Insufficient stock." };
            }
        } else {
            if (product.countInStock < quantity) {
                return { success: false, message: "Insufficient stock." };
            }
        }

        const userId = new ObjectId(session.user.id);
        const cart = await cartsCollection.findOne({ userId });
        if (!cart) return { success: false, message: "Cart not found." };

        const itemIndex = cart.items.findIndex(item => {
            const sameProduct = item.productId.toString() === productId;
            const sameVariant = variantId
                ? item.variantId?.toString() === variantId
                : !item.variantId;
            return sameProduct && sameVariant;
        });

        if (itemIndex === -1) return { success: false, message: "Item not in cart." };

        cart.items[itemIndex].quantity = quantity;
        await cartsCollection.updateOne({ _id: cart._id }, { $set: { items: cart.items } });

        revalidatePath('/cart');
        const populatedCart = await getPopulatedCart(session.user.id);
        return { success: true, message: "Cart updated.", cart: populatedCart };

    } catch (error) {
        const message = error instanceof Error ? error.message : 'An unknown error occurred.';
        return { success: false, message: `Failed to update cart: ${message}` };
    }
}

export async function removeFromCart(productId: string, variantId?: string): Promise<ActionResponse> {
    const session = await auth();
    if (!session?.user?.id) {
        return { success: false, message: "User not authenticated." };
    }

    try {
        const db = await getDb();
        const cartsCollection = db.collection<Cart>('carts');
        const userId = new ObjectId(session.user.id);

        const cart = await cartsCollection.findOne({ userId });
        if (!cart) return { success: false, message: "Cart not found." };

        // Filtrar el ítem por productId + variantId
        const updatedItems = cart.items.filter(item => {
            const sameProduct = item.productId.toString() === productId;
            if (!sameProduct) return true; // mantener
            const sameVariant = variantId
                ? item.variantId?.toString() === variantId
                : !item.variantId;
            return !sameVariant; // remover si coincide
        });

        await cartsCollection.updateOne({ userId }, { $set: { items: updatedItems } });

        revalidatePath('/cart');
        const populatedCart = await getPopulatedCart(session.user.id);
        return { success: true, message: "Item removed from cart.", cart: populatedCart };

    } catch (error) {
        const message = error instanceof Error ? error.message : 'An unknown error occurred.';
        return { success: false, message: `Failed to remove item: ${message}` };
    }
}
