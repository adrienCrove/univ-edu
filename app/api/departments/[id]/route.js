import { NextResponse } from 'next/server';
import pool from '@/lib/db';

// GET /api/departments/[id] - Récupérer un département spécifique
export async function GET(request, { params }) {
  try {
    const { id } = params;
    
    // Vérifier si le département existe
    const result = await pool.query(
      `SELECT d.id, d.nom, d.code, d.description, 
              d.etablissement_id, e.nom as etablissement_nom,
              e.university_id, u.nom as universite_nom,
              (SELECT COUNT(*) FROM cours c WHERE c.departement_id = d.id) as courses_count
       FROM departement d
       JOIN etablissement e ON d.etablissement_id = e.id
       JOIN university u ON e.university_id = u.id
       WHERE d.id = $1`,
      [id]
    );
    
    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Département non trouvé' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Erreur lors de la récupération du département:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

// PUT /api/departments/[id] - Mettre à jour un département
export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const { nom, code, description, etablissement_id } = await request.json();
    
    // Vérifier si le département existe
    const departmentExists = await pool.query(
      'SELECT * FROM departement WHERE id = $1',
      [id]
    );
    
    if (departmentExists.rows.length === 0) {
      return NextResponse.json(
        { error: 'Département non trouvé' },
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
      
      // Vérifier si un autre département avec le même code existe dans cet établissement
      if (code) {
        const duplicateCode = await pool.query(
          'SELECT * FROM departement WHERE code = $1 AND etablissement_id = $2 AND id != $3',
          [code, etablissement_id, id]
        );
        
        if (duplicateCode.rows.length > 0) {
          return NextResponse.json(
            { error: 'Un département avec ce code existe déjà dans cet établissement' },
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
    
    if (code) {
      updateFields.push(`code = $${paramIndex}`);
      queryParams.push(code);
      paramIndex++;
    }
    
    if (description !== undefined) {
      updateFields.push(`description = $${paramIndex}`);
      queryParams.push(description);
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
      `UPDATE departement SET ${updateFields.join(', ')} WHERE id = $${paramIndex}`,
      queryParams
    );
    
    // Récupérer le département mis à jour
    const updatedDepartment = await pool.query(
      `SELECT d.id, d.nom, d.code, d.description, 
              d.etablissement_id, e.nom as etablissement_nom,
              e.university_id, u.nom as universite_nom,
              (SELECT COUNT(*) FROM cours c WHERE c.departement_id = d.id) as courses_count
       FROM departement d
       JOIN etablissement e ON d.etablissement_id = e.id
       JOIN university u ON e.university_id = u.id
       WHERE d.id = $1`,
      [id]
    );
    
    return NextResponse.json(updatedDepartment.rows[0]);
  } catch (error) {
    console.error('Erreur lors de la mise à jour du département:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

// DELETE /api/departments/[id] - Supprimer un département
export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    
    // Vérifier si le département existe
    const departmentExists = await pool.query(
      'SELECT * FROM departement WHERE id = $1',
      [id]
    );
    
    if (departmentExists.rows.length === 0) {
      return NextResponse.json(
        { error: 'Département non trouvé' },
        { status: 404 }
      );
    }
    
    // Vérifier si des cours sont associés à ce département
    const coursesCount = await pool.query(
      'SELECT COUNT(*) FROM cours WHERE departement_id = $1',
      [id]
    );
    
    if (parseInt(coursesCount.rows[0].count) > 0) {
      return NextResponse.json(
        { error: 'Ce département ne peut pas être supprimé car il contient des cours. Veuillez d\'abord supprimer ou transférer ces cours.' },
        { status: 400 }
      );
    }
    
    // Supprimer le département
    await pool.query('DELETE FROM departement WHERE id = $1', [id]);
    
    return NextResponse.json(
      { message: 'Département supprimé avec succès' }
    );
  } catch (error) {
    console.error('Erreur lors de la suppression du département:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}