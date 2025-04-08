"use client"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { User, Mail, Phone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Image from "next/image"
import { requestAccount } from "@/lib/auth"
import { toast } from "sonner"

export default function RegisterPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    studentId: "",
    fullName: "",
    email: "",
    phone: ""
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await requestAccount(
        formData.studentId,
        formData.fullName,
        formData.email,
        formData.phone
      )
      toast.success("Demande envoyée avec succès ! L'administrateur vous contactera bientôt.")
      router.push("/login")
    } catch (error) {
      console.error("Erreur lors de la demande:", error)
      toast.error(error.message || "Erreur lors de l'envoi de la demande")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container relative min-h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r">
        <div className="absolute inset-0 bg-zinc-900" />
        <div className="relative z-20 flex items-center text-lg font-medium">
          <Image
            src="/logo/logo-fs.jpeg"
            alt="Logo"
            width={40}
            height={40}
            className="mr-2"
          />
          UnivEdu
        </div>
        <div className="relative z-20 mt-auto">
          <blockquote className="space-y-2">
            <p className="text-lg">
              &quot;Cette plateforme a révolutionné la façon dont je gère mes études. Tout est tellement plus simple et organisé maintenant.&quot;
            </p>
            <footer className="text-sm">Sofia Davis, Étudiante</footer>
          </blockquote>
        </div>
      </div>
      <div className="lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">
              Demande de compte
            </h1>
            <p className="text-sm text-muted-foreground">
              Remplissez le formulaire ci-dessous pour demander un compte. Un administrateur vous contactera bientôt.
            </p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="studentId">Numéro matricule</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="studentId"
                  name="studentId"
                  placeholder="Entrez votre numéro matricule"
                  value={formData.studentId}
                  onChange={handleChange}
                  className="pl-9"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="fullName">Nom complet</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="fullName"
                  name="fullName"
                  placeholder="Entrez votre nom complet"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="pl-9"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Entrez votre email"
                  value={formData.email}
                  onChange={handleChange}
                  className="pl-9"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Téléphone</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="Entrez votre numéro de téléphone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="pl-9"
                  required
                />
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Envoi en cours..." : "Envoyer la demande"}
            </Button>
          </form>
          <p className="px-8 text-center text-sm text-muted-foreground">
            Déjà un compte ?{" "}
            <Link href="/login" className="underline underline-offset-4 hover:text-primary">
              Connectez-vous
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

