"use client"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Image from "next/image"
import { requestPasswordReset } from "@/lib/auth"
import { toast } from "sonner"

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState("")

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await requestPasswordReset(email)
      toast.success("Un email de réinitialisation a été envoyé à votre adresse email")
      router.push("/login")
    } catch (error) {
      console.error("Erreur:", error)
      toast.error(error.message || "Erreur lors de l'envoi de l'email")
    } finally {
      setIsLoading(false)
    }
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
          <div className="flex flex-col items-center justify-center mb-2">
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
              Entrez votre adresse email pour recevoir un lien de réinitialisation
            </p>
          </motion.div>

          <motion.form
            onSubmit={handleSubmit}
            className="space-y-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Votre adresse email"
                  className="pl-10"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? "Envoi en cours..." : "Envoyer le lien"}
            </Button>

            <div className="text-center text-sm">
              <Link
                href="/login"
                className="text-primary hover:underline"
              >
                Retour à la connexion
              </Link>
            </div>
          </motion.form>
        </div>
      </motion.div>
    </div>
  )
}

