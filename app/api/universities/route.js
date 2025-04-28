import { NextResponse } from 'next/server';
import pool from '@/lib/db';

// GET /api/universities - Récupérer toutes les universités
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    
    let query = `
      SELECT u.id, u.nom, u.code as code_university, u.description, u.adresse, u.contact, u.email, u.telephone, u.site_web, 
             u.is_active, u.image, u.created_at, u.updated_at,
             (SELECT COUNT(*) FROM etablissement e WHERE e.university_id = u.id) as establishments_count
      FROM university u
    `;
    
    const queryParams = [];
    let paramCount = 1;
    
    if (search) {
      query += ` WHERE u.nom ILIKE $${paramCount} OR u.description ILIKE $${paramCount}`;
      queryParams.push(`%${search}%`);
    }
    
    query += ' ORDER BY u.nom';
    
    const result = await pool.query(query, queryParams);
    
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Erreur lors de la récupération des universités:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// POST /api/universities - Créer une nouvelle université
export async function POST(request) {
  try {
    const { nom, code_university, description, adresse, contact, email, telephone, site_web, image } = await request.json();
    
    // Vérifier si une université avec le même nom existe déjà
    const universityExists = await pool.query(
      'SELECT * FROM university WHERE nom = $1',
      [nom]
    );
    
    if (universityExists.rows.length > 0) {
      return NextResponse.json(
        { error: 'Une université avec ce nom existe déjà' },
        { status: 400 }
      );
    }
    
    // Insérer l'université
    const result = await pool.query(
      `INSERT INTO university (nom, code, description, adresse, contact, email, telephone, site_web, image)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING id, nom, code, description, adresse, contact, email, telephone, site_web, is_active, image, created_at, updated_at`,
      [nom, code_university, description, adresse, contact, email, telephone, site_web, image]
    );
    
    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error('Erreur lors de la création de l\'université:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
} 