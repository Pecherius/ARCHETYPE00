"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, Trash2, Play, Archive, Eye } from "lucide-react"
import { RaffleService, type Raffle } from "../lib/raffle-service"
import { useLanguage } from "../hooks/use-language"
import LanguageSelector from "./language-selector"

interface RaffleSelectorProps {
  onSelectRaffle: (raffleId: string) => void
  onCreateRaffle: (raffle: Raffle) => void
}

export default function RaffleSelector({ onSelectRaffle, onCreateRaffle }: RaffleSelectorProps) {
  const { t } = useLanguage()
  const [raffles, setRaffles] = useState<Raffle[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newRaffleTitle, setNewRaffleTitle] = useState("")
  const [newRaffleDescription, setNewRaffleDescription] = useState("")
  const [newRaffleImage, setNewRaffleImage] = useState("")
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    loadRaffles()
  }, [])

  const loadRaffles = async () => {
    setLoading(true)
    const data = await RaffleService.getAllRaffles()
    setRaffles(data)
    setLoading(false)
  }

  const handleCreateRaffle = async () => {
    if (!newRaffleTitle.trim()) return

    setCreating(true)
    const raffle = await RaffleService.createRaffle(
      newRaffleTitle.trim(),
      newRaffleDescription.trim() || undefined,
      newRaffleImage.trim() || undefined,
    )

    if (raffle) {
      setRaffles((prev) => [raffle, ...prev])
      setNewRaffleTitle("")
      setNewRaffleDescription("")
      setNewRaffleImage("")
      setShowCreateForm(false)
      onCreateRaffle(raffle)
    }
    setCreating(false)
  }

  const handleDeleteRaffle = async (id: string) => {
    if (!confirm(t.deleteConfirm)) return

    const success = await RaffleService.deleteRaffle(id)
    if (success) {
      setRaffles((prev) => prev.filter((r) => r.id !== id))
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 border-green-200"
      case "completed":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "paused":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <Play className="w-3 h-3" />
      case "completed":
        return <Archive className="w-3 h-3" />
      case "paused":
        return <Eye className="w-3 h-3" />
      default:
        return null
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "active":
        return t.active
      case "completed":
        return t.completed
      case "paused":
        return t.paused
      default:
        return status
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">{t.loadingRaffles}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-purple-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Language Selector */}
        <div className="flex justify-end mb-6">
          <LanguageSelector />
        </div>

        <div className="text-center mb-8">
          <h1 className="text-5xl font-black bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 bg-clip-text text-transparent mb-4">
            {t.raffleSystem}
          </h1>
          <p className="text-gray-600 text-lg">{t.manageRaffles}</p>
        </div>

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            {t.myRaffles} ({raffles.length})
          </h2>
          <Button
            onClick={() => setShowCreateForm(true)}
            className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-semibold px-6 py-3 rounded-lg shadow-md flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            {t.newRaffle}
          </Button>
        </div>

        <AnimatePresence>
          {showCreateForm && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-6"
            >
              <Card className="p-6 bg-white border-pink-200 shadow-lg">
                <h3 className="text-xl font-bold text-gray-800 mb-4">{t.createNewRaffle}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <Label htmlFor="title">{t.raffleTitle} *</Label>
                    <Input
                      id="title"
                      value={newRaffleTitle}
                      onChange={(e) => setNewRaffleTitle(e.target.value)}
                      placeholder={t.raffleTitlePlaceholder}
                      className="border-pink-200 focus:border-pink-400 focus:ring-pink-400"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="description">{t.description}</Label>
                    <Input
                      id="description"
                      value={newRaffleDescription}
                      onChange={(e) => setNewRaffleDescription(e.target.value)}
                      placeholder={t.descriptionPlaceholder}
                      className="border-pink-200 focus:border-pink-400 focus:ring-pink-400"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="image">{t.imageUrl}</Label>
                    <Input
                      id="image"
                      value={newRaffleImage}
                      onChange={(e) => setNewRaffleImage(e.target.value)}
                      placeholder={t.imageUrlPlaceholder}
                      className="border-pink-200 focus:border-pink-400 focus:ring-pink-400"
                    />
                  </div>
                </div>
                <div className="flex gap-3 mt-6">
                  <Button
                    onClick={handleCreateRaffle}
                    disabled={!newRaffleTitle.trim() || creating}
                    className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-semibold px-6 py-2 rounded-lg shadow-md disabled:opacity-50"
                  >
                    {creating ? t.creating : t.createRaffle}
                  </Button>
                  <Button
                    onClick={() => setShowCreateForm(false)}
                    variant="outline"
                    className="border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    {t.cancel}
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {raffles.length === 0 ? (
          <Card className="p-12 text-center bg-white border-pink-200 shadow-lg">
            <div className="text-6xl mb-4">🎲</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">{t.noRafflesYet}</h3>
            <p className="text-gray-600 mb-6">{t.createFirstRaffle}</p>
            <Button
              onClick={() => setShowCreateForm(true)}
              className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-semibold px-8 py-3 rounded-lg shadow-md"
            >
              {t.createFirstRaffle}
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {raffles.map((raffle) => (
              <motion.div
                key={raffle.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="group"
              >
                <Card className="h-full bg-white border-pink-200 shadow-lg hover:shadow-xl transition-all duration-200 overflow-hidden">
                  {raffle.image_url && (
                    <div className="h-48 overflow-hidden">
                      <img
                        src={raffle.image_url || "/placeholder.svg"}
                        alt={raffle.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                    </div>
                  )}
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-xl font-bold text-gray-800 line-clamp-2">{raffle.title}</h3>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium border flex items-center gap-1 ${getStatusColor(raffle.status)}`}
                      >
                        {getStatusIcon(raffle.status)}
                        {getStatusText(raffle.status)}
                      </span>
                    </div>
                    {raffle.description && (
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">{raffle.description}</p>
                    )}
                    <p className="text-xs text-gray-500 mb-4">
                      {t.created}: {raffle.created_at ? new Date(raffle.created_at).toLocaleDateString() : t.pending}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => onSelectRaffle(raffle.id)}
                        className="flex-1 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-semibold py-2 rounded-lg shadow-md"
                      >
                        {t.openRaffle}
                      </Button>
                      <Button
                        onClick={() => handleDeleteRaffle(raffle.id)}
                        variant="outline"
                        size="sm"
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 border-red-200"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
