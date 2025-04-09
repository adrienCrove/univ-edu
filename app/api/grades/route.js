import { NextResponse } from 'next/server';
import pool from '@/lib/db';

// GET /api/grades - Récupérer toutes les notes
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const etudiantId = searchParams.get('etudiant_id');
    const evaluationId = searchParams.get('evaluation_id');
    const coursId = searchParams.get('cours_id');
    
    let query = `
      SELECT n.etudiant_id, n.evaluation_id, n.note, n.mention,
             u.fullname as etudiant_nom, u.studentid as etudiant_matricule,
             e.titre as evaluation_titre, e.date as evaluation_date, e.poids as evaluation_poids,
             c.cours_id, c.code as cours_code, c.titre as cours_titre
      FROM notes n
      JOIN utilisateurs u ON n.etudiant_id = u.id
      JOIN evaluations e ON n.evaluation_id = e.evaluation_id
      JOIN cours c ON e.cours_id = c.cours_id
    `;
    
    const queryParams = [];
    let paramCount = 1;
    
    if (etudiantId || evaluationId || coursId) {
      query += ' WHERE ';
      
      if (etudiantId) {
        query += `n.etudiant_id = $${paramCount}`;
        queryParams.push(etudiantId);
        paramCount++;
      }
      
      if (evaluationId) {
        if (etudiantId) {
          query += ' AND ';
        }
        query += `n.evaluation_id = $${paramCount}`;
        queryParams.push(evaluationId);
        paramCount++;
      }
      
      if (coursId) {
        if (etudiantId || evaluationId) {
          query += ' AND ';
        }
        query += `c.cours_id = $${paramCount}`;
        queryParams.push(coursId);
        paramCount++;
      }
    }
    
    query += ' ORDER BY e.date DESC, u.fullname';
    
    const result = await pool.query(query, queryParams);
    
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Erreur lors de la récupération des notes:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// POST /api/grades - Créer une nouvelle note
export async function POST(request) {
  try {
    const { etudiant_id, evaluation_id, note, mention } = await request.json();
    
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
    
    // Vérifier si l'évaluation existe
    const evaluationExists = await pool.query(
      'SELECT * FROM evaluations WHERE evaluation_id = $1',
      [evaluation_id]
    );
    
    if (evaluationExists.rows.length === 0) {
      return NextResponse.json(
        { error: 'Évaluation non trouvée' },
        { status: 404 }
      );
    }
    
    // Vérifier si l'étudiant est inscrit au cours de l'évaluation
    const courseId = evaluationExists.rows[0].cours_id;
    const enrollmentExists = await pool.query(
      'SELECT * FROM inscriptions WHERE etudiant_id = $1 AND cours_id = $2 AND statut = \'Active\'',
      [etudiant_id, courseId]
    );
    
    if (enrollmentExists.rows.length === 0) {
      return NextResponse.json(
        { error: 'L\'étudiant n\'est pas inscrit à ce cours' },
        { status: 400 }
      );
    }
    
    // Vérifier si une note existe déjà pour cet étudiant et cette évaluation
    const gradeExists = await pool.query(
      'SELECT * FROM notes WHERE etudiant_id = $1 AND evaluation_id = $2',
      [etudiant_id, evaluation_id]
    );
    
    if (gradeExists.rows.length > 0) {
      return NextResponse.json(
        { error: 'Une note existe déjà pour cet étudiant et cette évaluation' },
        { status: 400 }
      );
    }
    
    // Insérer la note
    const result = await pool.query(
      `INSERT INTO notes (etudiant_id, evaluation_id, note, mention)
       VALUES ($1, $2, $3, $4)
       RETURNING etudiant_id, evaluation_id, note, mention`,
      [etudiant_id, evaluation_id, note, mention]
    );
    
    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error('Erreur lors de la création de la note:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
} 