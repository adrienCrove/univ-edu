import { NextResponse } from 'next/server';
import pool from '@/lib/db';

// GET /api/universities/[id] - Récupérer une université spécifique
export async function GET(request, context) {
  try {
    const params = await context.params;
    const id = params.id;
    
    const result = await pool.query(
      'SELECT * FROM university WHERE id = $1',
      [id]
    );
    
    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Université non trouvée' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'université:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// PUT /api/universities/[id] - Mettre à jour une université
export async function PUT(request, context) {
  try {
    const params = await context.params;
    const id = params.id;
    const { nom, code_university, description, adresse, contact, email, telephone, site_web, image, is_active } = await request.json();
    
    // Vérifier si l'université existe
    const universityExists = await pool.query(
      'SELECT * FROM university WHERE id = $1',
      [id]
    );
    
    if (universityExists.rows.length === 0) {
      return NextResponse.json(
        { error: 'Université non trouvée' },
        { status: 404 }
      );
    }
    
    // Vérifier si le nouveau nom n'est pas déjà utilisé par une autre université
    if (nom !== universityExists.rows[0].nom) {
      const nameExists = await pool.query(
        'SELECT * FROM university WHERE nom = $1 AND id != $2',
        [nom, id]
      );
      
      if (nameExists.rows.length > 0) {
        return NextResponse.json(
          { error: 'Une université avec ce nom existe déjà' },
          { status: 400 }
        );
      }
    }
    
    // Mettre à jour l'université
    const result = await pool.query(
      `UPDATE university 
       SET nom = $1, code = $2, description = $3, adresse = $4, contact = $5, 
           email = $6, telephone = $7, site_web = $8, image = $9, 
           is_active = $10, updated_at = CURRENT_TIMESTAMP
       WHERE id = $11
       RETURNING *`,
      [nom, code_university, description, adresse, contact, email, telephone, site_web, image, is_active, id]
    );
    
    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'université:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// DELETE /api/universities/[id] - Supprimer une université
export async function DELETE(request, context) {
  try {
    const params = await context.params;
    const id = params.id;
    
    // Vérifier si l'université existe
    const universityExists = await pool.query(
      'SELECT * FROM university WHERE id = $1',
      [id]
    );
    
    if (universityExists.rows.length === 0) {
      return NextResponse.json(
        { error: 'Université non trouvée' },
        { status: 404 }
      );
    }
    
    // Supprimer l'université
    await pool.query('DELETE FROM university WHERE id = $1', [id]);
    
    return NextResponse.json({ message: 'Université supprimée avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'université:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
} 