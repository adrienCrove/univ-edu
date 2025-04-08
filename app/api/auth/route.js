import { NextResponse } from 'next/server';
import { Pool } from 'pg';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function POST(request) {
  try {
    const { action, ...data } = await request.json();

    switch (action) {
      case 'login':
        return await handleLogin(data);
      case 'requestAccount':
        return await handleRequestAccount(data);
      case 'requestPasswordReset':
        return await handleRequestPasswordReset(data);
      case 'resetPassword':
        return await handleResetPassword(data);
      default:
        return NextResponse.json({ error: 'Action non valide' }, { status: 400 });
    }
  } catch (error) {
    console.error('Erreur d\'authentification:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

async function handleLogin({ studentId, password }) {
  try {
    console.log('Tentative de connexion pour:', studentId);
    const result = await pool.query(
      'SELECT * FROM utilisateurs WHERE studentid = $1 AND password = $2',
      [studentId, password]
    );

    const user = result.rows[0];
    if (!user) {
      console.log('Identifiants invalides pour:', studentId);
      return NextResponse.json({ error: 'Identifiants invalides' }, { status: 401 });
    }

    await pool.query(
      'UPDATE utilisateurs SET last_login = CURRENT_TIMESTAMP WHERE id = $1',
      [user.id]
    );

    const rolesResult = await pool.query(
      'SELECT r.nom FROM roles r JOIN utilisateurs_roles ur ON r.role_id = ur.role_id WHERE ur.student_id = $1',
      [user.id]
    );

    const roles = rolesResult.rows.map(row => row.nom);
    const token = jwt.sign(
      { 
        userId: user.id,
        studentId: user.studentid,
        roles 
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    console.log('Connexion réussie pour:', studentId);
    return NextResponse.json({ 
      token, 
      user: { 
        id: user.id,
        studentId: user.studentid,
        fullName: user.fullname,
        email: user.email,
        roles 
      } 
    });
  } catch (error) {
    console.error('Erreur lors de la connexion:', error);
    return NextResponse.json({ error: 'Erreur lors de la connexion' }, { status: 500 });
  }
}

async function handleRequestAccount({ studentId, fullName, email, phone }) {
  const mailOptions = {
    from: process.env.SMTP_USER,
    to: process.env.ADMIN_EMAIL,
    subject: 'Nouvelle demande de compte',
    html: `
      <h2>Nouvelle demande de compte</h2>
      <p><strong>Numéro matricule:</strong> ${studentId}</p>
      <p><strong>Nom complet:</strong> ${fullName}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Téléphone:</strong> ${phone}</p>
    `
  };

  await transporter.sendMail(mailOptions);
  return NextResponse.json({ message: 'Demande envoyée avec succès' });
}

async function handleRequestPasswordReset({ email }) {
  const result = await pool.query(
    'SELECT * FROM utilisateurs WHERE email = $1',
    [email]
  );

  const user = result.rows[0];
  if (!user) {
    return NextResponse.json({ error: 'Email non trouvé' }, { status: 404 });
  }

  const resetToken = jwt.sign(
    { userId: user.id },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );

  const resetUrl = `${process.env.APP_URL}/reset-password?token=${resetToken}`;
  const mailOptions = {
    from: process.env.SMTP_USER,
    to: email,
    subject: 'Réinitialisation de mot de passe',
    html: `
      <h2>Réinitialisation de mot de passe</h2>
      <p>Cliquez sur le lien suivant pour réinitialiser votre mot de passe :</p>
      <a href="${resetUrl}">${resetUrl}</a>
      <p>Ce lien expirera dans 1 heure.</p>
    `
  };

  await transporter.sendMail(mailOptions);
  return NextResponse.json({ message: 'Email de réinitialisation envoyé' });
}

async function handleResetPassword({ token, newPassword }) {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await pool.query(
      'UPDATE utilisateurs SET password = $1 WHERE id = $2',
      [hashedPassword, decoded.userId]
    );

    return NextResponse.json({ message: 'Mot de passe mis à jour avec succès' });
  } catch (error) {
    return NextResponse.json({ error: 'Token invalide ou expiré' }, { status: 400 });
  }
} 