'use client';

import { Provider } from 'react-redux';
import { store } from '@/lib/store';
import { ThemeProvider } from 'next-themes';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setUser, setLoading } from '@/lib/slices/authSlice';
import { authService } from '@/lib/auth';

function AuthProvider({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch();

  useEffect(() => {
    // Check for existing session on app load
    const checkUser = async () => {
      try {
        dispatch(setLoading(true));
        const user = await authService.getCurrentUser();
        if (user) {
          dispatch(setUser(user));
        }
      } catch (error) {
        console.error('Error checking user session:', error);
      } finally {
        dispatch(setLoading(false));
      }
    };

    checkUser();
  }, [dispatch]);

  return <>{children}</>;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <ThemeProvider
        attribute="class"
        defaultTheme="light"
        enableSystem={false}
        disableTransitionOnChange
      >
        <AuthProvider>
          {children}
        </AuthProvider>
      </ThemeProvider>
    </Provider>
  );
}