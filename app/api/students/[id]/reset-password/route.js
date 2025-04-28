import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import crypto from 'crypto';

// POST /api/students/[id]/reset-password - Envoyer un lien de réinitialisation de mot de passe
export async function POST(request, { params }) {
  try {
    const { id } = params;
    const { email } = await request.json();
    
    // Vérifier si l'étudiant existe
    const checkStudent = await pool.query(
      'SELECT * FROM utilisateurs WHERE id = $1 AND email = $2',
      [id, email]
    );
    
    if (checkStudent.rows.length === 0) {
      return NextResponse.json(
        { error: 'Étudiant non trouvé ou email incorrect' },
        { status: 404 }
      );
    }
    
    // Générer un token de réinitialisation
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiration = new Date();
    resetTokenExpiration.setHours(resetTokenExpiration.getHours() + 1); // Expire dans 1 heure
    
    // Mettre à jour l'utilisateur avec le token
    await pool.query(
      'UPDATE utilisateurs SET reset_token = $1, reset_token_expiration = $2 WHERE id = $3',
      [resetToken, resetTokenExpiration, id]
    );
    
    // Dans un système réel, nous enverrions ici un email avec le lien de réinitialisation
    // par exemple: `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`
    
    // Pour cet exemple, nous simulons simplement l'envoi
    console.log(`Lien de réinitialisation pour ${email}: /reset-password?token=${resetToken}`);
    
    return NextResponse.json({
      success: true,
      message: 'Lien de réinitialisation du mot de passe envoyé'
      // En production, ne jamais renvoyer le token dans la réponse
      // resetToken est uniquement affiché ici pour faciliter le test
    });
  } catch (error) {
    console.error('Erreur lors de l\'envoi du lien de réinitialisation:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
} 