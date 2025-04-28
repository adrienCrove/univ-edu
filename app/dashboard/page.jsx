import { AppSidebar } from "@/components/app-sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookOpenIcon, CalendarIcon, ClipboardListIcon, FileTextIcon, UsersIcon } from "lucide-react"


export default function Page() {
  return (
    (<SidebarProvider>
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
       
            <main className="flex-1 p-6 space-y-8">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold tracking-tight">
                  Bienvenue sur votre espace professionnel. Voici un résumé de votre activité.
                </h2>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    Avril 2025
                  </Button>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Chiffre d&apos;affaires</CardTitle>
                    <div className="rounded-full bg-blue-100 p-1">
                    <UsersIcon className="h-4 w-4 text-blue-500" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">12 450 €</div>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <span className="text-green-500">+20.1%</span>
                      <span className="ml-1">par rapport au mois dernier</span>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Nouveaux étudiants</CardTitle>
                    <div className="rounded-full bg-green-100 p-1">
                      <UsersIcon className="h-4 w-4 text-green-500" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">12</div>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <span>+5 par rapport au mois dernier</span>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Projets actifs</CardTitle>
                    <div className="rounded-full bg-purple-100 p-1">
                      <BookOpenIcon className="h-4 w-4 text-purple-500" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">8</div>
                    <div className="text-xs text-muted-foreground">3 projets en attente</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Factures impayées</CardTitle>
                    <div className="rounded-full bg-red-100 p-1">
                      <FileTextIcon className="h-4 w-4 text-red-500" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">5</div>
                    <div className="text-xs text-muted-foreground">1 400 € en attente</div>
                  </CardContent>
                </Card>
              </div>

              <div>
                <Tabs defaultValue="activite">
                  <TabsList className="grid w-full grid-cols-4 max-w-[400px]">
                    <TabsTrigger value="activite">Activité</TabsTrigger>
                    <TabsTrigger value="projets">Projets</TabsTrigger>
                    <TabsTrigger value="finances">Finances</TabsTrigger>
                    <TabsTrigger value="clients">Étudiants</TabsTrigger>
                  </TabsList>
                  <TabsContent value="activite" className="mt-6">
                    <div className="grid gap-6 md:grid-cols-2">
                      <Card>
                        <CardHeader>
                          <CardTitle>Activité récente</CardTitle>
                          <CardDescription>Les dernières mises à jour de vos projets et étudiants</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="flex items-start gap-4">
                            <div className="rounded-full bg-blue-100 p-2">
                              <FileTextIcon className="h-4 w-4 text-blue-500" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <div className="font-medium">Contrat signé</div>
                                <div className="text-xs text-muted-foreground">Il y a 2 heures</div>
                              </div>
                              <div className="text-sm text-muted-foreground">Projet site e-learning pour DépartementTech</div>
                            </div>
                          </div>
                          <div className="flex items-start gap-4">
                            <div className="rounded-full bg-green-100 p-2">
                              <ClipboardListIcon className="h-4 w-4 text-green-500" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <div className="font-medium">Tâche complétée</div>
                                <div className="text-xs text-muted-foreground">Il y a 4 heures</div>
                              </div>
                              <div className="text-sm text-muted-foreground">Intégration de la page d&apos;accueil</div>
                            </div>
                          </div>
                          <div className="flex items-start gap-4">
                            <div className="rounded-full bg-purple-100 p-2">
                              <UsersIcon className="h-4 w-4 text-purple-500" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <div className="font-medium">Nouveau message</div>
                                <div className="text-xs text-muted-foreground">Il y a 5 heures</div>
                              </div>
                              <div className="text-sm text-muted-foreground">De Marketing Solutions concernant le projet</div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle>À venir</CardTitle>
                          <CardDescription>Planification des prochains jours</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="flex items-start gap-4">
                            <div className="rounded-full bg-yellow-100 p-2">
                              <CalendarIcon className="h-4 w-4 text-yellow-500" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <div className="font-medium">Réunion client</div>
                                <div className="text-xs text-muted-foreground">Demain, 14:00</div>
                              </div>
                              <div className="text-sm text-muted-foreground">Présentation de la maquette à DesignStudio</div>
                            </div>
                          </div>
                          <div className="flex items-start gap-4">
                            <div className="rounded-full bg-red-100 p-2">
                              <FileTextIcon className="h-4 w-4 text-red-500" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <div className="font-medium">Échéance facturation</div>
                                <div className="text-xs text-muted-foreground">Dans 3 jours</div>
                              </div>
                              <div className="text-sm text-muted-foreground">Facture #F-2023-056 de 2 400 €</div>
                            </div>
                          </div>
                          <div className="flex items-start gap-4">
                            <div className="rounded-full bg-blue-100 p-2">
                              <FileTextIcon className="h-4 w-4 text-blue-500" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <div className="font-medium">Livraison projet</div>
                                <div className="text-xs text-muted-foreground">Dans 5 jours</div>
                              </div>
                              <div className="text-sm text-muted-foreground">Site vitrine pour DépartementSciences</div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>
                  <TabsContent value="projets" className="mt-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Projets en cours</CardTitle>
                        <CardDescription>Liste des projets académiques actifs</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p>Contenu des projets à venir...</p>
                      </CardContent>
                    </Card>
                  </TabsContent>
                  <TabsContent value="finances" className="mt-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Aperçu financier</CardTitle>
                        <CardDescription>Résumé des finances du département</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p>Contenu financier à venir...</p>
                      </CardContent>
                    </Card>
                  </TabsContent>
                  <TabsContent value="clients" className="mt-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Étudiants récents</CardTitle>
                        <CardDescription>Nouveaux étudiants inscrits</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p>Liste des étudiants à venir...</p>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>

              <div>
                <Card>
                  <CardHeader>
                    <CardTitle>Performance mensuelle</CardTitle>
                    <CardDescription>Revenu et nouvelles affaires sur les 6 derniers mois</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[200px] bg-muted/20 rounded-md flex items-center justify-center">
                      <p className="text-muted-foreground">Graphique de performance à venir</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </main>
        </div>
      </SidebarInset>
    </SidebarProvider>)
  );
}
