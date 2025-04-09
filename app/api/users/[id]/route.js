import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import bcrypt from 'bcrypt';

// GET /api/users/[id] - Récupérer un utilisateur spécifique
export async function GET(request, { params }) {
  try {
    const { id } = params;
    
    const result = await pool.query(`
      SELECT u.id, u.fullname, u.studentid, u.email, u.phone, u.address, u.created_at, u.last_login,
             ARRAY_AGG(r.nom) as roles
      FROM utilisateurs u
      LEFT JOIN utilisateurs_roles ur ON u.id = ur.student_id
      LEFT JOIN roles r ON ur.role_id = r.role_id
      WHERE u.id = $1
      GROUP BY u.id
    `, [id]);
    
    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
    }
    
    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'utilisateur:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// PUT /api/users/[id] - Mettre à jour un utilisateur
export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const { fullname, studentid, email, password, phone, address, roles } = await request.json();
    
    // Vérifier si l'utilisateur existe
    const userExists = await pool.query(
      'SELECT * FROM utilisateurs WHERE id = $1',
      [id]
    );
    
    if (userExists.rows.length === 0) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
    }
    
    // Vérifier si le nouveau studentid ou email est déjà utilisé par un autre utilisateur
    if (studentid || email) {
      const duplicateCheck = await pool.query(
        'SELECT * FROM utilisateurs WHERE (studentid = $1 OR email = $2) AND id != $3',
        [studentid || userExists.rows[0].studentid, email || userExists.rows[0].email, id]
      );
      
      if (duplicateCheck.rows.length > 0) {
        return NextResponse.json(
          { error: 'Un utilisateur avec ce numéro matricule ou cet email existe déjà' },
          { status: 400 }
        );
      }
    }
    
    // Préparer la requête de mise à jour
    let updateQuery = 'UPDATE utilisateurs SET ';
    const updateValues = [];
    let paramCount = 1;
    
    if (fullname) {
      updateQuery += `fullname = $${paramCount}, `;
      updateValues.push(fullname);
      paramCount++;
    }
    
    if (studentid) {
      updateQuery += `studentid = $${paramCount}, `;
      updateValues.push(studentid);
      paramCount++;
    }
    
    if (email) {
      updateQuery += `email = $${paramCount}, `;
      updateValues.push(email);
      paramCount++;
    }
    
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateQuery += `password = $${paramCount}, `;
      updateValues.push(hashedPassword);
      paramCount++;
    }
    
    if (phone !== undefined) {
      updateQuery += `phone = $${paramCount}, `;
      updateValues.push(phone);
      paramCount++;
    }
    
    if (address !== undefined) {
      updateQuery += `address = $${paramCount}, `;
      updateValues.push(address);
      paramCount++;
    }
    
    // Supprimer la dernière virgule et ajouter la clause WHERE
    updateQuery = updateQuery.slice(0, -2) + ` WHERE id = $${paramCount} RETURNING id, fullname, studentid, email, phone, address, created_at`;
    updateValues.push(id);
    
    // Exécuter la mise à jour
    const result = await pool.query(updateQuery, updateValues);
    
    // Mettre à jour les rôles si fournis
    if (roles) {
      // Supprimer les rôles existants
      await pool.query('DELETE FROM utilisateurs_roles WHERE student_id = $1', [id]);
      
      // Ajouter les nouveaux rôles
      for (const roleName of roles) {
        const roleResult = await pool.query(
          'SELECT role_id FROM roles WHERE nom = $1',
          [roleName]
        );
        
        if (roleResult.rows.length > 0) {
          const roleId = roleResult.rows[0].role_id;
          
          await pool.query(
            'INSERT INTO utilisateurs_roles (student_id, role_id) VALUES ($1, $2)',
            [id, roleId]
          );
        }
      }
    }
    
    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'utilisateur:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// DELETE /api/users/[id] - Supprimer un utilisateur
export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    
    // Vérifier si l'utilisateur existe
    const userExists = await pool.query(
      'SELECT * FROM utilisateurs WHERE id = $1',
      [id]
    );
    
    if (userExists.rows.length === 0) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
    }
    
    // Supprimer l'utilisateur (les contraintes de clé étrangère supprimeront automatiquement les entrées dans utilisateurs_roles)
    await pool.query('DELETE FROM utilisateurs WHERE id = $1', [id]);
    
    return NextResponse.json({ message: 'Utilisateur supprimé avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'utilisateur:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
} 