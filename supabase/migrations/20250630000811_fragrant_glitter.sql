/*
  # Enhanced Admin Dashboard Features

  1. New Tables
    - `order_comments` - Comments/notes on orders by admins
    - `role_change_audit` - Audit log for role changes
    - `content_management` - CMS for website content
    - `package_inventory` - Inventory tracking for packages

  2. Enhanced Tables
    - Add inventory fields to packages table
    - Add seasonal availability to packages
    - Add role change tracking

  3. Security
    - Enable RLS on all new tables
    - Add admin-only policies
    - Create admin functions for management
*/

-- Create order comments table
CREATE TABLE IF NOT EXISTS order_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  admin_id uuid NOT NULL REFERENCES profiles(id),
  comment text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create role change audit table
CREATE TABLE IF NOT EXISTS role_change_audit (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id),
  admin_id uuid NOT NULL REFERENCES profiles(id),
  old_role text NOT NULL,
  new_role text NOT NULL,
  reason text,
  created_at timestamptz DEFAULT now()
);

-- Create content management table
CREATE TABLE IF NOT EXISTS content_management (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section text NOT NULL UNIQUE,
  content jsonb NOT NULL,
  is_active boolean DEFAULT true,
  updated_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add inventory and seasonal fields to packages
ALTER TABLE packages ADD COLUMN IF NOT EXISTS stock_quantity integer DEFAULT 0;
ALTER TABLE packages ADD COLUMN IF NOT EXISTS low_stock_threshold integer DEFAULT 10;
ALTER TABLE packages ADD COLUMN IF NOT EXISTS seasonal_available boolean DEFAULT true;
ALTER TABLE packages ADD COLUMN IF NOT EXISTS season_start date;
ALTER TABLE packages ADD COLUMN IF NOT EXISTS season_end date;

-- Enable RLS on new tables
ALTER TABLE order_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_change_audit ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_management ENABLE ROW LEVEL SECURITY;

-- Policies for order_comments
CREATE POLICY "order_comments_admin_all" ON order_comments
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Policies for role_change_audit
CREATE POLICY "role_audit_admin_read" ON role_change_audit
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Policies for content_management
CREATE POLICY "content_admin_all" ON content_management
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

CREATE POLICY "content_public_read" ON content_management
  FOR SELECT TO anon, authenticated
  USING (is_active = true);

-- Create admin functions for order comments
CREATE OR REPLACE FUNCTION admin_add_order_comment(
  p_order_id uuid,
  p_comment text
)
RETURNS uuid AS $$
DECLARE
  comment_id uuid;
BEGIN
  -- Check if current user is admin
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Access denied. Admin privileges required.';
  END IF;
  
  -- Insert comment
  INSERT INTO order_comments (order_id, admin_id, comment)
  VALUES (p_order_id, auth.uid(), p_comment)
  RETURNING id INTO comment_id;
  
  RETURN comment_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get order comments
CREATE OR REPLACE FUNCTION admin_get_order_comments(p_order_id uuid)
RETURNS TABLE (
  id uuid,
  comment text,
  admin_name text,
  created_at timestamptz
) AS $$
BEGIN
  -- Check if current user is admin
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Access denied. Admin privileges required.';
  END IF;
  
  RETURN QUERY
  SELECT oc.id, oc.comment, p.name as admin_name, oc.created_at
  FROM order_comments oc
  JOIN profiles p ON oc.admin_id = p.id
  WHERE oc.order_id = p_order_id
  ORDER BY oc.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function for role changes with audit
CREATE OR REPLACE FUNCTION admin_change_user_role(
  p_user_id uuid,
  p_new_role text,
  p_reason text DEFAULT NULL
)
RETURNS void AS $$
DECLARE
  old_role text;
  old_is_admin boolean;
  new_is_admin boolean;
BEGIN
  -- Check if current user is admin
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Access denied. Admin privileges required.';
  END IF;
  
  -- Get current role
  SELECT CASE WHEN is_admin THEN 'admin' ELSE 'user' END
  INTO old_role
  FROM profiles
  WHERE id = p_user_id;
  
  -- Determine new admin status
  new_is_admin := (p_new_role = 'admin');
  
  -- Update user role
  UPDATE profiles
  SET is_admin = new_is_admin, updated_at = now()
  WHERE id = p_user_id;
  
  -- Log the change
  INSERT INTO role_change_audit (user_id, admin_id, old_role, new_role, reason)
  VALUES (p_user_id, auth.uid(), old_role, p_new_role, p_reason);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function for dashboard statistics
CREATE OR REPLACE FUNCTION admin_get_dashboard_stats()
RETURNS jsonb AS $$
DECLARE
  stats jsonb;
BEGIN
  -- Check if current user is admin
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Access denied. Admin privileges required.';
  END IF;
  
  SELECT jsonb_build_object(
    'total_users', (SELECT COUNT(*) FROM profiles),
    'total_orders', (SELECT COUNT(*) FROM orders),
    'total_revenue', (SELECT COALESCE(SUM(total_amount), 0) FROM orders WHERE status != 'cancelled'),
    'pending_orders', (SELECT COUNT(*) FROM orders WHERE status = 'pending'),
    'total_packages', (SELECT COUNT(*) FROM packages WHERE is_active = true),
    'low_stock_packages', (SELECT COUNT(*) FROM packages WHERE stock_quantity <= low_stock_threshold AND is_active = true),
    'daily_orders', (
      SELECT jsonb_agg(
        jsonb_build_object(
          'date', date_trunc('day', created_at),
          'count', count,
          'revenue', revenue
        ) ORDER BY date_trunc('day', created_at) DESC
      )
      FROM (
        SELECT 
          date_trunc('day', created_at) as day,
          COUNT(*) as count,
          SUM(total_amount) as revenue
        FROM orders 
        WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
        GROUP BY date_trunc('day', created_at)
        ORDER BY day DESC
        LIMIT 30
      ) daily_stats
    ),
    'order_status_distribution', (
      SELECT jsonb_object_agg(status, count)
      FROM (
        SELECT status, COUNT(*) as count
        FROM orders
        GROUP BY status
      ) status_stats
    ),
    'top_packages', (
      SELECT jsonb_agg(
        jsonb_build_object(
          'package_id', package_id,
          'total_quantity', total_quantity,
          'total_revenue', total_revenue
        ) ORDER BY total_quantity DESC
      )
      FROM (
        SELECT 
          package_id,
          SUM(quantity) as total_quantity,
          SUM(total_amount) as total_revenue
        FROM orders
        WHERE status != 'cancelled'
        GROUP BY package_id
        ORDER BY total_quantity DESC
        LIMIT 5
      ) package_stats
    )
  ) INTO stats;
  
  RETURN stats;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function for package management
CREATE OR REPLACE FUNCTION admin_update_package_inventory(
  p_package_id uuid,
  p_stock_quantity integer DEFAULT NULL,
  p_low_stock_threshold integer DEFAULT NULL,
  p_seasonal_available boolean DEFAULT NULL,
  p_season_start date DEFAULT NULL,
  p_season_end date DEFAULT NULL
)
RETURNS void AS $$
BEGIN
  -- Check if current user is admin
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Access denied. Admin privileges required.';
  END IF;
  
  UPDATE packages SET
    stock_quantity = COALESCE(p_stock_quantity, stock_quantity),
    low_stock_threshold = COALESCE(p_low_stock_threshold, low_stock_threshold),
    seasonal_available = COALESCE(p_seasonal_available, seasonal_available),
    season_start = COALESCE(p_season_start, season_start),
    season_end = COALESCE(p_season_end, season_end)
  WHERE id = p_package_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT EXECUTE ON FUNCTION admin_add_order_comment(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION admin_get_order_comments(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION admin_change_user_role(uuid, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION admin_get_dashboard_stats() TO authenticated;
GRANT EXECUTE ON FUNCTION admin_update_package_inventory(uuid, integer, integer, boolean, date, date) TO authenticated;

-- Insert default content management entries
INSERT INTO content_management (section, content) VALUES
  ('hero', '{"title": "Premium Fresh Mangoes From Bangladesh", "subtitle": "Experience the sweetest, juiciest mangoes directly from our sustainable farms", "cta_text": "Shop Now"}'),
  ('navigation', '{"links": [{"name": "How We Harvest", "href": "#harvest"}, {"name": "Packaging", "href": "#packaging"}, {"name": "Packages", "href": "#packages"}, {"name": "Reviews", "href": "#reviews"}]}'),
  ('footer', '{"company_info": "Premium fresh mangoes directly from Bangladeshi farms. Committed to quality, freshness, and customer satisfaction.", "contact": {"phone": "+880 1XXX-XXXXXX", "email": "info@mangoharvestbd.com", "address": "Rajshahi, Bangladesh"}}')
ON CONFLICT (section) DO NOTHING;

-- Create triggers for updated_at
CREATE TRIGGER update_order_comments_updated_at
  BEFORE UPDATE ON order_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_content_management_updated_at
  BEFORE UPDATE ON content_management
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();