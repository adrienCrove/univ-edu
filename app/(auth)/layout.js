'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { AppSidebar } from '@/components/app-sidebar.jsx';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb.jsx';
import { Home, ChevronRight as ChevronRightIcon } from 'lucide-react';
import Link from 'next/link';
import { SidebarProvider } from '@/components/ui/sidebar.jsx';

export default function AuthLayout({ children }) {
  const pathname = usePathname();
  const [breadcrumbs, setBreadcrumbs] = useState([]);

  useEffect(() => {
    // Générer les breadcrumbs en fonction du chemin actuel
    const generateBreadcrumbs = () => {
      const paths = pathname.split('/').filter(Boolean);
      
      const breadcrumbItems = [
        { label: 'Accueil', href: '/', icon: <Home className="h-4 w-4" /> }
      ];
      
      let currentPath = '';
      
      paths.forEach((path, index) => {
        currentPath += `/${path}`;
        
        // Formater le label pour l'affichage
        let label = path;
        
        // Personnaliser les labels en fonction du chemin
        if (path === 'admin') {
          label = 'Administration';
        } else if (path === 'student') {
          label = 'Étudiant';
        } else if (path === 'establishments') {
          label = 'Établissements';
        } else if (path === 'universities') {
          label = 'Universités';
        } else if (path === 'courses') {
          label = 'Cours';
        } else if (path === 'enrollments') {
          label = 'Inscriptions';
        } else if (path === 'grades') {
          label = 'Notes';
        } else if (path === 'new') {
          label = 'Nouveau';
        } else if (path.match(/^[0-9a-fA-F-]+$/)) {
          // Si c'est un ID, on ne l'affiche pas dans le breadcrumb
          return;
        }
        
        // Convertir en titre (première lettre en majuscule, remplacer les tirets par des espaces)
        label = label.charAt(0).toUpperCase() + label.slice(1).replace(/-/g, ' ');
        
        breadcrumbItems.push({
          label,
          href: currentPath,
          isCurrentPage: index === paths.length - 1
        });
      });
      
      setBreadcrumbs(breadcrumbItems);
    };
    
    generateBreadcrumbs();
  }, [pathname]);

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-gray-100">
        <AppSidebar />
        
        <div className="flex-1 flex flex-col overflow-hidden">
          <header className="bg-white shadow-sm">
            <div className="px-4 py-3">
              <Breadcrumb>
                <BreadcrumbList>
                  {breadcrumbs.map((item, index) => (
                    <BreadcrumbItem key={index}>
                      {index > 0 && <BreadcrumbSeparator><ChevronRightIcon className="h-4 w-4" /></BreadcrumbSeparator>}
                      {item.isCurrentPage ? (
                        <BreadcrumbPage>{item.label}</BreadcrumbPage>
                      ) : (
                        <BreadcrumbLink asChild>
                          <Link href={item.href} className="flex items-center">
                            {item.icon && <span className="mr-1">{item.icon}</span>}
                            {item.label}
                          </Link>
                        </BreadcrumbLink>
                      )}
                    </BreadcrumbItem>
                  ))}
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          </header>
          
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
} 