import { NextResponse } from "next/server"

// This is a simple middleware to redirect to login page
// In a real application, you would check for authentication tokens
export function middleware(request) {
  // Check if the user is accessing a protected route
  const isProtectedRoute =
    !request.nextUrl.pathname.startsWith("/login") &&
    !request.nextUrl.pathname.startsWith("/register") &&
    !request.nextUrl.pathname.startsWith("/forgot-password")

  // For demo purposes, we'll use a mock authentication check
  // In a real app, you would check for a valid session token
  const isAuthenticated = request.cookies.has("auth-token")

  // If trying to access a protected route without authentication, redirect to login
  if (isProtectedRoute && !isAuthenticated) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  // If already authenticated and trying to access login page, redirect to dashboard
  if (isAuthenticated && request.nextUrl.pathname === "/login") {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  return NextResponse.next()
}

// Configure the middleware to run on specific paths
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|public).*)",
  ],
}

