import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import ExcelJS from 'exceljs';
import { parse } from 'url';

// GET /api/programs/export - Exporter toutes les filières
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'json';

    // Requête pour récupérer toutes les filières avec les informations associées
    const result = await pool.query(`
      SELECT f.id, f.nom, f.code, f.etablissement_id, 
             e.nom as etablissement_nom, e.university_id,
             u.nom as universite_nom
      FROM filiere f
      JOIN etablissement e ON f.etablissement_id = e.id
      JOIN university u ON e.university_id = u.id
      ORDER BY f.nom
    `);
    
    // Transformer les données
    const programs = result.rows.map(program => ({
      id: program.id,
      nom: program.nom,
      code: program.code,
      etablissement_id: program.etablissement_id,
      etablissement_nom: program.etablissement_nom,
      university_id: program.university_id,
      universite_nom: program.universite_nom
    }));

    // Répondre selon le format demandé
    switch (format) {
      case 'xlsx': 
        return exportExcel(programs);
      case 'csv':
        return exportCSV(programs);
      case 'json':
      default:
        return NextResponse.json(programs);
    }
  } catch (error) {
    console.error('Erreur lors de l\'export des filières:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'export des filières', details: error.message },
      { status: 500 }
    );
  }
}

// Fonction pour export Excel
async function exportExcel(data) {
  // Créer un nouveau classeur Excel
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Filières');
  
  // Définir les colonnes
  worksheet.columns = [
    { header: 'ID', key: 'id', width: 10 },
    { header: 'Nom', key: 'nom', width: 30 },
    { header: 'Code', key: 'code', width: 15 },
    { header: 'Établissement', key: 'etablissement_nom', width: 30 },
    { header: 'ID Établissement', key: 'etablissement_id', width: 15 },
    { header: 'Université', key: 'universite_nom', width: 30 },
    { header: 'ID Université', key: 'university_id', width: 15 }
  ];
  
  // Style d'en-tête
  worksheet.getRow(1).font = { bold: true };
  worksheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE0E0E0' }
  };
  
  // Ajouter les données
  data.forEach(program => {
    worksheet.addRow(program);
  });
  
  // Générer le buffer Excel
  const buffer = await workbook.xlsx.writeBuffer();
  
  // Créer la réponse
  return new NextResponse(buffer, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename=filieres_export_${new Date().toISOString().slice(0, 10)}.xlsx`
    }
  });
}

// Fonction pour export CSV
async function exportCSV(data) {
  // Créer un nouveau classeur Excel (on utilise ExcelJS pour le CSV aussi)
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Filières');
  
  // Définir les colonnes
  worksheet.columns = [
    { header: 'ID', key: 'id', width: 10 },
    { header: 'Nom', key: 'nom', width: 30 },
    { header: 'Code', key: 'code', width: 15 },
    { header: 'Établissement', key: 'etablissement_nom', width: 30 },
    { header: 'ID Établissement', key: 'etablissement_id', width: 15 },
    { header: 'Université', key: 'universite_nom', width: 30 },
    { header: 'ID Université', key: 'university_id', width: 15 }
  ];
  
  // Ajouter les données
  data.forEach(program => {
    worksheet.addRow(program);
  });
  
  // Générer le buffer CSV
  const buffer = await workbook.csv.writeBuffer();
  
  // Créer la réponse
  return new NextResponse(buffer, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename=filieres_export_${new Date().toISOString().slice(0, 10)}.csv`
    }
  });
} 