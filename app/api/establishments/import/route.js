import { NextResponse } from 'next/server';
import Excel from 'exceljs';
import pool from '@/lib/db';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    
    if (!file) {
      return NextResponse.json(
        { error: 'Aucun fichier n\'a été fourni' },
        { status: 400 }
      );
    }
    
    // Vérifier le type de fichier
    const allowedTypes = ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Type de fichier non autorisé. Utilisez un fichier Excel (.xlsx)' },
        { status: 400 }
      );
    }
    
    // Lire le contenu du fichier
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Charger le classeur Excel
    const workbook = new Excel.Workbook();
    await workbook.xlsx.load(buffer);
    
    // Récupérer la première feuille
    const worksheet = workbook.getWorksheet(1);
    if (!worksheet) {
      return NextResponse.json(
        { error: 'Aucune feuille trouvée dans le fichier Excel' },
        { status: 400 }
      );
    }
    
    // Analyser les en-têtes pour déterminer les colonnes
    const headers = {};
    worksheet.getRow(1).eachCell((cell, colNumber) => {
      const value = cell.value.toString().trim().toLowerCase();
      
      switch(value) {
        case 'nom': headers.nom = colNumber; break;
        case 'code': headers.code = colNumber; break;
        case 'adresse': headers.adresse = colNumber; break;
        case 'contact': headers.contact = colNumber; break;
        case 'email': headers.email = colNumber; break;
        case 'téléphone':
        case 'telephone': headers.telephone = colNumber; break;
        case 'site web': 
        case 'site_web': headers.site_web = colNumber; break;
        case 'image': 
        case 'image url': headers.image = colNumber; break;
        case 'université': 
        case 'universite':
        case 'université id':
        case 'universite id':
        case 'nom université': 
        case 'nom universite': headers.university_name = colNumber; break;
      }
    });
    
    // Vérifier si les colonnes obligatoires sont présentes
    if (!headers.nom) {
      return NextResponse.json(
        { error: 'La colonne "Nom" est obligatoire dans le fichier Excel' },
        { status: 400 }
      );
    }
    
    if (!headers.university_name) {
      return NextResponse.json(
        { error: 'Une colonne pour l\'université est requise (Université, Nom Université, etc.)' },
        { status: 400 }
      );
    }
    
    // Convertir les données Excel en objets
    const establishments = [];
    const errors = [];
    let rowCounter = 0;
    
    // Parcourir les lignes de données (en sautant l'en-tête)
    worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
      if (rowNumber === 1) return; // Sauter l'en-tête
      
      rowCounter++;
      const establishment = {};
      
      // Récupérer les valeurs des cellules
      if (headers.nom) establishment.nom = row.getCell(headers.nom).value || '';
      if (headers.code) establishment.code = row.getCell(headers.code).value || '';
      if (headers.adresse) establishment.adresse = row.getCell(headers.adresse).value || '';
      if (headers.contact) establishment.contact = row.getCell(headers.contact).value || '';
      if (headers.email) establishment.email = row.getCell(headers.email).value || '';
      if (headers.telephone) establishment.telephone = row.getCell(headers.telephone).value || '';
      if (headers.site_web) establishment.site_web = row.getCell(headers.site_web).value || '';
      if (headers.image) establishment.image = row.getCell(headers.image).value || '';
      if (headers.university_name) establishment.university_name = row.getCell(headers.university_name).value || '';
      
      // Validation basique
      if (!establishment.nom) {
        errors.push(`Ligne ${rowCounter}: Le nom est obligatoire`);
      }
      
      if (!establishment.university_name) {
        errors.push(`Ligne ${rowCounter}: Le nom de l'université est obligatoire`);
      }
      
      establishments.push(establishment);
    });
    
    if (errors.length > 0) {
      return NextResponse.json({ success: false, errors }, { status: 400 });
    }
    
    // Traiter l'import en base de données
    const importResults = {
      imported: 0,
      skipped: 0,
      errors: []
    };
    
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      for (const establishment of establishments) {
        try {
          // 1. Trouver l'université par son nom
          const universityResult = await client.query(
            'SELECT id FROM university WHERE nom ILIKE $1',
            [establishment.university_name]
          );
          
          if (universityResult.rows.length === 0) {
            importResults.errors.push(`Université "${establishment.university_name}" non trouvée pour l'établissement "${establishment.nom}"`);
            importResults.skipped++;
            continue;
          }
          
          const university_id = universityResult.rows[0].id;
          
          // 2. Vérifier si l'établissement existe déjà
          const existingResult = await client.query(
            'SELECT id FROM etablissement WHERE nom = $1 AND university_id = $2',
            [establishment.nom, university_id]
          );
          
          if (existingResult.rows.length > 0) {
            importResults.skipped++;
            continue;
          }
          
          // 3. Insérer le nouvel établissement
          await client.query(
            `INSERT INTO etablissement 
             (nom, code, adresse, contact, email, telephone, site_web, image, university_id)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
            [
              establishment.nom,
              establishment.code || null,
              establishment.adresse || null,
              establishment.contact || null, 
              establishment.email || null,
              establishment.telephone || null,
              establishment.site_web || null,
              establishment.image || null,
              university_id
            ]
          );
          
          importResults.imported++;
        } catch (error) {
          importResults.errors.push(`Erreur pour "${establishment.nom}": ${error.message}`);
          importResults.skipped++;
        }
      }
      
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
    
    return NextResponse.json({
      success: true,
      totalRows: establishments.length,
      ...importResults
    }, { status: 200 });
    
  } catch (error) {
    console.error('Erreur lors de l\'import des établissements:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'import des établissements', details: error.message },
      { status: 500 }
    );
  }
} 