import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database schema types
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          name: string;
          phone?: string;
          address?: string;
          is_admin: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          name: string;
          phone?: string;
          address?: string;
          is_admin?: boolean;
        };
        Update: {
          email?: string;
          name?: string;
          phone?: string;
          address?: string;
          is_admin?: boolean;
          updated_at?: string;
        };
      };
      packages: {
        Row: {
          id: string;
          name: string;
          weight: string;
          price: number;
          description: string;
          image_url: string;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          name: string;
          weight: string;
          price: number;
          description: string;
          image_url: string;
          is_active?: boolean;
        };
        Update: {
          name?: string;
          weight?: string;
          price?: number;
          description?: string;
          image_url?: string;
          is_active?: boolean;
        };
      };
      orders: {
        Row: {
          id: string;
          customer_name: string;
          customer_email: string;
          customer_phone: string;
          shipping_address: string;
          package_id: string;
          quantity: number;
          total_amount: number;
          payment_method: string;
          transaction_id: string;
          status: 'pending' | 'verified' | 'shipped' | 'delivered' | 'cancelled';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          customer_name: string;
          customer_email: string;
          customer_phone: string;
          shipping_address: string;
          package_id: string;
          quantity: number;
          total_amount: number;
          payment_method: string;
          transaction_id: string;
          status?: 'pending' | 'verified' | 'shipped' | 'delivered' | 'cancelled';
        };
        Update: {
          status?: 'pending' | 'verified' | 'shipped' | 'delivered' | 'cancelled';
          updated_at?: string;
        };
      };
      reviews: {
        Row: {
          id: string;
          customer_name: string;
          rating: number;
          comment: string;
          is_featured: boolean;
          created_at: string;
        };
        Insert: {
          customer_name: string;
          rating: number;
          comment: string;
          is_featured?: boolean;
        };
        Update: {
          customer_name?: string;
          rating?: number;
          comment?: string;
          is_featured?: boolean;
        };
      };
    };
  };
}