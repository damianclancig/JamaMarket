
import clientPromise, { getDb } from '@/lib/mongodb';
import type { Product, ProductState, PetType } from './types';
import { ObjectId, Filter } from 'mongodb';
import { NO_IMAGE_URL } from './utils';

const productFromDoc = (doc: any): Product | null => {
  if (!doc) {
    return null;
  }
  const images = doc.images && doc.images.length > 0 ? doc.images : [NO_IMAGE_URL];

  // Calcular precio: si tiene variantes, usar el mínimo
  let price = doc.price;
  if (doc.variants && doc.variants.length > 0) {
    price = Math.min(...doc.variants.map((v: any) => v.price));
  }

  // Calcular stock: suma de variantes o campo directo
  let countInStock = doc.countInStock ?? 0;
  if (doc.variants && doc.variants.length > 0) {
    countInStock = doc.variants.reduce((sum: number, v: any) => sum + (v.stock ?? 0), 0);
  }

  return {
    id: doc._id.toString(),
    name: doc.name,
    slug: doc.slug,
    category: doc.category,
    images: images,
    price,
    oldPrice: doc.oldPrice,
    brand: doc.brand,
    rating: doc.rating,
    numReviews: doc.numReviews,
    countInStock,
    description: doc.description,
    care: doc.care || '',
    isFeatured: doc.isFeatured || false,
    state: doc.state || 'inactivo',
    dataAiHint: doc.dataAiHint || 'product image',
    // Campos JamaMarket
    petType: doc.petType || [],
    productType: doc.productType || 'simple',
    variants: doc.variants?.map((v: any) => ({
      _id: v._id?.toString(),
      sku: v.sku,
      price: v.price,
      stock: v.stock,
      attribute: v.attribute,
      imageIndex: v.imageIndex,
    })) || [],
    packItems: doc.packItems?.map((p: any) => ({
      productId: p.productId?.toString(),
      variantId: p.variantId?.toString(),
      quantity: p.quantity,
    })) || [],
    createdAt: doc.createdAt?.toISOString ? doc.createdAt.toISOString() : doc.createdAt?.toString(),
    updatedAt: doc.updatedAt?.toISOString ? doc.updatedAt.toISOString() : doc.updatedAt?.toString(),
  };
};

export const getPaginatedProducts = async (params: {
  offset?: number;
  limit?: number;
  searchTerm?: string;
  category?: string;
  petType?: PetType;
  brand?: string;
  sortOrder?: string;
  state?: ProductState;
}): Promise<Product[]> => {
  const {
    offset = 0,
    limit = 12,
    searchTerm,
    category,
    petType,
    brand,
    sortOrder = 'name_asc',
    state
  } = params;

  try {
    const db = await getDb();
    const productsCollection = db.collection('products');

    const query: Filter<any> = {};

    if (state) {
      query.state = state;
    }

    if (searchTerm) {
      query.name = { $regex: searchTerm, $options: 'i' };
    }
    if (category && category !== 'All') {
      query.category = category;
    }
    if (petType) {
      query.petType = petType;
    }
    if (brand) {
      query.brand = { $regex: brand, $options: 'i' };
    }

    let sort: any = {};
    switch (sortOrder) {
      case 'price_asc':
        sort = { price: 1 };
        break;
      case 'price_desc':
        sort = { price: -1 };
        break;
      case 'name_asc':
        sort = { name: 1 };
        break;
      case 'name_desc':
        sort = { name: -1 };
        break;
      default:
        sort = { name: 1 };
    }

    const products = await productsCollection
      .find(query)
      .sort(sort)
      .skip(offset)
      .limit(limit)
      .toArray();

    return products.map(doc => productFromDoc(doc)).filter(p => p !== null) as Product[];
  } catch (error) {
    console.error('Error fetching paginated products:', error);
    return [];
  }
};

export const getUniqueCategories = async (): Promise<string[]> => {
  try {
    const db = await getDb();
    const productsCollection = db.collection('products');
    const categories = await productsCollection.distinct('category', { state: 'activo' });
    return ['All', ...categories];
  } catch (error) {
    console.error('Error fetching unique categories:', error);
    return ['All'];
  }
}

export const getAllProducts = async (): Promise<Product[]> => {
  try {
    const db = await getDb();
    const productsCollection = db.collection('products');
    const products = await productsCollection.find({}).sort({ createdAt: -1 }).toArray();
    return products.map(doc => productFromDoc(doc)).filter(p => p !== null) as Product[];
  } catch (error) {
    console.error('Error fetching all products:', error);
    return [];
  }
};

export const getAvailableProducts = async (): Promise<Product[]> => {
  try {
    const db = await getDb();
    const productsCollection = db.collection('products');
    const products = await productsCollection.find({ state: 'activo' }).sort({ createdAt: -1 }).toArray();
    return products.map(doc => productFromDoc(doc)).filter(p => p !== null) as Product[];
  } catch (error) {
    console.error('Error fetching available products:', error);
    return [];
  }
};

export const getFeaturedProducts = async (): Promise<Product[]> => {
  try {
    const db = await getDb();
    const productsCollection = db.collection('products');
    const products = await productsCollection.find({ isFeatured: true, state: 'activo' }).limit(4).toArray();
    return products.map(doc => productFromDoc(doc)).filter(p => p !== null) as Product[];
  } catch (error) {
    console.error('Error fetching featured products:', error);
    return [];
  }
};

export const getProductById = async (id: string): Promise<Product | null> => {
  if (!ObjectId.isValid(id)) {
    return null;
  }
  try {
    const db = await getDb();
    const productsCollection = db.collection('products');
    const product = await productsCollection.findOne({ _id: new ObjectId(id) });
    return productFromDoc(product);
  } catch (error) {
    console.error(`Error fetching product by id ${id}:`, error);
    return null;
  }
};

export const getProductBySlug = async (slug: string): Promise<Product | null> => {
  try {
    const db = await getDb();
    const productsCollection = db.collection('products');
    const product = await productsCollection.findOne({ slug: slug, state: 'activo' });
    return productFromDoc(product);
  } catch (error) {
    console.error(`Error fetching product by slug ${slug}:`, error);
    return null;
  }
};

