import { Facebook, Instagram, Phone, Mail, MapPin } from 'lucide-react';
import Link from 'next/link';

export function Footer() {
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
              Premium fresh mangoes directly from Bangladeshi farms. 
              Committed to quality, freshness, and customer satisfaction.
            </p>
            <div className="flex space-x-4">
              <Facebook className="h-5 w-5 text-gray-400 hover:text-white cursor-pointer transition-colors" />
              <Instagram className="h-5 w-5 text-gray-400 hover:text-white cursor-pointer transition-colors" />
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Quick Links</h3>
            <div className="space-y-2 text-sm">
              <Link href="#harvest" className="block text-gray-400 hover:text-white transition-colors">
                How We Harvest
              </Link>
              <Link href="#packaging" className="block text-gray-400 hover:text-white transition-colors">
                Packaging Process
              </Link>
              <Link href="#packages" className="block text-gray-400 hover:text-white transition-colors">
                Mango Packages
              </Link>
              <Link href="/order" className="block text-gray-400 hover:text-white transition-colors">
                Place Order
              </Link>
            </div>
          </div>

          {/* Customer Service */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Customer Service</h3>
            <div className="space-y-2 text-sm">
              <Link href="/profile" className="block text-gray-400 hover:text-white transition-colors">
                My Account
              </Link>
              <Link href="/track" className="block text-gray-400 hover:text-white transition-colors">
                Track Order
              </Link>
              <Link href="/faq" className="block text-gray-400 hover:text-white transition-colors">
                FAQ
              </Link>
              <Link href="/support" className="block text-gray-400 hover:text-white transition-colors">
                Support
              </Link>
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Contact Us</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-emerald-500" />
                <span className="text-gray-400">+880 1XXX-XXXXXX</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-emerald-500" />
                <span className="text-gray-400">info@mangoharvestbd.com</span>
              </div>
              <div className="flex items-start space-x-2">
                <MapPin className="h-4 w-4 text-emerald-500 mt-0.5" />
                <span className="text-gray-400">
                  Rajshahi, Bangladesh<br />
                  Mango Capital of Bangladesh
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
          <p>&copy; 2024 Mango Harvest BD. All rights reserved. | Privacy Policy | Terms of Service</p>
        </div>
      </div>
    </footer>
  );
}