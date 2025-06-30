/*
  # Fix Infinite Recursion in RLS Policies

  1. Problem
    - Admin policies were checking the profiles table from within profiles table policies
    - This creates infinite recursion: policy checks profiles -> policy checks profiles -> etc.

  2. Solution
    - Remove recursive admin policies
    - Use simpler approach with direct user ID checks
    - Create admin functions that bypass RLS when needed

  3. Changes
    - Drop all existing policies
    - Create simple, non-recursive policies
    - Add admin functions for admin operations
*/

-- Disable RLS temporarily to clean up
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies to start fresh
DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
DROP POLICY IF EXISTS "profiles_select_own" ON profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
DROP POLICY IF EXISTS "profiles_select_admin" ON profiles;
DROP POLICY IF EXISTS "profiles_update_admin" ON profiles;

-- Re-enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create simple, non-recursive policies
-- Policy 1: Allow authenticated users to insert their own profile
CREATE POLICY "profiles_insert_policy" ON profiles
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

-- Policy 2: Allow users to read their own profile
CREATE POLICY "profiles_select_policy" ON profiles
  FOR SELECT TO authenticated
  USING (auth.uid() = id);

-- Policy 3: Allow users to update their own profile
CREATE POLICY "profiles_update_policy" ON profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Create a function to check if current user is admin (bypasses RLS)
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND is_admin = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create admin functions that bypass RLS for admin operations
CREATE OR REPLACE FUNCTION admin_get_all_profiles()
RETURNS TABLE (
  id uuid,
  email text,
  name text,
  phone text,
  address text,
  is_admin boolean,
  created_at timestamptz,
  updated_at timestamptz
) AS $$
BEGIN
  -- Check if current user is admin
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Access denied. Admin privileges required.';
  END IF;
  
  -- Return all profiles (bypasses RLS)
  RETURN QUERY
  SELECT p.id, p.email, p.name, p.phone, p.address, p.is_admin, p.created_at, p.updated_at
  FROM profiles p;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function for admin to update any profile
CREATE OR REPLACE FUNCTION admin_update_profile(
  target_id uuid,
  new_name text DEFAULT NULL,
  new_phone text DEFAULT NULL,
  new_address text DEFAULT NULL,
  new_is_admin boolean DEFAULT NULL
)
RETURNS void AS $$
BEGIN
  -- Check if current user is admin
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Access denied. Admin privileges required.';
  END IF;
  
  -- Update the profile (bypasses RLS)
  UPDATE profiles SET
    name = COALESCE(new_name, name),
    phone = COALESCE(new_phone, phone),
    address = COALESCE(new_address, address),
    is_admin = COALESCE(new_is_admin, is_admin),
    updated_at = now()
  WHERE id = target_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fix orders policies to be simpler too
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;

-- Drop existing order policies
DROP POLICY IF EXISTS "orders_insert_all" ON orders;
DROP POLICY IF EXISTS "orders_select_all" ON orders;
DROP POLICY IF EXISTS "orders_select_own" ON orders;
DROP POLICY IF EXISTS "orders_update_admin" ON orders;

-- Re-enable RLS for orders
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Create simple order policies
-- Allow anyone to create orders (for guest checkout)
CREATE POLICY "orders_insert" ON orders
  FOR INSERT TO authenticated, anon
  WITH CHECK (true);

-- Allow anyone to read orders (for order tracking by order ID)
CREATE POLICY "orders_select" ON orders
  FOR SELECT TO authenticated, anon
  USING (true);

-- Create admin function for order management
CREATE OR REPLACE FUNCTION admin_get_all_orders()
RETURNS TABLE (
  id uuid,
  customer_name text,
  customer_email text,
  customer_phone text,
  shipping_address text,
  package_id text,
  quantity integer,
  total_amount integer,
  payment_method text,
  transaction_id text,
  status order_status,
  created_at timestamptz,
  updated_at timestamptz
) AS $$
BEGIN
  -- Check if current user is admin
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Access denied. Admin privileges required.';
  END IF;
  
  -- Return all orders (bypasses RLS)
  RETURN QUERY
  SELECT o.id, o.customer_name, o.customer_email, o.customer_phone, o.shipping_address,
         o.package_id, o.quantity, o.total_amount, o.payment_method, o.transaction_id,
         o.status, o.created_at, o.updated_at
  FROM orders o
  ORDER BY o.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function for admin to update order status
CREATE OR REPLACE FUNCTION admin_update_order_status(
  order_id uuid,
  new_status order_status
)
RETURNS void AS $$
BEGIN
  -- Check if current user is admin
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Access denied. Admin privileges required.';
  END IF;
  
  -- Update the order status (bypasses RLS)
  UPDATE orders SET
    status = new_status,
    updated_at = now()
  WHERE id = order_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions on admin functions
GRANT EXECUTE ON FUNCTION is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION admin_get_all_profiles() TO authenticated;
GRANT EXECUTE ON FUNCTION admin_update_profile(uuid, text, text, text, boolean) TO authenticated;
GRANT EXECUTE ON FUNCTION admin_get_all_orders() TO authenticated;
GRANT EXECUTE ON FUNCTION admin_update_order_status(uuid, order_status) TO authenticated;