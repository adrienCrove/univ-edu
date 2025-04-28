import { NextResponse } from 'next/server';
import pool from '@/lib/db';

// GET /api/establishments/[id] - Récupérer un établissement spécifique
export async function GET(request, { params }) {
  try {
    const { id } = params;
    
    console.log('Récupération de l\'établissement avec ID:', id);
    
    const result = await pool.query(
      `SELECT e.*, u.nom as university_name 
       FROM etablissement e
       LEFT JOIN university u ON e.university_id = u.id
       WHERE e.id = $1`,
      [id]
    );
    
    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Établissement non trouvé' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'établissement:', error);
    return NextResponse.json(
      { error: 'Erreur serveur', details: error.message },
      { status: 500 }
    );
  }
}

// PUT /api/establishments/[id] - Mettre à jour un établissement
export async function PUT(request, { params }) {
  try {
    const { id } = params;
    console.log('Mise à jour de l\'établissement avec ID:', id);
    
    const data = await request.json();
    console.log('Données reçues:', data);
    
    const { nom, code_etablissement, adresse, contact, email, telephone, site_web, image, university_id } = data;
    
    // Vérifier si l'établissement existe
    console.log('Vérification de l\'existence de l\'établissement');
    const establishmentExists = await pool.query(
      'SELECT * FROM etablissement WHERE id = $1',
      [id]
    );
    
    if (establishmentExists.rows.length === 0) {
      return NextResponse.json(
        { error: 'Établissement non trouvé' },
        { status: 404 }
      );
    }
    
    // Vérifier si l'université existe
    console.log('Vérification de l\'existence de l\'université:', university_id);
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
    
    // Vérifier si un autre établissement avec le même nom existe déjà dans la même université
    console.log('Vérification des doublons');
    const duplicateExists = await pool.query(
      'SELECT * FROM etablissement WHERE nom = $1 AND university_id = $2 AND id != $3',
      [nom, university_id, id]
    );
    
    if (duplicateExists.rows.length > 0) {
      return NextResponse.json(
        { error: 'Un établissement avec ce nom existe déjà dans cette université' },
        { status: 400 }
      );
    }
    
    // Mettre à jour l'établissement
    console.log('Mise à jour de l\'établissement');
    const result = await pool.query(
      `UPDATE etablissement 
       SET nom = $1, code = $2, adresse = $3, contact = $4, 
           email = $5, telephone = $6, site_web = $7, image = $8, 
           university_id = $9
       WHERE id = $10
       RETURNING *`,
      [nom, code_etablissement, adresse, contact, email, telephone, site_web, image, university_id, id]
    );
    
    console.log('Établissement mis à jour:', result.rows[0]);
    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'établissement:', error);
    return NextResponse.json(
      { error: 'Erreur serveur', details: error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/establishments/[id] - Supprimer un établissement
export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    console.log('Suppression de l\'établissement avec ID:', id);
    
    // Vérifier si l'établissement existe
    const establishmentExists = await pool.query(
      'SELECT * FROM etablissement WHERE id = $1',
      [id]
    );
    
    if (establishmentExists.rows.length === 0) {
      return NextResponse.json(
        { error: 'Établissement non trouvé' },
        { status: 404 }
      );
    }
    
    // Supprimer l'établissement
    await pool.query('DELETE FROM etablissement WHERE id = $1', [id]);
    
    return NextResponse.json(
      { message: 'Établissement supprimé avec succès' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'établissement:', error);
    return NextResponse.json(
      { error: 'Erreur serveur', details: error.message },
      { status: 500 }
    );
  }
} 