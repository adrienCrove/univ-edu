import { NextResponse } from 'next/server';
import pool from '@/lib/db';

// GET /api/programs/[id] - Récupérer une filière spécifique
export async function GET(request, context) {
  try {
    const params = await context.params;
    const id = params.id;
    
    // Vérifier si la filière existe
    const result = await pool.query(
      `SELECT f.id, f.nom, f.code, f.etablissement_id, 
              e.nom as etablissement_nom, e.university_id,
              u.nom as universite_nom
       FROM filiere f
       JOIN etablissement e ON f.etablissement_id = e.id
       JOIN university u ON e.university_id = u.id
       WHERE f.id = $1`,
      [id]
    );
    
    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Filière non trouvée' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Erreur lors de la récupération de la filière:', error);
    return NextResponse.json(
      { error: 'Erreur serveur', message: error.message, details: error },
      { status: 500 }
    );
  }
}

// PUT /api/programs/[id] - Mettre à jour une filière
export async function PUT(request, context) {
  try {
    const params = await context.params;
    const id = params.id;
    const { nom, code, etablissement_id } = await request.json();
    
    // Vérifier si la filière existe
    const programExists = await pool.query(
      'SELECT * FROM filiere WHERE id = $1',
      [id]
    );
    
    if (programExists.rows.length === 0) {
      return NextResponse.json(
        { error: 'Filière non trouvée' },
        { status: 404 }
      );
    }
    
    // Si l'établissement a été modifié, vérifier s'il existe
    if (etablissement_id) {
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
      
      // Vérifier si une autre filière avec le même code existe dans cet établissement
      if (code) {
        const duplicateCode = await pool.query(
          'SELECT * FROM filiere WHERE code = $1 AND etablissement_id = $2 AND id != $3',
          [code, etablissement_id, id]
        );
        
        if (duplicateCode.rows.length > 0) {
          return NextResponse.json(
            { error: 'Une filière avec ce code existe déjà dans cet établissement' },
            { status: 400 }
          );
        }
      }
    }
    
    // Construire la requête de mise à jour dynamiquement
    const updateFields = [];
    const queryParams = [];
    let paramIndex = 1;
    
    if (nom) {
      updateFields.push(`nom = $${paramIndex}`);
      queryParams.push(nom);
      paramIndex++;
    }
    
    if (code !== undefined) {
      updateFields.push(`code = $${paramIndex}`);
      queryParams.push(code);
      paramIndex++;
    }
    
    if (etablissement_id) {
      updateFields.push(`etablissement_id = $${paramIndex}`);
      queryParams.push(etablissement_id);
      paramIndex++;
    }
    
    if (updateFields.length === 0) {
      return NextResponse.json(
        { error: 'Aucune donnée fournie pour la mise à jour' },
        { status: 400 }
      );
    }
    
    // Ajouter l'ID à la liste des paramètres
    queryParams.push(id);
    
    // Exécuter la requête de mise à jour
    await pool.query(
      `UPDATE filiere SET ${updateFields.join(', ')} WHERE id = $${paramIndex}`,
      queryParams
    );
    
    // Récupérer la filière mise à jour
    const updatedProgram = await pool.query(
      `SELECT f.id, f.nom, f.code, f.etablissement_id, 
              e.nom as etablissement_nom, e.university_id,
              u.nom as universite_nom
       FROM filiere f
       JOIN etablissement e ON f.etablissement_id = e.id
       JOIN university u ON e.university_id = u.id
       WHERE f.id = $1`,
      [id]
    );
    
    return NextResponse.json(updatedProgram.rows[0]);
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la filière:', error);
    return NextResponse.json(
      { error: 'Erreur serveur', message: error.message, details: error },
      { status: 500 }
    );
  }
}

// DELETE /api/programs/[id] - Supprimer une filière
export async function DELETE(request, context) {
  try {
    const params = await context.params;
    const id = params.id;
    
    // Vérifier si la filière existe
    const programExists = await pool.query(
      'SELECT * FROM filiere WHERE id = $1',
      [id]
    );
    
    if (programExists.rows.length === 0) {
      return NextResponse.json(
        { error: 'Filière non trouvée' },
        { status: 404 }
      );
    }
    
    // Vérifier si des cours sont associés à cette filière
    // Note: cette vérification est en commentaire car la table cours pourrait ne pas exister
    /* 
    const coursesCount = await pool.query(
      'SELECT COUNT(*) FROM cours WHERE filiere_id = $1',
      [id]
    );
    
    if (parseInt(coursesCount.rows[0].count) > 0) {
      return NextResponse.json(
        { error: 'Cette filière ne peut pas être supprimée car elle est associée à des cours. Veuillez d\'abord supprimer ou transférer ces cours.' },
        { status: 400 }
      );
    }
    */
    
    // Vérifier si des étudiants sont inscrits à cette filière
    const studentsCount = await pool.query(
      'SELECT COUNT(*) FROM utilisateurs WHERE filiere_id = $1',
      [id]
    );
    
    if (parseInt(studentsCount.rows[0].count) > 0) {
      return NextResponse.json(
        { error: 'Cette filière ne peut pas être supprimée car des étudiants y sont inscrits. Veuillez d\'abord transférer ces étudiants.' },
        { status: 400 }
      );
    }
    
    // Supprimer la filière
    await pool.query('DELETE FROM filiere WHERE id = $1', [id]);
    
    return NextResponse.json(
      { message: 'Filière supprimée avec succès' }
    );
  } catch (error) {
    console.error('Erreur lors de la suppression de la filière:', error);
    return NextResponse.json(
      { error: 'Erreur serveur', message: error.message, details: error },
      { status: 500 }
    );
  }
} 