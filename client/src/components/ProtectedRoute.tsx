import { ReactNode, useEffect } from 'react';
import { useAuth } from '@/_core/hooks/useAuth';
import { getLoginUrl } from '@/const';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading, isAuthenticated } = useAuth();

  useEffect(() => {
    if (loading) return; // Still checking auth
    if (isAuthenticated && user) return; // User is authenticated
    if (typeof window === 'undefined') return;
    
    // Don't redirect if already on auth page or oauth callback
    if (window.location.href.includes('auth.manus.im')) return;
    if (window.location.href.includes('/api/oauth')) return;

    // User is not authenticated - redirect to login
    (async () => {
      try {
        const loginUrl = await getLoginUrl();
        window.location.href = loginUrl;
      } catch (error) {
        console.error('Failed to get login URL:', error);
      }
    })();
  }, [loading, isAuthenticated, user]);

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // If not authenticated and not loading, don't render children
  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
