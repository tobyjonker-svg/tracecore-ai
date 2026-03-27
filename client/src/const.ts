export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

// Get login URL from server endpoint
export const getLoginUrl = async (): Promise<string> => {
  try {
    const response = await fetch("/api/oauth/login");
    const data = await response.json();
    return data.loginUrl || "/";
  } catch (error) {
    console.error("Failed to get login URL:", error);
    // Fallback to home page
    return "/";
  }
};
