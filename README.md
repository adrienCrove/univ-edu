## Description du projet

Je veux créer mon SAAS pour la gestion académique (étudiant, professeur) d'une université. L'utilisateur qui sera le professeur ou l'étudiant ou l'admin pourra se connecter à leur profil respectif (avec matricule pour les profs et les étudiants et e-mail pour l'admin). L'étudiant pourra consulter son agenda de cours, voir ses notes (effectuer des revendications qui créeront un historique d'action menée) , voir s'il est en règle (pension payée, mais ici, il sera lié à l'API de la banque) et enfin faire des requêtes en cas de besoin académique ou requête personnel (qui pourrait lancer une discussion de messagerie avec le support de l'école). Les professeurs pourront attribuer des notes aux élèves, intégrer des documents, créer des examens ou des évaluations (CC et TP), consulter la liste des étudiants. L'admin s'occupera de la configuration générale : ajout des utilisateurs (étudiants et professeurs), configuration de l'année académique, des établissements de l'université, de leur programme et de leur filière, du support et voir le journal d'activité.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
