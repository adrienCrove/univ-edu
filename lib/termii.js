// Service d'intégration de l'API Termii pour l'envoi de SMS et WhatsApp
// Documentation: https://termii.com/docs

const TERMII_API_KEY = process.env.TERMII_API_KEY;
const TERMII_API_URL = 'https://api.ng.termii.com/api';
const TERMII_SENDER_ID = process.env.TERMII_SENDER_ID || 'UnivEdu';

/**
 * Envoie un SMS via l'API Termii
 * @param {string} to - Numéro de téléphone du destinataire (format international)
 * @param {string} message - Contenu du message
 * @returns {Promise<object>} - Réponse de l'API
 */
export async function sendSMS(to, message) {
  try {
    // Vérifier que le numéro commence par + (format international)
    const formattedNumber = to.startsWith('+') ? to : `+${to}`;
    
    console.log('Envoi SMS via Termii à:', formattedNumber);
    
    const response = await fetch(`${TERMII_API_URL}/sms/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        api_key: TERMII_API_KEY,
        to: formattedNumber,
        from: TERMII_SENDER_ID,
        sms: message,
        type: 'plain',
        channel: 'generic',
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Erreur Termii SMS:', errorData);
      throw new Error(`Erreur lors de l'envoi du SMS: ${errorData.message || response.statusText}`);
    }

    const result = await response.json();
    // Ajouter l'information sur le canal utilisé
    return { ...result, channel: 'sms' };
  } catch (error) {
    console.error('Erreur d\'envoi SMS Termii:', error);
    throw error;
  }
}

/**
 * Envoie un message WhatsApp via l'API Termii
 * @param {string} to - Numéro de téléphone du destinataire (format international)
 * @param {string} message - Contenu du message
 * @returns {Promise<object>} - Réponse de l'API
 */
export async function sendWhatsApp(to, message) {
  try {
    // Vérifier que le numéro commence par + (format international)
    const formattedNumber = to.startsWith('+') ? to : `+${to}`;
    
    // Remarque: Si l'API WhatsApp n'est pas disponible, utilisez l'API SMS comme fallback
    console.log('Tentative d\'envoi WhatsApp via Termii à:', formattedNumber);
    
    // Essayer l'endpoint actuel de WhatsApp Business de Termii
    // Documentation: https://developer.termii.com/whatsapp-business
    const response = await fetch(`${TERMII_API_URL}/whatsapp/business`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        api_key: TERMII_API_KEY,
        to: formattedNumber,
        from: TERMII_SENDER_ID,
        type: 'text',
        message_id: `msg_${Date.now()}`, // Identifiant unique pour le message
        content: {
          text: message
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Erreur Termii WhatsApp:', errorData);
      console.warn('L\'envoi WhatsApp a échoué, fallback vers SMS...');
      
      // Fallback vers SMS si WhatsApp échoue
      return await sendSMS(to, message);
    }

    return await response.json();
  } catch (error) {
    console.error('Erreur d\'envoi WhatsApp Termii:', error);
    console.warn('Exception lors de l\'envoi WhatsApp, fallback vers SMS...');
    
    // En cas d'erreur, on utilise le SMS comme solution de repli
    return await sendSMS(to, message);
  }
}

/**
 * Envoie une notification à un utilisateur nouvellement créé
 * @param {object} user - Informations de l'utilisateur
 * @param {string} channel - Canal d'envoi ('sms' ou 'whatsapp')
 * @returns {Promise<object>} - Résultat de l'envoi
 */
export async function sendUserCreationNotification(user, channel = 'sms') {
  // Vérifier que l'utilisateur a un numéro de téléphone
  if (!user.phone) {
    throw new Error('Numéro de téléphone manquant pour l\'envoi de notification');
  }

  // Construire le message
  const message = 
    `Bienvenue à l'Université! Votre compte a été créé avec succès.\n\n` +
    `Nom complet: ${user.fullname}\n` +
    `Matricule: ${user.studentid}\n` +
    `Email: ${user.email}\n\n` +
    `Connectez-vous sur notre plateforme avec votre matricule pour accéder à vos services académiques.`;

  // Envoyer via le canal spécifié
  if (channel === 'whatsapp') {
    return await sendWhatsApp(user.phone, message);
  }

  return await sendSMS(user.phone, message);
} 