import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { sendUserCreationNotification } from '@/lib/termii';

// POST /api/notifications - Envoyer une notification
export async function POST(request) {
  try {
    const { userId, channel = 'sms' } = await request.json();
    
    // Vérifier que le canal est valide
    if (channel !== 'sms' && channel !== 'whatsapp') {
      return NextResponse.json(
        { error: 'Canal de notification invalide. Utilisez "sms" ou "whatsapp"' },
        { status: 400 }
      );
    }
    
    // Récupérer les informations de l'utilisateur
    const result = await pool.query(
      `SELECT id, fullname, studentid, email, phone
       FROM utilisateurs
       WHERE id = $1`,
      [userId]
    );
    
    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }
    
    const user = result.rows[0];
    
    // Vérifier que l'utilisateur a un numéro de téléphone
    if (!user.phone) {
      return NextResponse.json(
        { error: 'Cet utilisateur n\'a pas de numéro de téléphone' },
        { status: 400 }
      );
    }
    
    // Valider le format du numéro de téléphone
    let phoneNumber = user.phone;
    if (!phoneNumber.startsWith('+')) {
      // On ajoute le préfixe international s'il n'existe pas (par défaut +237 pour le Cameroun)
      phoneNumber = phoneNumber.startsWith('0') 
        ? '+237' + phoneNumber.substring(1) 
        : '+237' + phoneNumber;
        
      // Mise à jour de l'objet user pour l'envoi
      user.phone = phoneNumber;
    }
    
    console.log(`Envoi de notification ${channel} à ${user.fullname} sur ${user.phone}`);
    
    try {
      // Envoyer la notification - même si WhatsApp échoue, il y aura un fallback vers SMS
      const notificationResult = await sendUserCreationNotification(user, channel);
      
      // Enregistrer l'envoi dans la base de données
      await pool.query(
        `INSERT INTO notifications (user_id, type, channel, status, message)
         VALUES ($1, $2, $3, $4, $5)`,
        [
          userId, 
          'creation_compte', 
          channel, 
          'envoyé', 
          `Notification de création de compte envoyée via ${notificationResult.channel || channel}`
        ]
      );
      
      return NextResponse.json({
        success: true,
        message: `Notification envoyée avec succès via ${notificationResult.channel || channel}`,
        details: notificationResult
      });
      
    } catch (error) {
      console.error('Erreur Termii détaillée:', error);
      
      // On tente d'envoyer un SMS en dernier recours si ce n'était pas déjà le canal choisi
      if (channel !== 'sms') {
        try {
          console.log('Tentative de fallback vers SMS après échec WhatsApp');
          const smsResult = await sendUserCreationNotification(user, 'sms');
          
          await pool.query(
            `INSERT INTO notifications (user_id, type, channel, status, message)
             VALUES ($1, $2, $3, $4, $5)`,
            [
              userId, 
              'creation_compte', 
              'sms (fallback)', 
              'envoyé', 
              `Notification de création de compte envoyée via SMS (fallback après échec ${channel})`
            ]
          );
          
          return NextResponse.json({
            success: true,
            message: 'Notification envoyée par SMS (le canal WhatsApp a échoué)',
            details: smsResult
          });
        } catch (smsError) {
          console.error('Échec du fallback SMS:', smsError);
          throw new Error('Tous les canaux de notification ont échoué');
        }
      } else {
        throw error; // On propage l'erreur si c'était déjà un SMS qui a échoué
      }
    }
  } catch (error) {
    console.error('Erreur lors de l\'envoi de la notification:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur serveur lors de l\'envoi de la notification' },
      { status: 500 }
    );
  }
} 