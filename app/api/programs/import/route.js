import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import ExcelJS from 'exceljs';

// POST /api/programs/import - Importer des filières depuis un fichier Excel
export async function POST(request) {
  try {
    // Récupérer le fichier Excel depuis FormData
    const formData = await request.formData();
    const file = formData.get('file');
    
    if (!file) {
      return NextResponse.json({ error: 'Aucun fichier fourni' }, { status: 400 });
    }
    
    // Lire le contenu du fichier
    const buffer = await file.arrayBuffer();
    const programs = await parseExcelData(buffer);
    
    // Valider les données
    if (!Array.isArray(programs) || programs.length === 0) {
      return NextResponse.json({ error: 'Format de données invalide ou aucune donnée trouvée' }, { status: 400 });
    }
    
    // Vérifier que chaque enregistrement a les propriétés requises
    const requiredFields = ['nom', 'code', 'etablissement_id'];
    const missingFields = programs.some(program => 
      !requiredFields.every(field => program[field] !== undefined && program[field] !== null)
    );
    
    if (missingFields) {
      return NextResponse.json({ 
        error: 'Certains enregistrements ne contiennent pas tous les champs requis (nom, code, etablissement_id)'
      }, { status: 400 });
    }
    
    // Stocker chaque filière dans la base de données
    let importedCount = 0;
    let updatedCount = 0;
    
    for (const program of programs) {
      // Vérifier si la filière existe déjà
      const existingProgram = await pool.query(
        'SELECT id FROM filiere WHERE code = $1 OR (nom = $2 AND etablissement_id = $3)',
        [program.code, program.nom, program.etablissement_id]
      );
      
      if (existingProgram.rows.length > 0) {
        // Mettre à jour la filière existante
        await pool.query(
          'UPDATE filiere SET nom = $1, code = $2, etablissement_id = $3 WHERE id = $4',
          [program.nom, program.code, program.etablissement_id, existingProgram.rows[0].id]
        );
        updatedCount++;
      } else {
        // Insérer une nouvelle filière
        await pool.query(
          'INSERT INTO filiere (nom, code, etablissement_id) VALUES ($1, $2, $3)',
          [program.nom, program.code, program.etablissement_id]
        );
        importedCount++;
      }
    }
    
    return NextResponse.json({ 
      success: true, 
      message: `Import réussi: ${importedCount} filières importées, ${updatedCount} filières mises à jour.` 
    });
    
  } catch (error) {
    console.error('Erreur lors de l\'import des filières:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'import des filières', details: error.message },
      { status: 500 }
    );
  }
}

// Fonction pour analyser le fichier Excel et extraire les données
async function parseExcelData(buffer) {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);
  
  const worksheet = workbook.getWorksheet(1); // Première feuille
  if (!worksheet) {
    throw new Error('Aucune feuille de calcul trouvée dans le fichier Excel');
  }
  
  const headers = [];
  const programs = [];
  
  // Extraire les en-têtes (première ligne)
  worksheet.getRow(1).eachCell((cell, colNumber) => {
    headers[colNumber] = cell.value ? cell.value.toString().toLowerCase().trim() : null;
  });
  
  // Mapper les index de colonnes aux noms de champs
  const fieldMap = {
    id: headers.indexOf('id'),
    nom: headers.indexOf('nom'),
    code: headers.indexOf('code'),
    etablissement_id: headers.indexOf('id établissement') !== -1 ? 
                      headers.indexOf('id établissement') : 
                      headers.indexOf('etablissement_id')
  };
  
  // Vérifier que les colonnes requises sont présentes
  if (fieldMap.nom === -1 || fieldMap.code === -1 || fieldMap.etablissement_id === -1) {
    throw new Error('Colonnes requises manquantes dans le fichier Excel. Assurez-vous que "nom", "code" et "id établissement" (ou "etablissement_id") sont présents.');
  }
  
  // Extraire les données (à partir de la deuxième ligne)
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return; // Ignorer la ligne d'en-tête
    
    const program = {};
    
    // Récupérer les valeurs de chaque cellule
    Object.entries(fieldMap).forEach(([field, colIndex]) => {
      if (colIndex !== -1) {
        const cell = row.getCell(colIndex);
        program[field] = cell.value !== null && cell.value !== undefined ? cell.value : null;
      }
    });
    
    // Ajouter l'enregistrement s'il contient des données
    if (program.nom && program.code && program.etablissement_id) {
      programs.push(program);
    }
  });
  
  return programs;
} 