import { NextResponse } from 'next/server';
import pool from '@/lib/db';

// GET /api/students - Récupérer tous les étudiants
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const department = searchParams.get('department') || '';
    const includeArchived = searchParams.get('includeArchived') === 'true';
    
    console.log('Paramètres de recherche:', { search, department, includeArchived });
    
    // Requête pour récupérer les étudiants avec informations de filière
    let query = `
      SELECT u.id, u.fullname, u.studentid, u.email, u.phone, u.address, u.created_at, u.last_login,
             f.id as filiere_id, f.nom as filiere_nom,
             ARRAY_AGG(r.nom) as roles
      FROM utilisateurs u
      LEFT JOIN filiere f ON u.filiere_id = f.id
      JOIN utilisateurs_roles ur ON u.id = ur.student_id
      JOIN roles r ON ur.role_id = r.role_id
      WHERE r.nom = 'etudiant'
      ${!includeArchived ? "AND (u.is_archived IS NULL OR u.is_archived = false)" : ""}
      GROUP BY u.id, f.id, f.nom
      ORDER BY u.created_at DESC
    `;
    
    const queryParams = [];
    let paramCount = 1;
    
    // Vérifier d'abord si nous avons des utilisateurs
    const checkUsers = await pool.query('SELECT COUNT(*) FROM utilisateurs');
    console.log('Nombre total d\'utilisateurs:', checkUsers.rows[0].count);
    
    // Vérifier si nous avons des rôles
    const checkRoles = await pool.query('SELECT * FROM roles');
    console.log('Rôles disponibles:', checkRoles.rows);
    
    // Vérifier les utilisateurs avec le rôle etudiant
    const checkStudents = await pool.query(`
      SELECT COUNT(*) 
      FROM utilisateurs u
      JOIN utilisateurs_roles ur ON u.id = ur.student_id
      JOIN roles r ON ur.role_id = r.role_id
      WHERE r.nom = 'etudiant'
    `);
    console.log('Nombre d\'étudiants:', checkStudents.rows[0].count);
    
    // Appliquer les filtres si nécessaire
    if (search) {
      query = `
        SELECT u.id, u.fullname, u.studentid, u.email, u.phone, u.address, u.created_at, u.last_login,
               f.id as filiere_id, f.nom as filiere_nom,
               ARRAY_AGG(r.nom) as roles
        FROM utilisateurs u
        LEFT JOIN filiere f ON u.filiere_id = f.id
        JOIN utilisateurs_roles ur ON u.id = ur.student_id
        JOIN roles r ON ur.role_id = r.role_id
        WHERE r.nom = 'etudiant'
        ${!includeArchived ? "AND (u.is_archived IS NULL OR u.is_archived = false)" : ""}
        AND (
          u.fullname ILIKE $1 OR 
          u.email ILIKE $1 OR 
          u.studentid ILIKE $1
        )
        GROUP BY u.id, f.id, f.nom
        ORDER BY u.created_at DESC
      `;
      queryParams.push(`%${search}%`);
    }
    
    if (department && department !== 'all') {
      // Filtrer par filière
      query = `
        SELECT u.id, u.fullname, u.studentid, u.email, u.phone, u.address, u.created_at, u.last_login,
               f.id as filiere_id, f.nom as filiere_nom,
               ARRAY_AGG(r.nom) as roles
        FROM utilisateurs u
        LEFT JOIN filiere f ON u.filiere_id = f.id
        JOIN utilisateurs_roles ur ON u.id = ur.student_id
        JOIN roles r ON ur.role_id = r.role_id
        WHERE r.nom = 'etudiant'
        ${!includeArchived ? "AND (u.is_archived IS NULL OR u.is_archived = false)" : ""}
        AND f.nom = $1
        GROUP BY u.id, f.id, f.nom
        ORDER BY u.created_at DESC
      `;
      queryParams.push(department);
    }
    
    console.log('Requête SQL finale:', query);
    console.log('Paramètres:', queryParams);
    
    const result = await pool.query(query, queryParams);
    console.log('Nombre de résultats:', result.rows.length);
    
    // Transformer les données pour correspondre à la structure attendue par le frontend
    const students = result.rows.map(student => ({
      id: student.id,
      name: student.fullname,
      email: student.email,
      department: student.filiere_nom || 'Non assigné',
      matricule: student.studentid,
      joinDate: new Date(student.created_at).toLocaleDateString('fr-FR'),
      statut: 'Full-time', // Valeur par défaut
      avatar: "/placeholder.svg?height=40&width=40",
    }));
    
    console.log('Étudiants transformés:', students.length);
    
    return NextResponse.json(students);
  } catch (error) {
    console.error('Erreur lors de la récupération des étudiants:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 }); 
  }
} 

// POST /api/students - Créer un nouvel étudiant
export async function POST(request) {
  try {
    const { fullname, email, studentid, filiere_id } = await request.json();
    
    // Vérifier que les champs obligatoires sont présents
    if (!fullname || !email || !studentid || !filiere_id) {
      return NextResponse.json(
        { error: 'Les champs nom, email, matricule et filière sont obligatoires' }, 
        { status: 400 }
      );
    }

    // Vérifier si l'email ou le matricule existe déjà
    const checkExisting = await pool.query(
      'SELECT * FROM utilisateurs WHERE email = $1 OR studentid = $2',
      [email, studentid]
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

    // Générer un mot de passe temporaire (à remplacer par un système plus sécurisé)
    const temporaryPassword = studentid; // Utilise le matricule comme mot de passe temporaire

    // Insérer le nouvel utilisateur
    const insertUser = await pool.query(
      `INSERT INTO utilisateurs 
       (fullname, email, studentid, password, filiere_id) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING id`,
      [fullname, email, studentid, temporaryPassword, filiere_id]
    );

    const userId = insertUser.rows[0].id;

    // Récupérer l'ID du rôle étudiant
    const roleQuery = await pool.query('SELECT role_id FROM roles WHERE nom = $1', ['etudiant']);
    
    if (roleQuery.rows.length === 0) {
      throw new Error('Le rôle étudiant n\'existe pas dans la base de données');
    }
    
    const roleId = roleQuery.rows[0].role_id;

    // Associer le rôle étudiant au nouvel utilisateur
    await pool.query(
      'INSERT INTO utilisateurs_roles (student_id, role_id) VALUES ($1, $2)',
      [userId, roleId]
    );

    // Récupérer le nouvel étudiant avec toutes ses informations
    const newStudent = await pool.query(
      `SELECT u.id, u.fullname, u.studentid, u.email, u.created_at, f.nom as filiere_nom
       FROM utilisateurs u
       LEFT JOIN filiere f ON u.filiere_id = f.id
       WHERE u.id = $1`,
      [userId]
    );

    return NextResponse.json({
      success: true,
      student: {
        id: newStudent.rows[0].id,
        name: newStudent.rows[0].fullname,
        email: newStudent.rows[0].email,
        matricule: newStudent.rows[0].studentid,
        department: newStudent.rows[0].filiere_nom || 'Non assigné',
        joinDate: new Date(newStudent.rows[0].created_at).toLocaleDateString('fr-FR')
      }
    }, { status: 201 });
    
  } catch (error) {
    console.error('Erreur lors de la création de l\'étudiant:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
} 