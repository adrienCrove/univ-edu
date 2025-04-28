'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';

export default function NewEstablishmentPage() {
  const router = useRouter();
  const [universities, setUniversities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    nom: '',
    code_etablissement: '',
    adresse: '',
    contact: '',
    email: '',
    telephone: '',
    site_web: '',
    image: '',
    university_id: '',
  });

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
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erreur lors de l\'upload');
      }

      const data = await response.json();
      setFormData(prev => ({
        ...prev,
        image: data.url
      }));
      toast.success('Image uploadée avec succès');
    } catch (error) {
      toast.error(error.message);
      console.error('Erreur:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/establishments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erreur lors de la création de l\'établissement');
      }

      toast.success('Établissement créé avec succès');
      router.push('/admin/establishments');
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
        <h1 className="text-3xl font-bold">Nouvel établissement</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informations de l'établissement</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Nom de l'établissement</label>
                <Input
                  name="nom"
                  value={formData.nom}
                  onChange={handleChange}
                  required
                  placeholder="Entrez le nom de l'établissement"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Université</label>
                <Select
                  value={formData.university_id}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, university_id: value }))}
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
                <label className="text-sm font-medium">Code de l'établissement</label>
                <Input
                  name="code_etablissement"
                  value={formData.code_etablissement}
                  onChange={handleChange}
                  placeholder="Entrez le code de l'établissement"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Adresse</label>
                <Input
                  name="adresse"
                  value={formData.adresse}
                  onChange={handleChange}
                  placeholder="Adresse de l'établissement"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Contact</label>
                <Input
                  name="contact"
                  value={formData.contact}
                  onChange={handleChange}
                  placeholder="Personne à contacter"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <Input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="email@example.com"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Téléphone</label>
                <Input
                  name="telephone"
                  value={formData.telephone}
                  onChange={handleChange}
                  placeholder="Numéro de téléphone"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Site web</label>
                <Input
                  name="site_web"
                  value={formData.site_web}
                  onChange={handleChange}
                  placeholder="https://example.com"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Image</label>
                <div className="flex items-center space-x-4">
                  {formData.image && (
                    <img
                      src={formData.image}
                      alt="Aperçu"
                      className="w-20 h-20 object-cover rounded"
                    />
                  )}
                  <Input
                    type="file"
                    accept="image/jpeg,image/png,image/jpg,image/webp"
                    onChange={handleImageUpload}
                    disabled={uploading}
                    className="flex-1"
                  />
                </div>
                {uploading && <p className="text-sm text-muted-foreground">Upload en cours...</p>}
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={loading || uploading}>
                {loading ? 'Création en cours...' : 'Créer l\'établissement'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 