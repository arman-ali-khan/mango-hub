/*
  # Fix RLS Policies for Profile Creation

  1. Security Updates
    - Drop all existing profile policies completely
    - Create simple, working policies for profile management
    - Ensure authenticated users can create their own profiles
    - Fix admin policies to work properly

  2. Changes
    - Simplified policy structure
    - Clear separation of concerns
    - Proper WITH CHECK clauses
    - Enable profile creation during registration
*/

-- First, disable RLS temporarily to clean up
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies on profiles table
DROP POLICY IF EXISTS "Users can create own profile" ON profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can read all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON profiles;
DROP POLICY IF EXISTS "Enable read for own profile" ON profiles;
DROP POLICY IF EXISTS "Enable update for own profile" ON profiles;
DROP POLICY IF EXISTS "Enable admin read all profiles" ON profiles;
DROP POLICY IF EXISTS "Enable admin update all profiles" ON profiles;

-- Re-enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create simple, working policies
-- Policy 1: Allow authenticated users to insert their own profile
CREATE POLICY "profiles_insert_own" ON profiles
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

-- Policy 2: Allow users to read their own profile
CREATE POLICY "profiles_select_own" ON profiles
  FOR SELECT TO authenticated
  USING (auth.uid() = id);

-- Policy 3: Allow users to update their own profile
CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Policy 4: Allow admins to read all profiles
CREATE POLICY "profiles_select_admin" ON profiles
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles admin_check
      WHERE admin_check.id = auth.uid() 
      AND admin_check.is_admin = true
    )
  );

-- Policy 5: Allow admins to update all profiles
CREATE POLICY "profiles_update_admin" ON profiles
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles admin_check
      WHERE admin_check.id = auth.uid() 
      AND admin_check.is_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles admin_check
      WHERE admin_check.id = auth.uid() 
      AND admin_check.is_admin = true
    )
  );

-- Also fix orders policies to be simpler
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;

-- Drop existing order policies
DROP POLICY IF EXISTS "Users can read own orders" ON orders;
DROP POLICY IF EXISTS "Users can create orders" ON orders;
DROP POLICY IF EXISTS "Admins can read all orders" ON orders;
DROP POLICY IF EXISTS "Admins can update orders" ON orders;
DROP POLICY IF EXISTS "Anyone can create orders" ON orders;
DROP POLICY IF EXISTS "Public order tracking" ON orders;
DROP POLICY IF EXISTS "Enable order creation for everyone" ON orders;
DROP POLICY IF EXISTS "Enable order reading for everyone" ON orders;
DROP POLICY IF EXISTS "Enable order updates for admins" ON orders;

-- Re-enable RLS for orders
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Create simple order policies
-- Allow anyone to create orders (for guest checkout)
CREATE POLICY "orders_insert_all" ON orders
  FOR INSERT TO authenticated, anon
  WITH CHECK (true);

-- Allow anyone to read orders (for order tracking)
CREATE POLICY "orders_select_all" ON orders
  FOR SELECT TO authenticated, anon
  USING (true);

-- Allow authenticated users to read their own orders
CREATE POLICY "orders_select_own" ON orders
  FOR SELECT TO authenticated
  USING (
    customer_email = (
      SELECT email FROM profiles 
      WHERE id = auth.uid()
    )
  );

-- Allow admins to update orders
CREATE POLICY "orders_update_admin" ON orders
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles admin_check
      WHERE admin_check.id = auth.uid() 
      AND admin_check.is_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles admin_check
      WHERE admin_check.id = auth.uid() 
      AND admin_check.is_admin = true
    )
  );