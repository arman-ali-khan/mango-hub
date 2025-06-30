import { supabase } from './supabase';

export interface ContentSection {
  id: string;
  section: string;
  content: any;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface HeroContent {
  title: string;
  subtitle: string;
  cta_text: string;
  background_image?: string;
}

export interface NavigationContent {
  brand_name?: string;
  brand_logo?: string;
  links: Array<{
    name: string;
    href: string;
    order?: number;
  }>;
}

export interface BenefitsContent {
  title: string;
  subtitle: string;
  benefits: Array<{
    id: string;
    icon: string;
    title: string;
    description: string;
    color: string;
  }>;
}

export interface PackagesContent {
  title: string;
  subtitle: string;
  packages: Array<{
    id: string;
    name: string;
    weight: string;
    price: number;
    originalPrice: number;
    description: string;
    features: string[];
    image: string;
    popular: boolean;
  }>;
}

export interface FooterContent {
  company_info: string;
  contact: {
    phone: string;
    email: string;
    address: string;
  };
  links?: Array<{
    id: string;
    name: string;
    href: string;
    category: string;
  }>;
  social_links?: Array<{
    id: string;
    platform: string;
    url: string;
    icon: string;
  }>;
  copyright_text?: string;
}

export const contentService = {
  // Get all content sections
  async getAllContent(): Promise<ContentSection[]> {
    try {
      const { data, error } = await supabase
        .from('content_management')
        .select('*')
        .eq('is_active', true)
        .order('section');

      if (error) {
        console.error('Error fetching content:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Content service error:', error);
      return [];
    }
  },

  // Get specific content section
  async getContentBySection(section: string): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('content_management')
        .select('content')
        .eq('section', section)
        .eq('is_active', true)
        .single();

      if (error) {
        console.error(`Error fetching ${section} content:`, error);
        return null;
      }

      return data?.content || null;
    } catch (error) {
      console.error(`Content service error for ${section}:`, error);
      return null;
    }
  },

  // Get hero content with fallback
  async getHeroContent(): Promise<HeroContent> {
    const content = await this.getContentBySection('hero');
    
    return content || {
      title: 'Premium Fresh Mangoes From Bangladesh',
      subtitle: 'Experience the sweetest, juiciest mangoes directly from our sustainable farms. Eco-friendly packaging, nationwide delivery.',
      cta_text: 'Shop Now',
      background_image: 'https://images.pexels.com/photos/5966630/pexels-photo-5966630.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop'
    };
  },

  // Get navigation content with fallback
  async getNavigationContent(): Promise<NavigationContent> {
    const content = await this.getContentBySection('navigation');
    
    return content || {
      brand_name: 'Mango Harvest BD',
      links: [
        { name: 'How We Harvest', href: '#harvest' },
        { name: 'Packaging', href: '#packaging' },
        { name: 'Packages', href: '#packages' },
        { name: 'Reviews', href: '#reviews' }
      ]
    };
  },

  // Get benefits content with fallback
  async getBenefitsContent(): Promise<BenefitsContent> {
    const content = await this.getContentBySection('benefits');
    
    return content || {
      title: 'Why Choose Us?',
      subtitle: 'We\'re committed to delivering the finest mangoes with unmatched quality and service',
      benefits: [
        {
          id: '1',
          icon: 'heart',
          title: 'Always Fresh',
          description: 'Harvested daily and delivered within 24-48 hours to ensure maximum freshness and taste.',
          color: 'bg-red-100 text-red-600'
        },
        {
          id: '2',
          icon: 'award',
          title: '100% Organic',
          description: 'Grown without harmful pesticides or chemicals. Certified organic by Bangladesh Standards.',
          color: 'bg-emerald-100 text-emerald-600'
        },
        {
          id: '3',
          icon: 'users',
          title: 'Trusted Farmers',
          description: 'Working directly with experienced farmers from Rajshahi, the mango capital of Bangladesh.',
          color: 'bg-blue-100 text-blue-600'
        }
      ]
    };
  },

  // Get packages content with fallback
  async getPackagesContent(): Promise<PackagesContent> {
    const content = await this.getContentBySection('packages');
    
    return content || {
      title: 'Choose Your Package',
      subtitle: 'Select the perfect mango package for your needs. All packages include premium quality mangoes with our freshness guarantee.',
      packages: [
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
      ]
    };
  },

  // Get footer content with fallback
  async getFooterContent(): Promise<FooterContent> {
    const content = await this.getContentBySection('footer');
    
    return content || {
      company_info: 'Premium fresh mangoes directly from Bangladeshi farms. Committed to quality, freshness, and customer satisfaction.',
      contact: {
        phone: '+880 1XXX-XXXXXX',
        email: 'info@mangoharvestbd.com',
        address: 'Rajshahi, Bangladesh\nMango Capital of Bangladesh'
      },
      copyright_text: '© 2024 Mango Harvest BD. All rights reserved.'
    };
  }
};