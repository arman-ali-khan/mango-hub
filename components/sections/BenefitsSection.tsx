'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart, Award, Users, Truck, Leaf, Shield, Star, Check } from 'lucide-react';
import { contentService, BenefitsContent } from '@/lib/contentService';

const iconMap = {
  heart: Heart,
  award: Award,
  users: Users,
  truck: Truck,
  leaf: Leaf,
  shield: Shield,
  star: Star,
  check: Check,
};

export function BenefitsSection() {
  const [benefitsContent, setBenefitsContent] = useState<BenefitsContent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBenefitsContent = async () => {
      try {
        const content = await contentService.getBenefitsContent();
        setBenefitsContent(content);
      } catch (error) {
        console.error('Error fetching benefits content:', error);
        const fallbackContent = await contentService.getBenefitsContent();
        setBenefitsContent(fallbackContent);
      } finally {
        setLoading(false);
      }
    };

    fetchBenefitsContent();
  }, []);

  if (loading || !benefitsContent) {
    return (
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading benefits...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {benefitsContent.title.split(' ').map((word, index) => {
              if (word.toLowerCase().includes('us') || word.toLowerCase().includes('choose')) {
                return (
                  <span key={index} className="text-emerald-500">{word} </span>
                );
              }
              return word + ' ';
            })}
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {benefitsContent.subtitle}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {benefitsContent.benefits.map((benefit, index) => {
            const IconComponent = iconMap[benefit.icon as keyof typeof iconMap] || Heart;
            
            return (
              <motion.div
                key={benefit.id}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="group"
              >
                <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
                  <div className={`w-16 h-16 rounded-full ${benefit.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <IconComponent className="h-8 w-8" />
                  </div>
                  
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    {benefit.title}
                  </h3>
                  
                  <p className="text-gray-600 leading-relaxed">
                    {benefit.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="bg-gradient-to-r from-emerald-500 to-orange-500 rounded-2xl p-8 md:p-12 text-center text-white"
        >
          <h3 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Taste the Difference?
          </h3>
          <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
            Join thousands of satisfied customers who trust us for the freshest, 
            most delicious mangoes in Bangladesh.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <div className="flex items-center space-x-2 bg-white/20 rounded-full px-6 py-3">
              <Truck className="h-5 w-5" />
              <span className="font-semibold">Free Delivery Above ৳2000</span>
            </div>
            <div className="flex items-center space-x-2 bg-white/20 rounded-full px-6 py-3">
              <Award className="h-5 w-5" />
              <span className="font-semibold">100% Money Back Guarantee</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}