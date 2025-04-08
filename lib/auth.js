import { jwtVerify } from 'jose';
import { toast } from 'sonner';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

// Fonction utilitaire pour logger les erreurs
const logError = (action, error) => {
  console.error(`[${new Date().toISOString()}] Erreur ${action}:`, error);
};

export async function loginUser(studentId, password) {
  try {
    console.log(`[${new Date().toISOString()}] Tentative de connexion pour l'étudiant: ${studentId}`);
    const response = await fetch(`${API_URL}/auth`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'login',
        studentId,
        password,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      logError('connexion', error);
      toast.error(error.error || 'Erreur de connexion');
      throw new Error(error.error || 'Erreur de connexion');
    }

    const data = await response.json();
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    console.log(`[${new Date().toISOString()}] Connexion réussie pour l'étudiant: ${studentId}`);
    toast.success('Connexion réussie');
    return data;
  } catch (error) {
    logError('connexion', error);
    toast.error('Erreur lors de la connexion');
    throw error;
  }
}

export async function requestAccount(studentId, fullName, email, phone) {
  try {
    console.log(`[${new Date().toISOString()}] Nouvelle demande de compte:`, { studentId, fullName, email });
    const response = await fetch('/api/auth', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'requestAccount',
        studentId,
        fullName,
        email,
        phone,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      logError('demande de compte', error);
      toast.error(error.error || 'Erreur lors de la demande de compte');
      throw new Error(error.error || 'Erreur lors de la demande de compte');
    }

    const result = await response.json();
    console.log(`[${new Date().toISOString()}] Demande de compte envoyée avec succès pour: ${studentId}`);
    //toast.success('Demande de compte envoyée avec succès');
    return result;
  } catch (error) {
    logError('demande de compte', error);
    toast.error('Erreur lors de la demande de compte');
    throw error;
  }
}

export async function requestPasswordReset(email) {
  try {
    console.log(`[${new Date().toISOString()}] Demande de réinitialisation de mot de passe pour: ${email}`);
    const response = await fetch('/api/auth', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'requestPasswordReset',
        email,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      logError('réinitialisation de mot de passe', error);
      toast.error(error.error || 'Erreur lors de la demande de réinitialisation');
      throw new Error(error.error || 'Erreur lors de la demande de réinitialisation');
    }

    const result = await response.json();
    console.log(`[${new Date().toISOString()}] Email de réinitialisation envoyé à: ${email}`);
    toast.success('Email de réinitialisation envoyé');
    return result;
  } catch (error) {
    logError('réinitialisation de mot de passe', error);
    toast.error('Erreur lors de la demande de réinitialisation');
    throw error;
  }
}

export async function resetPassword(token, newPassword) {
  try {
    console.log(`[${new Date().toISOString()}] Tentative de réinitialisation de mot de passe`);
    const response = await fetch('/api/auth', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'resetPassword',
        token,
        newPassword,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      logError('réinitialisation de mot de passe', error);
      toast.error(error.error || 'Erreur lors de la réinitialisation du mot de passe');
      throw new Error(error.error || 'Erreur lors de la réinitialisation du mot de passe');
    }

    const result = await response.json();
    console.log(`[${new Date().toISOString()}] Mot de passe réinitialisé avec succès`);
    toast.success('Mot de passe réinitialisé avec succès');
    return result;
  } catch (error) {
    logError('réinitialisation de mot de passe', error);
    toast.error('Erreur lors de la réinitialisation du mot de passe');
    throw error;
  }
}

// Vérification simplifiée du token côté client
export function verifyToken(token) {
  if (!token) return null;
  
  try {
    // Décodage simple du token sans vérification de la signature
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    const payload = JSON.parse(jsonPayload);
    
    // Vérifier si le token est expiré
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      console.log(`[${new Date().toISOString()}] Token expiré`);
      toast.error('Session expirée, veuillez vous reconnecter');
      return null;
    }

    return payload;
  } catch (error) {
    logError('vérification du token', error);
    toast.error('Erreur de vérification du token');
    return null;
  }
}

export function checkRole(requiredRole) {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  return user.roles?.includes(requiredRole) || false;
} 