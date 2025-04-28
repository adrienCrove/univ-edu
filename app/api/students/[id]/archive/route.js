import { NextResponse } from 'next/server';
import pool from '@/lib/db';

// PUT /api/students/[id]/archive - Archiver un étudiant
export async function PUT(request, { params }) {
  try {
    const { id } = params;
    
    // Vérifier si l'étudiant existe
    const checkStudent = await pool.query(
      'SELECT * FROM utilisateurs WHERE id = $1',
      [id]
    );
    
    if (checkStudent.rows.length === 0) {
      return NextResponse.json(
        { error: 'Étudiant non trouvé' },
        { status: 404 }
      );
    }
    
    // Dans un vrai système, nous pourrions avoir une colonne 'archived' à mettre à jour
    // Ou déplacer l'étudiant vers une table d'archives
    // Ici, nous allons simplement simuler l'archivage avec un champ 'is_archived'
    
    // Pour cet exemple, ajoutons un champ is_archived si nécessaire
    try {
      await pool.query('ALTER TABLE utilisateurs ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT false');
    } catch (error) {
      console.error('Erreur lors de la mise à jour du schéma:', error);
      // Continuer même si erreur ici (le champ pourrait déjà exister)
    }
    
    // Archiver l'étudiant
    await pool.query(
      'UPDATE utilisateurs SET is_archived = true WHERE id = $1',
      [id]
    );
    
    return NextResponse.json({
      success: true,
      message: 'Étudiant archivé avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de l\'archivage de l\'étudiant:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
} 