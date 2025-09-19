/**
 * Tests des projets pour l'API Portfolio
 * 
 * Ces tests vérifient :
 * - Récupération des projets (accès public)
 * - Création de projet (authentification requise)
 * - Modification de projet (authentification requise)
 * - Suppression de projet (authentification requise)
 * - Validation des données
 * - Contrôle d'accès
 */

const baseUrl = 'http://localhost:3000/api';

// Helper pour obtenir un token d'authentification
async function getAuthToken() {
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
  
  if (response.ok) {
    const cookies = response.headers.get('set-cookie');
    return cookies;
  }
  return null;
}

describe('Tests des projets', () => {
  
  test('Récupérer tous les projets (accès public)', async () => {
    const response = await fetch(`${baseUrl}/projects`);
    
    expect(response.status).toBe(200);
    
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.data).toBeDefined();
    expect(Array.isArray(data.data)).toBe(true);
    expect(data.message).toContain('project(s) trouvé(s)');
  });

  test('Récupérer un projet par ID', async () => {
    const response = await fetch(`${baseUrl}/projects/1`);
    
    // Peut être 200 (projet trouvé) ou 404 (projet non trouvé)
    expect([200, 404]).toContain(response.status);
    
    if (response.status === 200) {
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data).toBeDefined();
      expect(data.data.id).toBe(1);
    }
  });

  test('Créer un projet sans authentification (doit échouer)', async () => {
    const response = await fetch(`${baseUrl}/projects`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'Test Project',
        description: 'Description du test',
        technologies: 'React, Node.js',
        status: 'En cours'
      })
    });

    expect(response.status).toBe(403);
    
    const data = await response.json();
    expect(data.success).toBe(false);
    expect(data.error).toBe('Accès non autorisé');
  });

  test('Créer un projet avec authentification', async () => {
    const authToken = await getAuthToken();
    expect(authToken).toBeDefined();

    const response = await fetch(`${baseUrl}/projects`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': authToken
      },
      body: JSON.stringify({
        name: 'Projet Test API',
        description: 'Un projet créé via les tests API',
        technologies: 'React, Node.js, Jest',
        status: 'En cours',
        url: 'https://github.com/test/project',
        imageUrl: '/imgs/test.png'
      })
    });

    expect(response.status).toBe(201);
    
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.data).toBeDefined();
    expect(data.data.name).toBe('Projet Test API');
    expect(data.message).toBe('Project créé avec succès');
  });

  test('Créer un projet avec données invalides', async () => {
    const authToken = await getAuthToken();
    expect(authToken).toBeDefined();

    const response = await fetch(`${baseUrl}/projects`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': authToken
      },
      body: JSON.stringify({
        name: '', // Nom vide
        description: '', // Description vide
        technologies: '', // Technologies vides
        status: '' // Statut vide
      })
    });

    expect(response.status).toBe(400);
    
    const data = await response.json();
    expect(data.success).toBe(false);
    expect(data.error).toBe('Données invalides');
    expect(data.details).toBeDefined();
    expect(data.details.length).toBeGreaterThan(0);
  });

  test('Modifier un projet sans authentification (doit échouer)', async () => {
    const response = await fetch(`${baseUrl}/projects/1`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'Projet Modifié',
        description: 'Description modifiée',
        technologies: 'React, Node.js',
        status: 'Terminé'
      })
    });

    expect(response.status).toBe(403);
    
    const data = await response.json();
    expect(data.success).toBe(false);
    expect(data.error).toBe('Accès non autorisé');
  });

  test('Supprimer un projet sans authentification (doit échouer)', async () => {
    const response = await fetch(`${baseUrl}/projects/1`, {
      method: 'DELETE'
    });

    expect(response.status).toBe(403);
    
    const data = await response.json();
    expect(data.success).toBe(false);
    expect(data.error).toBe('Accès non autorisé');
  });

  test('Tentative d\'accès à une route protégée sans token', async () => {
    const response = await fetch(`${baseUrl}/projects`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'Test',
        description: 'Test',
        technologies: 'Test',
        status: 'Test'
      })
    });

    expect(response.status).toBe(403);
  });
});
