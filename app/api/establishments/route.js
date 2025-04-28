import { NextResponse } from 'next/server';
import pool from '@/lib/db';

// GET /api/establishments - Récupérer tous les établissements
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const universityId = searchParams.get('universityId');
    
    let query = `
      SELECT e.*, u.nom as university_name 
      FROM etablissement e
      LEFT JOIN university u ON e.university_id = u.id
      WHERE 1=1
    `;
    
    const queryParams = [];
    let paramCount = 1;
    
    if (search) {
      query += ` AND (e.nom ILIKE $${paramCount} OR e.code ILIKE $${paramCount})`;
      queryParams.push(`%${search}%`);
      paramCount++;
    }
    
    if (universityId) {
      query += ` AND e.university_id = $${paramCount}`;
      queryParams.push(universityId);
      paramCount++;
    }
    
    query += ' ORDER BY e.nom';
    
    console.log('Exécution de la requête:', query);
    console.log('Paramètres:', queryParams);
    
    const result = await pool.query(query, queryParams);
    
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Erreur détaillée lors de la récupération des établissements:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des établissements', details: error.message },
      { status: 500 }
    );
  }
}

// POST /api/establishments - Créer un nouvel établissement
export async function POST(request) {
  try {
    const data = await request.json();
    console.log('Données reçues:', data);

    const { 
      nom, 
      code_etablissement,
      adresse, 
      contact, 
      email, 
      telephone, 
      site_web, 
      image, 
      university_id
    } = data;

    // Validation des champs requis
    if (!nom || !university_id) {
      return NextResponse.json(
        { error: 'Le nom et l\'université sont requis' },
        { status: 400 }
      );
    }

    // Vérifier si l'université existe
    console.log('Vérification de l\'université:', university_id);
    const universityExists = await pool.query(
      'SELECT * FROM university WHERE id = $1',
      [university_id]
    );
    
    if (universityExists.rows.length === 0) {
      return NextResponse.json(
        { error: 'Université non trouvée' },
        { status: 404 }
      );
    }
    
    // Vérifier si un établissement avec le même nom existe déjà dans la même université
    console.log('Vérification du nom unique');
    const establishmentExists = await pool.query(
      'SELECT * FROM etablissement WHERE nom = $1 AND university_id = $2',
      [nom, university_id]
    );
    
    if (establishmentExists.rows.length > 0) {
      return NextResponse.json(
        { error: 'Un établissement avec ce nom existe déjà dans cette université' },
        { status: 400 }
      );
    }
    
    // Créer l'établissement
    console.log('Création de l\'établissement');
    const result = await pool.query(
      `INSERT INTO etablissement 
       (nom, code, adresse, contact, email, telephone, site_web, image, university_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [nom, code_etablissement, adresse, contact, email, telephone, site_web, image, university_id]
    );
    
    console.log('Établissement créé:', result.rows[0]);
    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error('Erreur détaillée lors de la création de l\'établissement:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création de l\'établissement', details: error.message },
      { status: 500 }
    );
  }
} 