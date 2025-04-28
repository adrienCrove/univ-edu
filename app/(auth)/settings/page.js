"use client"
import React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { SidebarProvider, SidebarInset, SidebarTrigger, Sidebar } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/app-sidebar'
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb'
import { Separator } from '@/components/ui/separator'

export default function page() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="#">
                  Building Your Application
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>Data Fetching</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4">
        <main className="flex-1 p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight">Paramètres du système</h2>
        </div>

        <Tabs defaultValue="general">
          <TabsList className="grid w-full grid-cols-4 max-w-[600px]">
            <TabsTrigger value="general">Général</TabsTrigger>
            <TabsTrigger value="security">Sécurité</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="integrations">Intégrations</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="mt-6 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Informations de l&apos;établissement</CardTitle>
                <CardDescription>Gérez les informations de base de votre établissement</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="institution-name">Nom de l&apos;établissement</Label>
                    <Input id="institution-name" defaultValue="Université EduManage" />
                  </div>
                  <div className="space-y-2">
                      <Label htmlFor="institution-code">Code de l&apos;établissement</Label>
                    <Input id="institution-code" defaultValue="UEM-2025" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="admin-email">Email administrateur</Label>
                    <Input id="admin-email" type="email" defaultValue="admin@edumanage.com" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contact-phone">Téléphone de contact</Label>
                    <Input id="contact-phone" defaultValue="+33 1 23 45 67 89" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="institution-address">Adresse</Label>
                  <Input id="institution-address" defaultValue="123 Avenue de l'Éducation, 75001 Paris" />
                </div>
                <div className="flex justify-end">
                  <Button>Enregistrer les modifications</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Année académique</CardTitle>
                <CardDescription>Configurez les paramètres de l&apos;année académique en cours</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="academic-year">Année académique</Label>
                    <Input id="academic-year" defaultValue="2024-2025" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="current-semester">Semestre en cours</Label>
                    <Input id="current-semester" defaultValue="Printemps 2025" />
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button>Enregistrer les modifications</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Paramètres de sécurité</CardTitle>
                <CardDescription>Gérez les options de sécurité de votre compte</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Authentification à deux facteurs</div>
                      <div className="text-sm text-muted-foreground">
                        Ajouter une couche de sécurité supplémentaire à votre compte
                      </div>
                    </div>
                    <Switch />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Notifications de connexion</div>
                      <div className="text-sm text-muted-foreground">
                        Recevoir des alertes lors de nouvelles connexions
                      </div>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Expiration de session</div>
                      <div className="text-sm text-muted-foreground">
                        Déconnexion automatique après 30 minutes d&apos;inactivité
                      </div>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button>Enregistrer les modifications</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Préférences de notification</CardTitle>
                <CardDescription>Gérez comment et quand vous recevez des notifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Notifications par email</div>
                      <div className="text-sm text-muted-foreground">Recevoir des notifications par email</div>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Notifications dans l&apos;application</div>
                      <div className="text-sm text-muted-foreground">Recevoir des notifications dans l&apos;application</div>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Notifications de nouvelles inscriptions</div>
                      <div className="text-sm text-muted-foreground">
                        Être notifié lors de nouvelles inscriptions d&apos;étudiants
                      </div>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Rappels d&apos;échéances</div>
                      <div className="text-sm text-muted-foreground">
                        Recevoir des rappels pour les échéances importantes
                      </div>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button>Enregistrer les modifications</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="integrations" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Intégrations</CardTitle>
                <CardDescription>Gérez les intégrations avec d&apos;autres services</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Google Workspace</div>
                      <div className="text-sm text-muted-foreground">
                        Intégration avec Google Workspace pour les emails et calendriers
                      </div>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Microsoft 365</div>
                      <div className="text-sm text-muted-foreground">
                        Intégration avec Microsoft 365 pour les documents et collaborations
                      </div>
                    </div>
                    <Switch />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Moodle</div>
                      <div className="text-sm text-muted-foreground">
                        Intégration avec Moodle pour les cours en ligne
                      </div>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Système de paiement</div>
                      <div className="text-sm text-muted-foreground">
                        Intégration avec le système de paiement en ligne
                      </div>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button>Enregistrer les modifications</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
    </SidebarInset>
    </SidebarProvider>
   
  )
}