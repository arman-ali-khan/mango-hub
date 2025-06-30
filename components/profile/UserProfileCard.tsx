'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Edit, LogOut, Phone, Mail, MapPin } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useDispatch } from 'react-redux';
import { clearUser } from '@/lib/slices/authSlice';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().min(11, 'Please enter a valid phone number'),
  address: z.string().min(10, 'Please enter a complete address'),
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface UserProfileCardProps {
  user: {
    id: string;
    email: string;
    name: string;
    phone?: string;
    address?: string;
    isAdmin?: boolean;
  };
}

export function UserProfileCard({ user }: UserProfileCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const dispatch = useDispatch();
  const { toast } = useToast();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user.name || '',
      phone: user.phone || '',
      address: user.address || '',
    }
  });

  const onUpdateProfile = async (data: ProfileFormData) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          name: data.name,
          phone: data.phone,
          address: data.address,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      });

      setIsEditing(false);
    } catch (error: any) {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      dispatch(clearUser());
      router.push('/');
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to logout. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8, delay: 0.2 }}
    >
      <Card className="shadow-xl overflow-hidden relative">
        {/* Beautiful gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 via-emerald-600 to-orange-500 opacity-90" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        
        {/* Decorative elements */}
        <div className="absolute top-4 right-4 w-20 h-20 bg-white/10 rounded-full blur-xl" />
        <div className="absolute bottom-4 left-4 w-16 h-16 bg-orange-300/20 rounded-full blur-lg" />
        
        <CardHeader className="relative z-10">
          <CardTitle className="flex items-center justify-between text-white">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                <User className="h-6 w-6 text-white" />
              </div>
              <span className="text-lg font-semibold">Profile Information</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditing(!isEditing)}
              className="text-white hover:bg-white/20 transition-colors"
            >
              <Edit className="h-4 w-4" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="relative z-10">
          {isEditing ? (
            <form onSubmit={handleSubmit(onUpdateProfile)} className="space-y-4">
              <div>
                <Label htmlFor="name" className="text-white/90">Full Name</Label>
                <Input
                  id="name"
                  {...register('name')}
                  className="mt-1 bg-white/20 border-white/30 text-white placeholder:text-white/60 focus:bg-white/30"
                />
                {errors.name && (
                  <p className="text-sm text-orange-200 mt-1">{errors.name.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="phone" className="text-white/90">Phone Number</Label>
                <Input
                  id="phone"
                  {...register('phone')}
                  className="mt-1 bg-white/20 border-white/30 text-white placeholder:text-white/60 focus:bg-white/30"
                />
                {errors.phone && (
                  <p className="text-sm text-orange-200 mt-1">{errors.phone.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="address" className="text-white/90">Address</Label>
                <Input
                  id="address"
                  {...register('address')}
                  className="mt-1 bg-white/20 border-white/30 text-white placeholder:text-white/60 focus:bg-white/30"
                />
                {errors.address && (
                  <p className="text-sm text-orange-200 mt-1">{errors.address.message}</p>
                )}
              </div>

              <div className="flex space-x-2 pt-2">
                <Button
                  type="submit"
                  size="sm"
                  className="bg-white text-emerald-600 hover:bg-white/90 font-semibold"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Saving...' : 'Save'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(false)}
                  className="border-white/30 text-white hover:bg-white/20"
                >
                  Cancel
                </Button>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <User className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-white/70">Name</p>
                  <p className="font-semibold text-white text-lg">{user.name}</p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <Mail className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-white/70">Email</p>
                  <p className="font-semibold text-white">{user.email}</p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <Phone className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-white/70">Phone</p>
                  <p className="font-semibold text-white">{user.phone || 'Not provided'}</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center mt-1">
                  <MapPin className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-white/70">Address</p>
                  <p className="font-semibold text-white leading-relaxed">{user.address || 'Not provided'}</p>
                </div>
              </div>

              {user.isAdmin && (
                <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 border border-white/30">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-yellow-300 rounded-full animate-pulse" />
                    <span className="text-white font-semibold text-sm">Administrator Account</span>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-white/20">
            <Button
              variant="outline"
              className="w-full border-white/30 text-white hover:bg-red-500/20 hover:border-red-300 transition-colors"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}