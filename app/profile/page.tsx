'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { UserProfileCard } from '@/components/profile/UserProfileCard';
import { OrdersList } from '@/components/profile/OrdersList';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/lib/store';
import { setOrders } from '@/lib/slices/orderSlice';
import { useToast } from '@/hooks/use-toast';
import { orderService } from '@/lib/orderService';

export default function ProfilePage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { toast } = useToast();
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const { orders } = useSelector((state: RootState) => state.order);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth');
      return;
    }

    fetchUserOrders();
  }, [isAuthenticated, router]);

  const fetchUserOrders = async () => {
    if (!user) return;

    try {
      console.log('📦 Fetching orders for user:', user.email);
      
      const userOrders = await orderService.getOrdersByEmail(user.email);
      
      console.log('✅ Orders fetched successfully:', userOrders);
      dispatch(setOrders(userOrders));
    } catch (error: any) {
      console.error('❌ Error fetching orders:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to fetch your orders. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-orange-50">
      <Header />
      
      <main className="pt-20 pb-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              My <span className="text-emerald-500">Profile</span>
            </h1>
            <p className="text-xl text-gray-600">
              Manage your account and track your mango orders
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Card */}
            <div className="lg:col-span-1">
              <UserProfileCard user={user} />
            </div>

            {/* Orders Section */}
            <div className="lg:col-span-2">
              <OrdersList orders={orders} />
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}