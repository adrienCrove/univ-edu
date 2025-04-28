'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { ArrowLeft, Building2, MapPin, Phone, Mail, Globe, University, Trash2, Edit2, Save, X } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function EstablishmentDetailsPage({ params }) {
  const router = useRouter();
  const [establishment, setEstablishment] = useState(null);
  const [universities, setUniversities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
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

  const { id } = use(params);

  useEffect(() => {
    fetchEstablishment();
    fetchUniversities();
  }, [id]);

  const fetchEstablishment = async () => {
    try {
      const response = await fetch(`/api/establishments/${id}`);
      if (!response.ok) throw new Error('Erreur lors de la récupération de l\'établissement');
      const data = await response.json();
      setEstablishment(data);
      setFormData(data);
    } catch (error) {
      toast.error('Erreur lors du chargement de l\'établissement');
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch(`/api/establishments/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erreur lors de la mise à jour de l\'établissement');
      }

      const updatedEstablishment = await response.json();
      setEstablishment(updatedEstablishment);
      setIsEditing(false);
      toast.success('Établissement mis à jour avec succès');
    } catch (error) {
      toast.error(error.message);
      console.error('Erreur:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/establishments/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erreur lors de la suppression de l\'établissement');
      }

      toast.success('Établissement supprimé avec succès');
      router.push('/admin/establishments');
    } catch (error) {
      toast.error(error.message);
      console.error('Erreur:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
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

  if (loading) {
    return <div className="container mx-auto p-6">Chargement...</div>;
  }

  if (!establishment) {
    return <div className="container mx-auto p-6">Établissement non trouvé</div>;
  }

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
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">{establishment.nom}</h1>
          <div className="space-x-2">
            {!isEditing ? (
              <>
                <Button
                  variant="outline"
                  onClick={() => setIsEditing(true)}
                >
                  <Edit2 className="mr-2 h-4 w-4" />
                  Modifier
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => setShowDeleteDialog(true)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Supprimer
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsEditing(false);
                    setFormData(establishment);
                  }}
                >
                  <X className="mr-2 h-4 w-4" />
                  Annuler
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={saving}
                >
                  <Save className="mr-2 h-4 w-4" />
                  {saving ? 'Enregistrement...' : 'Enregistrer'}
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informations de l'établissement</CardTitle>
        </CardHeader>
        <CardContent>
          {isEditing ? (
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
                      disabled={!isEditing || uploading}
                      className="flex-1"
                    />
                  </div>
                  {uploading && <p className="text-sm text-muted-foreground">Upload en cours...</p>}
                </div>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Université</label>
                  <div className="flex items-center text-sm">
                    <University className="mr-2 h-4 w-4 text-muted-foreground" />
                    {establishment.university_name} ({establishment.code_etablissement})
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Adresse</label>
                  <div className="flex items-center text-sm">
                    <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                    {establishment.adresse}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Contact</label>
                  <div className="flex items-center text-sm">
                    <Building2 className="mr-2 h-4 w-4 text-muted-foreground" />
                    {establishment.contact}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Téléphone</label>
                  <div className="flex items-center text-sm">
                    <Phone className="mr-2 h-4 w-4 text-muted-foreground" />
                    {establishment.telephone}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Email</label>
                  <div className="flex items-center text-sm">
                    <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
                    {establishment.email}
                  </div>
                </div>

                {establishment.site_web && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Site web</label>
                    <div className="flex items-center text-sm">
                      <Globe className="mr-2 h-4 w-4 text-muted-foreground" />
                      <a
                        href={establishment.site_web}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {establishment.site_web}
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Cela supprimera définitivement l'établissement
              et toutes ses données associées.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
} 