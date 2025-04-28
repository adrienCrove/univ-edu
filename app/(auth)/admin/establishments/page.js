'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, Search, Building2, MapPin, Phone, Mail, Globe, University, FileDown, FileUp, RefreshCcw } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ImportModal, ExportModal } from '@/app/components/establishments/ImportExportModals';

export default function EstablishmentsPage() {
  const [establishments, setEstablishments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchEstablishments();
  }, []);

  const fetchEstablishments = async () => {
    try {
      const response = await fetch('/api/establishments');
      if (!response.ok) throw new Error('Erreur lors de la récupération des établissements');
      const data = await response.json();
      setEstablishments(data);
    } catch (error) {
      toast.error('Erreur lors du chargement des établissements');
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredEstablishments = establishments.filter(establishment =>
    establishment.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    establishment.code?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleImportComplete = () => {
    fetchEstablishments();
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Établissements</h1>
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
            setLoading(true);
            fetchEstablishments().then(() => {
              toast.success('Liste des établissements actualisée');
            });
          }}>
            <RefreshCcw className="mr-2 h-4 w-4" />
            Actualiser
          </Button>
          <Button onClick={() => router.push('/admin/establishments/new')}>
            <Plus className="mr-2 h-4 w-4" />
            Nouvel établissement
          </Button>
        </div>
      </div>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher un établissement..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="text-center">Chargement...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 h-full">
          {filteredEstablishments.length === 0 ? (
            <div className="col-span-full text-center py-10 text-muted-foreground">
              Aucun établissement trouvé
            </div>
          ) : (
            filteredEstablishments.map((establishment) => (
              <Link href={`/admin/establishments/${establishment.id}`} key={establishment.id}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xl">
                        {establishment.nom}
                        {establishment.code && <span className="text-sm text-muted-foreground ml-2">({establishment.code})</span>}
                      </CardTitle>
                      <Building2 className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <University className="mr-2 h-4 w-4" />
                        {establishment.university_name}
                      </div>
                      {establishment.adresse && (
                        <div className="flex items-center text-sm text-muted-foreground">
                          <MapPin className="mr-2 h-4 w-4" />
                          {establishment.adresse}
                        </div>
                      )}
                      {establishment.telephone && (
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Phone className="mr-2 h-4 w-4" />
                          {establishment.telephone}
                        </div>
                      )}
                      {establishment.email && (
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Mail className="mr-2 h-4 w-4" />
                          {establishment.email}
                        </div>
                      )}
                      {establishment.site_web && (
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Globe className="mr-2 h-4 w-4" />
                          {establishment.site_web}
                        </div>
                      )}
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