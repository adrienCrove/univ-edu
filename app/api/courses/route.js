import { NextResponse } from 'next/server';
import pool from '@/lib/db';

// GET /api/courses - Récupérer tous les cours
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const semestreId = searchParams.get('semestre_id');
    const departementId = searchParams.get('departement_id');
    
    let query = `
      SELECT c.cours_id, c.code, c.titre, c.description, c.credits, 
             s.semestre_id, s.annee_academique, s.session,
             d.departement_id, d.nom as departement_nom
      FROM cours c
      LEFT JOIN semestres s ON c.semestre_id = s.semestre_id
      LEFT JOIN departements d ON c.departement_id = d.departement_id
    `;
    
    const queryParams = [];
    let paramCount = 1;
    
    if (semestreId || departementId) {
      query += ' WHERE ';
      
      if (semestreId) {
        query += `c.semestre_id = $${paramCount}`;
        queryParams.push(semestreId);
        paramCount++;
      }
      
      if (departementId) {
        if (semestreId) {
          query += ' AND ';
        }
        query += `c.departement_id = $${paramCount}`;
        queryParams.push(departementId);
        paramCount++;
      }
    }
    
    query += ' ORDER BY c.code';
    
    const result = await pool.query(query, queryParams);
    
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Erreur lors de la récupération des cours:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// POST /api/courses - Créer un nouveau cours
export async function POST(request) {
  try {
    const { code, titre, description, credits, semestre_id, departement_id } = await request.json();
    
    // Vérifier si le code du cours existe déjà
    const courseExists = await pool.query(
      'SELECT * FROM cours WHERE code = $1',
      [code]
    );
    
    if (courseExists.rows.length > 0) {
      return NextResponse.json(
        { error: 'Un cours avec ce code existe déjà' },
        { status: 400 }
      );
    }
    
    // Insérer le cours
    const result = await pool.query(
      `INSERT INTO cours (code, titre, description, credits, semestre_id, departement_id)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING cours_id, code, titre, description, credits, semestre_id, departement_id`,
      [code, titre, description, credits, semestre_id, departement_id]
    );
    
    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error('Erreur lors de la création du cours:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
} 