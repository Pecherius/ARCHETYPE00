"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useRaffleLanguage } from "../hooks/use-raffle-language"
import { userStorageService, type SavedUser } from "../lib/user-storage"
import { ParticipantIcon } from "../lib/participant-icons"

interface SavedUsersManagerProps {
  onSelectUser: (user: SavedUser) => void
  onClose: () => void
  isOpen: boolean
}


export default function SavedUsersManager({ onSelectUser, onClose, isOpen }: SavedUsersManagerProps) {
  const { t } = useRaffleLanguage()
  const [savedUsers, setSavedUsers] = useState<SavedUser[]>([])
  const [filter, setFilter] = useState<"all" | "recent" | "most_used">("recent")
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    if (isOpen) {
      loadSavedUsers()
    }
  }, [isOpen, filter])

  const loadSavedUsers = () => {
    let users: SavedUser[] = []
    
    switch (filter) {
      case "recent":
        users = userStorageService.getRecentlyUsedUsers(20)
        break
      case "most_used":
        users = userStorageService.getMostUsedUsers(20)
        break
      default:
        users = userStorageService.getAllUsers()
    }
    
    setSavedUsers(users)
  }

  const handleSelectUser = (user: SavedUser) => {
    userStorageService.updateUserUsage(user.id)
    onSelectUser(user)
    onClose()
  }

  const handleDeleteUser = (userId: string) => {
    if (confirm(t.deleteConfirm)) {
      userStorageService.deleteUser(userId)
      loadSavedUsers()
    }
  }

  const filteredUsers = savedUsers.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.up_address.toLowerCase().includes(searchTerm.toLowerCase())
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
            <span className="text-pink-500">👥</span>
            {t.savedUsers || "Usuarios Guardados"}
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
              {t.recent || "Recientes"}
            </button>
            <button
              onClick={() => setFilter("most_used")}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                filter === "most_used"
                  ? "bg-pink-500 text-white"
                  : "bg-zinc-700 text-zinc-300 hover:bg-zinc-600"
              }`}
            >
              {t.mostUsed || "Más Usados"}
            </button>
            <button
              onClick={() => setFilter("all")}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                filter === "all"
                  ? "bg-pink-500 text-white"
                  : "bg-zinc-700 text-zinc-300 hover:bg-zinc-600"
              }`}
            >
              {t.all || "Todos"}
            </button>
          </div>

          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t.searchUsers || "Buscar usuarios..."}
            className="w-full px-3 py-2 bg-zinc-800 border border-zinc-600 rounded-lg text-zinc-100 placeholder-zinc-400 focus:border-pink-500 focus:ring-pink-500"
          />
        </div>

        {/* Users List */}
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {filteredUsers.length === 0 ? (
            <div className="text-center text-zinc-500 py-8">
              <span className="text-4xl mb-2 block">👤</span>
              <p className="text-sm">
                {searchTerm ? (t.noUsersFound || "No se encontraron usuarios") : (t.noSavedUsers || "No hay usuarios guardados")}
              </p>
            </div>
          ) : (
            filteredUsers.map((user) => (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between p-4 bg-zinc-800/50 rounded-lg border border-zinc-700 hover:bg-zinc-700/50 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1">
                  <div
                    className="w-10 h-10 rounded-full shadow-sm flex items-center justify-center"
                    style={{ backgroundColor: user.color }}
                  >
                    <ParticipantIcon
                      participantId={user.id}
                      participantName={user.name}
                      className="w-6 h-6 text-white"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-zinc-100 truncate">{user.name}</h4>
                    <p className="text-xs text-zinc-400 font-mono truncate">{user.up_address}</p>
                    <div className="flex items-center gap-4 mt-1">
                      <span className="text-xs text-zinc-500">
                        {t.used || "Usado"}: {user.use_count} {t.times || "veces"}
                      </span>
                      <span className="text-xs text-zinc-500">
                        {t.lastUsed || "Último uso"}: {new Date(user.last_used).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleSelectUser(user)}
                    className="px-3 py-1 bg-pink-500 hover:bg-pink-600 text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    {t.select || "Seleccionar"}
                  </button>
                  <button
                    onClick={() => handleDeleteUser(user.id)}
                    className="px-3 py-1 text-red-400 hover:text-red-300 text-sm font-medium rounded-lg transition-colors"
                  >
                    Eliminar
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center mt-6 pt-4 border-t border-zinc-700">
          <div className="text-sm text-zinc-400">
            {filteredUsers.length} {t.users || "usuarios"}
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 border border-zinc-600 text-zinc-300 hover:bg-zinc-800 rounded-lg transition-colors"
          >
            {t.close || "Cerrar"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}
