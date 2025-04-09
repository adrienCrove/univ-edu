import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import bcrypt from 'bcrypt';

// GET /api/users - Récupérer tous les utilisateurs
export async function GET() {
  try {
    const result = await pool.query(`
      SELECT u.id, u.fullname, u.studentid, u.email, u.phone, u.address, u.created_at, u.last_login,
             ARRAY_AGG(r.nom) as roles
      FROM utilisateurs u
      LEFT JOIN utilisateurs_roles ur ON u.id = ur.student_id
      LEFT JOIN roles r ON ur.role_id = r.role_id
      GROUP BY u.id
      ORDER BY u.created_at DESC
    `);
    
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// POST /api/users - Créer un nouvel utilisateur
export async function POST(request) {
  try {
    const { fullname, studentid, email, password, phone, address, roles } = await request.json();
    
    // Vérifier si l'utilisateur existe déjà
    const userExists = await pool.query(
      'SELECT * FROM utilisateurs WHERE studentid = $1 OR email = $2',
      [studentid, email]
    );
    
    if (userExists.rows.length > 0) {
      return NextResponse.json(
        { error: 'Un utilisateur avec ce numéro matricule ou cet email existe déjà' },
        { status: 400 }
      );
    }
    
    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Insérer l'utilisateur
    const result = await pool.query(
      `INSERT INTO utilisateurs (fullname, studentid, email, password, phone, address)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, fullname, studentid, email, phone, address, created_at`,
      [fullname, studentid, email, hashedPassword, phone, address]
    );
    
    const newUser = result.rows[0];
    
    // Attribuer les rôles
    if (roles && roles.length > 0) {
      for (const roleName of roles) {
        // Récupérer l'ID du rôle
        const roleResult = await pool.query(
          'SELECT role_id FROM roles WHERE nom = $1',
          [roleName]
        );
        
        if (roleResult.rows.length > 0) {
          const roleId = roleResult.rows[0].role_id;
          
          // Attribuer le rôle à l'utilisateur
          await pool.query(
            'INSERT INTO utilisateurs_roles (student_id, role_id) VALUES ($1, $2)',
            [newUser.id, roleId]
          );
        }
      }
    }
    
    return NextResponse.json(newUser, { status: 201 });
  } catch (error) {
    console.error('Erreur lors de la création de l\'utilisateur:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
} 