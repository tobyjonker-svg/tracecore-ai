import { trpc } from "@/lib/trpc";
import { UNAUTHED_ERR_MSG } from '@shared/const';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink, TRPCClientError } from "@trpc/client";
import { createRoot } from "react-dom/client";
import superjson from "superjson";
import App from "./App";
import { getLoginUrl } from "./const";
import "./index.css";

const queryClient = new QueryClient();

const redirectToLoginIfUnauthorized = async (error: unknown) => {
  if (!(error instanceof TRPCClientError)) return;
  if (typeof window === "undefined") return;

  // Only redirect if it's specifically an UNAUTHORIZED error with the right message
  // Don't redirect on other errors like NOT_FOUND, BAD_REQUEST, etc.
  const isUnauthorized = 
    error.message === UNAUTHED_ERR_MSG || 
    (error.data?.code === 'UNAUTHORIZED' && error.message.includes('Please login'));

  if (!isUnauthorized) {
    // Log other errors but don't redirect
    console.debug('[Auth Check] Non-auth error:', error.data?.code, error.message);
    return;
  }

  // Prevent redirect loop - don't redirect if already on auth page
  if (window.location.href.includes('auth.manus.im')) return;
  if (window.location.href.includes('/api/oauth')) return;

  try {
    const loginUrl = await getLoginUrl();
    window.location.href = loginUrl;
  } catch (err) {
    console.error('Failed to redirect to login:', err);
  }
};

queryClient.getQueryCache().subscribe(event => {
  if (event.type === "updated" && event.action.type === "error") {
    const error = event.query.state.error;
    // Only redirect on auth errors, silently handle other errors
    if (error instanceof TRPCClientError && error.data?.code === 'UNAUTHORIZED') {
      redirectToLoginIfUnauthorized(error).catch(console.error);
    }
    // Don't spam console with every error - only log auth-related ones
    if (error instanceof TRPCClientError && error.data?.code === 'UNAUTHORIZED') {
      console.warn("[Auth Error] Unauthorized query:", error.message);
    }
  }
});

queryClient.getMutationCache().subscribe(event => {
  if (event.type === "updated" && event.action.type === "error") {
    const error = event.mutation.state.error;
    // Only redirect on auth errors, silently handle other errors
    if (error instanceof TRPCClientError && error.data?.code === 'UNAUTHORIZED') {
      redirectToLoginIfUnauthorized(error).catch(console.error);
    }
    // Don't spam console with every error - only log auth-related ones
    if (error instanceof TRPCClientError && error.data?.code === 'UNAUTHORIZED') {
      console.warn("[Auth Error] Unauthorized mutation:", error.message);
    }
  }
});

const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: "/api/trpc",
      transformer: superjson,
      fetch(input, init) {
        return globalThis.fetch(input, {
          ...(init ?? {}),
          credentials: "include",
        });
      },
    }),
  ],
});

createRoot(document.getElementById("root")!).render(
  <trpc.Provider client={trpcClient} queryClient={queryClient}>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </trpc.Provider>
);
