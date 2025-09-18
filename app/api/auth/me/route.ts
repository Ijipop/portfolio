import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Récupérer les informations utilisateur depuis les headers du middleware
    const userEmail = request.headers.get('x-user-email');
    const userRole = request.headers.get('x-user-role');
    const userId = request.headers.get('x-user-id');

    if (!userEmail || !userRole) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }

    // Retourner les informations utilisateur
    return NextResponse.json({
      userId: userId,
      email: userEmail,
      role: userRole,
      authenticated: true,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des infos utilisateur:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
