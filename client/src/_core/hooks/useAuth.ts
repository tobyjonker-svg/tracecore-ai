import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { useCallback, useEffect } from "react";

type UseAuthOptions = {
  redirectOnUnauthenticated?: boolean;
};

export function useAuth(options?: UseAuthOptions) {
  const { redirectOnUnauthenticated = false } = options ?? {};

  const meQuery = trpc.auth.me.useQuery(undefined, {
    retry: 1,
    retryDelay: 1000,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const logoutMutation = trpc.auth.logout.useMutation();

  const logout = useCallback(async () => {
    try {
      await logoutMutation.mutateAsync();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Invalidate auth query to force refetch
      meQuery.refetch();
    }
  }, [logoutMutation, meQuery]);

  // Handle redirect to login if needed
  useEffect(() => {
    if (!redirectOnUnauthenticated) return;
    if (typeof window === "undefined") return;

    // Only redirect if auth check is complete AND user is not authenticated
    const isAuthCheckComplete = meQuery.isFetched;
    const isAuthenticated = Boolean(meQuery.data);

    if (!isAuthCheckComplete) return; // Still loading
    if (isAuthenticated) return; // User is authenticated
    if (window.location.href.includes("auth.manus.im")) return; // Already on auth page
    if (window.location.href.includes("/api/oauth")) return; // OAuth callback in progress

    // Redirect to login
    (async () => {
      try {
        const loginUrl = await getLoginUrl();
        window.location.href = loginUrl;
      } catch (error) {
        console.error("Failed to get login URL:", error);
      }
    })();
  }, [redirectOnUnauthenticated, meQuery.isFetched, meQuery.data]);

  return {
    user: meQuery.data ?? null,
    loading: meQuery.isLoading,
    error: meQuery.error,
    isAuthenticated: Boolean(meQuery.data),
    refresh: () => meQuery.refetch(),
    logout,
  };
}
