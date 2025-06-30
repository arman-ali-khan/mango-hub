'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Menu, X, ShoppingCart, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/lib/store';
import { toggleCart } from '@/lib/slices/cartSlice';
import { contentService, NavigationContent } from '@/lib/contentService';
import Link from 'next/link';

export function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [navContent, setNavContent] = useState<NavigationContent | null>(null);
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

  useEffect(() => {
    const fetchNavContent = async () => {
      try {
        const content = await contentService.getNavigationContent();
        setNavContent(content);
      } catch (error) {
        console.error('Error fetching navigation content:', error);
        const fallbackContent = await contentService.getNavigationContent();
        setNavContent(fallbackContent);
      }
    };

    fetchNavContent();
  }, []);

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  // Use fallback if content is not loaded yet
  const brandName = navContent?.brand_name || 'Mango Harvest BD';
  const brandLogo = navContent?.brand_logo;
  const navigationLinks = navContent?.links || [
    { name: 'How We Harvest', href: '#harvest' },
    { name: 'Packaging', href: '#packaging' },
    { name: 'Packages', href: '#packages' },
    { name: 'Reviews', href: '#reviews' }
  ];

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
            {brandLogo ? (
              <img 
                src={brandLogo} 
                alt={brandName}
                className="w-8 h-8 object-contain"
                onError={(e) => {
                  // Fallback to default logo if image fails to load
                  (e.target as HTMLImageElement).style.display = 'none';
                  const fallbackDiv = document.createElement('div');
                  fallbackDiv.className = 'w-8 h-8 bg-gradient-to-r from-emerald-500 to-orange-500 rounded-full flex items-center justify-center';
                  fallbackDiv.innerHTML = '<span class="text-white font-bold text-sm">M</span>';
                  (e.target as HTMLImageElement).parentNode?.insertBefore(fallbackDiv, e.target);
                }}
              />
            ) : (
              <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-orange-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">M</span>
              </div>
            )}
            <span className="font-bold text-xl text-gray-900">{brandName}</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navigationLinks.map((link, index) => (
              <a 
                key={index}
                href={link.href} 
                className="text-gray-700 hover:text-emerald-600 transition-colors"
              >
                {link.name}
              </a>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => dispatch(toggleCart())}
              className="relative color-black"
            >
              <ShoppingCart className="h-5 w-5" />
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-emerald-500 text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Button>

            {isAuthenticated ? (
              <Link href="/profile">
                <Button variant="ghost" size="sm">
                  <User className="h-5 w-5" />
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
            {navigationLinks.map((link, index) => (
              <a
                key={index}
                href={link.href}
                className="block text-gray-700 hover:text-emerald-600 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                {link.name}
              </a>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.header>
  );
}