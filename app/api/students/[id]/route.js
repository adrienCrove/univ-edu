import { NextResponse } from 'next/server';
import pool from '@/lib/db';

// GET /api/students/[id] - Récupérer un étudiant spécifique
export async function GET(request, { params }) {
  try {
    const { id } = params;
    
    // Vérifier si l'étudiant existe
    const result = await pool.query(
      `SELECT u.id, u.fullname, u.studentid, u.email, u.phone, u.address, u.created_at, u.last_login,
              f.id as filiere_id, f.nom as filiere_nom, f.etablissement_id
       FROM utilisateurs u
       LEFT JOIN filiere f ON u.filiere_id = f.id
       WHERE u.id = $1`,
      [id]
    );
    
    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Étudiant non trouvé' },
        { status: 404 }
      );
    }
    
    // Récupérer les informations de l'étudiant
    const student = result.rows[0];
    
    return NextResponse.json({
      id: student.id,
      name: student.fullname,
      email: student.email,
      matricule: student.studentid,
      phone: student.phone,
      address: student.address,
      created_at: student.created_at,
      last_login: student.last_login,
      filiere_id: student.filiere_id,
      filiere_nom: student.filiere_nom,
      etablissement_id: student.etablissement_id
    });
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'étudiant:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

// PUT /api/students/[id] - Mettre à jour un étudiant
export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const { fullname, email, studentid, filiere_id } = await request.json();
    
    // Vérifier que les champs obligatoires sont présents
    if (!fullname || !email || !studentid || !filiere_id) {
      return NextResponse.json(
        { error: 'Les champs nom, email, matricule et filière sont obligatoires' }, 
        { status: 400 }
      );
    }
    
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
    
    // Vérifier si l'email ou le matricule existe déjà (sauf pour l'étudiant actuel)
    const checkExisting = await pool.query(
      'SELECT * FROM utilisateurs WHERE (email = $1 OR studentid = $2) AND id != $3',
      [email, studentid, id]
    );
    
    if (checkExisting.rows.length > 0) {
      // Déterminer quel champ est en doublon
      const existingEmail = checkExisting.rows.some(row => row.email === email);
      const existingStudentId = checkExisting.rows.some(row => row.studentid === studentid);
      
      let errorMessage = '';
      if (existingEmail && existingStudentId) {
        errorMessage = 'Cet email et ce matricule sont déjà utilisés';
      } else if (existingEmail) {
        errorMessage = 'Cet email est déjà utilisé';
      } else if (existingStudentId) {
        errorMessage = 'Ce matricule est déjà utilisé';
      }
      
      return NextResponse.json({ error: errorMessage }, { status: 409 });
    }
    
    // Mettre à jour l'étudiant
    await pool.query(
      `UPDATE utilisateurs 
       SET fullname = $1, email = $2, studentid = $3, filiere_id = $4
       WHERE id = $5`,
      [fullname, email, studentid, filiere_id, id]
    );
    
    // Récupérer l'étudiant mis à jour
    const result = await pool.query(
      `SELECT u.id, u.fullname, u.studentid, u.email, u.created_at, f.nom as filiere_nom
       FROM utilisateurs u
       LEFT JOIN filiere f ON u.filiere_id = f.id
       WHERE u.id = $1`,
      [id]
    );
    
    return NextResponse.json({
      success: true,
      student: {
        id: result.rows[0].id,
        name: result.rows[0].fullname,
        email: result.rows[0].email,
        matricule: result.rows[0].studentid,
        department: result.rows[0].filiere_nom || 'Non assigné',
        joinDate: new Date(result.rows[0].created_at).toLocaleDateString('fr-FR')
      }
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'étudiant:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
} 