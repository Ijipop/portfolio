import { NextRequest, NextResponse } from 'next/server';

// Fonction de journalisation sécurisée
function logAuthEvent(level: 'INFO' | 'ERROR', message: string, userEmail?: string) {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    level,
    message,
    userEmail: userEmail || 'anonymous',
    service: 'auth'
  };
  
  console.log(`[${level}] ${JSON.stringify(logEntry)}`);
}

export async function POST(request: NextRequest) {
  try {
    // Récupérer l'email de l'utilisateur depuis les headers (ajouté par le middleware)
    const userEmail = request.headers.get('x-user-email');
    
    // Créer la réponse
    const response = NextResponse.json({
      message: 'Déconnexion réussie'
    });

    // Supprimer le cookie d'authentification
    response.cookies.set('auth-token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0,  // Expire immédiatement
      path: '/'
    });

    logAuthEvent('INFO', 'User logged out successfully', userEmail || 'unknown');
    return response;

  } catch (error) {
    logAuthEvent('ERROR', 'Logout error occurred');
    console.error('Erreur de déconnexion:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la déconnexion' },
      { status: 500 }
    );
  }
}
