'use client';

import { motion } from 'framer-motion';
import { Sunrise, TreePine, Truck, PackageCheck } from 'lucide-react';

const steps = [
  {
    icon: Sunrise,
    title: 'Early Morning Harvest',
    description: 'We harvest mangoes at dawn when they\'re at peak freshness and sugar content.',
    image: 'https://images.pexels.com/photos/5966628/pexels-photo-5966628.jpeg?auto=compress&cs=tinysrgb&w=500&h=300&fit=crop'
  },
  {
    icon: TreePine,
    title: 'Hand-Picked Selection',
    description: 'Each mango is carefully hand-picked by experienced farmers to ensure quality.',
    image: 'https://images.pexels.com/photos/5947080/pexels-photo-5947080.jpeg?auto=compress&cs=tinysrgb&w=500&h=300&fit=crop'
  },
  {
    icon: PackageCheck,
    title: 'Quality Control',
    description: 'Every mango goes through rigorous quality checks before packaging.',
    image: 'https://images.pexels.com/photos/4666748/pexels-photo-4666748.jpeg?auto=compress&cs=tinysrgb&w=500&h=300&fit=crop'
  },
  {
    icon: Truck,
    title: 'Fresh Delivery',
    description: 'Fast, temperature-controlled delivery ensures mangoes reach you fresh.',
    image: 'https://images.pexels.com/photos/4393021/pexels-photo-4393021.jpeg?auto=compress&cs=tinysrgb&w=500&h=300&fit=crop'
  }
];

export function HarvestProcess() {
  return (
    <section id="harvest" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            How We <span className="text-emerald-500">Harvest</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Our time-tested harvesting process ensures every mango meets our premium quality standards
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group"
            >
              <div className="relative overflow-hidden rounded-2xl bg-white shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                {/* Image */}
                <div className="h-48 overflow-hidden">
                  <img
                    src={step.image}
                    alt={step.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="bg-emerald-100 p-3 rounded-full">
                      <step.icon className="h-6 w-6 text-emerald-600" />
                    </div>
                    <div className="ml-4 text-sm font-semibold text-emerald-600">
                      Step {index + 1}
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {step.title}
                  </h3>
                  
                  <p className="text-gray-600 leading-relaxed">
                    {step.description}
                  </p>
                </div>

                {/* Animated Border */}
                <div className="absolute inset-0 border-2 border-transparent group-hover:border-emerald-200 rounded-2xl transition-colors duration-300" />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Process Flow Animation */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
          viewport={{ once: true }}
          className="hidden lg:block mt-8"
        >
          <div className="flex justify-center items-center">
            <div className="flex items-center space-x-4">
              {steps.map((_, index) => (
                <div key={index} className="flex items-center">
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity, delay: index * 0.5 }}
                    className="w-3 h-3 bg-emerald-500 rounded-full"
                  />
                  {index < steps.length - 1 && (
                    <motion.div
                      initial={{ scaleX: 0 }}
                      whileInView={{ scaleX: 1 }}
                      transition={{ duration: 0.8, delay: index * 0.2 }}
                      className="w-16 h-0.5 bg-gradient-to-r from-emerald-500 to-orange-500 mx-4 origin-left"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}