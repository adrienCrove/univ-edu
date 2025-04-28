"use client"
import * as React from "react"
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { SearchForm } from "@/components/search-form"
import { VersionSwitcher } from "@/components/version-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"

// This is sample data.
const data = {
  versions: ["1.0.1", "1.1.0-alpha", "2.0.0-beta1"],
  navMain: [
    {
      title: "Accueil",
      url: "#",
      items: [
        {
          title: "Tableau de bord",
          url: "/dashboard",
          isActive: true,
        },
        {
          title: "Annonces",
            url: "#",
        },        
      ],
    },
    {
      title: "Académique",
      url: "#",
      items: [
        { title: "Emploi du temps", url: "#" },
        { title: "Programme scolaire", url: "#", isActive: true },
        { title: "Examens et évaluations", url: "#" },
        { title: "Mes notes", url: "#" },
        { title: "Mes documents", url: "#" },
        { title: "Calendrier académique", url: "#" },
        { title: "Liste des étudiants", url: "/student" },
      ],
    },
    {
      title: "Finances",
      url: "#",
      items: [
        { title: "Paiements et Factures", url: "#" },
        { title: "Historique financier", url: "#" },
      ],
    },
    {
      title: "Administration",
      url: "#",
      items: [
        {
          title: "Gestion des programmes",
          url: "/admin/programs",
        },
        {
          title: "Gestion des établissements",
          url: "/admin/establishments",
        },
        {
          title: "Profils des universités",
          url: "/admin/universities",
        },
        {
          title: "Gestion des cours",
          url: "/admin/courses",
        },       
        
        {
          title: "Gestion des utilisateurs",
          url: "/admin/users",
        },
        
      ],
    },
    {
      title: "Paramètres",
      url: "#",
      items: [
        {
          title: "Profil",
          url: "#",
        },
        {
          title: "Paramètres",
          url: "/settings",
        },
        {
          title: "Journal d'activité",
          url: "#",
        },
        {
          title: "Support",
          url: "#",
        },
      ],
    },
  ],
}

export function AppSidebar({
  ...props
}) {
  const pathname = usePathname()

  // Fonction pour vérifier si un menu est actif
  const isMenuActive = (url) => {
    if (url === '/') {
      return pathname === '/'
    }
    return pathname.startsWith(url)
  }

  // Fonction pour vérifier si un groupe est actif
  const isGroupActive = (items) => {
    return items.some(item => isMenuActive(item.url))
  }

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <VersionSwitcher versions={data.versions} defaultVersion={data.versions[0]} />
        <SearchForm />
      </SidebarHeader>
      <SidebarContent>
        {/* We create a SidebarGroup for each parent. */}
        {data.navMain.map((item) => (
          <SidebarGroup key={item.title}>
            <SidebarGroupLabel>{item.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {item.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton 
                      asChild 
                      isActive={isMenuActive(item.url)}
                    >
                      <Link href={item.url}>
                        {item.title}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
