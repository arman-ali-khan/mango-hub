'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Clock, CheckCircle, Truck, Edit, X, Save, AlertTriangle, MessageCircle, Calendar, CreditCard } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useDispatch } from 'react-redux';
import { updateOrderInState } from '@/lib/slices/orderSlice';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { adminService } from '@/lib/adminService';

const orderUpdateSchema = z.object({
  transactionId: z.string().min(5, 'Transaction ID must be at least 5 characters'),
  paymentMethod: z.string().min(1, 'Please select a payment method'),
});

type OrderUpdateFormData = z.infer<typeof orderUpdateSchema>;

interface OrderCardProps {
  order: {
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
  };
}

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  verified: 'bg-blue-100 text-blue-800',
  shipped: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

const statusIcons = {
  pending: Clock,
  verified: CheckCircle,
  shipped: Truck,
  delivered: CheckCircle,
  cancelled: Clock,
};

const paymentMethods = [
  { id: 'bkash', name: 'bKash', icon: '💳' },
  { id: 'nagad', name: 'Nagad', icon: '📱' },
  { id: 'rocket', name: 'Rocket', icon: '🚀' },
  { id: 'upay', name: 'Upay', icon: '💰' },
];

export function OrderCard({ order }: OrderCardProps) {
  const [editingOrder, setEditingOrder] = useState(false);
  const [latestComment, setLatestComment] = useState<string | null>(null);
  const [loadingComment, setLoadingComment] = useState(false);
  const dispatch = useDispatch();
  const { toast } = useToast();

  const StatusIcon = statusIcons[order.status];

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm<OrderUpdateFormData>({
    resolver: zodResolver(orderUpdateSchema),
  });

  // Load latest comment automatically when component mounts
  useEffect(() => {
    loadLatestComment();
  }, [order.id]);

  const loadLatestComment = async () => {
    try {
      setLoadingComment(true);
      const comments = await adminService.getOrderComments(order.id);
      
      if (comments && comments.length > 0) {
        // Get the most recent comment
        setLatestComment(comments[0].comment);
      }
    } catch (error) {
      // Silently fail for comments as it's not critical
      console.log('Could not load comments:', error);
    } finally {
      setLoadingComment(false);
    }
  };

  const canEditOrder = (orderDate: string) => {
    const orderTime = new Date(orderDate);
    const now = new Date();
    const hoursDiff = (now.getTime() - orderTime.getTime()) / (1000 * 60 * 60);
    return hoursDiff <= 1;
  };

  const canCancelOrder = (orderDate: string, status: string) => {
    if (status === 'shipped' || status === 'delivered' || status === 'cancelled') {
      return false;
    }
    return canEditOrder(orderDate);
  };

  const openEditOrder = () => {
    setEditingOrder(true);
    setValue('transactionId', order.transactionId);
    setValue('paymentMethod', order.paymentMethod);
  };

  const onUpdateOrder = async (data: OrderUpdateFormData) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({
          transaction_id: data.transactionId,
          payment_method: data.paymentMethod,
          updated_at: new Date().toISOString(),
        })
        .eq('id', order.id);

      if (error) throw error;

      // Update local state
      dispatch(updateOrderInState({
        id: order.id,
        updates: {
          transactionId: data.transactionId,
          paymentMethod: data.paymentMethod,
        }
      }));

      toast({
        title: "Order Updated",
        description: "Your order details have been updated successfully.",
      });

      setEditingOrder(false);
      reset();
    } catch (error: any) {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update order. Please try again.",
        variant: "destructive",
      });
    }
  };

  const cancelOrder = async () => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({
          status: 'cancelled',
          updated_at: new Date().toISOString(),
        })
        .eq('id', order.id);

      if (error) throw error;

      // Update local state
      dispatch(updateOrderInState({
        id: order.id,
        updates: { status: 'cancelled' }
      }));

      toast({
        title: "Order Cancelled",
        description: "Your order has been cancelled successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Cancellation Failed",
        description: error.message || "Failed to cancel order. Please try again.",
        variant: "destructive",
      });
    }
  };

  const canEdit = canEditOrder(order.orderDate);
  const canCancel = canCancelOrder(order.orderDate, order.status);

  return (
    <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl p-6 hover:bg-white/30 transition-all duration-300 hover:shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 bg-white/30 rounded-full flex items-center justify-center">
            <StatusIcon className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="font-semibold text-white text-lg">Order #{order.id.slice(-8)}</p>
            <div className="flex items-center space-x-3 text-sm text-white/70">
              <div className="flex items-center space-x-1">
                <Calendar className="h-3 w-3" />
                <span>
                  {new Date(order.orderDate).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
            </div>
            
            {/* Transaction ID moved under order date */}
            <div className="flex items-center space-x-1 text-xs text-white/60 mt-1">
              <CreditCard className="h-3 w-3" />
              <span className="font-mono">TXN: {order.transactionId}</span>
            </div>

            {/* Latest Admin Comment - Show automatically */}
            {loadingComment ? (
              <div className="flex items-center space-x-2 text-white/60 mt-2">
                <div className="animate-spin rounded-full h-3 w-3 border-b border-white/60"></div>
                <span className="text-xs">Loading comment...</span>
              </div>
            ) : latestComment ? (
              <div className="mt-2 bg-white/10 rounded-lg p-2 border border-white/20 max-w-md">
                <div className="flex items-start space-x-2">
                  <MessageCircle className="h-3 w-3 text-blue-300 mt-0.5 flex-shrink-0" />
                  <p className="text-white/90 text-xs leading-relaxed">{latestComment}</p>
                </div>
              </div>
            ) : null}
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Badge className={`${statusColors[order.status]} font-semibold px-3 py-1`}>
            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
          </Badge>
          
          {/* Edit Order Button */}
          {canEdit && order.status === 'pending' && (
            <Dialog open={editingOrder} onOpenChange={setEditingOrder}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-white/30 text-white hover:bg-white/20"
                  onClick={openEditOrder}
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Update Order Details</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(onUpdateOrder)} className="space-y-4">
                  <div>
                    <Label htmlFor="paymentMethod">Payment Method</Label>
                    <Select
                      value={register('paymentMethod').value}
                      onValueChange={(value) => setValue('paymentMethod', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select payment method" />
                      </SelectTrigger>
                      <SelectContent>
                        {paymentMethods.map((method) => (
                          <SelectItem key={method.id} value={method.id}>
                            <div className="flex items-center space-x-2">
                              <span>{method.icon}</span>
                              <span>{method.name}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.paymentMethod && (
                      <p className="text-sm text-red-500 mt-1">
                        {errors.paymentMethod.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="transactionId">Transaction ID</Label>
                    <Input
                      id="transactionId"
                      {...register('transactionId')}
                      placeholder="Enter new transaction ID"
                    />
                    {errors.transactionId && (
                      <p className="text-sm text-red-500 mt-1">
                        {errors.transactionId.message}
                      </p>
                    )}
                  </div>

                  <div className="bg-blue-50 p-3 rounded-lg">
                    <div className="flex items-start space-x-2">
                      <AlertTriangle className="h-4 w-4 text-blue-600 mt-0.5" />
                      <div className="text-sm text-blue-800">
                        <p className="font-medium">Important:</p>
                        <p>You can only update order details within 1 hour of placing the order.</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex space-x-3">
                    <Button
                      type="submit"
                      className="flex-1"
                      disabled={isSubmitting}
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {isSubmitting ? 'Updating...' : 'Update Order'}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setEditingOrder(false);
                        reset();
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          )}

          {/* Cancel Order Button */}
          {canCancel && (
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-red-300 text-red-600 hover:bg-red-50"
                >
                  <X className="h-4 w-4 mr-1" />
                  Cancel
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Cancel Order</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="bg-red-50 p-4 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-red-900">Are you sure?</h4>
                        <p className="text-sm text-red-700 mt-1">
                          This action cannot be undone. Your order will be cancelled and you'll need to place a new order if you change your mind.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>Order Details:</strong><br />
                      Order #{order.id.slice(-8)}<br />
                      Amount: ৳{order.totalAmount}<br />
                      Package: {order.packageType}
                    </p>
                  </div>

                  <div className="flex space-x-3">
                    <Button
                      onClick={cancelOrder}
                      className="flex-1 bg-red-600 hover:bg-red-700"
                    >
                      Yes, Cancel Order
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1"
                    >
                      Keep Order
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-4">
        <div className="bg-white/10 rounded-lg p-3">
          <p className="text-xs text-white/60 uppercase tracking-wide font-medium">Package</p>
          <p className="font-semibold text-white mt-1">{order.packageType}</p>
        </div>
        <div className="bg-white/10 rounded-lg p-3">
          <p className="text-xs text-white/60 uppercase tracking-wide font-medium">Quantity</p>
          <p className="font-semibold text-white mt-1">{order.quantity}</p>
        </div>
        <div className="bg-white/10 rounded-lg p-3">
          <p className="text-xs text-white/60 uppercase tracking-wide font-medium">Amount</p>
          <p className="font-bold text-white text-lg mt-1">৳{order.totalAmount}</p>
        </div>
        <div className="bg-white/10 rounded-lg p-3">
          <p className="text-xs text-white/60 uppercase tracking-wide font-medium">Payment</p>
          <p className="font-semibold text-white capitalize mt-1">{order.paymentMethod}</p>
        </div>
      </div>

      {/* Time-based notifications */}
      {canEdit && order.status === 'pending' && (
        <div className="bg-blue-500/30 backdrop-blur-sm border border-blue-300/30 rounded-lg p-4 mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-400/40 rounded-full flex items-center justify-center">
              <Clock className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="text-white font-semibold">Order can be edited</p>
              <p className="text-white/80 text-sm">You can update payment details or cancel within 1 hour of placing the order.</p>
            </div>
          </div>
        </div>
      )}

      {order.status === 'shipped' && (
        <div className="bg-blue-500/30 backdrop-blur-sm border border-blue-300/30 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-400/40 rounded-full flex items-center justify-center">
              <Truck className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="text-white font-semibold">Your order is on the way!</p>
              <p className="text-white/80 text-sm">Expected delivery within 24-48 hours.</p>
            </div>
          </div>
        </div>
      )}

      {order.status === 'delivered' && (
        <div className="bg-green-500/30 backdrop-blur-sm border border-green-300/30 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-green-400/40 rounded-full flex items-center justify-center">
              <CheckCircle className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="text-white font-semibold">Order delivered successfully!</p>
              <p className="text-white/80 text-sm">We hope you enjoyed your fresh mangoes.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}