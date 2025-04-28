import { NextResponse } from 'next/server';
import pool from '@/lib/db';

// GET /api/programs - Récupérer toutes les filières
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const establishmentId = searchParams.get('establishmentId');
    const universityId = searchParams.get('universityId');
    
    let queryParams = [];
    let whereConditions = [];
    let paramIndex = 1;
    
    // Construire la requête SQL de base
    let query = `
      SELECT f.id, f.nom, f.code, f.etablissement_id, 
             e.nom as etablissement_nom, e.university_id,
             u.nom as universite_nom
      FROM filiere f
      JOIN etablissement e ON f.etablissement_id = e.id
      JOIN university u ON e.university_id = u.id
    `;
    /*let query = `
      SELECT f.id, f.nom, f.code, f.etablissement_id, 
             e.nom as etablissement_nom, e.university_id,
             u.nom as universite_nom,
             (SELECT COUNT(*) FROM cours c WHERE c.filiere_id = f.id) as courses_count,
             (SELECT COUNT(*) FROM utilisateurs ut WHERE ut.filiere_id = f.id) as students_count
      FROM filiere f
      JOIN etablissement e ON f.etablissement_id = e.id
      JOIN university u ON e.university_id = u.id
    `;*/
    
    // Ajouter des conditions de recherche si présentes
    if (search) {
      whereConditions.push(`(f.nom ILIKE $${paramIndex} OR f.code ILIKE $${paramIndex})`);
      queryParams.push(`%${search}%`);
      paramIndex++;
    }
    
    if (establishmentId) {
      whereConditions.push(`f.etablissement_id = $${paramIndex}`);
      queryParams.push(establishmentId);
      paramIndex++;
    }
    
    if (universityId) {
      whereConditions.push(`e.university_id = $${paramIndex}`);
      queryParams.push(universityId);
      paramIndex++;
    }
    
    // Ajouter la clause WHERE si des conditions existent
    if (whereConditions.length > 0) {
      query += ` WHERE ${whereConditions.join(' AND ')}`;
    }
    
    // Ajouter l'ordre de tri
    query += ` ORDER BY f.nom`;
    
    const result = await pool.query(query, queryParams);
    
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Erreur lors de la récupération des filières:', error);
    // Retourner l'erreur détaillée pour faciliter le débogage
    return NextResponse.json({ 
      error: 'Erreur serveur',
      message: error.message,
      details: error 
    }, { status: 500 });
  }
}

// POST /api/programs - Créer une nouvelle filière
export async function POST(request) {
  try {
    const { nom, code, etablissement_id } = await request.json();
    
    // Vérification des données obligatoires
    if (!nom || !etablissement_id) {
      return NextResponse.json(
        { error: 'Le nom et l\'ID de l\'établissement sont obligatoires' },
        { status: 400 }
      );
    }
    
    // Vérifier si l'établissement existe
    const establishmentExists = await pool.query(
      'SELECT * FROM etablissement WHERE id = $1',
      [etablissement_id]
    );
    
    if (establishmentExists.rows.length === 0) {
      return NextResponse.json(
        { error: 'L\'établissement spécifié n\'existe pas' },
        { status: 404 }
      );
    }
    
    // Vérifier si une filière avec le même code existe déjà dans cet établissement
    if (code) {
      const programExists = await pool.query(
        'SELECT * FROM filiere WHERE code = $1 AND etablissement_id = $2',
        [code, etablissement_id]
      );
      
      if (programExists.rows.length > 0) {
        return NextResponse.json(
          { error: 'Une filière avec ce code existe déjà dans cet établissement' },
          { status: 400 }
        );
      }
    }
    
    // Insérer la nouvelle filière
    const result = await pool.query(
      `INSERT INTO filiere (nom, code, etablissement_id) 
       VALUES ($1, $2, $3) 
       RETURNING id, nom, code, etablissement_id`,
      [nom, code, etablissement_id]
    );
    
    // Récupérer les informations complètes de la filière créée
    const newProgram = await pool.query(
      `SELECT f.id, f.nom, f.code, f.etablissement_id, 
              e.nom as etablissement_nom, e.university_id,
              u.nom as universite_nom
       FROM filiere f
       JOIN etablissement e ON f.etablissement_id = e.id
       JOIN university u ON e.university_id = u.id
       WHERE f.id = $1`,
      [result.rows[0].id]
    );
    
    return NextResponse.json(newProgram.rows[0], { status: 201 });
  } catch (error) {
    console.error('Erreur lors de la création de la filière:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
} 