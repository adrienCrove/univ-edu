'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Download, Upload, FileUp, FileDown } from 'lucide-react';

// Composant de modal pour l'export Excel
export function ExportModal({ isOpen, onClose, onExport }) {
  const [fields, setFields] = useState({
    id: true,
    nom: true,
    code: true,
    adresse: true,
    contact: true,
    email: true,
    telephone: true,
    site_web: true,
    image: false,
    university_id: true
  });

  const handleToggleField = (field) => {
    setFields(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleExport = async () => {
    // Récupérer la liste des champs sélectionnés
    const selectedFields = Object.entries(fields)
      .filter(([_, selected]) => selected)
      .map(([field]) => field);

    if (selectedFields.length === 0) {
      toast.error('Veuillez sélectionner au moins un champ');
      return;
    }

    try {
      // Appeler l'API d'export avec les champs sélectionnés
      const response = await fetch('/api/establishments/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fields: selectedFields }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erreur lors de l\'export');
      }

      // Télécharger le fichier Excel
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'etablissements.xlsx';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      onClose();
      toast.success('Export réussi');
    } catch (error) {
      toast.error(error.message);
      console.error('Erreur:', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Exporter les établissements</DialogTitle>
          <DialogDescription>
            Sélectionnez les champs à inclure dans le fichier Excel
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4 py-4">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="nom" 
                checked={fields.nom} 
                onCheckedChange={() => handleToggleField('nom')} 
                disabled={true}
              />
              <Label htmlFor="nom">Nom</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="code" 
                checked={fields.code} 
                onCheckedChange={() => handleToggleField('code')} 
              />
              <Label htmlFor="code">Code</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="adresse" 
                checked={fields.adresse} 
                onCheckedChange={() => handleToggleField('adresse')} 
              />
              <Label htmlFor="adresse">Adresse</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="contact" 
                checked={fields.contact} 
                onCheckedChange={() => handleToggleField('contact')} 
              />
              <Label htmlFor="contact">Contact</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="email" 
                checked={fields.email} 
                onCheckedChange={() => handleToggleField('email')} 
              />
              <Label htmlFor="email">Email</Label>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="telephone" 
                checked={fields.telephone} 
                onCheckedChange={() => handleToggleField('telephone')} 
              />
              <Label htmlFor="telephone">Téléphone</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="site_web" 
                checked={fields.site_web} 
                onCheckedChange={() => handleToggleField('site_web')} 
              />
              <Label htmlFor="site_web">Site Web</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="image" 
                checked={fields.image} 
                onCheckedChange={() => handleToggleField('image')} 
              />
              <Label htmlFor="image">Image URL</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="university_id" 
                checked={fields.university_id} 
                onCheckedChange={() => handleToggleField('university_id')} 
                disabled={true}
              />
              <Label htmlFor="university_id">Université</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="id" 
                checked={fields.id} 
                onCheckedChange={() => handleToggleField('id')} 
              />
              <Label htmlFor="id">ID</Label>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button onClick={handleExport}>
            <FileDown className="mr-2 h-4 w-4" />
            Exporter
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Composant de modal pour l'import Excel
export function ImportModal({ isOpen, onClose, onImportComplete }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [importResults, setImportResults] = useState(null);

  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleImport = async () => {
    if (!file) {
      toast.error('Veuillez sélectionner un fichier Excel');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/establishments/import', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || result.errors?.join(', ') || 'Erreur lors de l\'import');
      }

      setImportResults(result);

      if (result.imported > 0) {
        toast.success(`Import réussi: ${result.imported} établissements importés`);
        if (onImportComplete) {
          onImportComplete();
        }
      } else {
        toast.info('Aucun établissement n\'a été importé');
      }
    } catch (error) {
      toast.error(error.message);
      console.error('Erreur:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setImportResults(null);
    onClose();
  };

  const downloadTemplate = () => {
    const headers = [
      'Nom', 'Code', 'Adresse', 'Contact', 'Email', 'Téléphone', 'Site Web', 'Image URL', 'Nom Université'
    ];
    
    let csvContent = headers.join(",") + "\n";
    csvContent += `"Exemple Établissement","ETB001","123 rue Exemple","M. Contact","contact@example.com","123456789","https://example.com","","Université Exemple"`;
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'modele_etablissements.csv';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Importer des établissements</DialogTitle>
          <DialogDescription>
            Importez des établissements à partir d'un fichier Excel (.xlsx)
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="file">Fichier Excel</Label>
            <Input
              id="file"
              type="file"
              accept=".xlsx"
              onChange={handleFileChange}
              disabled={uploading}
            />
            <p className="text-sm text-muted-foreground">
              Le fichier doit contenir au minimum les colonnes "Nom" et "Nom Université".
            </p>
          </div>
          
          <Button 
            variant="outline" 
            onClick={downloadTemplate} 
            className="w-full"
            size="sm"
          >
            <Download className="mr-2 h-4 w-4" />
            Télécharger un modèle CSV
          </Button>

          {importResults && (
            <div className="mt-4 p-4 bg-muted rounded-md">
              <h4 className="font-medium mb-2">Résultats de l'import:</h4>
              <ul className="space-y-1 text-sm">
                <li>Total: {importResults.totalRows} établissements</li>
                <li>Importés: {importResults.imported} établissements</li>
                <li>Ignorés: {importResults.skipped} établissements</li>
                {importResults.errors.length > 0 && (
                  <li>
                    <details>
                      <summary className="cursor-pointer text-destructive">Erreurs ({importResults.errors.length})</summary>
                      <ul className="mt-2 pl-4 space-y-1 text-xs">
                        {importResults.errors.map((error, i) => (
                          <li key={i}>{error}</li>
                        ))}
                      </ul>
                    </details>
                  </li>
                )}
              </ul>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Fermer
          </Button>
          <Button onClick={handleImport} disabled={!file || uploading}>
            <FileUp className="mr-2 h-4 w-4" />
            {uploading ? 'Importation...' : 'Importer'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 