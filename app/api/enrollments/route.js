import { NextResponse } from 'next/server';
import pool from '@/lib/db';

// GET /api/enrollments - Récupérer toutes les inscriptions
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const etudiantId = searchParams.get('etudiant_id');
    const coursId = searchParams.get('cours_id');
    
    let query = `
      SELECT e.inscription_id, e.etudiant_id, e.cours_id, e.date_inscription, e.statut, e.motif_annulation,
             u.fullname as etudiant_nom, u.studentid as etudiant_matricule,
             c.code as cours_code, c.titre as cours_titre
      FROM inscriptions e
      JOIN utilisateurs u ON e.etudiant_id = u.id
      JOIN cours c ON e.cours_id = c.cours_id
    `;
    
    const queryParams = [];
    let paramCount = 1;
    
    if (etudiantId || coursId) {
      query += ' WHERE ';
      
      if (etudiantId) {
        query += `e.etudiant_id = $${paramCount}`;
        queryParams.push(etudiantId);
        paramCount++;
      }
      
      if (coursId) {
        if (etudiantId) {
          query += ' AND ';
        }
        query += `e.cours_id = $${paramCount}`;
        queryParams.push(coursId);
        paramCount++;
      }
    }
    
    query += ' ORDER BY e.date_inscription DESC';
    
    const result = await pool.query(query, queryParams);
    
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Erreur lors de la récupération des inscriptions:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// POST /api/enrollments - Créer une nouvelle inscription
export async function POST(request) {
  try {
    const { etudiant_id, cours_id } = await request.json();
    
    // Vérifier si l'étudiant existe
    const studentExists = await pool.query(
      'SELECT * FROM utilisateurs WHERE id = $1',
      [etudiant_id]
    );
    
    if (studentExists.rows.length === 0) {
      return NextResponse.json(
        { error: 'Étudiant non trouvé' },
        { status: 404 }
      );
    }
    
    // Vérifier si le cours existe
    const courseExists = await pool.query(
      'SELECT * FROM cours WHERE cours_id = $1',
      [cours_id]
    );
    
    if (courseExists.rows.length === 0) {
      return NextResponse.json(
        { error: 'Cours non trouvé' },
        { status: 404 }
      );
    }
    
    // Vérifier si l'étudiant est déjà inscrit à ce cours
    const enrollmentExists = await pool.query(
      'SELECT * FROM inscriptions WHERE etudiant_id = $1 AND cours_id = $2',
      [etudiant_id, cours_id]
    );
    
    if (enrollmentExists.rows.length > 0) {
      return NextResponse.json(
        { error: 'L\'étudiant est déjà inscrit à ce cours' },
        { status: 400 }
      );
    }
    
    // Insérer l'inscription
    const result = await pool.query(
      `INSERT INTO inscriptions (etudiant_id, cours_id, date_inscription, statut)
       VALUES ($1, $2, CURRENT_DATE, 'Active')
       RETURNING inscription_id, etudiant_id, cours_id, date_inscription, statut`,
      [etudiant_id, cours_id]
    );
    
    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error('Erreur lors de la création de l\'inscription:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
} 