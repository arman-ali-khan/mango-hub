'use client';

import { motion } from 'framer-motion';
import { Heart, Award, Users, Truck } from 'lucide-react';

const benefits = [
  {
    icon: Heart,
    title: 'Always Fresh',
    description: 'Harvested daily and delivered within 24-48 hours to ensure maximum freshness and taste.',
    color: 'bg-red-100 text-red-600'
  },
  {
    icon: Award,
    title: '100% Organic',
    description: 'Grown without harmful pesticides or chemicals. Certified organic by Bangladesh Standards.',
    color: 'bg-emerald-100 text-emerald-600'
  },
  {
    icon: Users,
    title: 'Trusted Farmers',
    description: 'Working directly with experienced farmers from Rajshahi, the mango capital of Bangladesh.',
    color: 'bg-blue-100 text-blue-600'
  }
];

export function BenefitsSection() {
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
            Why Choose <span className="text-emerald-500">Us?</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We're committed to delivering the finest mangoes with unmatched quality and service
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {benefits.map((benefit, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              viewport={{ once: true }}
              className="group"
            >
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
                <div className={`w-16 h-16 rounded-full ${benefit.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <benefit.icon className="h-8 w-8" />
                </div>
                
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  {benefit.title}
                </h3>
                
                <p className="text-gray-600 leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            </motion.div>
          ))}
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