'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { setUser } from '@/lib/slices/authSlice';
import { useToast } from '@/hooks/use-toast';
import { authService } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

export default function AuthCallbackPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { toast } = useToast();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get the session from the URL hash
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Auth callback error:', error);
          toast({
            title: "Authentication Error",
            description: error.message,
            variant: "destructive",
          });
          router.push('/auth');
          return;
        }

        if (data.session) {
          console.log('✅ Email confirmed, user authenticated');
          
          // Get the user profile
          const currentUser = await authService.getCurrentUser();
          
          if (currentUser) {
            dispatch(setUser({
              id: currentUser.id,
              email: currentUser.email,
              name: currentUser.name,
              phone: currentUser.phone,
              address: currentUser.address,
              isAdmin: currentUser.isAdmin,
            }));

            toast({
              title: "Email Confirmed!",
              description: "Welcome to Mango Harvest BD! Your account is now active.",
            });

            router.push('/profile');
          } else {
            toast({
              title: "Profile Not Found",
              description: "Please complete your registration.",
              variant: "destructive",
            });
            router.push('/auth');
          }
        } else {
          toast({
            title: "Authentication Failed",
            description: "Unable to confirm your email. Please try again.",
            variant: "destructive",
          });
          router.push('/auth');
        }
      } catch (error: any) {
        console.error('Callback handling error:', error);
        toast({
          title: "Error",
          description: "Something went wrong. Please try again.",
          variant: "destructive",
        });
        router.push('/auth');
      }
    };

    handleAuthCallback();
  }, [router, dispatch, toast]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-orange-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Confirming your email...</h2>
        <p className="text-gray-600">Please wait while we verify your account.</p>
      </div>
    </div>
  );
}