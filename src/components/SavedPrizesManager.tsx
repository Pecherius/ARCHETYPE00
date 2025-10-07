"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useRaffleLanguage } from "../hooks/use-raffle-language"
import { prizeStorageService, type SavedPrize } from "../lib/prize-storage"

interface SavedPrizesManagerProps {
  onSelectPrize: (prize: SavedPrize) => void
  onClose: () => void
  isOpen: boolean
}

export default function SavedPrizesManager({ onSelectPrize, onClose, isOpen }: SavedPrizesManagerProps) {
  const { t } = useRaffleLanguage()
  const [savedPrizes, setSavedPrizes] = useState<SavedPrize[]>([])
  const [filter, setFilter] = useState<"all" | "recent" | "most_used">("recent")
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    if (isOpen) {
      loadSavedPrizes()
    }
  }, [isOpen, filter])

  const loadSavedPrizes = () => {
    let prizes: SavedPrize[] = []
    
    switch (filter) {
      case "recent":
        prizes = prizeStorageService.getRecentlyUsedPrizes(20)
        break
      case "most_used":
        prizes = prizeStorageService.getMostUsedPrizes(20)
        break
      default:
        prizes = prizeStorageService.getAllPrizes()
    }
    
    setSavedPrizes(prizes)
  }

  const handleSelectPrize = (prize: SavedPrize) => {
    prizeStorageService.updatePrizeUsage(prize.id)
    onSelectPrize(prize)
    onClose()
  }

  const handleDeletePrize = (prizeId: string) => {
    if (confirm("Are you sure you want to delete this prize?")) {
      prizeStorageService.deletePrize(prizeId)
      loadSavedPrizes()
    }
  }

  const filteredPrizes = savedPrizes.filter(prize =>
    prize.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    prize.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (!isOpen) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8, y: 20 }}
        className="bg-zinc-900 rounded-2xl p-6 shadow-2xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-zinc-100 flex items-center gap-2">
            <span className="text-pink-500">🏆</span>
            {t.savedPrizes || "Saved Prizes"}
          </h3>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-200 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Filters and Search */}
        <div className="space-y-4 mb-6">
          <div className="flex gap-2">
            <button
              onClick={() => setFilter("recent")}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                filter === "recent"
                  ? "bg-pink-500 text-white"
                  : "bg-zinc-700 text-zinc-300 hover:bg-zinc-600"
              }`}
            >
              {t.recent || "Recent"}
            </button>
            <button
              onClick={() => setFilter("most_used")}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                filter === "most_used"
                  ? "bg-pink-500 text-white"
                  : "bg-zinc-700 text-zinc-300 hover:bg-zinc-600"
              }`}
            >
              {t.mostUsed || "Most Used"}
            </button>
            <button
              onClick={() => setFilter("all")}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                filter === "all"
                  ? "bg-pink-500 text-white"
                  : "bg-zinc-700 text-zinc-300 hover:bg-zinc-600"
              }`}
            >
              {t.all || "All"}
            </button>
          </div>

          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t.searchPrizes || "Search prizes..."}
            className="w-full px-3 py-2 bg-zinc-800 border border-zinc-600 rounded-lg text-zinc-100 placeholder-zinc-400 focus:border-pink-500 focus:ring-pink-500"
          />
        </div>

        {/* Prizes List */}
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {filteredPrizes.length === 0 ? (
            <div className="text-center text-zinc-500 py-8">
              <span className="text-4xl mb-2 block">🏆</span>
              <p className="text-sm">
                {searchTerm ? (t.noPrizesFound || "No prizes found") : (t.noSavedPrizes || "No saved prizes yet")}
              </p>
            </div>
          ) : (
            filteredPrizes.map((prize) => (
              <motion.div
                key={prize.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between p-4 bg-zinc-800/50 rounded-lg border border-zinc-700 hover:bg-zinc-700/50 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-rose-500 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                    🏆
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-zinc-100 truncate">{prize.name}</h4>
                    <p className="text-xs text-zinc-400 truncate">{prize.description}</p>
                    <div className="flex items-center gap-4 mt-1">
                      <span className="text-xs text-zinc-500">
                        {t.quantity || "Quantity"}: {prize.count}
                      </span>
                      <span className="text-xs text-zinc-500">
                        {t.used || "Used"}: {prize.use_count} {t.times || "times"}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleSelectPrize(prize)}
                    className="px-3 py-1 bg-pink-500 hover:bg-pink-600 text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    {t.select || "Select"}
                  </button>
                  <button
                    onClick={() => handleDeletePrize(prize.id)}
                    className="px-3 py-1 text-red-400 hover:text-red-300 text-sm font-medium rounded-lg transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center mt-6 pt-4 border-t border-zinc-700">
          <div className="text-sm text-zinc-400">
            {filteredPrizes.length} {t.prizes || "prizes"}
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 border border-zinc-600 text-zinc-300 hover:bg-zinc-800 rounded-lg transition-colors"
          >
            {t.close || "Close"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}
