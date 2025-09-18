import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const prisma = new PrismaClient();

// Schéma de validation pour le login
const loginSchema = z.object({
  email: z.string().email('Email invalide').min(1, 'Email requis'),
  password: z.string().min(1, 'Mot de passe requis')
});

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
    const body = await request.json();
    
    // Validation avec Zod
    const validationResult = loginSchema.safeParse(body);
    if (!validationResult.success) {
      logAuthEvent('ERROR', 'Validation failed', body.email);
      return NextResponse.json(
        { 
          message: 'Données invalides',
          errors: validationResult.error.issues.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        },
        { status: 400 }
      );
    }

    const { email, password } = validationResult.data;

    // Recherche de l'utilisateur
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (!user) {
      logAuthEvent('ERROR', 'Login attempt with non-existent email', email);
      return NextResponse.json(
        { message: 'Email ou mot de passe incorrect' },
        { status: 401 }
      );
    }

    // Vérification du mot de passe
    const isValidPassword = await bcrypt.compare(password, user.password);
    
    if (!isValidPassword) {
      logAuthEvent('ERROR', 'Login attempt with invalid password', email);
      return NextResponse.json(
        { message: 'Email ou mot de passe incorrect' },
        { status: 401 }
      );
    }

    // Génération du token JWT
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      logAuthEvent('ERROR', 'JWT_SECRET not configured');
      return NextResponse.json(
        { message: 'Erreur de configuration serveur' },
        { status: 500 }
      );
    }

    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        role: user.role 
      },
      jwtSecret,
      { expiresIn: '24h' }
    );

    // Retour des informations utilisateur (sans le mot de passe)
    const userResponse = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    };

    // Créer la réponse avec cookie sécurisé
    const response = NextResponse.json({
      message: 'Connexion réussie',
      user: userResponse
    });

    // Configuration du cookie sécurisé
    const isProduction = process.env.NODE_ENV === 'production';
    
    response.cookies.set('auth-token', token, {
      httpOnly: true,           // Empêche l'accès via JavaScript
      secure: isProduction,     // HTTPS uniquement en production
      sameSite: 'strict',      // Protection CSRF
      maxAge: 24 * 60 * 60,    // 24 heures en secondes
      path: '/'                // Disponible sur tout le site
    });

    logAuthEvent('INFO', 'Successful login', user.email);
    return response;

  } catch (error) {
    logAuthEvent('ERROR', 'Login error occurred', 'unknown');
    console.error('Erreur de connexion:', error);
    return NextResponse.json(
      { message: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
