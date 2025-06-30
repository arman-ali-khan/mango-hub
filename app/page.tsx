'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { HeroSection } from '@/components/sections/HeroSection';
import { HarvestProcess } from '@/components/sections/HarvestProcess';
import { PackagingSection } from '@/components/sections/PackagingSection';
import { BenefitsSection } from '@/components/sections/BenefitsSection';
import { MangoPackages } from '@/components/sections/MangoPackages';
import { ReviewsCarousel } from '@/components/sections/ReviewsCarousel';
import { FloatingChat } from '@/components/ui/FloatingChat';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

export default function Home() {
  useEffect(() => {
    // Smooth scrolling for anchor links
    const handleClick = (e: Event) => {
      const target = e.target as HTMLAnchorElement;
      if (target.hash) {
        e.preventDefault();
        const element = document.querySelector(target.hash);
        element?.scrollIntoView({ behavior: 'smooth' });
      }
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-orange-50">
      <Header />
      
      <main>
        <HeroSection />
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <HarvestProcess />
          <PackagingSection />
          <BenefitsSection />
          <MangoPackages />
          <ReviewsCarousel />
        </motion.div>
      </main>

      <Footer />
      <FloatingChat />
    </div>
  );
}