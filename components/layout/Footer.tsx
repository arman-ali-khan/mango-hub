'use client';

import { useState, useEffect } from 'react';
import { Facebook, Instagram, Phone, Mail, MapPin } from 'lucide-react';
import { contentService, FooterContent } from '@/lib/contentService';
import Link from 'next/link';

export function Footer() {
  const [footerContent, setFooterContent] = useState<FooterContent | null>(null);

  useEffect(() => {
    const fetchFooterContent = async () => {
      try {
        const content = await contentService.getFooterContent();
        setFooterContent(content);
      } catch (error) {
        console.error('Error fetching footer content:', error);
        const fallbackContent = await contentService.getFooterContent();
        setFooterContent(fallbackContent);
      }
    };

    fetchFooterContent();
  }, []);

  // Use fallback content if not loaded yet
  const content = footerContent || {
    company_info: 'Premium fresh mangoes directly from Bangladeshi farms. Committed to quality, freshness, and customer satisfaction.',
    contact: {
      phone: '+880 1XXX-XXXXXX',
      email: 'info@mangoharvestbd.com',
      address: 'Rajshahi, Bangladesh\nMango Capital of Bangladesh'
    },
    copyright_text: '© 2024 Mango Harvest BD. All rights reserved.'
  };

  // Default links if not provided in content
  const defaultLinks = [
    { name: 'How We Harvest', href: '#harvest', category: 'Quick Links' },
    { name: 'Packaging Process', href: '#packaging', category: 'Quick Links' },
    { name: 'Mango Packages', href: '#packages', category: 'Quick Links' },
    { name: 'Place Order', href: '/order', category: 'Quick Links' },
    { name: 'My Account', href: '/profile', category: 'Customer Service' },
    { name: 'Track Order', href: '/track', category: 'Customer Service' },
    { name: 'FAQ', href: '/faq', category: 'Customer Service' },
    { name: 'Support', href: '/support', category: 'Customer Service' },
  ];

  const links = content.links || defaultLinks;

  // Group links by category
  const groupedLinks = links.reduce((acc, link) => {
    if (!acc[link.category]) {
      acc[link.category] = [];
    }
    acc[link.category].push(link);
    return acc;
  }, {} as Record<string, typeof links>);

  // Default social links if not provided
  const defaultSocialLinks = [
    { platform: 'facebook', url: 'https://facebook.com/mangoharvestbd', icon: '📘' },
    { platform: 'instagram', url: 'https://instagram.com/mangoharvestbd', icon: '📷' },
  ];

  const socialLinks = content.social_links || defaultSocialLinks;

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-orange-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">M</span>
              </div>
              <span className="font-bold text-xl">Mango Harvest BD</span>
            </div>
            <p className="text-gray-400 text-sm">
              {content.company_info}
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white cursor-pointer transition-colors"
                  title={social.platform}
                >
                  {social.platform === 'facebook' && <Facebook className="h-5 w-5" />}
                  {social.platform === 'instagram' && <Instagram className="h-5 w-5" />}
                </a>
              ))}
            </div>
          </div>

          {/* Dynamic Link Categories */}
          {Object.entries(groupedLinks).slice(0, 2).map(([category, categoryLinks]) => (
            <div key={category} className="space-y-4">
              <h3 className="font-semibold text-lg">{category}</h3>
              <div className="space-y-2 text-sm">
                {categoryLinks.map((link, index) => (
                  <Link 
                    key={index}
                    href={link.href} 
                    className="block text-gray-400 hover:text-white transition-colors"
                  >
                    {link.name}
                  </Link>
                ))}
              </div>
            </div>
          ))}

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Contact Us</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-emerald-500" />
                <span className="text-gray-400">{content.contact.phone}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-emerald-500" />
                <span className="text-gray-400">{content.contact.email}</span>
              </div>
              <div className="flex items-start space-x-2">
                <MapPin className="h-4 w-4 text-emerald-500 mt-0.5" />
                <span className="text-gray-400 whitespace-pre-line">
                  {content.contact.address}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
          <p>{content.copyright_text || '© 2024 Mango Harvest BD. All rights reserved.'}</p>
        </div>
      </div>
    </footer>
  );
}