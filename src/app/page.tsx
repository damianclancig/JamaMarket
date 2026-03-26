import ContactSection from "@/components/home/contact-section";
import FeaturedProducts from "@/components/home/featured-products";
import HeroBanner from "@/components/home/hero-banner";
import ServicesSection from "@/components/home/services-section";
import { getFeaturedProducts } from "@/lib/product-service";
import { getActiveSlides } from "@/lib/slide-service";
import { getAllServices } from "@/lib/service-service";
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'JamaMarket - Todo para tu Mascota',
  description: 'Alimento premium, accesorios, juguetes y los mejores consejos para el cuidado de tus amigos peludos. JamaMarket: Calidad y amor en cada producto.',
};

import { auth } from "@/auth";

export default async function Home() {
  const session = await auth();
  const [featuredProducts, slides, services] = await Promise.all([
    getFeaturedProducts(),
    getActiveSlides(),
    getAllServices()
  ]);

  return (
    <div className="space-y-12 md:space-y-16 lg:space-y-20">
      <HeroBanner slides={slides} isAdmin={session?.user?.isAdmin} />
      <FeaturedProducts products={featuredProducts} isAdmin={session?.user?.isAdmin} />
      <ServicesSection services={services} />
      <ContactSection />
    </div>
  );
}
