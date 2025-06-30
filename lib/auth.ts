import { supabase } from './supabase';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  phone?: string;
  address?: string;
  isAdmin?: boolean;
}

export const authService = {
  // Sign up new user
  async signUp(email: string, password: string, userData: {
    name: string;
    phone: string;
    address: string;
  }) {
    try {
      console.log('🚀 Starting sign up process for:', email);
      
      // Sign up the user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (authError) {
        console.error('❌ Auth signup error:', authError);
        throw new Error(`Authentication failed: ${authError.message}`);
      }

      if (!authData.user) {
        throw new Error('No user returned from signup');
      }

      console.log('✅ Auth user created with ID:', authData.user.id);
      console.log('📧 Email confirmation status:', authData.user.email_confirmed_at ? 'Confirmed' : 'Pending');

      // Check if email confirmation is required
      if (!authData.user.email_confirmed_at && !authData.session) {
        console.log('📧 Email confirmation required - user will need to check their email');
        
        // Return a special response indicating email confirmation is needed
        return {
          user: authData.user,
          session: null,
          needsEmailConfirmation: true
        };
      }

      // If we have a session (email confirmed), create the profile
      if (authData.session) {
        console.log('✅ User has active session, creating profile...');
        
        const profileData = {
          id: authData.user.id,
          email: email.toLowerCase().trim(),
          name: userData.name.trim(),
          phone: userData.phone.trim(),
          address: userData.address.trim(),
          is_admin: false,
        };

        console.log('📝 Creating profile with data:', profileData);
        
        const { data: insertedProfile, error: profileError } = await supabase
          .from('profiles')
          .insert(profileData)
          .select()
          .single();

        if (profileError) {
          console.error('❌ Profile creation error:', profileError);
          throw new Error(`Profile creation failed: ${profileError.message}`);
        }

        console.log('✅ Profile created successfully:', insertedProfile);
        return authData;
      }

      return authData;
    } catch (error: any) {
      console.error('❌ Complete sign up error:', error);
      throw error;
    }
  },

  // Sign in user
  async signIn(email: string, password: string) {
    try {
      console.log('🔑 Starting sign in process for:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase().trim(),
        password,
      });

      if (error) {
        console.error('❌ Sign in error:', error);
        
        // Provide more specific error messages
        if (error.message.includes('Email not confirmed')) {
          throw new Error('Please check your email and click the confirmation link before signing in.');
        } else if (error.message.includes('Invalid login credentials')) {
          throw new Error('Invalid email or password. Please check your credentials and try again.');
        } else {
          throw new Error(`Login failed: ${error.message}`);
        }
      }

      if (data.user && data.session) {
        console.log('✅ User signed in, fetching profile:', data.user.id);
        
        // Get user profile
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (profileError) {
          console.error('❌ Profile fetch error:', profileError);
          
          // If profile doesn't exist, it might be because the user signed up but didn't complete profile creation
          if (profileError.code === 'PGRST116') {
            // Try to create the profile now
            console.log('🔧 Profile not found, attempting to create...');
            
            const profileData = {
              id: data.user.id,
              email: data.user.email!.toLowerCase().trim(),
              name: data.user.user_metadata?.name || data.user.email!.split('@')[0],
              phone: data.user.user_metadata?.phone || '',
              address: data.user.user_metadata?.address || '',
              is_admin: false,
            };

            const { data: newProfile, error: createError } = await supabase
              .from('profiles')
              .insert(profileData)
              .select()
              .single();

            if (createError) {
              console.error('❌ Profile creation during signin failed:', createError);
              throw new Error('Profile not found and could not be created. Please contact support.');
            }

            console.log('✅ Profile created during signin:', newProfile);
            
            return {
              user: data.user,
              session: data.session,
              profile: {
                id: newProfile.id,
                email: newProfile.email,
                name: newProfile.name,
                phone: newProfile.phone,
                address: newProfile.address,
                isAdmin: newProfile.is_admin,
              }
            };
          }
          
          throw new Error(`Profile not found: ${profileError.message}`);
        }

        console.log('✅ Profile fetched successfully:', profile);

        return {
          user: data.user,
          session: data.session,
          profile: {
            id: profile.id,
            email: profile.email,
            name: profile.name,
            phone: profile.phone,
            address: profile.address,
            isAdmin: profile.is_admin,
          }
        };
      }

      return data;
    } catch (error: any) {
      console.error('❌ Sign in error:', error);
      throw error;
    }
  },

  // Sign out user
  async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error('❌ Sign out error:', error);
      throw error;
    }
  },

  // Get current user
  async getCurrentUser() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('❌ Get current user profile error:', error);
          return null;
        }

        return {
          id: profile.id,
          email: profile.email,
          name: profile.name,
          phone: profile.phone,
          address: profile.address,
          isAdmin: profile.is_admin,
        };
      }

      return null;
    } catch (error) {
      console.error('❌ Get current user error:', error);
      return null;
    }
  },

  // Update user profile
  async updateProfile(userId: string, updates: {
    name?: string;
    phone?: string;
    address?: string;
  }) {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);

      if (error) throw error;
    } catch (error) {
      console.error('❌ Update profile error:', error);
      throw error;
    }
  },

  // Check if user is admin
  async isAdmin(userId: string) {
    try {
      const { data, error } = await supabase.rpc('is_admin');

      if (error) {
        console.error('❌ Check admin error:', error);
        return false;
      }
      
      return data === true;
    } catch (error) {
      console.error('❌ Check admin error:', error);
      return false;
    }
  },

  // Resend confirmation email
  async resendConfirmation(email: string) {
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('❌ Resend confirmation error:', error);
      throw error;
    }
  },

  // Admin functions
  async getAllProfiles() {
    try {
      const { data, error } = await supabase.rpc('admin_get_all_profiles');
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('❌ Get all profiles error:', error);
      throw error;
    }
  },

  async getAllOrders() {
    try {
      const { data, error } = await supabase.rpc('admin_get_all_orders');
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('❌ Get all orders error:', error);
      throw error;
    }
  },

  async updateOrderStatus(orderId: string, status: string) {
    try {
      const { error } = await supabase.rpc('admin_update_order_status', {
        order_id: orderId,
        new_status: status
      });
      
      if (error) throw error;
    } catch (error) {
      console.error('❌ Update order status error:', error);
      throw error;
    }
  }
};