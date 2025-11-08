import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PROTECTED_ROUTES = [
  "/admin/dashboard",
  "/admin/testimonials",
  "/admin/recycle-bin",
];
const AUTH_ROUTES = ["/admin/login"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if the route is protected
  const isProtectedRoute = PROTECTED_ROUTES.some((route) =>
    pathname.startsWith(route)
  );
  const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route));

  // Get session cookie
  const sessionId = request.cookies.get("admin_session_id")?.value;

  // If accessing protected route without session, redirect to login
  if (isProtectedRoute && !sessionId) {
    const url = new URL("/admin/login", request.url);
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  // If accessing auth route with valid session, redirect to dashboard
  if (isAuthRoute && sessionId) {
    return NextResponse.redirect(new URL("/admin/dashboard", request.url));
  }

  // Add security headers
  const response = NextResponse.next();

  // Prevent chunk loading errors with proper caching
  if (pathname.includes("/_next/static/")) {
    response.headers.set(
      "Cache-Control",
      "public, max-age=31536000, immutable"
    );
  } else if (pathname.includes("/_next/")) {
    response.headers.set(
      "Cache-Control",
      "public, max-age=3600, must-revalidate"
    );
  }

  // Security headers
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
