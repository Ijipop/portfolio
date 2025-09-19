import { NextRequest, NextResponse } from 'next/server';

// Interface pour le payload JWT
interface JWTPayload {
  userId: number;
  email: string;
  role: string;
  iat: number;
  exp: number;
}

// Fonction pour vérifier le token JWT (compatible Edge Runtime)
function verifyToken(token: string): JWTPayload | null {
  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error('JWT_SECRET not configured');
      return null;
    }
    
    // Décoder le JWT manuellement (compatible Edge Runtime)
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }
    
    const payload = JSON.parse(atob(parts[1]));
    
    // Vérifier l'expiration
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp < now) {
      return null;
    }
    
    return payload as JWTPayload;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

// Fonction pour extraire le token du cookie ou header
function extractToken(request: NextRequest): string | null {
  // 1. Essayer de récupérer depuis les cookies (priorité)
  const cookieToken = request.cookies.get('auth-token')?.value;
  if (cookieToken) {
    return cookieToken;
  }

  // 2. Essayer de récupérer depuis l'header Authorization
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  return null;
}

// Middleware principal
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Routes protégées (admin uniquement)
  const protectedRoutes = ['/admin', '/api/auth/me'];
  
  // Routes protégées pour les opérations d'écriture (POST, PUT, DELETE)
  const writeProtectedRoutes = ['/api/projects'];
  
  // Vérifier si la route actuelle nécessite une authentification
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  );
  
  // Vérifier si c'est une opération d'écriture sur les projets
  const isWriteOperation = writeProtectedRoutes.some(route => 
    pathname.startsWith(route)
  ) && request.method !== 'GET';

  if (!isProtectedRoute && !isWriteOperation) {
    return NextResponse.next();
  }

  // Extraire le token
  const token = extractToken(request);
  
  if (!token) {
    console.log(`[MIDDLEWARE] No token found for protected route: ${pathname}`);
    if (pathname.startsWith('/api')) {
      return NextResponse.json({ message: 'Accès non autorisé' }, { status: 401 });
    }
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Vérifier le token
  const payload = verifyToken(token);
  
  if (!payload) {
    console.log(`[MIDDLEWARE] Invalid token for route: ${pathname}`);
    if (pathname.startsWith('/api')) {
      return NextResponse.json({ message: 'Accès non autorisé' }, { status: 401 });
    }
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Vérifier l'expiration
  const now = Math.floor(Date.now() / 1000);
  if (payload.exp < now) {
    console.log(`[MIDDLEWARE] Token expired for user: ${payload.email}`);
    if (pathname.startsWith('/api')) {
      return NextResponse.json({ message: 'Token expiré' }, { status: 401 });
    }
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Vérifier le rôle (admin uniquement)
  if (payload.role !== 'admin') {
    console.log(`[MIDDLEWARE] Insufficient permissions for user: ${payload.email}, role: ${payload.role}`);
    if (pathname.startsWith('/api')) {
      return NextResponse.json({ message: 'Accès non autorisé' }, { status: 403 });
    }
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Log de l'accès autorisé
  console.log(`[MIDDLEWARE] Authorized access for user: ${payload.email} to ${pathname}`);

  // Ajouter les informations utilisateur aux headers pour les API routes
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-user-id', payload.userId.toString());
  requestHeaders.set('x-user-email', payload.email);
  requestHeaders.set('x-user-role', payload.role);
  
  // Log pour debug
  console.log(`[MIDDLEWARE] Added headers: x-user-email=${payload.email}, x-user-role=${payload.role}`);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

// Configuration du middleware
export const config = {
  matcher: [
    '/admin/:path*',
    '/api/auth/me',
    '/api/projects'
  ]
};
