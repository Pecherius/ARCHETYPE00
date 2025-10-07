"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useRaffleLanguage } from "../hooks/use-raffle-language"
import { ParticipantIcon } from "../lib/participant-icons"
import type { Raffle, Winner } from "../lib/raffle-types"

interface RaffleResultsScreenProps {
  raffle: Raffle
  winners: Winner[]
  onBackToEdit: () => void
  onViewWinners: () => void
  onRestartRaffle: () => void
}

export default function RaffleResultsScreen({
  raffle,
  winners,
  onBackToEdit,
  onViewWinners,
  onRestartRaffle,
}: RaffleResultsScreenProps) {
  const { t } = useRaffleLanguage()
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
    <section className="mx-auto max-w-6xl px-4 pb-12 sm:px-6">
      <h2 className="mb-6 text-2xl font-bold tracking-wide text-zinc-100">{t.resultsTitle}</h2>
      <div className="border border-zinc-800 p-6 text-sm leading-relaxed text-zinc-300">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={onBackToEdit}
            className="flex items-center gap-2 px-4 py-2 border border-zinc-600 text-zinc-300 hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {t.resultsBackToEdit}
          </button>
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
              <h3 className="text-3xl font-black bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 bg-clip-text text-transparent">
                {raffle.title}
              </h3>
            </div>
          </div>
          <h4 className="text-xl font-bold text-zinc-100 mb-2">{t.resultsTitle}</h4>
          {raffle.description && <p className="text-zinc-400">{raffle.description}</p>}
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
              <div className="p-6 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-lg text-center">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <span className="text-4xl">🏆</span>
                  <h3 className="text-2xl font-bold text-green-400">{t.resultsRaffleComplete}</h3>
                </div>
                <p className="text-green-300">
                  {winners.length} {t.winnersSelected} {raffle.title}
                </p>
              </div>

              {/* Winners List */}
              <div className="bg-zinc-800/50 p-6 rounded-lg border border-zinc-700">
                <h4 className="text-xl font-bold text-zinc-100 mb-6 flex items-center gap-2">
                  <span className="text-pink-500">🏆</span>
                  {t.winners} ({winners.length})
                </h4>

                <div className="space-y-4">
                  {winners.map((winner, index) => (
                    <motion.div
                      key={winner.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between p-4 bg-gradient-to-r from-pink-500/10 to-rose-500/10 rounded-xl border border-pink-500/20"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-8 h-8 rounded-full shadow-sm flex items-center justify-center"
                            style={{ backgroundColor: winner.participant_color }}
                          >
                            <ParticipantIcon
                              participantId={winner.participant_id}
                              participantName={winner.participant_name}
                              className="w-5 h-5 text-white"
                            />
                          </div>
                          <div className="text-lg font-bold text-zinc-100">#{index + 1}</div>
                        </div>

                        <div>
                          <div className="font-semibold text-zinc-100 text-lg">{winner.participant_name}</div>
                          <div className="text-sm text-pink-400 font-medium">{winner.prize_name}</div>
                          {winner.up_address && (
                            <div className="text-xs text-zinc-500 font-mono mt-1">
                              {winner.up_address.slice(0, 10)}...{winner.up_address.slice(-8)}
                            </div>
                          )}
                        </div>
                      </div>

                      {winner.up_address && (
                        <button
                          onClick={() => copyToClipboard(winner.up_address!, winner.id)}
                          className="flex items-center gap-2 px-3 py-2 border border-pink-500/30 text-pink-400 hover:bg-pink-500/20 rounded-lg transition-colors"
                        >
                          {copiedAddresses.has(winner.id) ? (
                            <>
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              {t.copied}
                            </>
                          ) : (
                            <>
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                              </svg>
                              {t.resultsCopyAddress}
                            </>
                          )}
                        </button>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 justify-center">
                <button
                  onClick={onViewWinners}
                  className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-semibold px-8 py-3 rounded-lg shadow-md flex items-center gap-2"
                >
                  <span className="text-lg">🏆</span>
                  {t.resultsViewWinners}
                </button>
                <button
                  onClick={onRestartRaffle}
                  className="border border-zinc-600 text-zinc-300 hover:bg-zinc-800 px-8 py-3 rounded-lg shadow-md flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  {t.resultsRestart}
                </button>
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
              <div className="p-8 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 rounded-lg">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <span className="text-4xl">⚠️</span>
                  <h3 className="text-2xl font-bold text-yellow-400">{t.resultsNotReady}</h3>
                </div>
                <p className="text-yellow-300 mb-6">{t.resultsNoWinners}</p>

                <button
                  onClick={onBackToEdit}
                  className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-semibold px-8 py-3 rounded-lg shadow-md flex items-center gap-2 mx-auto"
                >
                  <span className="text-lg">👤</span>
                  {t.resultsContinueEditing}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  )
}
