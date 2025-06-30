/*
  # Initial Database Schema for Mango Harvest BD

  1. New Tables
    - `profiles`
      - `id` (uuid, primary key, references auth.users)
      - `email` (text, unique)
      - `name` (text)
      - `phone` (text, optional)
      - `address` (text, optional)
      - `is_admin` (boolean, default false)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `packages`
      - `id` (uuid, primary key)
      - `name` (text)
      - `weight` (text)
      - `price` (integer)
      - `description` (text)
      - `image_url` (text)
      - `is_active` (boolean, default true)
      - `created_at` (timestamp)
    
    - `orders`
      - `id` (uuid, primary key)
      - `customer_name` (text)
      - `customer_email` (text)
      - `customer_phone` (text)
      - `shipping_address` (text)
      - `package_id` (text)
      - `quantity` (integer)
      - `total_amount` (integer)
      - `payment_method` (text)
      - `transaction_id` (text)
      - `status` (enum: pending, verified, shipped, delivered, cancelled)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `reviews`
      - `id` (uuid, primary key)
      - `customer_name` (text)
      - `rating` (integer, 1-5)
      - `comment` (text)
      - `is_featured` (boolean, default false)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
    - Add policies for admins to manage all data
    - Add policies for public read access where appropriate
*/

-- Create custom types
CREATE TYPE order_status AS ENUM ('pending', 'verified', 'shipped', 'delivered', 'cancelled');

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  name text NOT NULL,
  phone text,
  address text,
  is_admin boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create packages table
CREATE TABLE IF NOT EXISTS packages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  weight text NOT NULL,
  price integer NOT NULL,
  description text NOT NULL,
  image_url text NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name text NOT NULL,
  customer_email text NOT NULL,
  customer_phone text NOT NULL,
  shipping_address text NOT NULL,
  package_id text NOT NULL,
  quantity integer NOT NULL DEFAULT 1,
  total_amount integer NOT NULL,
  payment_method text NOT NULL,
  transaction_id text NOT NULL,
  status order_status DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name text NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text NOT NULL,
  is_featured boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Admins can read all profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Packages policies
CREATE POLICY "Anyone can read active packages"
  ON packages
  FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

CREATE POLICY "Admins can manage packages"
  ON packages
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Orders policies
CREATE POLICY "Users can read own orders"
  ON orders
  FOR SELECT
  TO authenticated
  USING (customer_email = (SELECT email FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can create orders"
  ON orders
  FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);

CREATE POLICY "Admins can read all orders"
  ON orders
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

CREATE POLICY "Admins can update orders"
  ON orders
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Reviews policies
CREATE POLICY "Anyone can read featured reviews"
  ON reviews
  FOR SELECT
  TO anon, authenticated
  USING (is_featured = true);

CREATE POLICY "Authenticated users can create reviews"
  ON reviews
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can manage reviews"
  ON reviews
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Insert default packages
INSERT INTO packages (name, weight, price, description, image_url) VALUES
  ('5KG Premium Pack', '5KG', 1200, 'Perfect for small families', 'https://images.pexels.com/photos/8844113/pexels-photo-8844113.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop'),
  ('10KG Family Pack', '10KG', 2200, 'Most popular choice', 'https://images.pexels.com/photos/5947081/pexels-photo-5947081.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop'),
  ('20KG Bulk Pack', '20KG', 4000, 'Best value for events', 'https://images.pexels.com/photos/1132047/pexels-photo-1132047.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop');

-- Insert sample reviews
INSERT INTO reviews (customer_name, rating, comment, is_featured) VALUES
  ('Fatima Rahman', 5, 'Amazing quality mangoes! The taste was incredible and they arrived perfectly fresh. Will definitely order again.', true),
  ('Ahmed Hassan', 5, 'Best mango delivery service in Bangladesh! The packaging was excellent and the mangoes were so sweet and juicy.', true),
  ('Nasreen Begum', 5, 'Ordered for my family gathering. Everyone loved the mangoes! Fresh, organic, and delivered on time.', true),
  ('Karim Uddin', 5, 'Even as someone from Rajshahi, I was impressed by the quality. These mangoes are premium grade!', true),
  ('Salma Khan', 5, 'Outstanding service! The mangoes were exactly as described and the delivery was super fast.', true),
  ('Rafiqul Islam', 5, 'Perfect for gifts! Ordered for Eid and my relatives were so happy with the quality and presentation.', true);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();