'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Search, Package, Clock, CheckCircle, Truck, MapPin, Phone, Mail, Navigation, Route, Calendar, CreditCard } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { orderService } from '@/lib/orderService';

interface Order {
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
}

const statusSteps = [
  { key: 'pending', label: 'Order Placed', icon: Package, description: 'Your order has been received' },
  { key: 'verified', label: 'Payment Verified', icon: CheckCircle, description: 'Payment confirmed and processing' },
  { key: 'shipped', label: 'Shipped', icon: Truck, description: 'Your mangoes are on the way' },
  { key: 'delivered', label: 'Delivered', icon: CheckCircle, description: 'Order delivered successfully' },
];

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  verified: 'bg-blue-100 text-blue-800',
  shipped: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

export default function TrackOrderPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const { toast } = useToast();

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast({
        title: "Search Required",
        description: "Please enter an order ID, email, phone number, or transaction ID.",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      setNotFound(false);
      setOrders([]);

      console.log('🔍 Searching for orders with query:', searchQuery);

      // Try the main search method first
      let searchResults;
      try {
        searchResults = await orderService.searchOrders(searchQuery);
      } catch (error: any) {
        console.log('⚠️ Main search failed, trying alternative method:', error.message);
        // If main search fails due to UUID casting, try alternative method
        searchResults = await orderService.searchOrdersAlternative(searchQuery);
      }

      if (searchResults && searchResults.length > 0) {
        console.log('✅ Found orders:', searchResults);
        setOrders(searchResults);
      } else {
        console.log('❌ No orders found');
        setNotFound(true);
      }
    } catch (error: any) {
      console.error('❌ Search error:', error);
      toast({
        title: "Search Failed",
        description: error.message || "Failed to search for orders. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusIndex = (status: string) => {
    return statusSteps.findIndex(step => step.key === status);
  };

  const isStepCompleted = (stepIndex: number, currentStatus: string) => {
    const currentIndex = getStatusIndex(currentStatus);
    return stepIndex <= currentIndex;
  };

  const isStepActive = (stepIndex: number, currentStatus: string) => {
    const currentIndex = getStatusIndex(currentStatus);
    return stepIndex === currentIndex;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-orange-50">
      <Header />
      
      <main className="pt-20 pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Track Your <span className="text-emerald-500">Order</span>
            </h1>
            <p className="text-xl text-gray-600">
              Enter your order details to track your mango delivery
            </p>
          </motion.div>

          {/* Search Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mb-8"
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
                    <Search className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-xl font-semibold">Search Order</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="flex space-x-4">
                  <div className="flex-1">
                    <Label htmlFor="search" className="text-white/90 font-medium">Order ID, Email, Phone, or Transaction ID</Label>
                    <Input
                      id="search"
                      placeholder="Enter order ID, email, phone number, or transaction ID"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                      className="mt-2 bg-white/20 border-white/30 text-white placeholder:text-white/60 focus:bg-white/30 focus:border-white/50"
                    />
                  </div>
                  <div className="flex items-end">
                    <Button
                      onClick={handleSearch}
                      disabled={loading}
                      className="bg-white text-purple-600 hover:bg-white/90 font-semibold px-8 py-3 rounded-lg shadow-lg"
                    >
                      {loading ? 'Searching...' : 'Track Order'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Results Section */}
          {notFound && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Card className="shadow-xl overflow-hidden relative">
                {/* Beautiful gradient background */}
                <div className="absolute inset-0 bg-gradient-to-br from-red-500 via-pink-500 to-orange-500 opacity-90" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                
                {/* Decorative elements */}
                <div className="absolute top-6 right-6 w-24 h-24 bg-white/10 rounded-full blur-xl" />
                <div className="absolute bottom-6 left-6 w-20 h-20 bg-orange-300/20 rounded-full blur-lg" />
                
                <CardContent className="text-center py-16 relative z-10">
                  <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-6">
                    <Package className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-semibold text-white mb-4">No Orders Found</h3>
                  <p className="text-white/90 mb-8 max-w-md mx-auto leading-relaxed">
                    We couldn't find any orders matching your search. Please check your details and try again.
                  </p>
                  <div className="bg-white/20 backdrop-blur-sm p-6 rounded-xl max-w-md mx-auto border border-white/30">
                    <p className="text-sm text-white mb-4 font-semibold">Need help?</p>
                    <div className="flex flex-col space-y-3">
                      <Button
                        size="sm"
                        className="bg-green-500 hover:bg-green-600 text-white font-semibold py-3 rounded-lg shadow-lg"
                        onClick={() => window.open('https://wa.me/8801XXXXXXXXX', '_blank')}
                      >
                        WhatsApp Support
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-white/30 text-white hover:bg-white/20 font-semibold py-3 rounded-lg"
                        onClick={() => window.open('tel:+8801XXXXXXXXX', '_self')}
                      >
                        Call Support
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {orders.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-8"
            >
              {orders.map((order) => (
                <div key={order.id} className="space-y-8">
                  {/* Order Details */}
                  <Card className="shadow-xl overflow-hidden relative">
                    {/* Beautiful gradient background with truck theme */}
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-500 opacity-90" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                    
                    {/* Decorative truck elements */}
                    <div className="absolute top-6 right-6 w-24 h-24 bg-white/10 rounded-full blur-xl" />
                    <div className="absolute bottom-6 left-6 w-20 h-20 bg-cyan-300/20 rounded-full blur-lg" />
                    <div className="absolute top-1/2 right-1/4 w-16 h-16 bg-emerald-300/15 rounded-full blur-md" />
                    
                    <CardHeader className="relative z-10">
                      <CardTitle className="flex items-center justify-between text-white">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                            <Truck className="h-6 w-6 text-white" />
                          </div>
                          <span className="text-xl font-semibold">Order Details</span>
                        </div>
                        <Badge className={`${statusColors[order.status]} font-semibold px-4 py-2 text-sm`}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="relative z-10">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 border border-white/30">
                            <div className="flex items-center space-x-3 mb-2">
                              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                                <Package className="h-4 w-4 text-white" />
                              </div>
                              <span className="text-xs text-white/70 uppercase tracking-wide font-medium">Order ID</span>
                            </div>
                            <p className="font-semibold text-white text-lg">{order.id}</p>
                          </div>
                          
                          <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 border border-white/30">
                            <div className="flex items-center space-x-3 mb-2">
                              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                                <Calendar className="h-4 w-4 text-white" />
                              </div>
                              <span className="text-xs text-white/70 uppercase tracking-wide font-medium">Order Date</span>
                            </div>
                            <p className="font-semibold text-white">{new Date(order.orderDate).toLocaleDateString()}</p>
                          </div>
                          
                          <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 border border-white/30">
                            <div className="flex items-center space-x-3 mb-2">
                              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                                <Package className="h-4 w-4 text-white" />
                              </div>
                              <span className="text-xs text-white/70 uppercase tracking-wide font-medium">Package</span>
                            </div>
                            <p className="font-semibold text-white">{order.packageType}</p>
                            <p className="text-sm text-white/80">Qty: {order.quantity}</p>
                          </div>
                        </div>
                        
                        <div className="space-y-4">
                          <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 border border-white/30">
                            <div className="flex items-center space-x-3 mb-2">
                              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                                <Phone className="h-4 w-4 text-white" />
                              </div>
                              <span className="text-xs text-white/70 uppercase tracking-wide font-medium">Customer</span>
                            </div>
                            <p className="font-semibold text-white">{order.customerName}</p>
                            <p className="text-sm text-white/80">{order.customerEmail}</p>
                          </div>
                          
                          <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 border border-white/30">
                            <div className="flex items-center space-x-3 mb-2">
                              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                                <CreditCard className="h-4 w-4 text-white" />
                              </div>
                              <span className="text-xs text-white/70 uppercase tracking-wide font-medium">Total Amount</span>
                            </div>
                            <p className="font-bold text-white text-2xl">৳{order.totalAmount}</p>
                            <p className="text-sm text-white/80 capitalize">{order.paymentMethod}</p>
                          </div>
                          
                          <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 border border-white/30">
                            <div className="flex items-center space-x-3 mb-2">
                              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                                <CreditCard className="h-4 w-4 text-white" />
                              </div>
                              <span className="text-xs text-white/70 uppercase tracking-wide font-medium">Transaction ID</span>
                            </div>
                            <p className="font-mono text-sm bg-white/10 p-2 rounded text-white break-all">{order.transactionId}</p>
                          </div>
                        </div>
                      </div>

                      <div className="mt-6 bg-white/20 backdrop-blur-sm rounded-lg p-6 border border-white/30">
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
                    </CardContent>
                  </Card>

                  {/* Order Status Timeline */}
                  <Card className="shadow-xl overflow-hidden relative">
                    {/* Beautiful gradient background with delivery theme */}
                    <div className="absolute inset-0 bg-gradient-to-br from-orange-500 via-amber-500 to-yellow-500 opacity-90" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                    
                    {/* Decorative delivery elements */}
                    <div className="absolute top-6 right-6 w-24 h-24 bg-white/10 rounded-full blur-xl" />
                    <div className="absolute bottom-6 left-6 w-20 h-20 bg-yellow-300/20 rounded-full blur-lg" />
                    <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-orange-300/15 rounded-full blur-md" />
                    
                    <CardHeader className="relative z-10">
                      <CardTitle className="flex items-center space-x-3 text-white">
                        <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                          <Route className="h-6 w-6 text-white" />
                        </div>
                        <span className="text-xl font-semibold">Delivery Status</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="relative z-10">
                      <div className="space-y-6">
                        {statusSteps.map((step, index) => {
                          const StepIcon = step.icon;
                          const completed = isStepCompleted(index, order.status);
                          const active = isStepActive(index, order.status);

                          return (
                            <div key={step.key} className="flex items-start space-x-4">
                              <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center shadow-lg ${
                                completed 
                                  ? 'bg-emerald-500 text-white' 
                                  : active
                                  ? 'bg-white/30 backdrop-blur-sm text-white border-2 border-white'
                                  : 'bg-white/10 text-white/50'
                              }`}>
                                <StepIcon className="h-6 w-6" />
                              </div>
                              <div className="flex-1 bg-white/20 backdrop-blur-sm rounded-lg p-4 border border-white/30">
                                <h3 className={`font-semibold text-lg ${
                                  completed || active ? 'text-white' : 'text-white/60'
                                }`}>
                                  {step.label}
                                </h3>
                                <p className={`text-sm ${
                                  completed || active ? 'text-white/90' : 'text-white/50'
                                }`}>
                                  {step.description}
                                </p>
                              </div>
                              {completed && (
                                <div className="flex-shrink-0 w-8 h-8 bg-emerald-400/40 rounded-full flex items-center justify-center">
                                  <CheckCircle className="h-5 w-5 text-white" />
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {order.status === 'shipped' && (
                        <div className="mt-8 bg-blue-500/30 backdrop-blur-sm border border-blue-300/30 rounded-xl p-6">
                          <div className="flex items-center space-x-4 mb-3">
                            <div className="w-12 h-12 bg-blue-400/40 rounded-full flex items-center justify-center">
                              <Truck className="h-6 w-6 text-white" />
                            </div>
                            <h3 className="font-semibold text-white text-lg">Your Order is On the Way!</h3>
                          </div>
                          <p className="text-white/90 leading-relaxed">
                            Your fresh mangoes are being delivered and should arrive within 24-48 hours. 
                            Our delivery team will call you before arrival.
                          </p>
                        </div>
                      )}

                      {order.status === 'delivered' && (
                        <div className="mt-8 bg-green-500/30 backdrop-blur-sm border border-green-300/30 rounded-xl p-6">
                          <div className="flex items-center space-x-4 mb-3">
                            <div className="w-12 h-12 bg-green-400/40 rounded-full flex items-center justify-center">
                              <CheckCircle className="h-6 w-6 text-white" />
                            </div>
                            <h3 className="font-semibold text-white text-lg">Order Delivered!</h3>
                          </div>
                          <p className="text-white/90 leading-relaxed">
                            Your order has been successfully delivered. We hope you enjoy your fresh mangoes! 
                            Please rate your experience.
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              ))}

              {/* Contact Support */}
              <Card className="shadow-xl overflow-hidden relative">
                {/* Beautiful gradient background with support theme */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 opacity-90" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                
                {/* Decorative support elements */}
                <div className="absolute top-6 right-6 w-24 h-24 bg-white/10 rounded-full blur-xl" />
                <div className="absolute bottom-6 left-6 w-20 h-20 bg-red-300/20 rounded-full blur-lg" />
                <div className="absolute top-1/2 right-1/3 w-16 h-16 bg-purple-300/15 rounded-full blur-md" />
                
                <CardHeader className="relative z-10">
                  <CardTitle className="flex items-center space-x-3 text-white">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                      <Phone className="h-6 w-6 text-white" />
                    </div>
                    <span className="text-xl font-semibold">Need Help?</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative z-10">
                  <p className="text-white/90 mb-6 leading-relaxed">
                    If you have any questions about your order, our support team is here to help.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button
                      className="bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-lg shadow-lg flex-1"
                      onClick={() => window.open('https://wa.me/8801XXXXXXXXX', '_blank')}
                    >
                      <Phone className="h-4 w-4 mr-2" />
                      WhatsApp Support
                    </Button>
                    <Button
                      variant="outline"
                      className="border-white/30 text-white hover:bg-white/20 font-semibold py-3 px-6 rounded-lg flex-1"
                      onClick={() => window.open('tel:+8801XXXXXXXXX', '_self')}
                    >
                      <Phone className="h-4 w-4 mr-2" />
                      Call Support
                    </Button>
                    <Button
                      variant="outline"
                      className="border-white/30 text-white hover:bg-white/20 font-semibold py-3 px-6 rounded-lg flex-1"
                      onClick={() => window.open('mailto:support@mangoharvestbd.com', '_self')}
                    >
                      <Mail className="h-4 w-4 mr-2" />
                      Email Support
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}