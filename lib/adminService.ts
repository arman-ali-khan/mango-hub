import { supabase } from './supabase';

export interface DashboardStats {
  totalUsers: number;
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  totalPackages: number;
  lowStockPackages: number;
  dailyOrders: Array<{
    date: string;
    count: number;
    revenue: number;
  }>;
  orderStatusDistribution: Record<string, number>;
  topPackages: Array<{
    package_id: string;
    total_quantity: number;
    total_revenue: number;
  }>;
}

export interface OrderComment {
  id: string;
  comment: string;
  admin_name: string;
  created_at: string;
}

export interface PackageData {
  id: string;
  name: string;
  weight: string;
  price: number;
  description: string;
  image_url: string;
  is_active: boolean;
  stock_quantity: number;
  low_stock_threshold: number;
  seasonal_available: boolean;
  season_start?: string;
  season_end?: string;
  created_at: string;
}

export const adminService = {
  // Get comprehensive dashboard statistics with fallback
  async getDashboardStats(): Promise<DashboardStats> {
    try {
      console.log('📊 Fetching dashboard statistics...');
      
      // Try the RPC function first
      try {
        const { data, error } = await supabase.rpc('admin_get_dashboard_stats');
        
        if (!error && data) {
          console.log('✅ Dashboard stats fetched via RPC successfully');
          return data;
        }
      } catch (rpcError) {
        console.log('⚠️ RPC method failed, using fallback approach:', rpcError);
      }

      // Fallback: Fetch data manually
      console.log('📊 Using fallback method to fetch dashboard stats...');
      
      const [
        usersResult,
        ordersResult,
        packagesResult
      ] = await Promise.allSettled([
        supabase.from('profiles').select('*'),
        supabase.from('orders').select('*'),
        supabase.from('packages').select('*')
      ]);

      // Process users data
      const users = usersResult.status === 'fulfilled' ? usersResult.value.data || [] : [];
      const totalUsers = users.length;

      // Process orders data
      const orders = ordersResult.status === 'fulfilled' ? ordersResult.value.data || [] : [];
      const totalOrders = orders.length;
      const totalRevenue = orders
        .filter(order => order.status !== 'cancelled')
        .reduce((sum, order) => sum + (order.total_amount || 0), 0);
      const pendingOrders = orders.filter(order => order.status === 'pending').length;

      // Process packages data
      const packages = packagesResult.status === 'fulfilled' ? packagesResult.value.data || [] : [];
      const totalPackages = packages.filter(pkg => pkg.is_active).length;
      const lowStockPackages = packages.filter(pkg => 
        pkg.is_active && 
        (pkg.stock_quantity || 0) <= (pkg.low_stock_threshold || 10)
      ).length;

      // Calculate daily orders (last 7 days)
      const now = new Date();
      const dailyOrders = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        const dayOrders = orders.filter(order => 
          order.created_at && order.created_at.startsWith(dateStr)
        );
        
        dailyOrders.push({
          date: dateStr,
          count: dayOrders.length,
          revenue: dayOrders.reduce((sum, order) => sum + (order.total_amount || 0), 0)
        });
      }

      // Calculate order status distribution
      const orderStatusDistribution: Record<string, number> = {};
      orders.forEach(order => {
        const status = order.status || 'unknown';
        orderStatusDistribution[status] = (orderStatusDistribution[status] || 0) + 1;
      });

      // Calculate top packages
      const packageStats: Record<string, { quantity: number; revenue: number }> = {};
      orders
        .filter(order => order.status !== 'cancelled')
        .forEach(order => {
          const packageId = order.package_id || 'unknown';
          if (!packageStats[packageId]) {
            packageStats[packageId] = { quantity: 0, revenue: 0 };
          }
          packageStats[packageId].quantity += order.quantity || 0;
          packageStats[packageId].revenue += order.total_amount || 0;
        });

      const topPackages = Object.entries(packageStats)
        .map(([package_id, stats]) => ({
          package_id,
          total_quantity: stats.quantity,
          total_revenue: stats.revenue
        }))
        .sort((a, b) => b.total_quantity - a.total_quantity)
        .slice(0, 5);

      const stats: DashboardStats = {
        totalUsers,
        totalOrders,
        totalRevenue,
        pendingOrders,
        totalPackages,
        lowStockPackages,
        dailyOrders,
        orderStatusDistribution,
        topPackages
      };

      console.log('✅ Dashboard stats calculated via fallback method');
      return stats;

    } catch (error: any) {
      console.error('❌ Admin service dashboard stats error:', error);
      
      // Return empty stats as last resort
      return {
        totalUsers: 0,
        totalOrders: 0,
        totalRevenue: 0,
        pendingOrders: 0,
        totalPackages: 0,
        lowStockPackages: 0,
        dailyOrders: [],
        orderStatusDistribution: {},
        topPackages: []
      };
    }
  },

  // Add comment to order with fallback
  async addOrderComment(orderId: string, comment: string): Promise<string> {
    try {
      console.log('💬 Adding comment to order:', orderId);
      
      // Try RPC function first
      try {
        const { data, error } = await supabase.rpc('admin_add_order_comment', {
          p_order_id: orderId,
          p_comment: comment
        });

        if (!error && data) {
          console.log('✅ Comment added via RPC successfully');
          return data;
        }
      } catch (rpcError) {
        console.log('⚠️ RPC method failed, using fallback approach:', rpcError);
      }

      // Fallback: Direct insert if order_comments table exists
      const { data: currentUser } = await supabase.auth.getUser();
      if (!currentUser.user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('order_comments')
        .insert({
          order_id: orderId,
          admin_id: currentUser.user.id,
          comment: comment
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to add comment: ${error.message}`);
      }

      console.log('✅ Comment added via fallback method');
      return data.id;

    } catch (error: any) {
      console.error('❌ Admin service add comment error:', error);
      throw error;
    }
  },

  // Get comments for an order with fallback
  async getOrderComments(orderId: string): Promise<OrderComment[]> {
    try {
      console.log('📝 Fetching comments for order:', orderId);
      
      // Try RPC function first
      try {
        const { data, error } = await supabase.rpc('admin_get_order_comments', {
          p_order_id: orderId
        });

        if (!error && data) {
          console.log('✅ Comments fetched via RPC successfully');
          return data;
        }
      } catch (rpcError) {
        console.log('⚠️ RPC method failed, using fallback approach:', rpcError);
      }

      // Fallback: Direct query if order_comments table exists
      const { data, error } = await supabase
        .from('order_comments')
        .select(`
          id,
          comment,
          created_at,
          profiles!order_comments_admin_id_fkey(name)
        `)
        .eq('order_id', orderId)
        .order('created_at', { ascending: false });

      if (error) {
        console.log('⚠️ Comments table might not exist yet:', error.message);
        return [];
      }

      const formattedComments = data?.map(item => ({
        id: item.id,
        comment: item.comment,
        admin_name: (item.profiles as any)?.name || 'Admin',
        created_at: item.created_at
      })) || [];

      console.log('✅ Comments fetched via fallback method');
      return formattedComments;

    } catch (error: any) {
      console.error('❌ Admin service get comments error:', error);
      return []; // Return empty array instead of throwing
    }
  },

  // Change user role with audit logging and fallback
  async changeUserRole(userId: string, newRole: string, reason?: string): Promise<void> {
    try {
      console.log('🔐 Changing user role:', { userId, newRole, reason });
      
      // Try RPC function first
      try {
        const { error } = await supabase.rpc('admin_change_user_role', {
          p_user_id: userId,
          p_new_role: newRole,
          p_reason: reason || null
        });

        if (!error) {
          console.log('✅ User role changed via RPC successfully');
          return;
        }
      } catch (rpcError) {
        console.log('⚠️ RPC method failed, using fallback approach:', rpcError);
      }

      // Fallback: Direct update
      const newIsAdmin = newRole === 'admin';
      
      const { error } = await supabase
        .from('profiles')
        .update({ 
          is_admin: newIsAdmin,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) {
        throw new Error(`Failed to change user role: ${error.message}`);
      }

      // Try to log the change if audit table exists
      try {
        const { data: currentUser } = await supabase.auth.getUser();
        if (currentUser.user) {
          await supabase
            .from('role_change_audit')
            .insert({
              user_id: userId,
              admin_id: currentUser.user.id,
              old_role: newRole === 'admin' ? 'user' : 'admin',
              new_role: newRole,
              reason: reason
            });
        }
      } catch (auditError) {
        console.log('⚠️ Could not log role change to audit table:', auditError);
      }

      console.log('✅ User role changed via fallback method');

    } catch (error: any) {
      console.error('❌ Admin service change role error:', error);
      throw error;
    }
  },

  // Get all packages with inventory information
  async getAllPackages(): Promise<PackageData[]> {
    try {
      console.log('📦 Fetching all packages...');
      
      const { data, error } = await supabase
        .from('packages')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Get packages error:', error);
        throw new Error(`Failed to fetch packages: ${error.message}`);
      }

      // Ensure all packages have default inventory values
      const packagesWithDefaults = (data || []).map(pkg => ({
        ...pkg,
        stock_quantity: pkg.stock_quantity || 0,
        low_stock_threshold: pkg.low_stock_threshold || 10,
        seasonal_available: pkg.seasonal_available ?? true
      }));

      console.log('✅ Packages fetched successfully');
      return packagesWithDefaults;
    } catch (error: any) {
      console.error('❌ Admin service get packages error:', error);
      return []; // Return empty array instead of throwing
    }
  },

  // Update package inventory with fallback
  async updatePackageInventory(
    packageId: string,
    updates: {
      stock_quantity?: number;
      low_stock_threshold?: number;
      seasonal_available?: boolean;
      season_start?: string;
      season_end?: string;
    }
  ): Promise<void> {
    try {
      console.log('📦 Updating package inventory:', { packageId, updates });
      
      // Try RPC function first
      try {
        const { error } = await supabase.rpc('admin_update_package_inventory', {
          p_package_id: packageId,
          p_stock_quantity: updates.stock_quantity || null,
          p_low_stock_threshold: updates.low_stock_threshold || null,
          p_seasonal_available: updates.seasonal_available || null,
          p_season_start: updates.season_start || null,
          p_season_end: updates.season_end || null
        });

        if (!error) {
          console.log('✅ Package inventory updated via RPC successfully');
          return;
        }
      } catch (rpcError) {
        console.log('⚠️ RPC method failed, using fallback approach:', rpcError);
      }

      // Fallback: Direct update
      const updateData: any = {};
      if (updates.stock_quantity !== undefined) updateData.stock_quantity = updates.stock_quantity;
      if (updates.low_stock_threshold !== undefined) updateData.low_stock_threshold = updates.low_stock_threshold;
      if (updates.seasonal_available !== undefined) updateData.seasonal_available = updates.seasonal_available;
      if (updates.season_start !== undefined) updateData.season_start = updates.season_start;
      if (updates.season_end !== undefined) updateData.season_end = updates.season_end;

      const { error } = await supabase
        .from('packages')
        .update(updateData)
        .eq('id', packageId);

      if (error) {
        throw new Error(`Failed to update package inventory: ${error.message}`);
      }

      console.log('✅ Package inventory updated via fallback method');

    } catch (error: any) {
      console.error('❌ Admin service update inventory error:', error);
      throw error;
    }
  },

  // Create new package
  async createPackage(packageData: {
    name: string;
    weight: string;
    price: number;
    description: string;
    image_url: string;
    stock_quantity?: number;
    low_stock_threshold?: number;
    seasonal_available?: boolean;
  }): Promise<PackageData> {
    try {
      console.log('📦 Creating new package:', packageData);
      
      const { data, error } = await supabase
        .from('packages')
        .insert({
          name: packageData.name,
          weight: packageData.weight,
          price: packageData.price,
          description: packageData.description,
          image_url: packageData.image_url,
          stock_quantity: packageData.stock_quantity || 0,
          low_stock_threshold: packageData.low_stock_threshold || 10,
          seasonal_available: packageData.seasonal_available ?? true,
          is_active: true
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Create package error:', error);
        throw new Error(`Failed to create package: ${error.message}`);
      }

      console.log('✅ Package created successfully');
      return data;
    } catch (error: any) {
      console.error('❌ Admin service create package error:', error);
      throw error;
    }
  },

  // Update package
  async updatePackage(packageId: string, updates: Partial<PackageData>): Promise<void> {
    try {
      console.log('📦 Updating package:', { packageId, updates });
      
      const { error } = await supabase
        .from('packages')
        .update(updates)
        .eq('id', packageId);

      if (error) {
        console.error('❌ Update package error:', error);
        throw new Error(`Failed to update package: ${error.message}`);
      }

      console.log('✅ Package updated successfully');
    } catch (error: any) {
      console.error('❌ Admin service update package error:', error);
      throw error;
    }
  },

  // Delete package (soft delete by setting is_active to false)
  async deletePackage(packageId: string): Promise<void> {
    try {
      console.log('🗑️ Deleting package:', packageId);
      
      const { error } = await supabase
        .from('packages')
        .update({ is_active: false })
        .eq('id', packageId);

      if (error) {
        console.error('❌ Delete package error:', error);
        throw new Error(`Failed to delete package: ${error.message}`);
      }

      console.log('✅ Package deleted successfully');
    } catch (error: any) {
      console.error('❌ Admin service delete package error:', error);
      throw error;
    }
  },

  // Get role change audit log with fallback
  async getRoleChangeAudit(): Promise<Array<{
    id: string;
    user_name: string;
    admin_name: string;
    old_role: string;
    new_role: string;
    reason?: string;
    created_at: string;
  }>> {
    try {
      console.log('📋 Fetching role change audit log...');
      
      const { data, error } = await supabase
        .from('role_change_audit')
        .select(`
          id,
          old_role,
          new_role,
          reason,
          created_at,
          user:profiles!role_change_audit_user_id_fkey(name),
          admin:profiles!role_change_audit_admin_id_fkey(name)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.log('⚠️ Audit table might not exist yet:', error.message);
        return [];
      }

      console.log('✅ Audit log fetched successfully');
      
      // Format the data
      return data?.map(item => ({
        id: item.id,
        user_name: (item.user as any)?.name || 'Unknown',
        admin_name: (item.admin as any)?.name || 'Unknown',
        old_role: item.old_role,
        new_role: item.new_role,
        reason: item.reason,
        created_at: item.created_at
      })) || [];
    } catch (error: any) {
      console.error('❌ Admin service get audit log error:', error);
      return []; // Return empty array instead of throwing
    }
  },

  // Get content management data with fallback
  async getContentManagement(): Promise<Array<{
    id: string;
    section: string;
    content: any;
    is_active: boolean;
    updated_by?: string;
    created_at: string;
    updated_at: string;
  }>> {
    try {
      console.log('📄 Fetching content management data...');
      
      const { data, error } = await supabase
        .from('content_management')
        .select('*')
        .order('section');

      if (error) {
        console.log('⚠️ Content management table might not exist yet:', error.message);
        return [];
      }

      console.log('✅ Content fetched successfully');
      return data || [];
    } catch (error: any) {
      console.error('❌ Admin service get content error:', error);
      return []; // Return empty array instead of throwing
    }
  },

  // Update content management with proper handling of existing records
  async updateContent(section: string, content: any): Promise<void> {
    try {
      console.log('📄 Updating content for section:', section);
      
      // First, check if the section already exists
      const { data: existingContent, error: checkError } = await supabase
        .from('content_management')
        .select('id')
        .eq('section', section)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        // PGRST116 means "not found", which is expected for new sections
        throw new Error(`Failed to check existing content: ${checkError.message}`);
      }

      const { data: currentUser } = await supabase.auth.getUser();
      const userId = currentUser.user?.id;

      if (existingContent) {
        // Update existing record
        console.log('📝 Updating existing content section:', section);
        const { error } = await supabase
          .from('content_management')
          .update({
            content,
            updated_by: userId,
            updated_at: new Date().toISOString()
          })
          .eq('section', section);

        if (error) {
          throw new Error(`Failed to update content: ${error.message}`);
        }
      } else {
        // Insert new record
        console.log('📝 Creating new content section:', section);
        const { error } = await supabase
          .from('content_management')
          .insert({
            section,
            content,
            is_active: true,
            updated_by: userId,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });

        if (error) {
          throw new Error(`Failed to create content: ${error.message}`);
        }
      }

      console.log('✅ Content updated successfully for section:', section);
    } catch (error: any) {
      console.error('❌ Admin service update content error:', error);
      throw error;
    }
  }
};