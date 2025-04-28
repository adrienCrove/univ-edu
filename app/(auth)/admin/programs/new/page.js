'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';

export default function NewProgramPage() {
  const router = useRouter();
  const [establishments, setEstablishments] = useState([]);
  const [universities, setUniversities] = useState([]);
  const [selectedUniversityId, setSelectedUniversityId] = useState('');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nom: '',
    code: '',
    etablissement_id: '',
  });

  useEffect(() => {
    fetchUniversities();
  }, []);

  useEffect(() => {
    if (selectedUniversityId) {
      fetchEstablishments(selectedUniversityId);
    } else {
      setEstablishments([]);
      setFormData(prev => ({ ...prev, etablissement_id: '' }));
    }
  }, [selectedUniversityId]);

  const fetchUniversities = async () => {
    try {
      const response = await fetch('/api/universities');
      if (!response.ok) throw new Error('Erreur lors de la récupération des universités');
      const data = await response.json();
      setUniversities(data);
    } catch (error) {
      toast.error('Erreur lors du chargement des universités');
      console.error('Erreur:', error);
    }
  };

  const fetchEstablishments = async (universityId) => {
    try {
      const response = await fetch(`/api/establishments?universityId=${universityId}`);
      if (!response.ok) throw new Error('Erreur lors de la récupération des établissements');
      const data = await response.json();
      setEstablishments(data);
    } catch (error) {
      toast.error('Erreur lors du chargement des établissements');
      console.error('Erreur:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/programs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erreur lors de la création de la filière');
      }

      toast.success('Filière créée avec succès');
      router.push('/admin/programs');
    } catch (error) {
      toast.error(error.message);
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour
        </Button>
        <h1 className="text-3xl font-bold">Nouvelle filière</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informations de la filière</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Université</label>
                <Select
                  value={selectedUniversityId}
                  onValueChange={(value) => setSelectedUniversityId(value)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez une université" />
                  </SelectTrigger>
                  <SelectContent>
                    {universities.map((university) => (
                      <SelectItem key={university.id} value={university.id}>
                        {university.nom}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Établissement</label>
                <Select
                  value={formData.etablissement_id}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, etablissement_id: value }))}
                  disabled={!selectedUniversityId || establishments.length === 0}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder={!selectedUniversityId ? "Sélectionnez d'abord une université" : establishments.length === 0 ? "Aucun établissement disponible" : "Sélectionnez un établissement"} />
                  </SelectTrigger>
                  <SelectContent>
                    {establishments.map((establishment) => (
                      <SelectItem key={establishment.id} value={establishment.id}>
                        {establishment.nom}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Nom de la filière</label>
                <Input
                  name="nom"
                  value={formData.nom}
                  onChange={handleChange}
                  required
                  placeholder="Entrez le nom de la filière"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Code de la filière</label>
                <Input
                  name="code"
                  value={formData.code}
                  onChange={handleChange}
                  placeholder="Entrez le code de la filière (optionnel)"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-4 mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                Annuler
              </Button>
              <Button 
                type="submit" 
                disabled={loading || !formData.etablissement_id || !formData.nom}
              >
                {loading ? 'Création en cours...' : 'Créer la filière'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}