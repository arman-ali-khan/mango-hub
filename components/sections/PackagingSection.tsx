'use client';

import { motion } from 'framer-motion';
import { Leaf, Shield, Recycle, Thermometer } from 'lucide-react';

const features = [
  {
    icon: Leaf,
    title: 'Eco-Friendly Materials',
    description: 'Made from 100% biodegradable and sustainable materials'
  },
  {
    icon: Shield,
    title: 'Protection Guarantee',
    description: 'Advanced cushioning ensures mangoes arrive in perfect condition'
  },
  {
    icon: Recycle,
    title: 'Recyclable Design',
    description: 'Easy to recycle packaging that reduces environmental impact'
  },
  {
    icon: Thermometer,
    title: 'Temperature Control',
    description: 'Insulated packaging maintains optimal temperature during transit'
  }
];

export function PackagingSection() {
  return (
    <section id="packaging" className="py-20 bg-gradient-to-br from-emerald-50 to-orange-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Sustainable <span className="text-emerald-500">Packaging</span>
            </h2>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              We care about the environment as much as we care about quality. Our innovative 
              packaging solution ensures your mangoes arrive fresh while minimizing environmental impact.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="flex items-start space-x-3"
                >
                  <div className="bg-emerald-100 p-2 rounded-lg">
                    <feature.icon className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right Visual */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="relative">
              {/* Main Image */}
              <div className="rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src="https://images.pexels.com/photos/4393668/pexels-photo-4393668.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop"
                  alt="Sustainable Packaging"
                  className="w-full h-96 object-cover"
                />
              </div>

              {/* Floating Elements */}
              <motion.div
                animate={{
                  y: [0, -10, 0],
                  rotate: [0, 5, 0]
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="absolute -top-6 -right-6 bg-white rounded-full p-4 shadow-lg"
              >
                <Leaf className="h-8 w-8 text-emerald-500" />
              </motion.div>

              <motion.div
                animate={{
                  y: [0, 10, 0],
                  rotate: [0, -5, 0]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 1
                }}
                className="absolute -bottom-6 -left-6 bg-white rounded-full p-4 shadow-lg"
              >
                <Recycle className="h-8 w-8 text-orange-500" />
              </motion.div>

              {/* Decorative Dots */}
              <div className="absolute top-1/2 -left-12 grid grid-cols-3 gap-2">
                {[...Array(9)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.1 }}
                    className="w-2 h-2 bg-emerald-300 rounded-full"
                  />
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          viewport={{ once: true }}
          className="mt-16 bg-white rounded-2xl p-8 shadow-lg"
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-emerald-500 mb-2">100%</div>
              <div className="text-gray-600">Biodegradable</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-orange-500 mb-2">0%</div>
              <div className="text-gray-600">Damage Rate</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-500 mb-2">5 Days</div>
              <div className="text-gray-600">Freshness Guaranteed</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-500 mb-2">24/7</div>
              <div className="text-gray-600">Temperature Monitored</div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}