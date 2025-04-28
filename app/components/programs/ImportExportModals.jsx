'use client';

import { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { FileText, Upload, Download } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export function ImportModal({ isOpen, onClose, onImportComplete }) {
  const [file, setFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleImport = async () => {
    if (!file) {
      toast.error('Veuillez sélectionner un fichier');
      return;
    }

    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      toast.error('Veuillez sélectionner un fichier Excel (.xlsx ou .xls)');
      return;
    }

    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      // Envoi des données à l'API
      const response = await fetch('/api/programs/import', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erreur lors de l\'import');
      }

      const result = await response.json();
      toast.success(`Import réussi: ${result.imported} filières importées`);
      
      if (result.errors && result.errors.length > 0) {
        toast.warning(`${result.errors.length} erreurs rencontrées pendant l'import`);
      }

      onImportComplete();
      onClose();
    } catch (error) {
      console.error('Erreur lors de l\'import:', error);
      toast.error(error.message || 'Erreur lors de l\'import');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Importer des filières</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p className="text-sm text-muted-foreground mb-4">
            Sélectionnez un fichier Excel contenant les filières à importer. 
            Le fichier doit avoir des colonnes avec les entêtes suivants: 
            Nom, Code, Établissement.
          </p>
          <div className="flex items-center gap-4">
            <Input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileChange}
              className="flex-1"
            />
          </div>
          {file && (
            <div className="mt-2 flex items-center text-sm">
              <FileText className="mr-2 h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">{file.name}</span>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Annuler
          </Button>
          <Button onClick={handleImport} disabled={isLoading || !file} className="gap-2">
            {isLoading ? (
              <>Importation en cours...</>
            ) : (
              <>
                <Upload className="h-4 w-4" />
                Importer
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function ExportModal({ isOpen, onClose }) {
  const [isLoading, setIsLoading] = useState(false);
  const [exportFormat, setExportFormat] = useState('xlsx');
  
  const handleExport = async () => {
    setIsLoading(true);

    try {
      // Déterminer le bon endpoint basé sur le format sélectionné
      const endpoint = `/api/programs/export?format=${exportFormat}`;
      const response = await fetch(endpoint);
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erreur lors de l\'export');
      }

      // Traitement selon le format
      if (exportFormat === 'json') {
        const data = await response.json();
        // Création d'un fichier JSON à télécharger
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `filieres_export_${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        toast.success(`${data.length} filières exportées avec succès`);
      } else {
        // Pour Excel, on obtient directement un blob
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `filieres_export_${new Date().toISOString().slice(0, 10)}.${exportFormat}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        toast.success('Export Excel réalisé avec succès');
      }
      
      onClose();
    } catch (error) {
      console.error('Erreur lors de l\'export:', error);
      toast.error(error.message || 'Erreur lors de l\'export');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Exporter les filières</DialogTitle>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <p className="text-sm text-muted-foreground">
            Sélectionnez le format d'export et cliquez sur le bouton ci-dessous pour exporter toutes les filières.
          </p>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Format d'export</label>
            <Select
              value={exportFormat}
              onValueChange={setExportFormat}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionnez un format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="xlsx">Excel (.xlsx)</SelectItem>
                <SelectItem value="csv">CSV (.csv)</SelectItem>
                <SelectItem value="json">JSON (.json)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Annuler
          </Button>
          <Button onClick={handleExport} disabled={isLoading} className="gap-2">
            {isLoading ? (
              <>Exportation en cours...</>
            ) : (
              <>
                <Download className="h-4 w-4" />
                Exporter
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 