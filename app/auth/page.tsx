'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Eye, EyeOff, Mail, Lock, User, Phone, MapPin, AlertCircle, CheckCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useDispatch } from 'react-redux';
import { setUser, setLoading } from '@/lib/slices/authSlice';
import { useToast } from '@/hooks/use-toast';
import { authService } from '@/lib/auth';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(11, 'Please enter a valid phone number'),
  address: z.string().min(10, 'Please enter a complete address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type LoginFormData = z.infer<typeof loginSchema>;
type RegisterFormData = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState('login');
  const [emailConfirmationNeeded, setEmailConfirmationNeeded] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');
  const router = useRouter();
  const dispatch = useDispatch();
  const { toast } = useToast();

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const registerForm = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onLogin = async (data: LoginFormData) => {
    try {
      dispatch(setLoading(true));
      
      const result = await authService.signIn(data.email, data.password);

      if (result.profile) {
        dispatch(setUser({
          id: result.profile.id,
          email: result.profile.email,
          name: result.profile.name,
          phone: result.profile.phone,
          address: result.profile.address,
          isAdmin: result.profile.isAdmin,
        }));

        toast({
          title: "Login Successful!",
          description: "Welcome back to Mango Harvest BD",
        });

        // Redirect based on user role
        if (result.profile.isAdmin) {
          router.push('/admin');
        } else {
          router.push('/profile');
        }
      }
    } catch (error: any) {
      console.error('Login error:', error);
      toast({
        title: "Login Failed",
        description: error.message || "Please check your credentials and try again.",
        variant: "destructive",
      });
    } finally {
      dispatch(setLoading(false));
    }
  };

  const onRegister = async (data: RegisterFormData) => {
    try {
      dispatch(setLoading(true));
      setEmailConfirmationNeeded(false);

      console.log('🚀 Starting registration process...');
      
      const result = await authService.signUp(data.email, data.password, {
        name: data.name,
        phone: data.phone,
        address: data.address,
      });

      // Check if email confirmation is needed
      if (result.needsEmailConfirmation) {
        console.log('📧 Email confirmation required');
        setEmailConfirmationNeeded(true);
        setRegisteredEmail(data.email);
        
        toast({
          title: "Registration Successful!",
          description: "Please check your email and click the confirmation link to complete your registration.",
        });
        
        return; // Don't proceed to sign in
      }

      // If we have a session, the user is confirmed and signed in
      if (result.session) {
        console.log('✅ Registration completed with active session');
        
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
            title: "Registration Successful!",
            description: "Welcome to Mango Harvest BD! Your account has been created.",
          });

          router.push('/profile');
        }
      } else {
        // User created but needs email confirmation
        setEmailConfirmationNeeded(true);
        setRegisteredEmail(data.email);
        
        toast({
          title: "Registration Successful!",
          description: "Please check your email and click the confirmation link to complete your registration.",
        });
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      toast({
        title: "Registration Failed",
        description: error.message || "Please try again with different details.",
        variant: "destructive",
      });
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleResendConfirmation = async () => {
    try {
      await authService.resendConfirmation(registeredEmail);
      toast({
        title: "Confirmation Email Sent",
        description: "Please check your email for the confirmation link.",
      });
    } catch (error: any) {
      toast({
        title: "Failed to Resend",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-orange-50">
      <Header />
      
      <main className="pt-20 pb-12">
        <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-8"
          >
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Welcome to <span className="text-emerald-500">Mango Harvest BD</span>
            </h1>
            <p className="text-gray-600">
              Join thousands of customers enjoying fresh, premium mangoes
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            {emailConfirmationNeeded ? (
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="text-center flex items-center justify-center space-x-2">
                    <Mail className="h-6 w-6 text-emerald-500" />
                    <span>Check Your Email</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center space-y-4">
                  <div className="bg-emerald-50 p-4 rounded-lg">
                    <CheckCircle className="h-12 w-12 text-emerald-500 mx-auto mb-3" />
                    <h3 className="font-semibold text-emerald-900 mb-2">Registration Successful!</h3>
                    <p className="text-emerald-800 text-sm">
                      We've sent a confirmation email to <strong>{registeredEmail}</strong>
                    </p>
                  </div>
                  
                  <div className="space-y-3">
                    <p className="text-gray-600 text-sm">
                      Please check your email and click the confirmation link to activate your account.
                    </p>
                    
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <AlertCircle className="h-4 w-4 text-blue-600 inline mr-2" />
                      <span className="text-blue-800 text-xs">
                        Don't forget to check your spam folder if you don't see the email.
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Button
                      onClick={handleResendConfirmation}
                      variant="outline"
                      className="w-full"
                    >
                      Resend Confirmation Email
                    </Button>
                    
                    <Button
                      onClick={() => {
                        setEmailConfirmationNeeded(false);
                        setActiveTab('login');
                      }}
                      variant="ghost"
                      className="w-full"
                    >
                      Back to Login
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="text-center">Account Access</CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="login">Login</TabsTrigger>
                      <TabsTrigger value="register">Register</TabsTrigger>
                    </TabsList>

                    <TabsContent value="login" className="space-y-4">
                      <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4">
                        <div>
                          <Label htmlFor="login-email">Email Address</Label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input
                              id="login-email"
                              type="email"
                              placeholder="your.email@example.com"
                              className="pl-10"
                              {...loginForm.register('email')}
                            />
                          </div>
                          {loginForm.formState.errors.email && (
                            <p className="text-sm text-red-500 mt-1">
                              {loginForm.formState.errors.email.message}
                            </p>
                          )}
                        </div>

                        <div>
                          <Label htmlFor="login-password">Password</Label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input
                              id="login-password"
                              type={showPassword ? 'text' : 'password'}
                              placeholder="Enter your password"
                              className="pl-10 pr-10"
                              {...loginForm.register('password')}
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                            >
                              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                          {loginForm.formState.errors.password && (
                            <p className="text-sm text-red-500 mt-1">
                              {loginForm.formState.errors.password.message}
                            </p>
                          )}
                        </div>

                        <Button
                          type="submit"
                          className="w-full bg-emerald-500 hover:bg-emerald-600"
                          disabled={loginForm.formState.isSubmitting}
                        >
                          {loginForm.formState.isSubmitting ? 'Signing In...' : 'Sign In'}
                        </Button>
                      </form>
                    </TabsContent>

                    <TabsContent value="register" className="space-y-4">
                      <form onSubmit={registerForm.handleSubmit(onRegister)} className="space-y-4">
                        <div>
                          <Label htmlFor="register-name">Full Name</Label>
                          <div className="relative">
                            <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input
                              id="register-name"
                              placeholder="Enter your full name"
                              className="pl-10"
                              {...registerForm.register('name')}
                            />
                          </div>
                          {registerForm.formState.errors.name && (
                            <p className="text-sm text-red-500 mt-1">
                              {registerForm.formState.errors.name.message}
                            </p>
                          )}
                        </div>

                        <div>
                          <Label htmlFor="register-email">Email Address</Label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input
                              id="register-email"
                              type="email"
                              placeholder="your.email@example.com"
                              className="pl-10"
                              {...registerForm.register('email')}
                            />
                          </div>
                          {registerForm.formState.errors.email && (
                            <p className="text-sm text-red-500 mt-1">
                              {registerForm.formState.errors.email.message}
                            </p>
                          )}
                        </div>

                        <div>
                          <Label htmlFor="register-phone">Phone Number</Label>
                          <div className="relative">
                            <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input
                              id="register-phone"
                              placeholder="01XXXXXXXXX"
                              className="pl-10"
                              {...registerForm.register('phone')}
                            />
                          </div>
                          {registerForm.formState.errors.phone && (
                            <p className="text-sm text-red-500 mt-1">
                              {registerForm.formState.errors.phone.message}
                            </p>
                          )}
                        </div>

                        <div>
                          <Label htmlFor="register-address">Address</Label>
                          <div className="relative">
                            <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input
                              id="register-address"
                              placeholder="Your complete address"
                              className="pl-10"
                              {...registerForm.register('address')}
                            />
                          </div>
                          {registerForm.formState.errors.address && (
                            <p className="text-sm text-red-500 mt-1">
                              {registerForm.formState.errors.address.message}
                            </p>
                          )}
                        </div>

                        <div>
                          <Label htmlFor="register-password">Password</Label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input
                              id="register-password"
                              type={showPassword ? 'text' : 'password'}
                              placeholder="Create a password"
                              className="pl-10 pr-10"
                              {...registerForm.register('password')}
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                            >
                              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                          {registerForm.formState.errors.password && (
                            <p className="text-sm text-red-500 mt-1">
                              {registerForm.formState.errors.password.message}
                            </p>
                          )}
                        </div>

                        <div>
                          <Label htmlFor="register-confirm-password">Confirm Password</Label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input
                              id="register-confirm-password"
                              type={showPassword ? 'text' : 'password'}
                              placeholder="Confirm your password"
                              className="pl-10"
                              {...registerForm.register('confirmPassword')}
                            />
                          </div>
                          {registerForm.formState.errors.confirmPassword && (
                            <p className="text-sm text-red-500 mt-1">
                              {registerForm.formState.errors.confirmPassword.message}
                            </p>
                          )}
                        </div>

                        <Button
                          type="submit"
                          className="w-full bg-emerald-500 hover:bg-emerald-600"
                          disabled={registerForm.formState.isSubmitting}
                        >
                          {registerForm.formState.isSubmitting ? 'Creating Account...' : 'Create Account'}
                        </Button>
                      </form>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            )}
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}