'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ShoppingCart, Package, User, MapPin, Star, Check } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/lib/store';
import { setCurrentOrder } from '@/lib/slices/orderSlice';

const orderSchema = z.object({
  customerName: z.string().min(2, 'Name must be at least 2 characters'),
  customerPhone: z.string().min(11, 'Please enter a valid phone number'),
  customerEmail: z.string().email('Please enter a valid email address'),
  shippingAddress: z.string().min(10, 'Please enter a complete address'),
  packageType: z.string().min(1, 'Please select a package'),
  quantity: z.number().min(1, 'Quantity must be at least 1'),
});

type OrderFormData = z.infer<typeof orderSchema>;

const packages = [
  { id: 'package-5kg', name: '5KG Premium Pack', price: 1200, weight: '5KG' },
  { id: 'package-10kg', name: '10KG Family Pack', price: 2200, weight: '10KG' },
  { id: 'package-20kg', name: '20KG Bulk Pack', price: 4000, weight: '20KG' },
];

export default function OrderPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  
  const selectedPackageId = searchParams.get('package');
  const selectedPackage = packages.find(pkg => pkg.id === selectedPackageId) || packages[1];

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm<OrderFormData>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      packageType: selectedPackage.id,
      quantity: 1,
      customerName: user?.name || '',
      customerEmail: user?.email || '',
      customerPhone: user?.phone || '',
      shippingAddress: user?.address || '',
    }
  });

  const watchedPackageType = watch('packageType');
  const watchedQuantity = watch('quantity');
  
  const currentPackage = packages.find(pkg => pkg.id === watchedPackageType) || packages[0];
  const totalAmount = currentPackage.price * watchedQuantity;

  const onSubmit = async (data: OrderFormData) => {
    try {
      // Create order object
      const order = {
        id: `order-${Date.now()}`,
        ...data,
        totalAmount,
        paymentMethod: '',
        transactionId: '',
        status: 'pending' as const,
        orderDate: new Date().toISOString(),
      };

      dispatch(setCurrentOrder(order));
      
      // Redirect to payment page
      router.push('/payment');
    } catch (error) {
      console.error('Error creating order:', error);
    }
  };

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
              Place Your <span className="text-emerald-500">Order</span>
            </h1>
            <p className="text-xl text-gray-600">
              Fill in your details and we'll deliver fresh mangoes to your doorstep
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Order Form */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <Card className="shadow-xl overflow-hidden relative">
                  {/* Beautiful gradient background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-purple-600 to-emerald-500 opacity-90" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                  
                  {/* Decorative elements */}
                  <div className="absolute top-6 right-6 w-24 h-24 bg-white/10 rounded-full blur-xl" />
                  <div className="absolute bottom-6 left-6 w-20 h-20 bg-emerald-300/20 rounded-full blur-lg" />
                  <div className="absolute top-1/3 right-1/4 w-16 h-16 bg-purple-300/15 rounded-full blur-md" />
                  
                  <CardHeader className="relative z-10">
                    <CardTitle className="flex items-center space-x-3 text-white">
                      <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                        <User className="h-6 w-6 text-white" />
                      </div>
                      <span className="text-xl font-semibold">Order Information</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="relative z-10">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                      {/* Personal Information */}
                      <div className="space-y-6">
                        <div className="flex items-center space-x-3 mb-4">
                          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                            <User className="h-4 w-4 text-white" />
                          </div>
                          <h3 className="text-lg font-semibold text-white">Personal Information</h3>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <Label htmlFor="customerName" className="text-white/90 font-medium">Full Name</Label>
                            <Input
                              id="customerName"
                              {...register('customerName')}
                              placeholder="Enter your full name"
                              className="mt-2 bg-white/20 border-white/30 text-white placeholder:text-white/60 focus:bg-white/30 focus:border-white/50"
                            />
                            {errors.customerName && (
                              <p className="text-sm text-orange-200 mt-1">{errors.customerName.message}</p>
                            )}
                          </div>
                          
                          <div>
                            <Label htmlFor="customerPhone" className="text-white/90 font-medium">Phone Number</Label>
                            <Input
                              id="customerPhone"
                              {...register('customerPhone')}
                              placeholder="01XXXXXXXXX"
                              className="mt-2 bg-white/20 border-white/30 text-white placeholder:text-white/60 focus:bg-white/30 focus:border-white/50"
                            />
                            {errors.customerPhone && (
                              <p className="text-sm text-orange-200 mt-1">{errors.customerPhone.message}</p>
                            )}
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="customerEmail" className="text-white/90 font-medium">Email Address</Label>
                          <Input
                            id="customerEmail"
                            type="email"
                            {...register('customerEmail')}
                            placeholder="your.email@example.com"
                            className="mt-2 bg-white/20 border-white/30 text-white placeholder:text-white/60 focus:bg-white/30 focus:border-white/50"
                          />
                          {errors.customerEmail && (
                            <p className="text-sm text-orange-200 mt-1">{errors.customerEmail.message}</p>
                          )}
                        </div>
                      </div>

                      {/* Shipping Information */}
                      <div className="space-y-6">
                        <div className="flex items-center space-x-3 mb-4">
                          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                            <MapPin className="h-4 w-4 text-white" />
                          </div>
                          <h3 className="text-lg font-semibold text-white">Shipping Information</h3>
                        </div>
                        
                        <div>
                          <Label htmlFor="shippingAddress" className="text-white/90 font-medium">Complete Address</Label>
                          <Textarea
                            id="shippingAddress"
                            {...register('shippingAddress')}
                            placeholder="House/Flat No, Road, Area, District"
                            className="mt-2 bg-white/20 border-white/30 text-white placeholder:text-white/60 focus:bg-white/30 focus:border-white/50"
                            rows={3}
                          />
                          {errors.shippingAddress && (
                            <p className="text-sm text-orange-200 mt-1">{errors.shippingAddress.message}</p>
                          )}
                        </div>
                      </div>

                      {/* Package Selection */}
                      <div className="space-y-6">
                        <div className="flex items-center space-x-3 mb-4">
                          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                            <Package className="h-4 w-4 text-white" />
                          </div>
                          <h3 className="text-lg font-semibold text-white">Package Selection</h3>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <Label htmlFor="packageType" className="text-white/90 font-medium">Package Type</Label>
                            <Select 
                              value={watchedPackageType} 
                              onValueChange={(value) => setValue('packageType', value)}
                            >
                              <SelectTrigger className="mt-2 bg-white/20 border-white/30 text-white focus:bg-white/30 focus:border-white/50">
                                <SelectValue placeholder="Select a package" />
                              </SelectTrigger>
                              <SelectContent>
                                {packages.map((pkg) => (
                                  <SelectItem key={pkg.id} value={pkg.id}>
                                    {pkg.name} - ৳{pkg.price}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            {errors.packageType && (
                              <p className="text-sm text-orange-200 mt-1">{errors.packageType.message}</p>
                            )}
                          </div>
                          
                          <div>
                            <Label htmlFor="quantity" className="text-white/90 font-medium">Quantity</Label>
                            <Input
                              id="quantity"
                              type="number"
                              min="1"
                              max="10"
                              {...register('quantity', { valueAsNumber: true })}
                              className="mt-2 bg-white/20 border-white/30 text-white placeholder:text-white/60 focus:bg-white/30 focus:border-white/50"
                            />
                            {errors.quantity && (
                              <p className="text-sm text-orange-200 mt-1">{errors.quantity.message}</p>
                            )}
                          </div>
                        </div>
                      </div>

                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-white text-purple-600 hover:bg-white/90 py-4 text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
                      >
                        {isSubmitting ? 'Processing...' : 'Proceed to Payment'}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                <Card className="shadow-xl sticky top-24 overflow-hidden relative">
                  {/* Beautiful gradient background - complementary to order form */}
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-500 via-pink-500 to-purple-600 opacity-90" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                  
                  {/* Decorative elements */}
                  <div className="absolute top-4 right-4 w-20 h-20 bg-white/10 rounded-full blur-xl" />
                  <div className="absolute bottom-4 left-4 w-16 h-16 bg-yellow-300/20 rounded-full blur-lg" />
                  
                  <CardHeader className="relative z-10">
                    <CardTitle className="flex items-center space-x-3 text-white">
                      <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                        <ShoppingCart className="h-6 w-6 text-white" />
                      </div>
                      <span className="text-xl font-semibold">Order Summary</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6 relative z-10">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center py-3 border-b border-white/20">
                        <span className="text-white/80 font-medium">Package:</span>
                        <span className="font-semibold text-white">{currentPackage.name}</span>
                      </div>
                      
                      <div className="flex justify-between items-center py-3 border-b border-white/20">
                        <span className="text-white/80 font-medium">Weight:</span>
                        <span className="font-semibold text-white">{currentPackage.weight}</span>
                      </div>
                      
                      <div className="flex justify-between items-center py-3 border-b border-white/20">
                        <span className="text-white/80 font-medium">Price per unit:</span>
                        <span className="font-semibold text-white">৳{currentPackage.price}</span>
                      </div>
                      
                      <div className="flex justify-between items-center py-3 border-b border-white/20">
                        <span className="text-white/80 font-medium">Quantity:</span>
                        <span className="font-semibold text-white">{watchedQuantity}</span>
                      </div>
                      
                      <div className="flex justify-between items-center py-4 border-t-2 border-white/30 bg-white/10 rounded-lg px-4 -mx-2">
                        <span className="text-lg font-bold text-white">Total:</span>
                        <span className="text-2xl font-bold text-white">৳{totalAmount}</span>
                      </div>
                    </div>

                    <div className="bg-white/20 backdrop-blur-sm p-6 rounded-xl border border-white/30 space-y-3">
                      <div className="flex items-center text-sm text-white">
                        <div className="w-5 h-5 bg-green-400 rounded-full flex items-center justify-center mr-3">
                          <Check className="h-3 w-3 text-white" />
                        </div>
                        <span className="font-semibold">Free delivery above ৳2000</span>
                      </div>
                      <div className="flex items-center text-sm text-white">
                        <div className="w-5 h-5 bg-green-400 rounded-full flex items-center justify-center mr-3">
                          <Check className="h-3 w-3 text-white" />
                        </div>
                        <span className="font-semibold">Fresh guarantee</span>
                      </div>
                      <div className="flex items-center text-sm text-white">
                        <div className="w-5 h-5 bg-green-400 rounded-full flex items-center justify-center mr-3">
                          <Check className="h-3 w-3 text-white" />
                        </div>
                        <span className="font-semibold">24-48 hour delivery</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}