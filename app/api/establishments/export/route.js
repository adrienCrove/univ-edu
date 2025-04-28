import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import Excel from 'exceljs';

export async function POST(request) {
  try {
    const { fields, filters } = await request.json();
    
    console.log('Champs à exporter:', fields);
    console.log('Filtres:', filters);
    
    // Vérifier si des champs ont été spécifiés
    if (!fields || !Array.isArray(fields) || fields.length === 0) {
      return NextResponse.json({ error: 'Aucun champ spécifié pour l\'export' }, { status: 400 });
    }
    
    // Construire la requête SQL en fonction des champs et filtres
    let queryFields = '';
    const validFields = ['id', 'nom', 'code', 'adresse', 'contact', 'email', 'telephone', 'site_web', 'image', 'university_id'];
    
    // Ajouter l'alias de l'université (toujours utile)
    const hasUniversityId = fields.includes('university_id');
    const fieldsToSelect = fields.filter(field => validFields.includes(field));
    
    if (fieldsToSelect.length === 0) {
      return NextResponse.json({ error: 'Aucun champ valide spécifié' }, { status: 400 });
    }
    
    queryFields = fieldsToSelect.map(field => `e.${field}`).join(', ');
    if (hasUniversityId) {
      queryFields += ', u.nom as university_name';
    }
    
    let query = `
      SELECT ${queryFields}
      FROM etablissement e
      LEFT JOIN university u ON e.university_id = u.id
      WHERE 1=1
    `;
    
    const queryParams = [];
    let paramCount = 1;
    
    // Ajouter les filtres si présents
    if (filters) {
      if (filters.search) {
        query += ` AND (e.nom ILIKE $${paramCount} OR e.code ILIKE $${paramCount})`;
        queryParams.push(`%${filters.search}%`);
        paramCount++;
      }
      
      if (filters.universityId) {
        query += ` AND e.university_id = $${paramCount}`;
        queryParams.push(filters.universityId);
        paramCount++;
      }
    }
    
    query += ' ORDER BY e.nom';
    
    console.log('Requête SQL:', query);
    console.log('Paramètres:', queryParams);
    
    const result = await pool.query(query, queryParams);
    const establishments = result.rows;
    
    // Créer un nouveau classeur et une feuille Excel
    const workbook = new Excel.Workbook();
    const worksheet = workbook.addWorksheet('Établissements');
    
    // Définir les en-têtes de colonnes
    const columnHeaders = fieldsToSelect.map(field => {
      switch(field) {
        case 'id': return 'ID';
        case 'nom': return 'Nom';
        case 'code': return 'Code';
        case 'adresse': return 'Adresse';
        case 'contact': return 'Contact';
        case 'email': return 'Email';
        case 'telephone': return 'Téléphone';
        case 'site_web': return 'Site Web';
        case 'image': return 'Image URL';
        case 'university_id': return 'ID Université';
        default: return field;
      }
    });
    
    if (hasUniversityId) {
      columnHeaders.push('Nom Université');
    }
    
    worksheet.columns = columnHeaders.map(header => ({
      header: header,
      key: header.toLowerCase().replace(' ', '_'),
      width: 20
    }));
    
    // Ajouter les données
    establishments.forEach(establishment => {
      const row = {};
      fieldsToSelect.forEach((field, index) => {
        row[columnHeaders[index].toLowerCase().replace(' ', '_')] = establishment[field];
      });
      
      if (hasUniversityId) {
        row['nom_université'] = establishment.university_name;
      }
      
      worksheet.addRow(row);
    });
    
    // Styliser les en-têtes
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' }
    };
    
    // Générer le buffer Excel
    const buffer = await workbook.xlsx.writeBuffer();
    
    // Configurer les en-têtes de réponse
    const responseHeaders = {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename=etablissements.xlsx'
    };
    
    // Retourner le fichier Excel
    return new NextResponse(buffer, { headers: responseHeaders });
    
  } catch (error) {
    console.error('Erreur lors de l\'export des établissements:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'export des établissements', details: error.message },
      { status: 500 }
    );
  }
} 