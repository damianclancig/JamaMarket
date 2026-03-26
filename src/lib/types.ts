

'use server';

import type { ObjectId } from 'mongodb';

export type Language = 'en' | 'es' | 'pt';

export type ProductState = 'activo' | 'inactivo' | 'vendido';

export type PetType = 'dog' | 'cat';

export type ProductType = 'simple' | 'pack';

export interface ProductVariant {
  _id?: string;
  sku?: string;
  price: number;
  stock: number;
  attribute: string; // ej: "20kg", "Rojo", "Talle M"
  imageIndex?: number; // índice de la imagen principal en product.images
}

export interface PackItem {
  productId: string;
  variantId: string;
  quantity: number;
}

export interface Product {
  id: string;
  _id?: ObjectId;
  name: string;
  slug: string;
  category: string;
  images: string[];
  price: number; // precio base (o precio mínimo de variantes si las tiene)
  oldPrice?: number;
  brand: string;
  rating: number;
  numReviews: number;
  countInStock: number; // stock total (suma de variantes si las tiene)
  description: string;
  care?: string; // "Tips de Jama" — texto con íconos de mascotas
  isFeatured: boolean;
  state: ProductState;
  dataAiHint: string;
  // Campos nuevos JamaMarket
  petType?: PetType[];
  productType?: ProductType;
  variants?: ProductVariant[];
  packItems?: PackItem[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Address {
  street?: string;
  number?: string;
  city?: string;
  province?: string;
  country?: string;
  zipCode?: string;
  instructions?: string;
}

export interface User {
  id: string;
  _id?: ObjectId;
  name: string;
  email: string;
  password?: string;
  isAdmin: boolean;
  phone?: string;
  profileImage?: string;
  address?: Address;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  createdAt?: string;
  updatedAt?: string;
}

export type SlideState = 'habilitado' | 'deshabilitado';

export interface HeroSlide {
  id: string;
  _id?: ObjectId;
  headline: string;
  subtext: string;
  image: string;
  buttonLink?: string;
  state: SlideState;
  dataAiHint?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CartItem {
  productId: ObjectId;
  variantId?: ObjectId; // ID de la variante seleccionada
  quantity: number;
}

export interface Cart {
  _id: ObjectId;
  userId: ObjectId;
  items: CartItem[];
}

export interface PopulatedCartItem {
  productId: string;
  variantId?: string; // ID de la variante seleccionada
  variantAttribute?: string; // ej: "20kg", "Rojo" — para mostrar en UI
  name: string;
  slug: string;
  price: number;
  quantity: number;
  image: string;
  countInStock: number;
}

export interface PopulatedCart {
  id: string;
  userId: string;
  items: PopulatedCartItem[];
  totalPrice: number;
}

export type OrderStatus =
  | 'Pendiente'
  | 'Pendiente de Pago'
  | 'Pendiente de Confirmación'
  | 'Confirmado'
  | 'Enviado'
  | 'Entregado'
  | 'Cancelado';

export type PaymentMethod = 'Efectivo' | 'Transferencia Bancaria' | 'MercadoPago';

export interface OrderItem {
  productId: string;
  name: string;
  slug: string;
  quantity: number;
  price: number;
  image: string;
}

export interface MercadoPagoPaymentDetails {
  paymentMethodId: string; // e.g., 'visa'
  paymentTypeId: string;   // e.g., 'credit_card'
  lastFourDigits?: string;
  installments?: number;
}

export interface Order {
  id: string;
  _id?: ObjectId;
  userId: string;
  user?: User;
  items: OrderItem[];
  totalPrice: number;
  paymentMethod: PaymentMethod;
  status: OrderStatus;
  receiptUrl?: string;
  mercadoPagoPreferenceId?: string;
  mercadoPagoInitPoint?: string;
  mercadoPagoPaymentId?: string;
  mercadoPagoPaymentDetails?: MercadoPagoPaymentDetails;
  createdAt: string;
  updatedAt: string;
}

export interface Service {
  id: string;
  _id?: ObjectId;
  icon: any;
  title: string;
  description: string;
  details: string[];
  price: string;
  note?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AppErrorLog {
  id: string;
  _id?: ObjectId;
  timestamp: string;
  path: string;
  functionName: string;
  errorMessage: string;
  stackTrace?: string;
  metadata?: Record<string, any>;
  isResolved: boolean;
}

export type ActionResponse = {
  success: boolean;
  message: string;
  product?: Product | null;
  products?: Product[] | null;
  user?: User | null;
  slide?: HeroSlide | null;
  cart?: PopulatedCart | null;
  order?: Order | null;
  init_point?: string;
  shippingCost?: number;
  shippingMessage?: string;
  zone?: number;
};
