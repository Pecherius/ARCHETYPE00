"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { motion, AnimatePresence } from "framer-motion"
import { Copy, Check, ArrowLeft, RotateCcw, Trophy, User, AlertCircle } from "lucide-react"
import { useLanguage } from "../hooks/use-language"
import { ParticipantIcon } from "../lib/participant-icons"
import LanguageSelector from "./language-selector"
import type { Raffle, Winner } from "../lib/types"

interface ResultsScreenProps {
  raffle: Raffle
  winners: Winner[]
  onBackToEdit: () => void
  onViewWinners: () => void
  onRestartRaffle: () => void
}

export default function ResultsScreen({
  raffle,
  winners,
  onBackToEdit,
  onViewWinners,
  onRestartRaffle,
}: ResultsScreenProps) {
  const { t } = useLanguage()
  const [copiedAddresses, setCopiedAddresses] = useState<Set<string>>(new Set())

  const copyToClipboard = async (address: string, winnerId: string) => {
    try {
      await navigator.clipboard.writeText(address)
      setCopiedAddresses((prev) => new Set(prev).add(winnerId))
      setTimeout(() => {
        setCopiedAddresses((prev) => {
          const newSet = new Set(prev)
          newSet.delete(winnerId)
          return newSet
        })
      }, 2000)
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }

  const hasWinners = winners.length > 0
  const isRaffleComplete = hasWinners

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-purple-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button
            onClick={onBackToEdit}
            variant="outline"
            className="flex items-center gap-2 border-pink-300 text-pink-600 hover:bg-pink-50 bg-transparent"
          >
            <ArrowLeft className="w-4 h-4" />
            {t.resultsBackToEdit}
          </Button>

          <LanguageSelector />
        </div>

        {/* Title Section */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-4 mb-4">
            {raffle.image_url && (
              <div className="w-16 h-16 rounded-xl overflow-hidden shadow-lg">
                <img src={raffle.image_url || "/placeholder.svg"} alt="Raffle" className="w-full h-full object-cover" />
              </div>
            )}
            <div>
              <h1 className="text-4xl font-black bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 bg-clip-text text-transparent">
                {raffle.title}
              </h1>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">{t.resultsTitle}</h2>
          {raffle.description && <p className="text-gray-600">{raffle.description}</p>}
        </div>

        {/* Main Content */}
        <AnimatePresence mode="wait">
          {isRaffleComplete ? (
            <motion.div
              key="complete"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Success Message */}
              <Card className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 text-center">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <Trophy className="w-8 h-8 text-green-600" />
                  <h3 className="text-2xl font-bold text-green-800">{t.resultsRaffleComplete}</h3>
                </div>
                <p className="text-green-700">
                  {winners.length} {t.winnersSelected} {raffle.title}
                </p>
              </Card>

              {/* Winners List */}
              <Card className="p-6 bg-white border-pink-200 shadow-lg">
                <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                  <Trophy className="w-6 h-6 text-pink-500" />
                  {t.winners} ({winners.length})
                </h3>

                <div className="space-y-4">
                  {winners.map((winner, index) => (
                    <motion.div
                      key={winner.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between p-4 bg-gradient-to-r from-pink-50 to-rose-50 rounded-xl border border-pink-100"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-6 h-6 rounded-full shadow-sm flex items-center justify-center"
                            style={{ backgroundColor: winner.participant_color }}
                          >
                            <ParticipantIcon
                              participantId={winner.participant_id}
                              participantName={winner.participant_name}
                              className="w-4 h-4 text-white"
                            />
                          </div>
                          <div className="text-lg font-bold text-gray-800">#{index + 1}</div>
                        </div>

                        <div>
                          <div className="font-semibold text-gray-800 text-lg">{winner.participant_name}</div>
                          <div className="text-sm text-pink-600 font-medium">{winner.prize_name}</div>
                          {winner.up_address && (
                            <div className="text-xs text-gray-500 font-mono mt-1">
                              {winner.up_address.slice(0, 10)}...{winner.up_address.slice(-8)}
                            </div>
                          )}
                        </div>
                      </div>

                      {winner.up_address && (
                        <Button
                          onClick={() => copyToClipboard(winner.up_address!, winner.id)}
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-2 border-pink-200 text-pink-600 hover:bg-pink-50"
                        >
                          {copiedAddresses.has(winner.id) ? (
                            <>
                              <Check className="w-4 h-4" />
                              {t.copied}
                            </>
                          ) : (
                            <>
                              <Copy className="w-4 h-4" />
                              {t.resultsCopyAddress}
                            </>
                          )}
                        </Button>
                      )}
                    </motion.div>
                  ))}
                </div>
              </Card>

              {/* Action Buttons */}
              <div className="flex gap-4 justify-center">
                <Button
                  onClick={onViewWinners}
                  className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-semibold px-8 py-3 rounded-lg shadow-md flex items-center gap-2"
                >
                  <Trophy className="w-5 h-5" />
                  {t.resultsViewWinners}
                </Button>
                <Button
                  onClick={onRestartRaffle}
                  variant="outline"
                  className="border-gray-300 text-gray-700 hover:bg-gray-50 px-8 py-3 rounded-lg shadow-md flex items-center gap-2 bg-transparent"
                >
                  <RotateCcw className="w-5 h-5" />
                  {t.resultsRestart}
                </Button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="not-ready"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center space-y-6"
            >
              {/* Not Ready Message */}
              <Card className="p-8 bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <AlertCircle className="w-8 h-8 text-yellow-600" />
                  <h3 className="text-2xl font-bold text-yellow-800">{t.resultsNotReady}</h3>
                </div>
                <p className="text-yellow-700 mb-6">{t.resultsNoWinners}</p>

                <Button
                  onClick={onBackToEdit}
                  className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-semibold px-8 py-3 rounded-lg shadow-md flex items-center gap-2 mx-auto"
                >
                  <User className="w-5 h-5" />
                  {t.resultsContinueEditing}
                </Button>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
