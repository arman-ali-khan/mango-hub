'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { CheckCircle, Clock, Phone, MessageCircle, Package, ArrowRight, User, MapPin, CreditCard, Gift } from 'lucide-react';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store';
import Link from 'next/link';

export default function OrderConfirmationPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get('orderId');
  
  const { orders } = useSelector((state: RootState) => state.order);
  const order = orders.find(o => o.id === orderId);

  useEffect(() => {
    if (!orderId || !order) {
      router.push('/');
    }
  }, [orderId, order, router]);

  if (!order) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-orange-50">
      <Header />
      
      <main className="pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Success Animation */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, type: "spring" }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center justify-center w-24 h-24 bg-emerald-100 rounded-full mb-6">
              <CheckCircle className="h-12 w-12 text-emerald-500" />
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Order <span className="text-emerald-500">Confirmed!</span>
            </h1>
            <p className="text-xl text-gray-600 mb-6">
              Thank you for your order. We've received your payment and will process it shortly.
            </p>
            
            <div className="inline-flex items-center bg-white px-6 py-3 rounded-full shadow-lg">
              <span className="text-sm font-medium text-gray-700 mr-2">Order ID:</span>
              <span className="text-sm font-bold text-emerald-600">{order.id}</span>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Order Details */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <Card className="shadow-xl overflow-hidden relative">
                {/* Beautiful gradient background */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 opacity-90" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                
                {/* Decorative elements */}
                <div className="absolute top-6 right-6 w-24 h-24 bg-white/10 rounded-full blur-xl" />
                <div className="absolute bottom-6 left-6 w-20 h-20 bg-purple-300/20 rounded-full blur-lg" />
                <div className="absolute top-1/3 right-1/4 w-16 h-16 bg-blue-300/15 rounded-full blur-md" />
                
                <CardHeader className="relative z-10">
                  <CardTitle className="flex items-center space-x-3 text-white">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                      <Package className="h-6 w-6 text-white" />
                    </div>
                    <span className="text-xl font-semibold">Order Details</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 relative z-10">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 border border-white/30">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                          <User className="h-4 w-4 text-white" />
                        </div>
                        <span className="text-xs text-white/70 uppercase tracking-wide font-medium">Customer</span>
                      </div>
                      <p className="font-semibold text-white text-lg">{order.customerName}</p>
                      <p className="text-sm text-white/80">{order.customerEmail}</p>
                    </div>
                    
                    <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 border border-white/30">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                          <Phone className="h-4 w-4 text-white" />
                        </div>
                        <span className="text-xs text-white/70 uppercase tracking-wide font-medium">Phone</span>
                      </div>
                      <p className="font-semibold text-white text-lg">{order.customerPhone}</p>
                    </div>
                    
                    <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 border border-white/30">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                          <Package className="h-4 w-4 text-white" />
                        </div>
                        <span className="text-xs text-white/70 uppercase tracking-wide font-medium">Package</span>
                      </div>
                      <p className="font-semibold text-white text-lg">{order.packageType}</p>
                      <p className="text-sm text-white/80">Qty: {order.quantity}</p>
                    </div>
                    
                    <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 border border-white/30">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                          <CreditCard className="h-4 w-4 text-white" />
                        </div>
                        <span className="text-xs text-white/70 uppercase tracking-wide font-medium">Total</span>
                      </div>
                      <p className="font-bold text-white text-2xl">৳{order.totalAmount}</p>
                      <p className="text-sm text-white/80 capitalize">{order.paymentMethod}</p>
                    </div>
                  </div>

                  <div className="bg-white/20 backdrop-blur-sm rounded-lg p-6 border border-white/30">
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center mt-1">
                        <MapPin className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <span className="text-xs text-white/70 uppercase tracking-wide font-medium">Delivery Address</span>
                        <p className="font-semibold text-white mt-2 leading-relaxed">{order.shippingAddress}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/20 backdrop-blur-sm rounded-lg p-6 border border-white/30">
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center mt-1">
                        <CreditCard className="h-4 w-4 text-white" />
                      </div>
                      <div className="w-full">
                        <span className="text-xs text-white/70 uppercase tracking-wide font-medium">Payment Details</span>
                        <div className="mt-2 space-y-2">
                          <p className="font-semibold text-white capitalize">Method: {order.paymentMethod}</p>
                          <div className="bg-white/10 rounded-lg p-3">
                            <span className="text-xs text-white/70 uppercase tracking-wide font-medium">Transaction ID</span>
                            <p className="font-mono text-sm text-white mt-1 break-all">{order.transactionId}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Next Steps */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <Card className="shadow-xl overflow-hidden relative">
                {/* Beautiful gradient background - complementary to order details */}
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500 via-pink-500 to-red-500 opacity-90" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                
                {/* Decorative elements */}
                <div className="absolute top-6 right-6 w-24 h-24 bg-white/10 rounded-full blur-xl" />
                <div className="absolute bottom-6 left-6 w-20 h-20 bg-red-300/20 rounded-full blur-lg" />
                <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-orange-300/15 rounded-full blur-md" />
                
                <CardHeader className="relative z-10">
                  <CardTitle className="flex items-center space-x-3 text-white">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                      <Clock className="h-6 w-6 text-white" />
                    </div>
                    <span className="text-xl font-semibold">What's Next?</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-8 relative z-10">
                  <div className="space-y-6">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-emerald-400/40 backdrop-blur-sm rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                        1
                      </div>
                      <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 border border-white/30 flex-1">
                        <h3 className="font-semibold text-white text-lg mb-2">Payment Verification</h3>
                        <p className="text-sm text-white/90 leading-relaxed">We'll verify your payment within 2-6 hours and send you a confirmation.</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-orange-400/40 backdrop-blur-sm rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                        2
                      </div>
                      <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 border border-white/30 flex-1">
                        <h3 className="font-semibold text-white text-lg mb-2">Order Processing</h3>
                        <p className="text-sm text-white/90 leading-relaxed">Fresh mangoes will be carefully selected and packed for delivery.</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-blue-400/40 backdrop-blur-sm rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                        3
                      </div>
                      <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 border border-white/30 flex-1">
                        <h3 className="font-semibold text-white text-lg mb-2">Delivery Confirmation</h3>
                        <p className="text-sm text-white/90 leading-relaxed">We'll call you to confirm delivery time and address details.</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-purple-400/40 backdrop-blur-sm rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                        4
                      </div>
                      <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 border border-white/30 flex-1">
                        <h3 className="font-semibold text-white text-lg mb-2">Fresh Delivery</h3>
                        <p className="text-sm text-white/90 leading-relaxed">Enjoy your premium mangoes within 24-48 hours of confirmation.</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-emerald-400/30 backdrop-blur-sm p-6 rounded-xl border border-emerald-300/30">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-10 h-10 bg-emerald-400/40 rounded-full flex items-center justify-center">
                        <Gift className="h-5 w-5 text-white" />
                      </div>
                      <h3 className="font-semibold text-white text-lg">Need Help?</h3>
                    </div>
                    <div className="space-y-3">
                      <Button
                        size="sm"
                        className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 rounded-lg shadow-lg"
                        onClick={() => window.open('https://wa.me/8801XXXXXXXXX', '_blank')}
                      >
                        <MessageCircle className="h-4 w-4 mr-2" />
                        WhatsApp Support
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full border-white/30 text-white hover:bg-white/20 font-semibold py-3 rounded-lg"
                        onClick={() => window.open('tel:+8801XXXXXXXXX', '_self')}
                      >
                        <Phone className="h-4 w-4 mr-2" />
                        Call Us
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mt-12 text-center space-y-4"
          >
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/">
                <Button size="lg" className="bg-teal-500 hover:bg-tela-700 text-white px-8 py-4 text-lg font-semibold rounded-full shadow-lg">
                  Continue Shopping
                </Button>
              </Link>
              
              <Link href="/profile">
                <Button size="lg" className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-4 text-lg font-semibold rounded-full shadow-lg">
                  Track Order
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>
            
            <p className="text-sm text-gray-600">
              You'll receive updates via SMS and email about your order status.
            </p>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}