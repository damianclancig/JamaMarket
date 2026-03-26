
import clientPromise, { getDb } from '@/lib/mongodb';
import type { HeroSlide } from './types';
import { ObjectId } from 'mongodb';

const slideFromDoc = (doc: any): HeroSlide | null => {
  if (!doc) {
    return null;
  }
  return {
    id: doc._id.toString(),
    headline: doc.headline,
    subtext: doc.subtext,
    image: doc.image,
    buttonLink: doc.buttonLink,
    state: doc.state || 'deshabilitado',
    dataAiHint: doc.dataAiHint || 'promotional banner',
    createdAt: doc.createdAt?.toISOString ? doc.createdAt.toISOString() : doc.createdAt?.toString(),
    updatedAt: doc.updatedAt?.toISOString ? doc.updatedAt.toISOString() : doc.updatedAt?.toString(),
  };
};

export const getAllSlides = async (): Promise<HeroSlide[]> => {
  try {
    const db = await getDb();
    const slidesCollection = db.collection('heroSlides');
    const slides = await slidesCollection.find({}).sort({ createdAt: -1 }).toArray();
    return slides.map(doc => slideFromDoc(doc)).filter(s => s !== null) as HeroSlide[];
  } catch (error) {
    console.error('Error fetching all slides:', error);
    return [];
  }
};

export const getActiveSlides = async (): Promise<HeroSlide[]> => {
  try {
    const db = await getDb();
    const slidesCollection = db.collection('heroSlides');
    const slides = await slidesCollection.find({ state: 'habilitado' }).sort({ createdAt: -1 }).toArray();
    return slides.map(doc => slideFromDoc(doc)).filter(s => s !== null) as HeroSlide[];
  } catch (error) {
    console.error('Error fetching active slides:', error);
    return [];
  }
};

export const getSlideById = async (id: string): Promise<HeroSlide | null> => {
  if (!ObjectId.isValid(id)) {
    return null;
  }
  try {
    const db = await getDb();
    const slidesCollection = db.collection('heroSlides');
    const slide = await slidesCollection.findOne({ _id: new ObjectId(id) });
    return slideFromDoc(slide);
  } catch (error) {
    console.error(`Error fetching slide by id ${id}:`, error);
    return null;
  }
};
