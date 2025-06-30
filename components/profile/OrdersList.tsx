'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Package, ShoppingBag } from 'lucide-react';
import { OrderCard } from './OrderCard';
import { useRouter } from 'next/navigation';

interface OrdersListProps {
  orders: Array<{
    id: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    shippingAddress: string;
    packageType: string;
    quantity: number;
    totalAmount: number;
    paymentMethod: string;
    transactionId: string;
    status: 'pending' | 'verified' | 'shipped' | 'delivered' | 'cancelled';
    orderDate: string;
  }>;
}

export function OrdersList({ orders }: OrdersListProps) {
  const router = useRouter();

  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8, delay: 0.4 }}
    >
      <Card className="shadow-xl overflow-hidden relative">
        {/* Beautiful gradient background - complementary to profile card */}
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500 via-orange-600 to-emerald-500 opacity-90" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        
        {/* Decorative elements */}
        <div className="absolute top-6 right-6 w-24 h-24 bg-white/10 rounded-full blur-xl" />
        <div className="absolute bottom-6 left-6 w-20 h-20 bg-emerald-300/20 rounded-full blur-lg" />
        <div className="absolute top-1/2 right-1/4 w-16 h-16 bg-yellow-300/10 rounded-full blur-md" />
        
        <CardHeader className="relative z-10">
          <CardTitle className="flex items-center space-x-3 text-white">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
              <Package className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-semibold">My Orders</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="relative z-10">
          {orders.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-6">
                <ShoppingBag className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">No Orders Yet</h3>
              <p className="text-white/80 mb-8 max-w-md mx-auto leading-relaxed">
                You haven't placed any orders yet. Start shopping for fresh, premium mangoes and experience the taste of Bangladesh!
              </p>
              <Button
                onClick={() => router.push('/#packages')}
                className="bg-white text-orange-600 hover:bg-white/90 font-semibold px-8 py-3 text-lg rounded-full shadow-lg"
              >
                Shop Now
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}