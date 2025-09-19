import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

// Schéma de validation pour les projets
const projectSchema = z.object({
  name: z.string().min(1, 'Le nom est requis').max(100, 'Le nom ne peut pas dépasser 100 caractères'),
  description: z.string().min(1, 'La description est requise').max(500, 'La description ne peut pas dépasser 500 caractères'),
  technologies: z.string().min(1, 'Les technologies sont requises').max(200, 'Les technologies ne peuvent pas dépasser 200 caractères'),
  status: z.string().min(1, 'Le statut est requis').max(50, 'Le statut ne peut pas dépasser 50 caractères'),
  url: z.string().optional().or(z.literal('')),
  imageUrl: z.string().optional().or(z.literal(''))
});

// Fonction de journalisation sécurisée
function logEvent(level: 'INFO' | 'ERROR', message: string, userEmail?: string, action?: string) {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    level,
    message,
    userEmail: userEmail || 'anonymous',
    service: 'projects',
    action
  };
  
  console.log(`[${level}] ${JSON.stringify(logEntry)}`);
}

// Fonction pour vérifier l'authentification
function verifyAuth(request: NextRequest): { isAuthenticated: boolean; userEmail?: string; userRole?: string } {
  const userEmail = request.headers.get('x-user-email');
  const userRole = request.headers.get('x-user-role');
  
  if (!userEmail || userRole !== 'admin') {
    return { isAuthenticated: false };
  }
  
  return { isAuthenticated: true, userEmail, userRole };
}

// GET /api/projects - Obtenir tous les projects (accès public)
export async function GET()
{
	try
	{
		const projects = await prisma.project.findMany({
			orderBy:
			{
				id: 'asc'
			}
		})
		
		logEvent('INFO', `Retrieved ${projects.length} projects`, undefined, 'GET_ALL');
		
		return NextResponse.json({
			success: true,
			data: projects,
			message: `${projects.length} project(s) trouvé(s)`
		})
	}
	catch (error)
	{
		logEvent('ERROR', 'Failed to retrieve projects', undefined, 'GET_ALL');
		console.error('Erreur lors de la récupération des projects:', error)
		return NextResponse.json(
			{
				success: false,
				error: 'Erreur lors de la récupération des projects'
			},
			{
				status: 500
			}
		)
	}
}

// POST /api/projects - Ajouter un nouveau project
export async function POST(request: NextRequest)
{
	try
	{
		// Vérifier l'authentification
		const auth = verifyAuth(request);
		
		if (!auth.isAuthenticated) {
			logEvent('ERROR', 'Unauthorized project creation attempt', auth.userEmail, 'CREATE');
			return NextResponse.json(
				{
					success: false,
					error: 'Accès non autorisé'
				},
				{
					status: 403
				}
			);
		}

		const body = await request.json()
		
		// Validation avec Zod
		const validationResult = projectSchema.safeParse(body);
		if (!validationResult.success) {
			logEvent('ERROR', 'Project validation failed', auth.userEmail, 'CREATE');
			return NextResponse.json(
				{
					success: false,
					error: 'Données invalides',
					details: validationResult.error.issues.map(err => ({
						field: err.path.join('.'),
						message: err.message
					}))
				},
				{
					status: 400
				}
			);
		}

		const { name, description, technologies, status, url, imageUrl } = validationResult.data;

		// Créer le project
		const project = await prisma.project.create({
			data:
			{
				name: name.trim(),
				description: description.trim(),
				technologies: technologies.trim(),
				status: status.trim(),
				url: url || '',
				imageUrl: imageUrl || ''
			}
		})

		logEvent('INFO', `Project created: ${project.name}`, auth.userEmail, 'CREATE');

		return NextResponse.json(
			{
				success: true,
				data: project,
				message: 'Project créé avec succès'
			},
			{
				status: 201
			}
		)
	}
	catch (error)
	{
		const auth = verifyAuth(request);
		logEvent('ERROR', 'Failed to create project', auth.userEmail, 'CREATE');
		console.error('Erreur lors de la création du project:', error)
		return NextResponse.json(
			{
				success: false,
				error: 'Erreur lors de la création du project'
			},
			{
				status: 500
			}
		)
	}
}
