'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { CreditCard, Smartphone, CheckCircle, AlertCircle, Wallet, DollarSign } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/lib/store';
import { addOrder, setCurrentOrder } from '@/lib/slices/orderSlice';
import { useToast } from '@/hooks/use-toast';
import { orderService } from '@/lib/orderService';

const paymentSchema = z.object({
  paymentMethod: z.string().min(1, 'Please select a payment method'),
  transactionId: z.string().min(5, 'Please enter a valid transaction ID'),
  amount: z.number().min(1, 'Please enter the payment amount'),
});

type PaymentFormData = z.infer<typeof paymentSchema>;

const paymentMethods = [
  {
    id: 'bkash',
    name: 'bKash',
    icon: '💳',
    number: '01XXXXXXXXX',
    color: 'bg-pink-500',
    instructions: 'Send money to 01XXXXXXXXX and enter the transaction ID'
  },
  {
    id: 'nagad',
    name: 'Nagad',
    icon: '📱',
    number: '01XXXXXXXXX', 
    color: 'bg-orange-500',
    instructions: 'Send money to 01XXXXXXXXX and enter the transaction ID'
  },
  {
    id: 'rocket',
    name: 'Rocket',
    icon: '🚀',
    number: '01XXXXXXXXX-X',
    color: 'bg-purple-500',
    instructions: 'Send money to 01XXXXXXXXX-X and enter the transaction ID'
  },
  {
    id: 'upay',
    name: 'Upay',
    icon: '💰',
    number: '01XXXXXXXXX',
    color: 'bg-blue-500',
    instructions: 'Send money to 01XXXXXXXXX and enter the transaction ID'
  }
];

export default function PaymentPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { toast } = useToast();
  const { currentOrder } = useSelector((state: RootState) => state.order);
  
  const [selectedMethod, setSelectedMethod] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      amount: currentOrder?.totalAmount || 0,
    }
  });

  const watchedMethod = watch('paymentMethod');
  const selectedPaymentMethod = paymentMethods.find(method => method.id === watchedMethod);

  if (!currentOrder) {
    router.push('/order');
    return null;
  }

  const onSubmit = async (data: PaymentFormData) => {
    try {
      console.log('🚀 Processing payment and creating order...');
      
      // Validate payment amount matches order total
      if (data.amount !== currentOrder.totalAmount) {
        toast({
          title: "Payment Amount Mismatch",
          description: `Please enter the exact amount: ৳${currentOrder.totalAmount}`,
          variant: "destructive",
        });
        return;
      }

      // Create order in database
      const orderData = {
        customerName: currentOrder.customerName,
        customerEmail: currentOrder.customerEmail,
        customerPhone: currentOrder.customerPhone,
        shippingAddress: currentOrder.shippingAddress,
        packageType: currentOrder.packageType,
        quantity: currentOrder.quantity,
        totalAmount: currentOrder.totalAmount,
        paymentMethod: data.paymentMethod,
        transactionId: data.transactionId,
      };

      const createdOrder = await orderService.createOrder(orderData);
      
      // Update Redux state with the created order
      dispatch(addOrder(createdOrder));
      dispatch(setCurrentOrder(createdOrder));
      
      toast({
        title: "Order Placed Successfully!",
        description: "We'll verify your payment and process your order within 24 hours.",
      });

      // Redirect to order confirmation with the actual order ID from database
      router.push(`/order-confirmation?orderId=${createdOrder.id}`);
    } catch (error: any) {
      console.error('❌ Error processing payment:', error);
      toast({
        title: "Order Creation Failed",
        description: error.message || "There was a problem creating your order. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-orange-50">
      <Header />
      
      <main className="pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Complete Your <span className="text-emerald-500">Payment</span>
            </h1>
            <p className="text-xl text-gray-600">
              Choose your preferred mobile banking method and complete the payment
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Payment Form */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <Card className="shadow-xl overflow-hidden relative">
                  {/* Beautiful gradient background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 opacity-90" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                  
                  {/* Decorative elements */}
                  <div className="absolute top-6 right-6 w-24 h-24 bg-white/10 rounded-full blur-xl" />
                  <div className="absolute bottom-6 left-6 w-20 h-20 bg-pink-300/20 rounded-full blur-lg" />
                  <div className="absolute top-1/3 right-1/4 w-16 h-16 bg-indigo-300/15 rounded-full blur-md" />
                  
                  <CardHeader className="relative z-10">
                    <CardTitle className="flex items-center space-x-3 text-white">
                      <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                        <CreditCard className="h-6 w-6 text-white" />
                      </div>
                      <span className="text-xl font-semibold">Payment Information</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="relative z-10">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                      {/* Payment Method Selection */}
                      <div className="space-y-6">
                        <div className="flex items-center space-x-3 mb-4">
                          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                            <Wallet className="h-4 w-4 text-white" />
                          </div>
                          <Label className="text-lg font-semibold text-white">Select Payment Method</Label>
                        </div>
                        <RadioGroup
                          value={watchedMethod}
                          onValueChange={(value) => {
                            setValue('paymentMethod', value);
                            setSelectedMethod(value);
                          }}
                          className="grid grid-cols-1 md:grid-cols-2 gap-4"
                        >
                          {paymentMethods.map((method) => (
                            <div key={method.id}>
                              <RadioGroupItem
                                value={method.id}
                                id={method.id}
                                className="sr-only"
                              />
                              <Label
                                htmlFor={method.id}
                                className={`flex items-center space-x-4 p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 ${
                                  watchedMethod === method.id
                                    ? 'border-white bg-white/20 backdrop-blur-sm shadow-lg'
                                    : 'border-white/30 hover:border-white/50 hover:bg-white/10'
                                }`}
                              >
                                <div className={`w-12 h-12 rounded-full ${method.color} flex items-center justify-center text-white text-xl shadow-lg`}>
                                  {method.icon}
                                </div>
                                <div>
                                  <div className="font-semibold text-white text-lg">{method.name}</div>
                                  <div className="text-sm text-white/70">{method.number}</div>
                                </div>
                                {watchedMethod === method.id && (
                                  <div className="ml-auto">
                                    <CheckCircle className="h-6 w-6 text-white" />
                                  </div>
                                )}
                              </Label>
                            </div>
                          ))}
                        </RadioGroup>
                        {errors.paymentMethod && (
                          <p className="text-sm text-orange-200">{errors.paymentMethod.message}</p>
                        )}
                      </div>

                      {/* Payment Instructions */}
                      {selectedPaymentMethod && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="bg-white/20 backdrop-blur-sm p-6 rounded-xl border border-white/30"
                        >
                          <div className="flex items-start space-x-4">
                            <div className="w-10 h-10 bg-blue-400/40 rounded-full flex items-center justify-center">
                              <AlertCircle className="h-5 w-5 text-white" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-white mb-3 text-lg">Payment Instructions</h3>
                              <ol className="list-decimal list-inside space-y-2 text-sm text-white/90">
                                <li>Open your {selectedPaymentMethod.name} app</li>
                                <li>Send ৳{currentOrder.totalAmount} to {selectedPaymentMethod.number}</li>
                                <li>Copy the transaction ID from the confirmation message</li>
                                <li>Paste the transaction ID in the field below</li>
                                <li>Click "Complete Order" to finish</li>
                              </ol>
                            </div>
                          </div>
                        </motion.div>
                      )}

                      {/* Transaction Details */}
                      {watchedMethod && (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="space-y-6"
                        >
                          <div className="flex items-center space-x-3 mb-4">
                            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                              <DollarSign className="h-4 w-4 text-white" />
                            </div>
                            <h3 className="text-lg font-semibold text-white">Transaction Details</h3>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <Label htmlFor="transactionId" className="text-white/90 font-medium">Transaction ID</Label>
                              <Input
                                id="transactionId"
                                {...register('transactionId')}
                                placeholder="Enter transaction ID"
                                className="mt-2 bg-white/20 border-white/30 text-white placeholder:text-white/60 focus:bg-white/30 focus:border-white/50"
                              />
                              {errors.transactionId && (
                                <p className="text-sm text-orange-200 mt-1">{errors.transactionId.message}</p>
                              )}
                            </div>
                            
                            <div>
                              <Label htmlFor="amount" className="text-white/90 font-medium">Amount Paid (৳)</Label>
                              <Input
                                id="amount"
                                type="number"
                                {...register('amount', { valueAsNumber: true })}
                                placeholder={`Enter ${currentOrder.totalAmount}`}
                                className="mt-2 bg-white/20 border-white/30 text-white placeholder:text-white/60 focus:bg-white/30 focus:border-white/50"
                              />
                              {errors.amount && (
                                <p className="text-sm text-orange-200 mt-1">{errors.amount.message}</p>
                              )}
                              <p className="text-xs text-white/70 mt-1">
                                Must match order total: ৳{currentOrder.totalAmount}
                              </p>
                            </div>
                          </div>

                          <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full bg-white text-purple-600 hover:bg-white/90 py-4 text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
                          >
                            {isSubmitting ? 'Creating Order...' : 'Complete Order'}
                          </Button>
                        </motion.div>
                      )}
                    </form>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                <Card className="shadow-xl sticky overflow-hidden relative">
                  {/* Beautiful gradient background - complementary to payment form */}
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-500 opacity-90" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                  
                  {/* Decorative elements */}
                  <div className="absolute top-4 right-4 w-20 h-20 bg-white/10 rounded-full blur-xl" />
                  <div className="absolute bottom-4 left-4 w-16 h-16 bg-cyan-300/20 rounded-full blur-lg" />
                  
                  <CardHeader className="relative z-10">
                    <CardTitle className="flex items-center space-x-3 text-white">
                      <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                        <CheckCircle className="h-6 w-6 text-white" />
                      </div>
                      <span className="text-xl font-semibold">Order Summary</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6 relative z-10">
                    <div className="space-y-4">
                      <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 border border-white/30">
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-white/80 font-medium">Customer:</span>
                          <span className="font-semibold text-white">{currentOrder.customerName}</span>
                        </div>
                        
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-white/80 font-medium">Package:</span>
                          <span className="font-semibold text-white">{currentOrder.packageType}</span>
                        </div>
                        
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-white/80 font-medium">Quantity:</span>
                          <span className="font-semibold text-white">{currentOrder.quantity}</span>
                        </div>
                        
                        <div className="flex justify-between text-sm">
                          <span className="text-white/80 font-medium">Phone:</span>
                          <span className="font-semibold text-white">{currentOrder.customerPhone}</span>
                        </div>
                      </div>

                      <div className="bg-white/30 backdrop-blur-sm rounded-lg p-6 border border-white/40">
                        <div className="flex justify-between items-center">
                          <span className="text-lg font-bold text-white">Total Amount:</span>
                          <span className="text-3xl font-bold text-white">৳{currentOrder.totalAmount}</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-yellow-400/20 backdrop-blur-sm p-6 rounded-xl border border-yellow-300/30">
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-yellow-400/40 rounded-full flex items-center justify-center">
                          <AlertCircle className="h-4 w-4 text-white" />
                        </div>
                        <div className="text-sm text-white">
                          <p className="font-semibold mb-2">Important:</p>
                          <p className="leading-relaxed">
                            Your order will be verified within 24 hours after payment confirmation. 
                            We'll call you to confirm delivery details.
                          </p>
                        </div>
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