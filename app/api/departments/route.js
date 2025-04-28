import { NextResponse } from 'next/server';
import pool from '@/lib/db';

// GET /api/departments - Récupérer tous les départements
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
      SELECT d.id, d.nom, d.code, d.description, 
             d.etablissement_id, e.nom as etablissement_nom,
             e.university_id, u.nom as universite_nom,
             (SELECT COUNT(*) FROM cours c WHERE c.departement_id = d.id) as courses_count
      FROM departement d
      JOIN etablissement e ON d.etablissement_id = e.id
      JOIN university u ON e.university_id = u.id
    `;
    
    // Ajouter des conditions de recherche si présentes
    if (search) {
      whereConditions.push(`(d.nom ILIKE $${paramIndex} OR d.code ILIKE $${paramIndex})`);
      queryParams.push(`%${search}%`);
      paramIndex++;
    }
    
    if (establishmentId) {
      whereConditions.push(`d.etablissement_id = $${paramIndex}`);
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
    query += ` ORDER BY d.code`;
    
    const result = await pool.query(query, queryParams);
    
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Erreur lors de la récupération des départements:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// POST /api/departments - Créer un nouveau département
export async function POST(request) {
  try {
    const { nom, code, description, etablissement_id } = await request.json();
    
    // Vérification des données obligatoires
    if (!nom || !code || !etablissement_id) {
      return NextResponse.json(
        { error: 'Le nom, le code et l\'ID de l\'établissement sont obligatoires' },
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
    
    // Vérifier si un département avec le même code existe déjà dans cet établissement
    const departmentExists = await pool.query(
      'SELECT * FROM departement WHERE code = $1 AND etablissement_id = $2',
      [code, etablissement_id]
    );
    
    if (departmentExists.rows.length > 0) {
      return NextResponse.json(
        { error: 'Un département avec ce code existe déjà dans cet établissement' },
        { status: 400 }
      );
    }
    
    // Insérer le nouveau département
    const result = await pool.query(
      `INSERT INTO departement (nom, code, description, etablissement_id) 
       VALUES ($1, $2, $3, $4) 
       RETURNING id, nom, code, description, etablissement_id`,
      [nom, code, description, etablissement_id]
    );
    
    // Récupérer les informations complètes du département créé
    const newDepartment = await pool.query(
      `SELECT d.id, d.nom, d.code, d.description, 
              d.etablissement_id, e.nom as etablissement_nom,
              e.university_id, u.nom as universite_nom
       FROM departement d
       JOIN etablissement e ON d.etablissement_id = e.id
       JOIN university u ON e.university_id = u.id
       WHERE d.id = $1`,
      [result.rows[0].id]
    );
    
    return NextResponse.json(newDepartment.rows[0], { status: 201 });
  } catch (error) {
    console.error('Erreur lors de la création du département:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
} 