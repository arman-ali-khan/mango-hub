'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Menu, X, ShoppingCart, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/lib/store';
import { toggleCart } from '@/lib/slices/cartSlice';
import Link from 'next/link';

export function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dispatch = useDispatch();
  const { items } = useSelector((state: RootState) => state.cart);
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-emerald-400/90 backdrop-blur-md shadow-lg'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-orange-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">M</span>
            </div>
            <span className="font-bold text-xl text-gray-900">Mango Harvest BD</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#harvest" className="text-gray-700 hover:text-emerald-600 transition-colors">
              How We Harvest
            </a>
            <a href="#packaging" className="text-gray-700 hover:text-emerald-600 transition-colors">
              Packaging
            </a>
            <a href="#packages" className="text-gray-700 hover:text-emerald-600 transition-colors">
              Packages
            </a>
            <a href="#reviews" className="text-gray-700 hover:text-emerald-600 transition-colors">
              Reviews
            </a>
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => dispatch(toggleCart())}
              className="relative color-black"
            >
              <ShoppingCart className="h-5 w-5" outline="black" />
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-emerald-500 text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Button>

            {isAuthenticated ? (
              <Link href="/profile" className="">
                <Button variant="ghost" size="sm">
                  <User className="h-5 w-5" className="" />
                </Button>
              </Link>
            ) : (
              <Link href="/auth">
                <Button size="sm" className="bg-emerald-500 hover:bg-emerald-600">
                  Login
                </Button>
              </Link>
            )}

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <motion.div
          initial={false}
          animate={{ height: isOpen ? 'auto' : 0 }}
          className="md:hidden overflow-hidden"
        >
          <div className="py-4 space-y-4">
            <a
              href="#harvest"
              className="block text-gray-700 hover:text-emerald-600 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              How We Harvest
            </a>
            <a
              href="#packaging"
              className="block text-gray-700 hover:text-emerald-600 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Packaging
            </a>
            <a
              href="#packages"
              className="block text-gray-700 hover:text-emerald-600 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Packages
            </a>
            <a
              href="#reviews"
              className="block text-gray-700 hover:text-emerald-600 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Reviews
            </a>
          </div>
        </motion.div>
      </div>
    </motion.header>
  );
}