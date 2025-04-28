"use client";

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { CheckIcon, ArrowUpIcon, ArrowDownIcon, SearchIcon, UsersIcon, UserPlusIcon, ActivityIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [notificationChannel, setNotificationChannel] = useState('sms');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/users');
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des utilisateurs');
      }
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Impossible de charger les utilisateurs');
    } finally {
      setLoading(false);
    }
  };

  const handleSendNotification = async () => {
    if (!selectedUser) return;
    
    try {
      setIsSending(true);
      const response = await fetch('/api/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: selectedUser.id,
          channel: notificationChannel
        }),
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Erreur lors de l\'envoi de la notification');
      }
      
      toast.success(`Notification envoyée avec succès via ${notificationChannel}`);
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Erreur:', error);
      toast.error(error.message || 'Échec de l\'envoi de la notification');
    } finally {
      setIsSending(false);
    }
  };

  const openNotificationDialog = (user) => {
    setSelectedUser(user);
    setIsDialogOpen(true);
  };

  // Formatter les rôles pour l'affichage
  const formatRoles = (roles) => {
    if (!roles || roles.length === 0) return '-';
    return roles.join(', ');
  };

  // Statistiques des utilisateurs
  const totalMembers = users.length;
  const newMembers = users.filter(user => {
    const createdDate = new Date(user.created_at);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return createdDate > thirtyDaysAgo;
  }).length;
  const activeMembers = users.filter(user => user.last_login).length;
  const activities = 74; // Nombre fictif pour l'exemple

  // Filtrage des utilisateurs
  const filteredUsers = users.filter(user => {
    // Filtrage par statut
    if (filterStatus !== "all") {
      const isActive = user.last_login ? true : false;
      if (filterStatus === "active" && !isActive) return false;
      if (filterStatus === "inactive" && isActive) return false;
    }
    
    // Recherche textuelle
    if (searchTerm.trim() !== "") {
      const searchLower = searchTerm.toLowerCase();
      return (
        user.fullname?.toLowerCase().includes(searchLower) ||
        user.studentid?.toLowerCase().includes(searchLower) ||
        user.email?.toLowerCase().includes(searchLower)
      );
    }
    
    return true;
  });

  // Gestion des sélections
  const toggleUserSelection = (userId) => {
    setSelectedUsers(prev => {
      if (prev.includes(userId)) {
        return prev.filter(id => id !== userId);
      } else {
        return [...prev, userId];
      }
    });
  };

  // Sélectionner/désélectionner tous les utilisateurs
  const toggleAllUsers = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map(user => user.id));
    }
  };

  return (
    <div className="px-6 py-8">
      {/* En-tête de la page */}
      <div className="flex flex-col space-y-2 mb-6">
               
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Gestion des utilisateurs</h1>
            <p className="text-muted-foreground">Gérer les rôles et les accès des utilisateurs.</p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm">
              <ArrowUpIcon className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button variant="outline" size="sm">
              <ArrowDownIcon className="h-4 w-4 mr-2" />
              Télécharger CSV
            </Button>
            <Button size="sm">
              <UserPlusIcon className="h-4 w-4 mr-2" />
              Nouveau compte
            </Button>
          </div>
        </div>
      </div>

      {/* Cartes d'information */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4 flex items-center">
            <div className="p-2 rounded-full bg-muted mr-4">
              <UsersIcon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total members</p>
              <p className="text-2xl font-bold">{totalMembers}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 flex items-center">
            <div className="p-2 rounded-full bg-muted mr-4">
              <UserPlusIcon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">New members</p>
              <p className="text-2xl font-bold">{newMembers}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 flex items-center">
            <div className="p-2 rounded-full bg-muted mr-4">
              <CheckIcon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Active members</p>
              <p className="text-2xl font-bold">{activeMembers}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 flex items-center">
            <div className="p-2 rounded-full bg-muted mr-4">
              <ActivityIcon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Activities</p>
              <p className="text-2xl font-bold">{activities}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtres et recherche */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-2">
          <Button 
            variant="ghost" 
            size="sm"
            className="flex items-center gap-2"
          >
            Filter
          </Button>
          <Select 
            value={filterStatus} 
            onValueChange={setFilterStatus}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="relative">
          <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search"
            className="pl-8 w-[250px]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Tableau des utilisateurs */}
      {loading ? (
        <p className="text-center items-center py-8">Chargement...</p>
      ) : (
        <div className="border rounded-md bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40px]">
                  <Checkbox 
                    checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                    onCheckedChange={toggleAllUsers}
                  />
                </TableHead>
                <TableHead>Nom Complet</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Matricule</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Date de création</TableHead>
                <TableHead>Rôles</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-6">
                    Aucun utilisateur trouvé
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => {
                  const isActive = user.last_login ? true : false;
                  return (
                    <TableRow key={user.id}>
                      <TableCell>
                        <Checkbox 
                          checked={selectedUsers.includes(user.id)}
                          onCheckedChange={() => toggleUserSelection(user.id)}
                        />
                      </TableCell>
                      <TableCell className="font-medium">{user.fullname}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.studentid}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <div className={`w-2 h-2 rounded-full mr-2 ${isActive ? 'bg-green-500' : 'bg-red-500'}`}></div>
                          <span>{isActive ? 'Active' : 'Inactive'}</span>
                        </div>
                      </TableCell>
                      
                      <TableCell>{new Date(user.created_at || new Date()).toLocaleDateString()}</TableCell>
                      <TableCell>
                        {formatRoles(user.roles)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => openNotificationDialog(user)}
                          disabled={!user.phone}
                        >
                          Envoi SMS
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Dialogue d'envoi de notification */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Envoyer une notification</DialogTitle>
            <DialogDescription>
              Envoyer un message de confirmation de création de compte à l'utilisateur.
            </DialogDescription>
          </DialogHeader>
          
          {selectedUser && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Utilisateur
                </Label>
                <div className="col-span-3">
                  <p className="font-medium">{selectedUser.fullname}</p>
                  <p className="text-sm text-muted-foreground">{selectedUser.phone}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="channel" className="text-right">
                  Canal
                </Label>
                <Select 
                  value={notificationChannel}
                  onValueChange={setNotificationChannel}
                  className="col-span-3"
                >
                  <SelectTrigger id="channel">
                    <SelectValue placeholder="Sélectionner un canal" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sms">SMS</SelectItem>
                    <SelectItem value="whatsapp">WhatsApp</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsDialogOpen(false)}
              disabled={isSending}
            >
              Annuler
            </Button>
            <Button 
              onClick={handleSendNotification}
              disabled={isSending}
            >
              {isSending ? "Envoi en cours..." : "Envoyer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}