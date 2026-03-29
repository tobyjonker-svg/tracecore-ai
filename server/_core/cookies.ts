import type { CookieOptions, Request } from "express";

const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "::1"]);

function isIpAddress(host: string) {
  // Basic IPv4 check and IPv6 presence detection.
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host)) return true;
  return host.includes(":");
}

function isSecureRequest(req: Request) {
  // Check direct protocol
  if (req.protocol === "https") return true;

  // Check X-Forwarded-Proto header (set by proxy/load balancer)
  const forwardedProto = req.headers["x-forwarded-proto"];
  if (forwardedProto) {
    const protoList = Array.isArray(forwardedProto)
      ? forwardedProto
      : forwardedProto.split(",");
    if (protoList.some(proto => proto.trim().toLowerCase() === "https")) {
      return true;
    }
  }

  // In production, assume HTTPS (Manus proxy handles it)
  if (process.env.NODE_ENV === 'production') {
    return true;
  }

  return false;
}

export function getSessionCookieOptions(
  req: Request
): Pick<CookieOptions, "domain" | "httpOnly" | "path" | "sameSite" | "secure"> {
  // For OAuth flows across auth.manus.im → app domain, we need:
  // - SameSite: 'none' (allows cross-site cookies)
  // - Secure: true (required when SameSite=none)
  // - HttpOnly: true (prevents JavaScript access)
  
  const isSecure = isSecureRequest(req);
  
  // Force secure=true for production to support OAuth cross-site cookies
  // In development (localhost), allow insecure cookies
  const secure = isSecure || process.env.NODE_ENV === 'production';

  return {
    httpOnly: true,
    path: "/",
    sameSite: "none",
    secure: secure,
  };
}
