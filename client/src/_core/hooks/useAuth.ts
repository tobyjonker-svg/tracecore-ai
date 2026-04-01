import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { TRPCClientError } from "@trpc/client";
import { useCallback, useEffect, useMemo } from "react";

type UseAuthOptions = {
  redirectOnUnauthenticated?: boolean;
  redirectPath?: string;
};

export function useAuth(options?: UseAuthOptions) {
  const { redirectOnUnauthenticated = false, redirectPath = "/" } =
    options ?? {};
  const utils = trpc.useUtils();

  const meQuery = trpc.auth.me.useQuery(undefined, {
    retry: 1,
    retryDelay: 1000,
    refetchOnWindowFocus: false,
    // Don't treat errors as fatal - user might still be authenticated
    throwOnError: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => {
      utils.auth.me.setData(undefined, null);
    },
  });

  const logout = useCallback(async () => {
    try {
      await logoutMutation.mutateAsync();
    } catch (error: unknown) {
      if (
        error instanceof TRPCClientError &&
        error.data?.code === "UNAUTHORIZED"
      ) {
        return;
      }
      throw error;
    } finally {
      utils.auth.me.setData(undefined, null);
      await utils.auth.me.invalidate();
    }
  }, [logoutMutation, utils]);

  const state = useMemo(() => {
    // Try to restore from localStorage if query fails
    const userData = meQuery.data ?? (() => {
      try {
        const stored = localStorage.getItem("manus-runtime-user-info");
        return stored ? JSON.parse(stored) : null;
      } catch {
        return null;
      }
    })();
    
    if (userData) {
      localStorage.setItem(
        "manus-runtime-user-info",
        JSON.stringify(userData)
      );
    }
    
    return {
      user: userData ?? null,
      loading: meQuery.isLoading || logoutMutation.isPending,
      error: meQuery.error ?? logoutMutation.error ?? null,
      isAuthenticated: Boolean(userData),
    };
  }, [
    meQuery.data,
    meQuery.error,
    meQuery.isLoading,
    logoutMutation.error,
    logoutMutation.isPending,
  ]);

  // Add timeout to prevent infinite loading on mobile
  useEffect(() => {
    if (!meQuery.isLoading) return;
    const timeout = setTimeout(() => {
      console.warn('[Auth] Query timeout - forcing redirect to login');
      if (typeof window !== 'undefined') {
        const origin = window.location.origin;
        window.location.href = `/api/oauth/login?origin=${encodeURIComponent(origin)}`;
      }
    }, 8000); // 8 second timeout
    return () => clearTimeout(timeout);
  }, [meQuery.isLoading]);

  // Redirect if not authenticated (must be at top level, not in conditional)
  useEffect(() => {
    if (!redirectOnUnauthenticated) return;
    if (meQuery.isLoading || logoutMutation.isPending) return;
    if (state.user) return;
    if (typeof window === "undefined") return;
    if (window.location.pathname === redirectPath) return;
    // Prevent redirect loop - don't redirect if already on auth page
    if (window.location.href.includes('auth.manus.im')) return;
    if (window.location.href.includes('/api/oauth')) return;

    window.location.href = redirectPath
  }, [
    redirectOnUnauthenticated,
    redirectPath,
    logoutMutation.isPending,
    meQuery.isLoading,
    state.user,
  ]);

  return {
    ...state,
    refresh: () => meQuery.refetch(),
    logout,
  };
}
