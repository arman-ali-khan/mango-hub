'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Package, ArrowLeft, Upload, Calendar, Warehouse, DollarSign, Weight, Image } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store';
import { useToast } from '@/hooks/use-toast';
import { adminService } from '@/lib/adminService';
import Link from 'next/link';

const packageSchema = z.object({
  name: z.string().min(2, 'Package name must be at least 2 characters'),
  weight: z.string().min(1, 'Weight is required'),
  price: z.number().min(1, 'Price must be greater than 0'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  image_url: z.string().url('Please enter a valid image URL'),
  stock_quantity: z.number().min(0, 'Stock quantity cannot be negative'),
  low_stock_threshold: z.number().min(1, 'Low stock threshold must be at least 1'),
  seasonal_available: z.boolean(),
  season_start: z.string().optional(),
  season_end: z.string().optional(),
});

type PackageFormData = z.infer<typeof packageSchema>;

export default function CreatePackagePage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors }
  } = useForm<PackageFormData>({
    resolver: zodResolver(packageSchema),
    defaultValues: {
      stock_quantity: 100,
      low_stock_threshold: 10,
      seasonal_available: true,
    }
  });

  const watchSeasonalAvailable = watch('seasonal_available');

  if (!isAuthenticated || !user?.isAdmin) {
    router.push('/auth');
    return null;
  }

  const onSubmit = async (data: PackageFormData) => {
    try {
      setIsSubmitting(true);
      
      await adminService.createPackage({
        name: data.name,
        weight: data.weight,
        price: data.price,
        description: data.description,
        image_url: data.image_url,
        stock_quantity: data.stock_quantity,
        low_stock_threshold: data.low_stock_threshold,
        seasonal_available: data.seasonal_available,
      });

      toast({
        title: "Package Created",
        description: "New package has been created successfully.",
      });

      router.push('/admin');
    } catch (error: any) {
      toast({
        title: "Creation Failed",
        description: error.message || "Failed to create package. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Header />
      
      <main className="pt-20 pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-8"
          >
            <div className="flex items-center space-x-4 mb-6">
              <Link href="/admin">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
            </div>
            
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Create New <span className="text-indigo-600">Package</span>
              </h1>
              <p className="text-xl text-gray-600">
                Add a new mango package to your inventory
              </p>
            </div>
          </motion.div>

          {/* Form */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <Card className="shadow-xl overflow-hidden relative">
              {/* Beautiful gradient background */}
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 opacity-90" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              
              {/* Decorative elements */}
              <div className="absolute top-6 right-6 w-24 h-24 bg-white/10 rounded-full blur-xl" />
              <div className="absolute bottom-6 left-6 w-20 h-20 bg-pink-300/20 rounded-full blur-lg" />
              
              <CardHeader className="relative z-10">
                <CardTitle className="flex items-center space-x-3 text-white">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                    <Package className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-xl font-semibold">Package Details</span>
                </CardTitle>
              </CardHeader>
              
              <CardContent className="relative z-10">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                  {/* Basic Information */}
                  <div className="space-y-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                        <Package className="h-4 w-4 text-white" />
                      </div>
                      <h3 className="text-lg font-semibold text-white">Basic Information</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="name" className="text-white/90 font-medium">Package Name</Label>
                        <Input
                          id="name"
                          {...register('name')}
                          placeholder="e.g., 5KG Premium Pack"
                          className="mt-2 bg-white/20 border-white/30 text-white placeholder:text-white/60 focus:bg-white/30"
                        />
                        {errors.name && (
                          <p className="text-sm text-orange-200 mt-1">{errors.name.message}</p>
                        )}
                      </div>
                      
                      <div>
                        <Label htmlFor="weight" className="text-white/90 font-medium">Weight</Label>
                        <div className="relative">
                          <Weight className="absolute left-3 top-3 h-4 w-4 text-white/60" />
                          <Input
                            id="weight"
                            {...register('weight')}
                            placeholder="e.g., 5KG"
                            className="mt-2 pl-10 bg-white/20 border-white/30 text-white placeholder:text-white/60 focus:bg-white/30"
                          />
                        </div>
                        {errors.weight && (
                          <p className="text-sm text-orange-200 mt-1">{errors.weight.message}</p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="price" className="text-white/90 font-medium">Price (৳)</Label>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-3 h-4 w-4 text-white/60" />
                          <Input
                            id="price"
                            type="number"
                            {...register('price', { valueAsNumber: true })}
                            placeholder="1200"
                            className="mt-2 pl-10 bg-white/20 border-white/30 text-white placeholder:text-white/60 focus:bg-white/30"
                          />
                        </div>
                        {errors.price && (
                          <p className="text-sm text-orange-200 mt-1">{errors.price.message}</p>
                        )}
                      </div>
                      
                      <div>
                        <Label htmlFor="image_url" className="text-white/90 font-medium">Image URL</Label>
                        <div className="relative">
                          <Image className="absolute left-3 top-3 h-4 w-4 text-white/60" />
                          <Input
                            id="image_url"
                            {...register('image_url')}
                            placeholder="https://example.com/image.jpg"
                            className="mt-2 pl-10 bg-white/20 border-white/30 text-white placeholder:text-white/60 focus:bg-white/30"
                          />
                        </div>
                        {errors.image_url && (
                          <p className="text-sm text-orange-200 mt-1">{errors.image_url.message}</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="description" className="text-white/90 font-medium">Description</Label>
                      <Textarea
                        id="description"
                        {...register('description')}
                        placeholder="Describe the package features and benefits..."
                        className="mt-2 bg-white/20 border-white/30 text-white placeholder:text-white/60 focus:bg-white/30"
                        rows={3}
                      />
                      {errors.description && (
                        <p className="text-sm text-orange-200 mt-1">{errors.description.message}</p>
                      )}
                    </div>
                  </div>

                  {/* Inventory Management */}
                  <div className="space-y-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                        <Warehouse className="h-4 w-4 text-white" />
                      </div>
                      <h3 className="text-lg font-semibold text-white">Inventory Management</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="stock_quantity" className="text-white/90 font-medium">Stock Quantity</Label>
                        <Input
                          id="stock_quantity"
                          type="number"
                          {...register('stock_quantity', { valueAsNumber: true })}
                          placeholder="100"
                          className="mt-2 bg-white/20 border-white/30 text-white placeholder:text-white/60 focus:bg-white/30"
                        />
                        {errors.stock_quantity && (
                          <p className="text-sm text-orange-200 mt-1">{errors.stock_quantity.message}</p>
                        )}
                      </div>
                      
                      <div>
                        <Label htmlFor="low_stock_threshold" className="text-white/90 font-medium">Low Stock Alert Threshold</Label>
                        <Input
                          id="low_stock_threshold"
                          type="number"
                          {...register('low_stock_threshold', { valueAsNumber: true })}
                          placeholder="10"
                          className="mt-2 bg-white/20 border-white/30 text-white placeholder:text-white/60 focus:bg-white/30"
                        />
                        {errors.low_stock_threshold && (
                          <p className="text-sm text-orange-200 mt-1">{errors.low_stock_threshold.message}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Seasonal Availability */}
                  <div className="space-y-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                        <Calendar className="h-4 w-4 text-white" />
                      </div>
                      <h3 className="text-lg font-semibold text-white">Seasonal Availability</h3>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <Switch
                        id="seasonal_available"
                        checked={watchSeasonalAvailable}
                        onCheckedChange={(checked) => setValue('seasonal_available', checked)}
                      />
                      <Label htmlFor="seasonal_available" className="text-white/90 font-medium">
                        Available Year Round
                      </Label>
                    </div>

                    {!watchSeasonalAvailable && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <Label htmlFor="season_start" className="text-white/90 font-medium">Season Start Date</Label>
                          <Input
                            id="season_start"
                            type="date"
                            {...register('season_start')}
                            className="mt-2 bg-white/20 border-white/30 text-white focus:bg-white/30"
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="season_end" className="text-white/90 font-medium">Season End Date</Label>
                          <Input
                            id="season_end"
                            type="date"
                            {...register('season_end')}
                            className="mt-2 bg-white/20 border-white/30 text-white focus:bg-white/30"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Submit Button */}
                  <div className="flex space-x-4">
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 bg-white text-purple-600 hover:bg-white/90 py-4 text-lg font-semibold rounded-lg shadow-lg"
                    >
                      {isSubmitting ? 'Creating Package...' : 'Create Package'}
                    </Button>
                    
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.push('/admin')}
                      className="border-white/30 text-white hover:bg-white/20 py-4 px-8"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}