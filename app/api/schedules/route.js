import { NextResponse } from 'next/server';
import pool from '@/lib/db';

// GET /api/schedules - Récupérer tous les emplois du temps
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const coursId = searchParams.get('cours_id');
    const salleId = searchParams.get('salle_id');
    const jourSemaine = searchParams.get('jour_semaine');
    
    let query = `
      SELECT e.seance_id, e.cours_id, e.salle_id, e.jour_semaine, e.heure_debut, e.heure_fin,
             c.code as cours_code, c.titre as cours_titre,
             s.nom as salle_nom, s.capacite as salle_capacite, s.localisation as salle_localisation
      FROM emplois_du_temps e
      JOIN cours c ON e.cours_id = c.cours_id
      LEFT JOIN salles s ON e.salle_id = s.salle_id
    `;
    
    const queryParams = [];
    let paramCount = 1;
    
    if (coursId || salleId || jourSemaine) {
      query += ' WHERE ';
      
      if (coursId) {
        query += `e.cours_id = $${paramCount}`;
        queryParams.push(coursId);
        paramCount++;
      }
      
      if (salleId) {
        if (coursId) {
          query += ' AND ';
        }
        query += `e.salle_id = $${paramCount}`;
        queryParams.push(salleId);
        paramCount++;
      }
      
      if (jourSemaine) {
        if (coursId || salleId) {
          query += ' AND ';
        }
        query += `e.jour_semaine = $${paramCount}`;
        queryParams.push(jourSemaine);
        paramCount++;
      }
    }
    
    query += ' ORDER BY e.jour_semaine, e.heure_debut';
    
    const result = await pool.query(query, queryParams);
    
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Erreur lors de la récupération des emplois du temps:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// POST /api/schedules - Créer un nouvel emploi du temps
export async function POST(request) {
  try {
    const { cours_id, salle_id, jour_semaine, heure_debut, heure_fin } = await request.json();
    
    // Vérifier si le cours existe
    const courseExists = await pool.query(
      'SELECT * FROM cours WHERE cours_id = $1',
      [cours_id]
    );
    
    if (courseExists.rows.length === 0) {
      return NextResponse.json(
        { error: 'Cours non trouvé' },
        { status: 404 }
      );
    }
    
    // Vérifier si la salle existe (si fournie)
    if (salle_id) {
      const roomExists = await pool.query(
        'SELECT * FROM salles WHERE salle_id = $1',
        [salle_id]
      );
      
      if (roomExists.rows.length === 0) {
        return NextResponse.json(
          { error: 'Salle non trouvée' },
          { status: 404 }
        );
      }
    }
    
    // Vérifier si le jour de la semaine est valide
    if (jour_semaine < 1 || jour_semaine > 7) {
      return NextResponse.json(
        { error: 'Le jour de la semaine doit être compris entre 1 et 7' },
        { status: 400 }
      );
    }
    
    // Vérifier si l'heure de début est antérieure à l'heure de fin
    if (heure_debut >= heure_fin) {
      return NextResponse.json(
        { error: 'L\'heure de début doit être antérieure à l\'heure de fin' },
        { status: 400 }
      );
    }
    
    // Vérifier s'il y a un conflit d'horaire
    const conflictCheck = await pool.query(
      `SELECT * FROM emplois_du_temps 
       WHERE jour_semaine = $1 
       AND ((heure_debut <= $2 AND heure_fin > $2) OR (heure_debut < $3 AND heure_fin >= $3))
       AND cours_id != $4`,
      [jour_semaine, heure_debut, heure_fin, cours_id]
    );
    
    if (conflictCheck.rows.length > 0) {
      return NextResponse.json(
        { error: 'Conflit d\'horaire détecté' },
        { status: 400 }
      );
    }
    
    // Insérer l'emploi du temps
    const result = await pool.query(
      `INSERT INTO emplois_du_temps (cours_id, salle_id, jour_semaine, heure_debut, heure_fin)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING seance_id, cours_id, salle_id, jour_semaine, heure_debut, heure_fin`,
      [cours_id, salle_id, jour_semaine, heure_debut, heure_fin]
    );
    
    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error('Erreur lors de la création de l\'emploi du temps:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
} 