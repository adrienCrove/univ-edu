'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, Search, Building2, MapPin, Phone, Mail, Globe, GraduationCap, RefreshCcw } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function UniversitiesPage() {
  const [universities, setUniversities] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchUniversities();
  }, []);

  const fetchUniversities = async () => {
    try {
      const response = await fetch('/api/universities');
      if (!response.ok) throw new Error('Erreur lors de la récupération des universités');
      const data = await response.json();
      setUniversities(data);
    } catch (error) {
      toast.error('Erreur lors du chargement des universités');
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUniversities = universities.filter(university =>
    university.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    university.code_university?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Universités</h1>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => {
            setLoading(true);
            fetchUniversities().then(() => {
              toast.success('Liste des universités actualisée');
            });
          }}>
            <RefreshCcw className="mr-2 h-4 w-4" />
            Actualiser
          </Button>
          <Button onClick={() => router.push('/admin/universities/new')}>
            <Plus className="mr-2 h-4 w-4" />
            Nouvelle université
          </Button>
        </div>
      </div>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher une université..."
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUniversities.map((university) => (
            <Link href={`/admin/universities/${university.id}`} key={university.id}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl">{university.nom} ({university.code_university})</CardTitle>
                    <GraduationCap className="h-5 w-5 text-muted-foreground" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <MapPin className="mr-2 h-4 w-4" />
                      {university.adresse}
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Phone className="mr-2 h-4 w-4" />
                      {university.telephone}
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Mail className="mr-2 h-4 w-4" />
                      {university.email}
                    </div>
                    {university.site_web && (
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Globe className="mr-2 h-4 w-4" />
                        {university.site_web}
                      </div>
                    )}
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Building2 className="mr-2 h-4 w-4" />
                      {university.establishments_count || 0} établissements
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
} 