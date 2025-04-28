"use client"
import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { Separator } from "@/components/ui/separator"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart3, LayoutGrid, MoreVertical, Calendar, ChevronLeft, ChevronRight, Search, UserPlus, CheckSquare, Trash, UserX, Edit, Archive, RefreshCw, Mail, Group } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

// Contract type badge colors
const contractTypeColors = {
  "Full-time": "bg-blue-100 text-blue-800",
  "Part-time": "bg-pink-100 text-pink-800",
  Freelance: "bg-green-100 text-green-800",
  Internship: "bg-purple-100 text-purple-800",
}

// Department badge colors
const departmentColors = {
  Lettre: "text-blue-800",
  Informatique: "text-orange-800",
  Science: "text-purple-800",
  Marketing: "text-teal-800",
}

// Nombre d'étudiants par page
const ITEMS_PER_PAGE = 6;

export default function Page() {
  const [viewMode, setViewMode] = useState("list")
  const [students, setStudents] = useState([])
  const [filteredStudents, setFilteredStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedDepartment, setSelectedDepartment] = useState("")
  const [departments, setDepartments] = useState([])
  const [filieres, setFilieres] = useState([])
  const [establishments, setEstablishments] = useState([])
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingStudent, setEditingStudent] = useState(null)
  const [newStudent, setNewStudent] = useState({
    name: "",
    email: "",
    matricule: "",
    etablissement_id: "",
    filiere_id: "",
  })
  const [selectedStudents, setSelectedStudents] = useState([])
  const [selectAll, setSelectAll] = useState(false)
  const [filteredFilieres, setFilteredFilieres] = useState([])

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        // Construire l'URL avec les paramètres de filtrage
        let url = '/api/students'
        const params = new URLSearchParams()
        
        if (searchTerm) {
          params.append('search', searchTerm)
        }
        
        if (selectedDepartment) {
          params.append('department', selectedDepartment)
        }
        
        if (params.toString()) {
          url += `?${params.toString()}`
        }

        const response = await fetch(url)
        if (!response.ok) {
          throw new Error('Erreur lors de la récupération des étudiants')
        }
        const data = await response.json()
        
        setStudents(data)
        setFilteredStudents(data)
        
        // Extraire les départements/filières uniques des étudiants
        const uniqueDepartments = [...new Set(data.map(student => student.department))].filter(Boolean)
        setDepartments(uniqueDepartments)
        
        setTotalPages(Math.ceil(data.length / ITEMS_PER_PAGE))
        setLoading(false)
      } catch (err) {
        setError(err.message)
        setLoading(false)
        toast.error("Erreur lors du chargement des étudiants")
      }
    }

    const fetchFilieres = async () => {
      try {
        const response = await fetch('/api/programs');
        if (!response.ok) {
          throw new Error('Erreur lors de la récupération des filières');
        }
        const data = await response.json();
        setFilieres(data);
      } catch (err) {
        console.error('Erreur:', err);
        toast.error("Erreur lors du chargement des filières");
      }
    };

    const fetchEstablishments = async () => {
      try {
        const response = await fetch('/api/establishments');
        if (!response.ok) {
          throw new Error('Erreur lors de la récupération des établissements');
        }
        const data = await response.json();
        setEstablishments(data);
      } catch (err) {
        console.error('Erreur:', err);
        toast.error("Erreur lors du chargement des établissements");
      }
    };

    fetchStudents();
    fetchFilieres();
    fetchEstablishments();
  }, [searchTerm, selectedDepartment])

  useEffect(() => {
    // Filtrer les filières selon l'établissement sélectionné
    if (newStudent.etablissement_id) {
      const filtered = filieres.filter(
        filiere => filiere.etablissement_id === parseInt(newStudent.etablissement_id)
      );
      setFilteredFilieres(filtered);
    } else {
      setFilteredFilieres([]);
    }
  }, [newStudent.etablissement_id, filieres]);

  // Idem pour l'édition d'un étudiant
  useEffect(() => {
    if (editingStudent?.etablissement_id) {
      const filtered = filieres.filter(
        filiere => filiere.etablissement_id === parseInt(editingStudent.etablissement_id)
      );
      setFilteredFilieres(filtered);
    }
  }, [editingStudent?.etablissement_id, filieres]);

  // Calculer les étudiants à afficher pour la page courante
  const paginatedStudents = filteredStudents.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  // Fonction pour changer de page
  const handlePageChange = (page) => {
    setCurrentPage(page)
  }

  // Générer les numéros de page à afficher
  const getPageNumbers = () => {
    const pages = []
    const maxVisiblePages = 5
    
    if (totalPages <= maxVisiblePages) {
      // Si moins de pages que le maximum visible, afficher toutes les pages
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      // Sinon, afficher un sous-ensemble de pages
      if (currentPage <= 3) {
        // Au début
        for (let i = 1; i <= 5; i++) {
          pages.push(i)
        }
      } else if (currentPage >= totalPages - 2) {
        // À la fin
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pages.push(i)
        }
      } else {
        // Au milieu
        for (let i = currentPage - 2; i <= currentPage + 2; i++) {
          pages.push(i)
        }
      }
    }
    
    return pages
  }

  // Gérer la recherche
  const handleSearch = (e) => {
    setSearchTerm(e.target.value)
  }

  // Gérer le changement de département
  const handleDepartmentChange = (value) => {
    setSelectedDepartment(value === 'all' ? '' : value)
  }

  // Gérer la sélection de tous les étudiants
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedStudents([])
    } else {
      setSelectedStudents(paginatedStudents.map(student => student.id))
    }
    setSelectAll(!selectAll)
  }

  // Gérer la sélection d'un étudiant
  const handleSelectStudent = (id) => {
    if (selectedStudents.includes(id)) {
      setSelectedStudents(selectedStudents.filter(studentId => studentId !== id))
      setSelectAll(false)
    } else {
      setSelectedStudents([...selectedStudents, id])
      if (selectedStudents.length + 1 === paginatedStudents.length) {
        setSelectAll(true)
      }
    }
  }

  // Gérer la suppression des étudiants sélectionnés
  const handleDeleteSelected = () => {
    if (selectedStudents.length === 0) return
    
    toast.info(`${selectedStudents.length} étudiants seraient supprimés`)
    // Ici, vous implémenteriez la logique réelle de suppression
    
    // Réinitialiser la sélection après la suppression
    setSelectedStudents([])
    setSelectAll(false)
  }

  // Gérer l'ajout d'un nouvel étudiant
  const handleAddStudent = async () => {
    // Validation des champs requis
    if (!newStudent.name || !newStudent.email || !newStudent.matricule || !newStudent.filiere_id) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    try {
      const response = await fetch('/api/students', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullname: newStudent.name,
          email: newStudent.email,
          studentid: newStudent.matricule,
          filiere_id: newStudent.filiere_id
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de l\'ajout de l\'étudiant');
      }

      toast.success(`Étudiant ${newStudent.name} ajouté avec succès`);
      
      // Ajouter le nouvel étudiant à la liste
      setStudents([data.student, ...students]);
      setFilteredStudents([data.student, ...filteredStudents]);
      
      // Fermer le modal et réinitialiser le formulaire
      setIsAddModalOpen(false);
      setNewStudent({
        name: "",
        email: "",
        matricule: "",
        etablissement_id: "",
        filiere_id: "",
      });
    } catch (error) {
      toast.error(error.message);
    }
  }

  // Ouvrir le modal d'édition pour un étudiant
  const handleEditClick = (student) => {
    // Trouver la filière de l'étudiant
    const filiere = filieres.find(f => f.nom === student.department);
    const etablissement = filiere ? establishments.find(e => e.id === filiere.etablissement_id) : null;
    
    setEditingStudent({
      id: student.id,
      name: student.name,
      email: student.email,
      matricule: student.matricule,
      filiere_id: filiere ? filiere.id.toString() : "",
      etablissement_id: etablissement ? etablissement.id.toString() : ""
    });
    
    setIsEditModalOpen(true);
  }

  // Mettre à jour un étudiant
  const handleUpdateStudent = async () => {
    if (!editingStudent.name || !editingStudent.email || !editingStudent.matricule || !editingStudent.filiere_id) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    try {
      const response = await fetch(`/api/students/${editingStudent.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullname: editingStudent.name,
          email: editingStudent.email,
          studentid: editingStudent.matricule,
          filiere_id: editingStudent.filiere_id
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erreur lors de la mise à jour de l\'étudiant');
      }

      toast.success(`Étudiant mis à jour avec succès`);
      
      // Recharger la liste des étudiants
      const studentsResponse = await fetch('/api/students');
      const studentsData = await studentsResponse.json();
      setStudents(studentsData);
      setFilteredStudents(studentsData);
      
      // Fermer le modal
      setIsEditModalOpen(false);
      setEditingStudent(null);
    } catch (error) {
      toast.error(error.message);
    }
  }

  // Archiver un étudiant
  const handleArchiveStudent = async (studentId) => {
    try {
      const response = await fetch(`/api/students/${studentId}/archive`, {
        method: 'PUT'
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erreur lors de l\'archivage de l\'étudiant');
      }

      toast.success('Étudiant archivé avec succès');
      
      // Mettre à jour la liste en supprimant l'étudiant archivé
      const updatedStudents = students.filter(student => student.id !== studentId);
      setStudents(updatedStudents);
      setFilteredStudents(updatedStudents);
    } catch (error) {
      toast.error(error.message);
    }
  }

  // Envoyer un lien de réinitialisation de mot de passe
  const handleSendResetLink = async (studentId, studentEmail) => {
    try {
      const response = await fetch(`/api/students/${studentId}/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: studentEmail }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erreur lors de l\'envoi du lien de réinitialisation');
      }

      toast.success('Lien de réinitialisation envoyé à l\'étudiant');
    } catch (error) {
      toast.error(error.message);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500">Erreur: {error}</div>
      </div>
    )
  }

  const handleChangeLevel = (studentId) => {
    console.log(studentId);
  }

  return (
    <>
      <div className="container mx-aut bg-white">
          {/*<header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="#">
                    Gestion des étudiants
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Liste des étudiants</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </header>*/}
          <div className="flex flex-1 flex-col gap-4 p-4">
            <main className="flex-1 p-6 space-y-6">
              <div className="flex flex-row gap-2 justify-between items-center">
                <div className="flex flex-col gap-2">
                <h2 className="text-2xl font-bold tracking-tight">Liste des étudiants</h2>
                <p className='text-gray-500'>Gérez tous les étudiants inscrits dans votre établissement</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button onClick={() => setIsAddModalOpen(true)} className="flex items-center gap-2">
                    <UserPlus className="h-4 w-4" />
                    Ajouter un étudiant
                  </Button>
                </div>
              </div>
              <div>
                <div className="mb-6 flex flex-col md:flex-row justify-between gap-4">
                  <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
                    <div className="relative w-full md:w-64">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                      <Input
                        placeholder="Rechercher un étudiant..."
                        className="pl-8"
                        value={searchTerm}
                        onChange={handleSearch}
                      />
                    </div>
                    <Select value={selectedDepartment} onValueChange={handleDepartmentChange}>
                      <SelectTrigger className="w-full md:w-48">
                        <SelectValue placeholder="Département" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tous les départements</SelectItem>
                        {departments.map((dept) => (
                          <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>                    
                  </div>
                  <div className="flex justify-end">
                    <Tabs defaultValue={viewMode} onValueChange={(value) => setViewMode(value)}>
                      <TabsList className="grid w-[200px] grid-cols-2">
                        <TabsTrigger value="list" className="flex items-center gap-2">
                          <BarChart3 className="h-4 w-4" />
                          Liste
                        </TabsTrigger>
                        <TabsTrigger value="card" className="flex items-center gap-2">
                          <LayoutGrid className="h-4 w-4" />
                          Carte
                        </TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </div>
                </div>

                {selectedStudents.length > 0 && viewMode === "list" && (
                  <div className="flex items-center gap-2 mb-4 p-2 bg-gray-50 rounded-md">
                    <span className="text-sm text-gray-500">
                      {selectedStudents.length} étudiant(s) sélectionné(s)
                    </span>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="ml-auto"
                      onClick={handleDeleteSelected}
                    >
                      <UserX className="h-4 w-4 mr-1" />
                      Supprimer
                    </Button>
                  </div>
                )}

                {viewMode === "card" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {paginatedStudents.map((student) => (
                      <div key={student.id} className="border rounded-lg overflow-hidden">
                        <div className="p-4 border-b">
                          <div className="flex items-center justify-between mb-2">
                            <div className="text-sm font-medium text-gray-500">{student.contractType}</div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <button className="text-gray-400 hover:text-gray-600">
                                  <MoreVertical className="h-4 w-4" />
                                </button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleEditClick(student)}>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Modifier
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleSendResetLink(student.id, student.email)}>
                                  <Mail className="h-4 w-4 mr-2" />
                                  Envoyer lien de réinitialisation
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  onClick={() => handleArchiveStudent(student.id)}
                                  className="text-red-600 focus:text-red-600"
                                >
                                  <Archive className="h-4 w-4 mr-2" />
                                  Archiver
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                          <div className="flex items-center gap-3">
                            <Avatar className="size-8">
                              <AvatarImage src={student.avatar} alt={student.name} />
                              <AvatarFallback>{student.name.split(' ').map(n => n[0]).join('').substr(0, 2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div>
                              <h3 className="font-medium">{student.name}</h3>
                              <p className="text-sm text-gray-500">{student.email}</p>
                            </div>
                          </div>
                          <div className="mt-3 flex items-center gap-2">
                            <span
                              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${departmentColors[student.department] || "text-gray-800"}`}
                            >
                              • {student.department}
                            </span>
                          </div>
                        </div>
                        <div className="p-4 bg-gray-50">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <div className="text-xs text-gray-500">Matricule</div>
                              <div className="text-sm font-medium">{student.matricule}</div>
                            </div>
                            <div>
                              <div className="text-xs text-gray-500">Date d'inscription</div>
                              <div className="text-sm font-medium">{student.joinDate}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* List View */}
                {viewMode === "list" && (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                          <th className="px-2 py-3">
                            <Checkbox
                              checked={selectAll}
                              onCheckedChange={handleSelectAll}
                              aria-label="Sélectionner tous les étudiants"
                            />
                          </th>
                          <th className="px-6 py-3">Nom</th>
                          <th className="px-6 py-3">Matricule</th>
                          <th className="px-6 py-3">Département</th>
                          <th className="px-6 py-3">Date d'inscription</th>
                          <th className="px-6 py-3">Type</th>
                          <th className="px-6 py-3">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {paginatedStudents.map((student) => (
                          <tr key={student.id} className="hover:bg-gray-50">
                            <td className="px-2 py-4">
                              <Checkbox
                                checked={selectedStudents.includes(student.id)}
                                onCheckedChange={() => handleSelectStudent(student.id)}
                                aria-label={`Sélectionner ${student.name}`}
                              />
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center">
                                <Avatar className="mr-3">
                                  <AvatarImage src={student.avatar} alt={student.name} />
                                  <AvatarFallback>{student.name.split(' ').map(n => n[0]).join('').substr(0, 2).toUpperCase()}</AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="font-medium">{student.name}</div>
                                  <div className="text-sm text-gray-500">{student.email}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">{student.matricule}</td>
                            <td className="px-6 py-4">
                              <span
                                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${departmentColors[student.department] || "text-gray-800"}`}
                              >
                                • {student.department}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center">
                                <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                                {student.joinDate}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span
                                className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${contractTypeColors[student.contractType] || "bg-gray-100 text-gray-800"}`}
                              >
                                {student.contractType}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <button className="text-gray-400 hover:text-gray-600 cursor-pointer">
                                    <MoreVertical className="h-4 w-4" />
                                  </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => handleEditClick(student)}>
                                    <Edit className="h-4 w-4 mr-2" />
                                    Modifier
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleSendResetLink(student.id, student.email)}>
                                    <Mail className="h-4 w-4 mr-2" />
                                    Envoyer lien de réinitialisation
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleChangeLevel(student.id)}>
                                    <Edit className="h-4 w-4 mr-2" />
                                    Changer de niveau
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleAssignMentor(student.id)}>
                                    <Group className="h-4 w-4 mr-2" />
                                    Affecter un mentor
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem 
                                    onClick={() => handleArchiveStudent(student.id)}
                                    className="text-red-600 focus:text-red-600"
                                  >
                                    <Archive className="h-4 w-4 mr-2" />
                                    Archiver
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Pagination */}
                {filteredStudents.length > 0 ? (
                  <div className="flex items-center justify-between mt-6">
                    <div className="text-sm text-gray-500">
                      Affichage de {(currentPage - 1) * ITEMS_PER_PAGE + 1} à {Math.min(currentPage * ITEMS_PER_PAGE, filteredStudents.length)} sur {filteredStudents.length} étudiants
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      
                      {getPageNumbers().map((page) => (
                        <Button
                          key={page}
                          variant={currentPage === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => handlePageChange(page)}
                        >
                          {page}
                        </Button>
                      ))}
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    Aucun étudiant trouvé
                  </div>
                )}
              </div>
            </main>
          </div>
        </div>

      {/* Modal d'ajout d'étudiant */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Ajouter un nouvel étudiant</DialogTitle>
            <DialogDescription>
              Remplissez les informations pour créer un nouvel étudiant
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Nom
              </Label>
              <Input
                id="name"
                value={newStudent.name}
                onChange={(e) => setNewStudent({...newStudent, name: e.target.value})}
                className="col-span-3"
                placeholder="Nom complet de l'étudiant"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={newStudent.email}
                onChange={(e) => setNewStudent({...newStudent, email: e.target.value})}
                className="col-span-3"
                placeholder="adresse@exemple.com"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="matricule" className="text-right">
                Matricule
              </Label>
              <Input
                id="matricule"
                value={newStudent.matricule}
                onChange={(e) => setNewStudent({...newStudent, matricule: e.target.value})}
                className="col-span-3"
                placeholder="Numéro matricule"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="etablissement" className="text-right">
                Établissement
              </Label>
              <Select 
                value={newStudent.etablissement_id} 
                onValueChange={(value) => setNewStudent({...newStudent, etablissement_id: value, filiere_id: ""})}
              >
                <SelectTrigger id="etablissement" className="col-span-3">
                  <SelectValue placeholder="Sélectionner un établissement" />
                </SelectTrigger>
                <SelectContent>
                  {establishments.map((etablissement) => (
                    <SelectItem key={etablissement.id} value={etablissement.id.toString()}>{etablissement.nom}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="filiere" className="text-right">
                Filière
              </Label>
              <Select 
                value={newStudent.filiere_id} 
                onValueChange={(value) => setNewStudent({...newStudent, filiere_id: value})}
                disabled={!newStudent.etablissement_id || filteredFilieres.length === 0}
              >
                <SelectTrigger id="filiere" className="col-span-3">
                  <SelectValue placeholder={!newStudent.etablissement_id 
                    ? "Sélectionnez d'abord un établissement" 
                    : filteredFilieres.length === 0 
                      ? "Aucune filière disponible" 
                      : "Sélectionner une filière"} 
                  />
                </SelectTrigger>
                <SelectContent>
                  {filteredFilieres.map((filiere) => (
                    <SelectItem key={filiere.id} value={filiere.id.toString()}>{filiere.nom}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleAddStudent}>
              Ajouter l'étudiant
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal d'édition d'étudiant */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Modifier un étudiant</DialogTitle>
            <DialogDescription>
              Mettre à jour les informations de l'étudiant
            </DialogDescription>
          </DialogHeader>
          
          {editingStudent && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-name" className="text-right">
                  Nom
                </Label>
                <Input
                  id="edit-name"
                  value={editingStudent.name}
                  onChange={(e) => setEditingStudent({...editingStudent, name: e.target.value})}
                  className="col-span-3"
                  placeholder="Nom complet de l'étudiant"
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-email" className="text-right">
                  Email
                </Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={editingStudent.email}
                  onChange={(e) => setEditingStudent({...editingStudent, email: e.target.value})}
                  className="col-span-3"
                  placeholder="adresse@exemple.com"
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-matricule" className="text-right">
                  Matricule
                </Label>
                <Input
                  id="edit-matricule"
                  value={editingStudent.matricule}
                  onChange={(e) => setEditingStudent({...editingStudent, matricule: e.target.value})}
                  className="col-span-3"
                  placeholder="Numéro matricule"
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-etablissement" className="text-right">
                  Établissement
                </Label>
                <Select 
                  value={editingStudent.etablissement_id} 
                  onValueChange={(value) => setEditingStudent({...editingStudent, etablissement_id: value, filiere_id: ""})}
                >
                  <SelectTrigger id="edit-etablissement" className="col-span-3">
                    <SelectValue placeholder="Sélectionner un établissement" />
                  </SelectTrigger>
                  <SelectContent>
                    {establishments.map((etablissement) => (
                      <SelectItem key={etablissement.id} value={etablissement.id.toString()}>{etablissement.nom}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-filiere" className="text-right">
                  Filière
                </Label>
                <Select 
                  value={editingStudent.filiere_id} 
                  onValueChange={(value) => setEditingStudent({...editingStudent, filiere_id: value})}
                  disabled={!editingStudent.etablissement_id || filteredFilieres.length === 0}
                >
                  <SelectTrigger id="edit-filiere" className="col-span-3">
                    <SelectValue placeholder={!editingStudent.etablissement_id 
                      ? "Sélectionnez d'abord un établissement" 
                      : filteredFilieres.length === 0 
                        ? "Aucune filière disponible" 
                        : "Sélectionner une filière"} 
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredFilieres.map((filiere) => (
                      <SelectItem key={filiere.id} value={filiere.id.toString()}>{filiere.nom}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleUpdateStudent}>
              Mettre à jour
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}