import { NextResponse } from "next/server"
import { getAuth } from "firebase-admin/auth"
import { initializeApp, getApps, cert } from "firebase-admin/app"

// Initialiser Firebase Admin si ce n'est pas déjà fait
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: "univ-edu-9d5a0",
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  })
}

// This is a simple middleware to redirect to login page
// In a real application, you would check for authentication tokens
export async function middleware(request) {
  const auth = getAuth()
  const token = request.cookies.get("auth-token")?.value

  // Check if the user is accessing a protected route
  const isProtectedRoute =
    !request.nextUrl.pathname.startsWith("/login") &&
    !request.nextUrl.pathname.startsWith("/register") &&
    !request.nextUrl.pathname.startsWith("/forgot-password")

  try {
    if (token) {
      // Vérifier le token avec Firebase Admin
      await auth.verifyIdToken(token)
      
      // Si on est sur la page de login et qu'on est authentifié, rediriger vers le dashboard
      if (request.nextUrl.pathname === "/login") {
        return NextResponse.redirect(new URL("/dashboard", request.url))
      }
    } else if (isProtectedRoute) {
      // Si pas de token et route protégée, rediriger vers login
      return NextResponse.redirect(new URL("/login", request.url))
    }
  } catch (error) {
    // En cas d'erreur de token, supprimer le cookie et rediriger vers login
    if (isProtectedRoute) {
      const response = NextResponse.redirect(new URL("/login", request.url))
      response.cookies.delete("auth-token")
      return response
    }
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

