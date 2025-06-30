import { supabase } from './supabase';

export interface OrderData {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  packageType: string;
  quantity: number;
  totalAmount: number;
  paymentMethod: string;
  transactionId: string;
}

export const orderService = {
  // Create a new order in the database
  async createOrder(orderData: OrderData) {
    try {
      console.log('🚀 Creating order in database:', orderData);
      
      const { data, error } = await supabase
        .from('orders')
        .insert({
          customer_name: orderData.customerName,
          customer_email: orderData.customerEmail,
          customer_phone: orderData.customerPhone,
          shipping_address: orderData.shippingAddress,
          package_id: orderData.packageType,
          quantity: orderData.quantity,
          total_amount: orderData.totalAmount,
          payment_method: orderData.paymentMethod,
          transaction_id: orderData.transactionId,
          status: 'pending'
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Order creation error:', error);
        throw new Error(`Failed to create order: ${error.message}`);
      }

      console.log('✅ Order created successfully:', data);
      
      // Return formatted order
      return {
        id: data.id,
        customerName: data.customer_name,
        customerEmail: data.customer_email,
        customerPhone: data.customer_phone,
        shippingAddress: data.shipping_address,
        packageType: data.package_id,
        quantity: data.quantity,
        totalAmount: data.total_amount,
        paymentMethod: data.payment_method,
        transactionId: data.transaction_id,
        status: data.status,
        orderDate: data.created_at,
      };
    } catch (error: any) {
      console.error('❌ Order service error:', error);
      throw error;
    }
  },

  // Get order by ID
  async getOrderById(orderId: string) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();

      if (error) {
        console.error('❌ Get order error:', error);
        throw new Error(`Failed to get order: ${error.message}`);
      }

      // Return formatted order
      return {
        id: data.id,
        customerName: data.customer_name,
        customerEmail: data.customer_email,
        customerPhone: data.customer_phone,
        shippingAddress: data.shipping_address,
        packageType: data.package_id,
        quantity: data.quantity,
        totalAmount: data.total_amount,
        paymentMethod: data.payment_method,
        transactionId: data.transaction_id,
        status: data.status,
        orderDate: data.created_at,
      };
    } catch (error: any) {
      console.error('❌ Get order service error:', error);
      throw error;
    }
  },

  // Get orders by customer email
  async getOrdersByEmail(email: string) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('customer_email', email)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Get orders by email error:', error);
        throw new Error(`Failed to get orders: ${error.message}`);
      }

      // Return formatted orders
      return data.map(order => ({
        id: order.id,
        customerName: order.customer_name,
        customerEmail: order.customer_email,
        customerPhone: order.customer_phone,
        shippingAddress: order.shipping_address,
        packageType: order.package_id,
        quantity: order.quantity,
        totalAmount: order.total_amount,
        paymentMethod: order.payment_method,
        transactionId: order.transaction_id,
        status: order.status,
        orderDate: order.created_at,
      }));
    } catch (error: any) {
      console.error('❌ Get orders by email service error:', error);
      throw error;
    }
  },

  // Search orders by various criteria - FIXED VERSION
  async searchOrders(searchQuery: string) {
    try {
      console.log('🔍 Searching orders with query:', searchQuery);
      
      // Clean the search query
      const cleanQuery = searchQuery.trim();
      
      // Build the search query with proper UUID casting
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .or(`id::text.ilike.%${cleanQuery}%,customer_email.ilike.%${cleanQuery}%,customer_phone.ilike.%${cleanQuery}%,transaction_id.ilike.%${cleanQuery}%,customer_name.ilike.%${cleanQuery}%`)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) {
        console.error('❌ Search orders error:', error);
        throw new Error(`Failed to search orders: ${error.message}`);
      }

      console.log('✅ Search completed, found orders:', data?.length || 0);

      // Return formatted orders
      return data.map(order => ({
        id: order.id,
        customerName: order.customer_name,
        customerEmail: order.customer_email,
        customerPhone: order.customer_phone,
        shippingAddress: order.shipping_address,
        packageType: order.package_id,
        quantity: order.quantity,
        totalAmount: order.total_amount,
        paymentMethod: order.payment_method,
        transactionId: order.transaction_id,
        status: order.status,
        orderDate: order.created_at,
      }));
    } catch (error: any) {
      console.error('❌ Search orders service error:', error);
      throw error;
    }
  },

  // Alternative search method using multiple queries if the above doesn't work
  async searchOrdersAlternative(searchQuery: string) {
    try {
      console.log('🔍 Alternative search for orders with query:', searchQuery);
      
      const cleanQuery = searchQuery.trim().toLowerCase();
      
      // Try different search approaches
      const searches = await Promise.allSettled([
        // Search by email
        supabase
          .from('orders')
          .select('*')
          .ilike('customer_email', `%${cleanQuery}%`)
          .limit(10),
        
        // Search by phone
        supabase
          .from('orders')
          .select('*')
          .ilike('customer_phone', `%${cleanQuery}%`)
          .limit(10),
        
        // Search by transaction ID
        supabase
          .from('orders')
          .select('*')
          .ilike('transaction_id', `%${cleanQuery}%`)
          .limit(10),
        
        // Search by customer name
        supabase
          .from('orders')
          .select('*')
          .ilike('customer_name', `%${cleanQuery}%`)
          .limit(10),
      ]);

      // Collect all successful results
      const allResults: any[] = [];
      searches.forEach((result) => {
        if (result.status === 'fulfilled' && result.value.data) {
          allResults.push(...result.value.data);
        }
      });

      // Remove duplicates based on ID
      const uniqueResults = allResults.filter((order, index, self) => 
        index === self.findIndex(o => o.id === order.id)
      );

      // Sort by creation date
      uniqueResults.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      console.log('✅ Alternative search completed, found orders:', uniqueResults.length);

      // Return formatted orders
      return uniqueResults.map(order => ({
        id: order.id,
        customerName: order.customer_name,
        customerEmail: order.customer_email,
        customerPhone: order.customer_phone,
        shippingAddress: order.shipping_address,
        packageType: order.package_id,
        quantity: order.quantity,
        totalAmount: order.total_amount,
        paymentMethod: order.payment_method,
        transactionId: order.transaction_id,
        status: order.status,
        orderDate: order.created_at,
      }));
    } catch (error: any) {
      console.error('❌ Alternative search orders service error:', error);
      throw error;
    }
  },

  // Update order status
  async updateOrderStatus(orderId: string, status: string) {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ 
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);

      if (error) {
        console.error('❌ Update order status error:', error);
        throw new Error(`Failed to update order status: ${error.message}`);
      }

      console.log('✅ Order status updated successfully');
    } catch (error: any) {
      console.error('❌ Update order status service error:', error);
      throw error;
    }
  }
};