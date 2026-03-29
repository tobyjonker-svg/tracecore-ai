export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

// Get login URL from server endpoint
export const getLoginUrl = async (): Promise<string> => {
  try {
    // Pass the frontend origin to the server so it can use the correct domain in the redirect URI
    const origin = window.location.origin;
    const response = await fetch(`/api/oauth/login?origin=${encodeURIComponent(origin)}`);
    const data = await response.json();
    return data.loginUrl || "/";
  } catch (error) {
    console.error("Failed to get login URL:", error);
    // Fallback to home page
    return "/";
  }
};
