'use client';

import { motion } from 'framer-motion';
import { Check, Star, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const packages = [
  {
    id: 'package-5kg',
    name: '5KG Premium Pack',
    weight: '5KG',
    price: 1200,
    originalPrice: 1500,
    description: 'Perfect for small families',
    features: [
      '15-20 premium mangoes',
      'Eco-friendly packaging',
      'Same day delivery in Dhaka',
      'Freshness guarantee'
    ],
    image: 'https://images.pexels.com/photos/8844113/pexels-photo-8844113.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop',
    popular: false
  },
  {
    id: 'package-10kg',
    name: '10KG Family Pack',
    weight: '10KG',
    price: 2200,
    originalPrice: 2800,
    description: 'Most popular choice',
    features: [
      '30-40 premium mangoes',
      'Premium eco-packaging',
      'Free delivery nationwide',
      'Quality assurance',
      'Bonus: 5 extra mangoes'
    ],
    image: 'https://images.pexels.com/photos/5947081/pexels-photo-5947081.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop',
    popular: true
  },
  {
    id: 'package-20kg',
    name: '20KG Bulk Pack',
    weight: '20KG',
    price: 4000,
    originalPrice: 5200,
    description: 'Best value for events',
    features: [
      '60-80 premium mangoes',
      'Bulk packaging solution',
      'Express delivery',
      'Corporate discount available',
      'Free storage tips guide'
    ],
    image: 'https://images.pexels.com/photos/1132047/pexels-photo-1132047.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop',
    popular: false
  }
];

export function MangoPackages() {
  return (
    <section id="packages" className="py-20 bg-gradient-to-br from-orange-50 to-emerald-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Choose Your <span className="text-emerald-500">Package</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Select the perfect mango package for your needs. All packages include premium quality mangoes 
            with our freshness guarantee.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {packages.map((pkg, index) => (
            <motion.div
              key={pkg.id}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group relative"
            >
              {/* Popular Badge */}
              {pkg.popular && (
                <div className="absolute z-50 -top-4 left-1/2 transform -translate-x-1/2 z-10">
                  <div className="bg-gradient-to-r from-emerald-500 to-orange-500 text-white px-6 py-2 rounded-full text-sm font-semibold flex items-center space-x-2">
                    <Star className="h-4 w-4 fill-current" />
                    <span>Most Popular</span>
                  </div>
                </div>
              )}

              <div className={`relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden ${
                pkg.popular ? 'ring-2 ring-emerald-500 ring-opacity-50' : ''
              }`}>
                {/* Image */}
                <div className="h-48 overflow-hidden">
                  <img
                    src={pkg.image}
                    alt={pkg.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute -z-50 inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                </div>

                {/* Content */}
                <div className="p-6 z-96">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">{pkg.name}</h3>
                      <p className="text-gray-600">{pkg.description}</p>
                    </div>
                    <div className="bg-emerald-100 p-2 rounded-full">
                      <Package className="h-6 w-6 text-emerald-600" />
                    </div>
                  </div>

                  {/* Pricing */}
                  <div className="mb-6">
                    <div className="flex items-baseline space-x-2">
                      <span className="text-3xl font-bold text-gray-900">৳{pkg.price}</span>
                      <span className="text-lg text-gray-500 line-through">৳{pkg.originalPrice}</span>
                    </div>
                    <div className="text-sm text-emerald-600 font-semibold">
                      Save ৳{pkg.originalPrice - pkg.price} ({Math.round(((pkg.originalPrice - pkg.price) / pkg.originalPrice) * 100)}% off)
                    </div>
                  </div>

                  {/* Features */}
                  <div className="space-y-3 mb-8">
                    {pkg.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-center space-x-3">
                        <div className="bg-emerald-100 p-1 rounded-full">
                          <Check className="h-3 w-3 text-emerald-600" />
                        </div>
                        <span className="text-sm text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* Single Order Button */}
                  <Link href={`/order?package=${pkg.id}`} className="block">
                    <Button className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-3 text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300">
                      Order Now
                    </Button>
                  </Link>
                </div>

                {/* Hover Effect */}
                <div className="absolute -z-50 inset-0 bg-gradient-to-r from-emerald-500/5 to-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Additional Info */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          viewport={{ once: true }}
          className="mt-12 text-center"
        >
          <div className="bg-white rounded-xl p-6 shadow-lg max-w-2xl mx-auto">
            <h3 className="text-xl font-bold text-gray-900 mb-4">All Packages Include:</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <Check className="h-4 w-4 text-emerald-500" />
                <span>Premium Quality</span>
              </div>
              <div className="flex items-center space-x-2">
                <Check className="h-4 w-4 text-emerald-500" />
                <span>Eco Packaging</span>
              </div>
              <div className="flex items-center space-x-2">
                <Check className="h-4 w-4 text-emerald-500" />
                <span>Fresh Guarantee</span>
              </div>
              <div className="flex items-center space-x-2">
                <Check className="h-4 w-4 text-emerald-500" />
                <span>Fast Delivery</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}