'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, Search, Bookmark, Building2, GraduationCap, RefreshCcw, Users, FileDown, FileUp } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ImportModal, ExportModal } from '@/app/components/programs/ImportExportModals';

export default function ProgramsPage() {
  const [programs, setPrograms] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchPrograms();
  }, []);

  const fetchPrograms = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('Récupération des filières...');
      const response = await fetch('/api/programs', {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache'
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error('Réponse API non OK:', response.status, errorData);
        throw new Error(`Erreur ${response.status}: ${errorData?.error || response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Données reçues:', data);
      
      if (!Array.isArray(data)) {
        console.error('Format de données inattendu:', data);
        throw new Error('Format de données incorrect');
      }
      
      setPrograms(data);
      
      if (data.length === 0) {
        toast.info('Aucune filière trouvée');
      } else {
        console.log(`${data.length} filières récupérées avec succès`);
      }
    } catch (error) {
      console.error('Erreur détaillée:', error);
      setError(error.message);
      toast.error(`Erreur: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const filteredPrograms = programs.filter(program =>
    program.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    program.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    program.etablissement_nom?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleImportComplete = () => {
    fetchPrograms();
  };

  // Afficher un message d'erreur si un problème est survenu
  if (error && !loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Filières</h1>
          <Button onClick={() => fetchPrograms()}>
            <RefreshCcw className="mr-2 h-4 w-4" />
            Réessayer
          </Button>
        </div>
        <Card className="bg-red-50">
          <CardContent className="pt-6">
            <div className="text-center text-red-600">
              <p className="font-semibold mb-2">Une erreur est survenue lors de la récupération des filières</p>
              <p className="text-sm">{error}</p>
              <p className="mt-4 text-xs text-gray-600">
                Si le problème persiste, veuillez contacter l'administrateur système.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Filières</h1>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => setIsExportModalOpen(true)}>
            <FileDown className="mr-2 h-4 w-4" />
            Exporter
          </Button>
          <Button variant="outline" onClick={() => setIsImportModalOpen(true)}>
            <FileUp className="mr-2 h-4 w-4" />
            Importer
          </Button>
          <Button variant="outline" onClick={() => {
            toast.promise(fetchPrograms(), {
              loading: 'Actualisation en cours...',
              success: 'Liste des filières actualisée',
              error: (err) => `Échec de l'actualisation: ${err.message}`
            });
          }}>
            <RefreshCcw className="mr-2 h-4 w-4" />
            Actualiser
          </Button>
          <Button onClick={() => router.push('/admin/programs/new')}>
            <Plus className="mr-2 h-4 w-4" />
            Nouvelle filière
          </Button>
        </div>
      </div>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher une filière..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Chargement des filières...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 h-full">
          {filteredPrograms.length === 0 ? (
            <div className="col-span-full text-center py-10 text-muted-foreground">
              {searchTerm ? 'Aucune filière trouvée pour cette recherche' : 'Aucune filière disponible'}
            </div>
          ) : (
            filteredPrograms.map((program) => (
              <Link href={`/admin/programs/${program.id}`} key={program.id}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xl">
                        {program.nom || 'Sans nom'}
                        {program.code && <span className="text-sm text-muted-foreground ml-2">({program.code})</span>}
                      </CardTitle>
                      <Bookmark className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Building2 className="mr-2 h-4 w-4" />
                        {program.etablissement_nom || 'Établissement non spécifié'}
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <GraduationCap className="mr-2 h-4 w-4" />
                        {program.universite_nom || 'Université non spécifiée'}
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Users className="mr-2 h-4 w-4" />
                        {program.students_count || 0} étudiants
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))
          )}
        </div>
      )}

      {/* Modales d'import/export */}
      <ImportModal 
        isOpen={isImportModalOpen} 
        onClose={() => setIsImportModalOpen(false)} 
        onImportComplete={handleImportComplete}
      />
      
      <ExportModal 
        isOpen={isExportModalOpen} 
        onClose={() => setIsExportModalOpen(false)}
      />
    </div>
  );
} 