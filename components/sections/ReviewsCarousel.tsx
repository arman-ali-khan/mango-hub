'use client';

import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';
import { useState, useEffect } from 'react';

const reviews = [
  {
    id: 1,
    name: 'Fatima Rahman',
    location: 'Dhaka',
    rating: 5,
    comment: 'Amazing quality mangoes! The taste was incredible and they arrived perfectly fresh. Will definitely order again.',
    avatar: 'https://images.pexels.com/photos/3586798/pexels-photo-3586798.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop'
  },
  {
    id: 2,
    name: 'Ahmed Hassan',
    location: 'Chittagong',
    rating: 5,
    comment: 'Best mango delivery service in Bangladesh! The packaging was excellent and the mangoes were so sweet and juicy.',
    avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop'
  },
  {
    id: 3,
    name: 'Nasreen Begum',
    location: 'Sylhet',
    rating: 5,
    comment: 'Ordered for my family gathering. Everyone loved the mangoes! Fresh, organic, and delivered on time.',
    avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop'
  },
  {
    id: 4,
    name: 'Karim Uddin',
    location: 'Rajshahi',
    rating: 5,
    comment: 'Even as someone from Rajshahi, I was impressed by the quality. These mangoes are premium grade!',
    avatar: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop'
  },
  {
    id: 5,
    name: 'Salma Khan',
    location: 'Barisal',
    rating: 5,
    comment: 'Outstanding service! The mangoes were exactly as described and the delivery was super fast.',
    avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop'
  },
  {
    id: 6,
    name: 'Rafiqul Islam',
    location: 'Khulna',
    rating: 5,
    comment: 'Perfect for gifts! Ordered for Eid and my relatives were so happy with the quality and presentation.',
    avatar: 'https://images.pexels.com/photos/1559486/pexels-photo-1559486.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop'
  }
];

export function ReviewsCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex === reviews.length - 1 ? 0 : prevIndex + 1
      );
    }, 4000);

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === reviews.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? reviews.length - 1 : prevIndex - 1
    );
  };

  return (
    <section id="reviews" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            What Our <span className="text-emerald-500">Customers</span> Say
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Join thousands of satisfied customers who trust us for the freshest mangoes
          </p>
        </motion.div>

        {/* Main Carousel */}
        <div className="relative overflow-hidden">
          <motion.div
            className="flex transition-transform duration-500 ease-in-out"
            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
          >
            {reviews.map((review, index) => (
              <div key={review.id} className="w-full flex-shrink-0 px-4">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                  className="max-w-4xl mx-auto"
                >
                  <div className="bg-gradient-to-br from-emerald-50 to-orange-50 rounded-2xl p-8 md:p-12 shadow-lg">
                    {/* Quote Icon */}
                    <div className="flex justify-center mb-6">
                      <div className="bg-emerald-100 p-3 rounded-full">
                        <Quote className="h-8 w-8 text-emerald-600" />
                      </div>
                    </div>

                    {/* Review Content */}
                    <blockquote className="text-xl md:text-2xl text-gray-800 text-center mb-8 leading-relaxed font-medium">
                      "{review.comment}"
                    </blockquote>

                    {/* Rating */}
                    <div className="flex justify-center mb-6">
                      {[...Array(review.rating)].map((_, i) => (
                        <Star key={i} className="h-6 w-6 text-yellow-400 fill-current" />
                      ))}
                    </div>

                    {/* Customer Info */}
                    <div className="flex items-center justify-center space-x-4">
                      <img
                        src={review.avatar}
                        alt={review.name}
                        className="w-16 h-16 rounded-full object-cover border-4 border-white shadow-lg"
                      />
                      <div className="text-center">
                        <div className="font-bold text-gray-900 text-lg">{review.name}</div>
                        <div className="text-gray-600">{review.location}</div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Navigation Dots */}
        <div className="flex justify-center mt-8 space-x-2">
          {reviews.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? 'bg-emerald-500 w-8'
                  : 'bg-gray-300 hover:bg-gray-400'
              }`}
            />
          ))}
        </div>

        {/* Statistics */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          viewport={{ once: true }}
          className="mt-16 bg-gradient-to-r from-emerald-500 to-orange-500 rounded-2xl p-8 text-white"
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">10,000+</div>
              <div className="text-emerald-100">Happy Customers</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">4.9</div>
              <div className="text-emerald-100">Average Rating</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">98%</div>
              <div className="text-emerald-100">Customer Satisfaction</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">50,000+</div>
              <div className="text-emerald-100">Mangoes Delivered</div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}