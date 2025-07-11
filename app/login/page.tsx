"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { KanbanSquare, Loader2 } from "lucide-react"
import { loginUser } from "../lib/api"
import { useAuth } from "../contexts/AuthContext"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"

export default function LoginPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { login } = useAuth()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const result = await loginUser(username, password)

      if (result && "id" in result) {
        login(result)
        toast({
          title: "Login Successful",
          description: `Welcome back, ${result.username}!`,
        })
        router.push("/")
      } else {
        toast({
          title: "Login Failed",
          description: "Invalid username or password",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Login Error",
        description: "An error occurred during login",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4">
      <Card className="my-2 w-full max-w-sm md:max-w-md bg-gray-800 border-gray-700">
        <CardHeader className="text-center">
          <div className="flex max-h-16 justify-center">
            <Image
              src="/images/Tiei_logo.png"
              alt="TIEI logo"
              width={90}
              height={40}
              className="h-24 w-auto object-cover object-bottom"
              priority
            />
          </div>
          <CardTitle className="text-xl md:text-2xl font-bold text-white">E-Kanban System</CardTitle>
          <CardDescription className="text-sm md:text-base text-gray-400">
            Sign in to access the production management dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="username" className="text-xs md:text-sm font-medium text-gray-300">
                Username
              </label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="bg-gray-700 border-gray-600 text-xs md:text-sm text-white placeholder-gray-400"
                placeholder="Enter your username"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-xs md:text-sm font-medium text-gray-300">
                Password
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-gray-700 border-gray-600 text-xs md:text-sm text-white placeholder-gray-400"
                placeholder="Enter your password"
              />
            </div>
            <Button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-xs md:text-sm text-white">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
