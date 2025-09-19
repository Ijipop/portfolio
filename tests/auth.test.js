/**
 * Tests d'authentification pour l'API Portfolio
 * 
 * Ces tests vérifient :
 * - Connexion avec identifiants valides
 * - Connexion avec identifiants invalides
 * - Validation des données d'entrée
 * - Sécurité des cookies
 * - Déconnexion
 */

const baseUrl = 'http://localhost:3000/api';

// Tests de connexion
describe('Tests d\'authentification', () => {
  
  test('Connexion avec identifiants valides', async () => {
    const response = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@portfolio.com',
        password: 'admin123'
      })
    });

    expect(response.status).toBe(200);
    
    const data = await response.json();
    expect(data.message).toBe('Connexion réussie');
    expect(data.user).toBeDefined();
    expect(data.user.email).toBe('admin@portfolio.com');
    expect(data.user.role).toBe('admin');
    
    // Vérifier la présence du cookie sécurisé
    const setCookieHeader = response.headers.get('set-cookie');
    expect(setCookieHeader).toContain('auth-token=');
    expect(setCookieHeader).toContain('HttpOnly');
    expect(setCookieHeader).toContain('SameSite=Strict');
  });

  test('Connexion avec email invalide', async () => {
    const response = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'invalid@example.com',
        password: 'admin123'
      })
    });

    expect(response.status).toBe(401);
    
    const data = await response.json();
    expect(data.message).toBe('Email ou mot de passe incorrect');
  });

  test('Connexion avec mot de passe invalide', async () => {
    const response = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@portfolio.com',
        password: 'wrongpassword'
      })
    });

    expect(response.status).toBe(401);
    
    const data = await response.json();
    expect(data.message).toBe('Email ou mot de passe incorrect');
  });

  test('Connexion avec données manquantes', async () => {
    const response = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: '',
        password: ''
      })
    });

    expect(response.status).toBe(400);
    
    const data = await response.json();
    expect(data.message).toBe('Données invalides');
    expect(data.errors).toBeDefined();
    expect(data.errors.length).toBeGreaterThan(0);
  });

  test('Connexion avec email invalide (format)', async () => {
    const response = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'not-an-email',
        password: 'admin123'
      })
    });

    expect(response.status).toBe(400);
    
    const data = await response.json();
    expect(data.message).toBe('Données invalides');
    expect(data.errors).toBeDefined();
  });

  test('Déconnexion', async () => {
    // D'abord se connecter
    const loginResponse = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@portfolio.com',
        password: 'admin123'
      })
    });

    expect(loginResponse.status).toBe(200);
    const loginData = await loginResponse.json();
    
    // Récupérer le cookie
    const cookies = loginResponse.headers.get('set-cookie');
    expect(cookies).toBeDefined();

    // Se déconnecter
    const logoutResponse = await fetch(`${baseUrl}/auth/logout`, {
      method: 'POST',
      headers: {
        'Cookie': cookies
      }
    });

    expect(logoutResponse.status).toBe(200);
    
    const logoutData = await logoutResponse.json();
    expect(logoutData.message).toBe('Déconnexion réussie');
  });
});
