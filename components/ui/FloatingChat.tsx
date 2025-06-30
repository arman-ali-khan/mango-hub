'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Phone, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function FloatingChat() {
  const [isOpen, setIsOpen] = useState(false);

  const handleWhatsApp = () => {
    window.open('https://wa.me/8801XXXXXXXXX?text=Hello! I am interested in your mango packages.', '_blank');
  };

  const handleCall = () => {
    window.open('tel:+8801XXXXXXXXX', '_self');
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="mb-4 bg-white rounded-2xl shadow-2xl p-4 w-72"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Need Help?</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <p className="text-sm text-gray-600 mb-4">
              Get instant support or place your order directly through WhatsApp or phone call.
            </p>

            <div className="space-y-2">
              <Button
                onClick={handleWhatsApp}
                className="w-full bg-green-500 hover:bg-green-600 text-white flex items-center space-x-2"
              >
                <MessageCircle className="h-4 w-4" />
                <span>Chat on WhatsApp</span>
              </Button>
              
              <Button
                onClick={handleCall}
                variant="outline"
                className="w-full border-emerald-500 text-emerald-600 hover:bg-emerald-50 flex items-center space-x-2"
              >
                <Phone className="h-4 w-4" />
                <span>Call Now</span>
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Button
          onClick={() => setIsOpen(!isOpen)}
          className="w-14 h-14 rounded-full bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 shadow-lg"
        >
          <MessageCircle className="h-6 w-6 text-white" />
        </Button>
      </motion.div>

      {/* Floating notification */}
      <motion.div
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.7, 1, 0.7]
        }}
        transition={{ 
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 rounded-full"
      />
    </div>
  );
}