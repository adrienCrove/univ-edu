"use client"
import { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { GraduationCap, ArrowLeft, BadgeIcon as IdCard } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Image from "next/image"

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
      setIsSubmitted(true)
    }, 1500)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <motion.div
        className="w-full max-w-md bg-white rounded-xl shadow-lg overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="p-8">
          <div className="flex flex-col items-center justify-center mb-8">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex items-center justify-center h-14 w-14 rounded-full bg-primary/10 mb-4"
            >
              <Image src="/logo/logo-fs.jpeg" alt="logo" width={300} height={300} />

            </motion.div>
           
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <h2 className="text-2xl font-bold text-center mb-2">Mot de passe oublié</h2>
            <p className="text-center text-muted-foreground mb-6">
              Entrez votre numéro d'inscription pour recevoir un lien de réinitialisation
            </p>
          </motion.div>

          {isSubmitted ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <Alert className="mb-6 bg-green-50 text-green-800 border-green-200">
                <AlertDescription>
                  Si un compte existe avec ce numéro d'inscription, vous recevrez un lien de réinitialisation dans
                  quelques minutes.
                </AlertDescription>
              </Alert>

              <Button asChild variant="outline" className="w-full">
                <Link href="/login">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Retour à la connexion
                </Link>
              </Button>
            </motion.div>
          ) : (
            <motion.form
              onSubmit={handleSubmit}
              className="space-y-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <div className="space-y-2">
                <Label htmlFor="registrationNumber">N° de matricule</Label>
                <div className="relative">
                  <IdCard className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="registrationNumber"
                    type="text"
                    placeholder="Entrez votre N° matricule"
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Envoi en cours..." : "Envoyer le lien de réinitialisation"}
              </Button>

              <div className="text-center">
                <Link
                  href="/login"
                  className="text-sm font-medium text-primary hover:underline inline-flex items-center"
                >
                  <ArrowLeft className="mr-1 h-3 w-3" />
                  Retour à la connexion
                </Link>
              </div>
            </motion.form>
          )}
        </div>
      </motion.div>
    </div>
  )
}

