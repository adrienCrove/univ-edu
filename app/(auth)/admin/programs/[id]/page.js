'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  ArrowLeft, Save, Trash2, AlertCircle, BookOpen, School, Building2, Users, GraduationCap
} from 'lucide-react';
import { toast } from 'sonner';
import { 
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, 
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger 
} from '@/components/ui/alert-dialog';

export default function ProgramDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id;
  
  const [program, setProgram] = useState(null);
  const [establishments, setEstablishments] = useState([]);
  const [universities, setUniversities] = useState([]);
  const [selectedUniversityId, setSelectedUniversityId] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [formData, setFormData] = useState({
    nom: '',
    code: '',
    etablissement_id: '',
  });

  useEffect(() => {
    if (id) {
      fetchProgramDetails();
      fetchUniversities();
    }
  }, [id]);

  useEffect(() => {
    if (program && program.university_id) {
      setSelectedUniversityId(program.university_id);
      fetchEstablishments(program.university_id);
    }
  }, [program]);

  useEffect(() => {
    if (selectedUniversityId && selectedUniversityId !== program?.university_id) {
      fetchEstablishments(selectedUniversityId);
      setFormData(prev => ({ ...prev, etablissement_id: '' }));
    }
  }, [selectedUniversityId]);

  const fetchProgramDetails = async () => {
    try {
      const response = await fetch(`/api/programs/${id}`);
      if (!response.ok) {
        if (response.status === 404) {
          toast.error('Filière non trouvée');
          router.push('/admin/programs');
          return;
        }
        throw new Error('Erreur lors de la récupération des détails de la filière');
      }
      const data = await response.json();
      setProgram(data);
      setFormData({
        nom: data.nom,
        code: data.code || '',
        etablissement_id: data.etablissement_id,
      });
    } catch (error) {
      toast.error('Erreur lors du chargement des détails de la filière');
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

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
    setSaving(true);

    try {
      const response = await fetch(`/api/programs/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la mise à jour de la filière');
      }

      const updatedProgram = await response.json();
      setProgram(updatedProgram);
      toast.success('Filière mise à jour avec succès');
    } catch (error) {
      toast.error(error.message);
      console.error('Erreur:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const response = await fetch(`/api/programs/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la suppression de la filière');
      }

      toast.success('Filière supprimée avec succès');
      router.push('/admin/programs');
    } catch (error) {
      toast.error(error.message);
      console.error('Erreur:', error);
    } finally {
      setDeleting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 flex justify-center items-center">
        <div className="text-center">Chargement...</div>
      </div>
    );
  }

  if (!program) {
    return (
      <div className="container mx-auto p-6 flex justify-center items-center h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="flex items-center justify-center text-amber-600 mb-2">
              <AlertCircle size={48} />
            </div>
            <CardTitle className="text-center">Filière non trouvée</CardTitle>
            <CardDescription className="text-center">
              La filière que vous recherchez n'existe pas ou a été supprimée.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" onClick={() => router.push('/admin/programs')}>
              Retour à la liste des filières
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => router.push('/admin/programs')}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour à la liste
        </Button>
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">{program.nom}</h1>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Supprimer
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Êtes-vous sûr de vouloir supprimer cette filière ?</AlertDialogTitle>
                <AlertDialogDescription>
                  Cette action est irréversible. Toutes les données associées à cette filière seront supprimées.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Annuler</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={handleDelete} 
                  disabled={deleting} 
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {deleting ? 'Suppression...' : 'Supprimer'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Informations générales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center">
                <BookOpen className="mr-2 h-4 w-4 text-muted-foreground" />
                <span>Code: <span className="font-medium">{program.code || 'Non défini'}</span></span>
              </div>
              <div className="flex items-center">
                <Building2 className="mr-2 h-4 w-4 text-muted-foreground" />
                <span>Établissement: <span className="font-medium">{program.etablissement_nom}</span></span>
              </div>
              <div className="flex items-center">
                <School className="mr-2 h-4 w-4 text-muted-foreground" />
                <span>Université: <span className="font-medium">{program.universite_nom}</span></span>
              </div>
              <div className="flex items-center">
                <Users className="mr-2 h-4 w-4 text-muted-foreground" />
                <span>Nombre d'étudiants: <span className="font-medium">{program.students_count || 0}</span></span>
              </div>
              <div className="flex items-center">
                <GraduationCap className="mr-2 h-4 w-4 text-muted-foreground" />
                <span>Nombre de cours: <span className="font-medium">{program.courses_count || 0}</span></span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Modifier la filière</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Université</label>
                  <Select
                    value={selectedUniversityId}
                    onValueChange={(value) => setSelectedUniversityId(value)}
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

              <div className="flex justify-end">
                <Button type="submit" disabled={saving}>
                  {saving ? (
                    <span>Enregistrement...</span>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Enregistrer
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}