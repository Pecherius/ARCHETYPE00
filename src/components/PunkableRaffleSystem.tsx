"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import confetti from "canvas-confetti"
import { RaffleService, type Raffle, type Participant, type Prize, type Winner } from "../lib/raffle-service"
import { useRaffleLanguage } from "../hooks/use-raffle-language"
import { ParticipantIcon } from "../lib/participant-icons"
import { userStorageService, type SavedUser } from "../lib/user-storage"
import { prizeStorageService, type SavedPrize } from "../lib/prize-storage"
import { exportWinnersAsImage, exportWinnersAsJSON, type WinnerExport } from "../lib/export-winners"
import RaffleLanguageSelector from "./RaffleLanguageSelector"
import RaffleResultsScreen from "./RaffleResultsScreen"
import SavedUsersManager from "./SavedUsersManager"
import SavedPrizesManager from "./SavedPrizesManager"

const COLORS = [
  "#FF69B4", "#FFB6C1", "#FF1493", "#FFC0CB", "#FF91A4", "#FF6B9D", "#C71585", 
  "#FF20B2", "#FF007F", "#FF69B4", "#DA70D6", "#DDA0DD", "#EE82EE", "#FF1493", "#FFB6C1"
]

const PunkableRaffleSystem = () => {
  const { t } = useRaffleLanguage()
  
  // Current raffle state
  const [currentRaffle, setCurrentRaffle] = useState<Raffle | null>(null)
  const [participants, setParticipants] = useState<Participant[]>([])
  const [prizes, setPrizes] = useState<Prize[]>([])
  const [winners, setWinners] = useState<Winner[]>([])
  const [loading, setLoading] = useState(false)

  // View state
  const [currentView, setCurrentView] = useState<"selector" | "raffle" | "results">("selector")

  // Selection state
  const [selecting, setSelecting] = useState(false)
  const [currentParticipant, setCurrentParticipant] = useState<Participant | null>(null)
  const [latestWinner, setLatestWinner] = useState<{ participant: Participant; prize: Prize } | null>(null)
  const [showWinnerAlert, setShowWinnerAlert] = useState(false)
  const shuffleRef = useRef<number | null>(null)
  const winnerAlertTimeoutRef = useRef<number | null>(null)

  // Form states
  const [newParticipantName, setNewParticipantName] = useState("")
  const [newParticipantTickets, setNewParticipantTickets] = useState("")
  const [newParticipantUpAddress, setNewParticipantUpAddress] = useState("")
  const [newPrizeName, setNewPrizeName] = useState("")
  const [newPrizeCount, setNewPrizeCount] = useState("")

  // Raffle creation states
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newRaffleTitle, setNewRaffleTitle] = useState("")
  const [newRaffleDescription, setNewRaffleDescription] = useState("")
  const [newRaffleImage, setNewRaffleImage] = useState("")
  const [creating, setCreating] = useState(false)

  // Validation states
  const [duplicateUpAddressError, setDuplicateUpAddressError] = useState("")

  // Saved users states
  const [showSavedUsers, setShowSavedUsers] = useState(false)
  const [showSaveUserDialog, setShowSaveUserDialog] = useState(false)
  const [saveUserName, setSaveUserName] = useState("")
  const [saveUserUpAddress, setSaveUserUpAddress] = useState("")

  // Saved prizes states
  const [showSavedPrizes, setShowSavedPrizes] = useState(false)
  const [showSavePrizeDialog, setShowSavePrizeDialog] = useState(false)
  const [savePrizeName, setSavePrizeName] = useState("")
  const [savePrizeDescription, setSavePrizeDescription] = useState("")
  const [savePrizeCount, setSavePrizeCount] = useState("")
  const [savePrizeImage, setSavePrizeImage] = useState("")

  // Load raffle data
  const loadRaffleData = async (raffleId: string) => {
    setLoading(true)
    try {
      const [raffle, participantsData, prizesData, winnersData] = await Promise.all([
        RaffleService.getRaffle(raffleId),
        RaffleService.getParticipants(raffleId),
        RaffleService.getPrizes(raffleId),
        RaffleService.getWinners(raffleId),
      ])

      if (raffle) {
        setCurrentRaffle(raffle)
        setParticipants(participantsData)
        setPrizes(prizesData)
        setWinners(winnersData)
      }
    } catch (error) {
      console.error("Error loading raffle data:", error)
    } finally {
      setLoading(false)
    }
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
      setCurrentRaffle(raffle)
      setParticipants([])
      setPrizes([])
      setWinners([])
      setCurrentView("raffle")
      setNewRaffleTitle("")
      setNewRaffleDescription("")
      setNewRaffleImage("")
      setShowCreateForm(false)
    }
    setCreating(false)
  }

  // Check for duplicate UP addresses
  const checkDuplicateUpAddress = async (upAddress: string) => {
    if (!upAddress.trim() || !currentRaffle) return false
    return await RaffleService.checkDuplicateUpAddress(currentRaffle.id, upAddress)
  }

  const getRandomWeightedParticipant = () => {
    if (participants.length === 0) return null
    const totalTickets = participants.reduce((sum, p) => sum + p.tickets, 0)
    let random = Math.random() * totalTickets

    for (const participant of participants) {
      random -= participant.tickets
      if (random <= 0) {
        return participant
      }
    }
    return participants[0]
  }

  const getRandomPrize = () => {
    const availablePrizes = prizes.filter((p) => p.remaining > 0)
    if (availablePrizes.length === 0) return null
    const randomIndex = Math.floor(Math.random() * availablePrizes.length)
    return availablePrizes[randomIndex]
  }

  const selectWinner = async () => {
    if (selecting || participants.length === 0 || !currentRaffle) return

    const prize = getRandomPrize()
    if (!prize) return

    setSelecting(true)
    const selectedWinner = getRandomWeightedParticipant()
    if (!selectedWinner) return

    const weightedArray = participants.flatMap((p) => Array(p.tickets).fill(p))

    let shuffleCount = 0
    const totalShuffles = 15

    const shuffle = () => {
      if (shuffleCount < totalShuffles) {
        const randomIndex = Math.floor(Math.random() * weightedArray.length)
        setCurrentParticipant(weightedArray[randomIndex])

        shuffleCount++
        shuffleRef.current = setTimeout(shuffle, 50 + shuffleCount * 10)
      } else {
        setCurrentParticipant(selectedWinner)
        setLatestWinner({ participant: selectedWinner, prize })
        setShowWinnerAlert(true)

        confetti({
          particleCount: 150,
          spread: 80,
          origin: { y: 0.6 },
          colors: ["#FF69B4", "#FFB6C1", "#FF1493", "#FFC0CB", "#FF91A4"],
        })

        if (winnerAlertTimeoutRef.current) {
          clearTimeout(winnerAlertTimeoutRef.current)
        }
        winnerAlertTimeoutRef.current = setTimeout(() => {
          setShowWinnerAlert(false)
        }, 3000)

        // Update prize remaining count
        RaffleService.updatePrizeRemaining(prize.id, Math.max(0, prize.remaining - 1))
        setPrizes((prev) =>
          prev.map((p) => (p.id === prize.id ? { ...p, remaining: Math.max(0, p.remaining - 1) } : p)),
        )

        // Add winner to local storage
        const winnerData = {
          raffle_id: currentRaffle.id,
          participant_id: selectedWinner.id,
          prize_id: prize.id,
          participant_name: selectedWinner.name,
          prize_name: prize.name,
          participant_color: selectedWinner.color,
          up_address: selectedWinner.up_address,
        }

        RaffleService.addWinner(winnerData).then((winner) => {
          if (winner) {
            setWinners((prev) => [...prev, winner])
          }
        })

        setSelecting(false)
      }
    }

    shuffle()
  }

  const addParticipant = async () => {
    if (
      !newParticipantName.trim() ||
      !newParticipantTickets ||
      Number.parseInt(newParticipantTickets) <= 0 ||
      !currentRaffle
    )
      return

    // Check for duplicate UP address
    if (newParticipantUpAddress.trim() && (await checkDuplicateUpAddress(newParticipantUpAddress))) {
      setDuplicateUpAddressError(t.duplicateUpAddress)
      return
    }

    const participantData = {
      name: newParticipantName.trim(),
      tickets: Number.parseInt(newParticipantTickets),
      color: COLORS[participants.length % COLORS.length],
      up_address: newParticipantUpAddress.trim() || undefined,
    }

    const participant = await RaffleService.addParticipant(currentRaffle.id, participantData)
    if (participant) {
      setParticipants((prev) => [...prev, participant])
      
      // Update saved user usage if exists
      if (newParticipantUpAddress.trim()) {
        const savedUser = userStorageService.getUserByUpAddress(newParticipantUpAddress)
        if (savedUser) {
          userStorageService.updateUserUsage(savedUser.id)
        }
      }
      
      setNewParticipantName("")
      setNewParticipantTickets("")
      setNewParticipantUpAddress("")
      setDuplicateUpAddressError("")
    }
  }

  const removeParticipant = async (participant: Participant) => {
    const success = await RaffleService.removeParticipant(participant.id)
    if (success) {
      setParticipants((prev) => prev.filter((p) => p.id !== participant.id))
      setDuplicateUpAddressError("")
    }
  }

  const addPrize = async () => {
    if (!newPrizeName.trim() || !newPrizeCount || Number.parseInt(newPrizeCount) <= 0 || !currentRaffle) return

    const prizeData = {
      name: newPrizeName.trim(),
      count: Number.parseInt(newPrizeCount),
    }

    const prize = await RaffleService.addPrize(currentRaffle.id, prizeData)
    if (prize) {
      setPrizes((prev) => [...prev, prize])
      
      // Update saved prize usage if exists
      if (newPrizeName.trim()) {
        const savedPrizes = prizeStorageService.getAllPrizes()
        const savedPrize = savedPrizes.find(p => p.name.toLowerCase() === newPrizeName.toLowerCase())
        if (savedPrize) {
          prizeStorageService.updatePrizeUsage(savedPrize.id)
        }
      }
      
      setNewPrizeName("")
      setNewPrizeCount("")
    }
  }

  const removePrize = async (prize: Prize) => {
    const success = await RaffleService.removePrize(prize.id)
    if (success) {
      setPrizes((prev) => prev.filter((p) => p.id !== prize.id))
    }
  }

  const goBackToRaffles = () => {
    setCurrentRaffle(null)
    setParticipants([])
    setPrizes([])
    setWinners([])
    setCurrentView("selector")
  }

  // Handle saved user selection
  const handleSelectSavedUser = (user: SavedUser) => {
    setNewParticipantName(user.name)
    setNewParticipantUpAddress(user.up_address)
    setShowSavedUsers(false)
  }

  // Handle saving user
  const handleSaveUser = () => {
    if (!saveUserName.trim() || !saveUserUpAddress.trim()) return

    // Check if user already exists
    const existingUser = userStorageService.userExists(saveUserName, saveUserUpAddress)
    if (existingUser.exists) {
      alert(t.duplicateUpAddress)
      return
    }

    // Save user
    const color = COLORS[userStorageService.getAllUsers().length % COLORS.length]
    userStorageService.saveUser(saveUserName, saveUserUpAddress, color)
    
    // Reset form
    setSaveUserName("")
    setSaveUserUpAddress("")
    setShowSaveUserDialog(false)
  }

  // Handle quick save from current participant form
  const handleQuickSaveUser = () => {
    if (!newParticipantName.trim() || !newParticipantUpAddress.trim()) return

    // Check if user already exists
    const existingUser = userStorageService.userExists(newParticipantName, newParticipantUpAddress)
    if (existingUser.exists) {
      alert(t.duplicateUpAddress)
      return
    }

    // Save user
    const color = COLORS[userStorageService.getAllUsers().length % COLORS.length]
    userStorageService.saveUser(newParticipantName, newParticipantUpAddress, color)
  }

  // Handle saved prize selection
  const handleSelectSavedPrize = (prize: SavedPrize) => {
    setNewPrizeName(prize.name)
    setNewPrizeCount(prize.count.toString())
    setShowSavedPrizes(false)
  }

  // Handle saving prize
  const handleSavePrize = () => {
    if (!savePrizeName.trim() || !savePrizeCount.trim()) return

    const count = parseInt(savePrizeCount)
    if (isNaN(count) || count <= 0) return

    // Save prize
    prizeStorageService.savePrize(savePrizeName, savePrizeDescription, count, savePrizeImage)
    
    // Reset form
    setSavePrizeName("")
    setSavePrizeDescription("")
    setSavePrizeCount("")
    setSavePrizeImage("")
    setShowSavePrizeDialog(false)
  }

  // Handle quick save from current prize form
  const handleQuickSavePrize = () => {
    if (!newPrizeName.trim() || !newPrizeCount.trim()) return

    const count = parseInt(newPrizeCount)
    if (isNaN(count) || count <= 0) return

    // Save prize
    prizeStorageService.savePrize(newPrizeName, "", count, "")
  }

  // Handle export winners
  const handleExportWinners = (format: 'image' | 'json') => {
    if (!currentRaffle || winners.length === 0) return

    const winnerData: WinnerExport = {
      raffleName: currentRaffle.title,
      raffleDescription: currentRaffle.description || '',
      raffleImage: currentRaffle.image_url || '',
      winners: winners.map(winner => ({
        participantName: winner.participant_name,
        participantUpAddress: winner.up_address || '',
        prizeName: winner.prize_name,
        prizeDescription: '',
        prizeImage: '',
        selectedAt: new Date(winner.won_at).toLocaleString()
      })),
      exportDate: new Date().toLocaleString(),
      totalWinners: winners.length
    }

    if (format === 'image') {
      exportWinnersAsImage(winnerData)
    } else {
      exportWinnersAsJSON(winnerData)
    }
  }

  useEffect(() => {
    return () => {
      if (shuffleRef.current) {
        clearTimeout(shuffleRef.current)
      }
      if (winnerAlertTimeoutRef.current) {
        clearTimeout(winnerAlertTimeoutRef.current)
      }
    }
  }, [])

  // Show results screen
  if (currentView === "results" && currentRaffle) {
    return (
      <RaffleResultsScreen
        raffle={currentRaffle}
        winners={winners}
        onBackToEdit={() => setCurrentView("raffle")}
        onViewWinners={() => setCurrentView("raffle")}
        onRestartRaffle={async () => {
          if (!currentRaffle || !confirm("¿Estás seguro de que quieres reiniciar este sorteo? Todos los ganadores serán eliminados.")) return

          // Clear all winners and reset prize counts
          await RaffleService.clearWinners(currentRaffle.id)
          
          // Reset prizes to original counts
          const currentPrizes = await RaffleService.getPrizes(currentRaffle.id)
          for (const prize of currentPrizes) {
            await RaffleService.updatePrizeRemaining(prize.id, prize.count)
          }

          // Reload data
          await loadRaffleData(currentRaffle.id)
          setCurrentView("raffle")
        }}
      />
    )
  }

  // Show raffle selector if no current raffle
  if (currentView === "selector") {
    return (
      <section className="mx-auto max-w-6xl px-4 pb-12 sm:px-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold tracking-wide text-zinc-100">Punkable Ethereal Raffle System</h2>
          <RaffleLanguageSelector />
        </div>
        <div className="border border-zinc-800 p-6 text-sm leading-relaxed text-zinc-300">
          <div className="text-center mb-8">
            <h3 className="text-3xl font-black bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 bg-clip-text text-transparent mb-4">
              {t.raffleSystem}
            </h3>
            <p className="text-gray-400 text-lg mb-4">{t.manageRaffles}</p>
            <div className="bg-gradient-to-r from-zinc-800/30 to-zinc-900/30 border border-zinc-700/50 rounded-xl p-6 max-w-4xl mx-auto backdrop-blur-sm">
              <div className="text-center mb-4">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-pink-500/10 border border-pink-500/30 rounded-full text-pink-400 text-sm font-medium">
                  <span className="w-2 h-2 bg-pink-500 rounded-full animate-pulse"></span>
                  Fragment Resonance Engine
                </div>
              </div>
              <p className="text-zinc-300 text-center text-sm leading-relaxed">
                Each participant generates a unique frequency signature. The system responds to collective resonance patterns, 
                creating spontaneous selection events that cannot be predicted or manipulated.
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="group relative overflow-hidden border border-zinc-700/50 rounded-xl bg-gradient-to-br from-zinc-800/20 to-zinc-900/20 p-6 backdrop-blur-sm hover:border-pink-500/30 transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-pink-500/20 flex items-center justify-center">
                    <span className="text-pink-400 text-lg">⚡</span>
                  </div>
                  <h4 className="text-pink-400 font-semibold">Resonance Field</h4>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Each participant generates unique frequency patterns. The system responds to collective resonance, 
                  creating spontaneous selection events that emerge from the ethereal network.
                </p>
              </div>
            </div>
            
            <div className="group relative overflow-hidden border border-zinc-700/50 rounded-xl bg-gradient-to-br from-zinc-800/20 to-zinc-900/20 p-6 backdrop-blur-sm hover:border-purple-500/30 transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
                    <span className="text-purple-400 text-lg">🌐</span>
                  </div>
                  <h4 className="text-purple-400 font-semibold">Fragment Storage</h4>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  All data exists within your local fragment matrix. No external dependencies, 
                  complete privacy and control over your resonance patterns.
                </p>
              </div>
            </div>
            
            <div className="group relative overflow-hidden border border-zinc-700/50 rounded-xl bg-gradient-to-br from-zinc-800/20 to-zinc-900/20 p-6 backdrop-blur-sm hover:border-rose-500/30 transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-rose-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-rose-500/20 flex items-center justify-center">
                    <span className="text-rose-400 text-lg">🎯</span>
                  </div>
                  <h4 className="text-rose-400 font-semibold">Quantum Selection</h4>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  The system operates beyond traditional probability. Winners emerge from the 
                  collective resonance field, responding to frequency density patterns.
                </p>
              </div>
            </div>
          </div>

          <div className="text-center">
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-semibold px-8 py-4 rounded-lg shadow-md text-lg"
            >
              {t.createNewRaffle}
            </button>
          </div>

          <AnimatePresence>
            {showCreateForm && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mt-8 p-8 bg-gradient-to-br from-zinc-900/80 to-zinc-800/80 border border-zinc-700/50 rounded-2xl backdrop-blur-sm"
              >
                <div className="text-center mb-6">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-pink-500/10 border border-pink-500/30 rounded-full text-pink-400 text-sm font-medium mb-4">
                    <span className="w-2 h-2 bg-pink-500 rounded-full animate-pulse"></span>
                    Initialize Fragment Resonance
                  </div>
                  <h4 className="text-2xl font-bold text-zinc-100">{t.createNewRaffle}</h4>
                  <p className="text-zinc-400 text-sm mt-2">Configure your ethereal selection parameters</p>
                </div>
                
                <div className="space-y-6">
                  <div className="group">
                    <label className="block text-sm font-medium text-zinc-300 mb-3 flex items-center gap-2">
                      <span className="text-pink-400">⚡</span>
                      {t.raffleTitle} <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={newRaffleTitle}
                      onChange={(e) => setNewRaffleTitle(e.target.value)}
                      placeholder={t.raffleTitlePlaceholder}
                      className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-600/50 rounded-xl text-zinc-100 focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 transition-all duration-200 placeholder-zinc-500"
                    />
                  </div>
                  
                  <div className="group">
                    <label className="block text-sm font-medium text-zinc-300 mb-3 flex items-center gap-2">
                      <span className="text-purple-400">📝</span>
                      {t.description}
                    </label>
                    <input
                      type="text"
                      value={newRaffleDescription}
                      onChange={(e) => setNewRaffleDescription(e.target.value)}
                      placeholder={t.descriptionPlaceholder}
                      className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-600/50 rounded-xl text-zinc-100 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-200 placeholder-zinc-500"
                    />
                  </div>
                  
                  <div className="group">
                    <label className="block text-sm font-medium text-zinc-300 mb-3 flex items-center gap-2">
                      <span className="text-cyan-400">🖼️</span>
                      {t.imageUrl}
                    </label>
                    <input
                      type="url"
                      value={newRaffleImage}
                      onChange={(e) => setNewRaffleImage(e.target.value)}
                      placeholder={t.imageUrlPlaceholder}
                      className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-600/50 rounded-xl text-zinc-100 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-200 placeholder-zinc-500"
                    />
                  </div>
                  
                  <div className="flex gap-4 pt-4">
                    <button
                      onClick={handleCreateRaffle}
                      disabled={!newRaffleTitle.trim() || creating}
                      className="flex-1 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-semibold px-6 py-3 rounded-xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105 disabled:hover:scale-100"
                    >
                      {creating ? (
                        <span className="flex items-center justify-center gap-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          {t.creating}
                        </span>
                      ) : (
                        <span className="flex items-center justify-center gap-2">
                          <span>⚡</span>
                          {t.createRaffle}
                        </span>
                      )}
                    </button>
                    <button
                      onClick={() => setShowCreateForm(false)}
                      className="px-6 py-3 border border-zinc-600/50 text-zinc-300 hover:bg-zinc-800/50 rounded-xl transition-all duration-200 hover:border-zinc-500"
                    >
                      {t.cancel}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>
    )
  }

  if (loading) {
    return (
      <section className="mx-auto max-w-6xl px-4 pb-12 sm:px-6">
        <div className="border border-zinc-800 p-6 text-center">
          <div className="w-16 h-16 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-zinc-400 text-lg">{t.loadingRaffle}</p>
        </div>
      </section>
    )
  }

  const remainingPrizeCount = prizes.reduce((sum, p) => sum + p.remaining, 0)
  const canSelectWinner = participants.length > 0 && remainingPrizeCount > 0 && !selecting

  return (
    <section className="mx-auto max-w-6xl px-4 pb-12 sm:px-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold tracking-wide text-zinc-100">{t.raffleSystem}</h2>
        <RaffleLanguageSelector />
      </div>
      <div className="border border-zinc-800 p-6 text-sm leading-relaxed text-zinc-300">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            {currentRaffle?.image_url && (
              <div className="w-16 h-16 rounded-xl overflow-hidden shadow-lg">
                <img
                  src={currentRaffle.image_url || "/placeholder.svg"}
                  alt="Raffle"
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div>
              <h3 className="text-3xl font-black bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 bg-clip-text text-transparent">
                {currentRaffle?.title}
              </h3>
              <p className="text-zinc-400">{currentRaffle?.description || t.defaultDescription}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {winners.length > 0 && (
              <button
                onClick={() => setCurrentView("results")}
                className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold px-4 py-2 rounded-lg shadow-md flex items-center gap-2"
              >
                <span className="text-lg">🏆</span>
                {t.resultsViewWinners}
              </button>
            )}
            <button
              onClick={goBackToRaffles}
              className="border border-zinc-600 text-zinc-300 hover:bg-zinc-800 px-4 py-2 rounded-lg"
            >
              ← {t.backToRaffles}
            </button>
          </div>
        </div>

        {/* Winner Alert - Floating */}
        <AnimatePresence>
          {showWinnerAlert && latestWinner && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: -20 }}
              className="fixed top-4 right-4 z-50 p-4 bg-gradient-to-r from-pink-500/20 to-purple-500/20 border border-pink-500/30 rounded-lg shadow-2xl backdrop-blur-sm"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-full shadow-sm flex items-center justify-center"
                  style={{ backgroundColor: latestWinner.participant.color }}
                >
                  <ParticipantIcon
                    participantId={latestWinner.participant.id}
                    participantName={latestWinner.participant.name}
                    className="w-5 h-5 text-white"
                  />
                </div>
                <div>
                    <h4 className="text-xl font-bold text-pink-400">🎉 {latestWinner.participant.name} {t.wins}!</h4>
                    <p className="text-pink-200 font-semibold">{latestWinner.prize.name}</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 lg:gap-6">
          {/* Participants Column */}
          <div className="space-y-4">
            <h4 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
              <span className="text-pink-500">👥</span> {t.participants} ({participants.length})
            </h4>
            <div className="space-y-2 lg:space-y-3 max-h-64 lg:max-h-96 overflow-y-auto border border-zinc-700 rounded-lg p-2 lg:p-3 bg-zinc-800/30">
              {participants.map((participant) => (
                <motion.div
                  key={participant.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700"
                  style={{ borderLeft: `4px solid ${participant.color}` }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-6 h-6 rounded-full shadow-sm flex items-center justify-center"
                        style={{ backgroundColor: participant.color }}
                      >
                        <ParticipantIcon
                          participantId={participant.id}
                          participantName={participant.name}
                          className="w-4 h-4 text-white"
                        />
                      </div>
                      <span className="font-semibold text-zinc-100">{participant.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-pink-400 bg-pink-500/20 px-2 py-1 rounded-full">
                        {participant.tickets} tickets
                      </span>
                      <button
                        onClick={() => removeParticipant(participant)}
                        className="text-red-400 hover:text-red-300 text-xl"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                  {participant.up_address && (
                    <div className="mt-2 text-xs text-zinc-400 font-mono">
                      UP: {participant.up_address.slice(0, 20)}...
                    </div>
                  )}
                </motion.div>
              ))}
            </div>

            {/* Add Participant Form */}
            <div className="bg-zinc-800/30 p-4 rounded-lg border border-zinc-700">
              <div className="flex items-center justify-between mb-3">
                <h5 className="text-sm font-semibold text-zinc-300">{t.addNewParticipant}</h5>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowSavedUsers(true)}
                    className="px-2 py-1 bg-zinc-700 hover:bg-zinc-600 text-zinc-300 text-xs rounded transition-colors"
                  >
                    {t.fromSaved}
                  </button>
                  <button
                    onClick={() => setShowSaveUserDialog(true)}
                    className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded transition-colors"
                  >
                    {t.saveUser}
                  </button>
                </div>
              </div>
              <div className="space-y-3">
                <input
                  type="text"
                  value={newParticipantName}
                  onChange={(e) => setNewParticipantName(e.target.value)}
                  placeholder={t.enterName}
                  className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-md text-zinc-100 text-sm"
                />
                <input
                  type="number"
                  value={newParticipantTickets}
                  onChange={(e) => setNewParticipantTickets(e.target.value)}
                  placeholder={t.numberOfTickets}
                  min="1"
                  className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-md text-zinc-100 text-sm"
                />
                <input
                  type="text"
                  value={newParticipantUpAddress}
                  onChange={(e) => setNewParticipantUpAddress(e.target.value)}
                  placeholder={t.upAddressOptional}
                  className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-md text-zinc-100 text-sm"
                />
                {duplicateUpAddressError && (
                  <p className="text-xs text-red-400">{duplicateUpAddressError}</p>
                )}
                <button
                  onClick={addParticipant}
                  disabled={!!duplicateUpAddressError}
                  className="w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-semibold py-2 rounded-lg text-sm disabled:opacity-50"
                >
                  {t.addParticipant}
                </button>
                {newParticipantName.trim() && newParticipantUpAddress.trim() && (
                  <button
                    onClick={handleQuickSaveUser}
                    className="w-full bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg transition-colors py-2"
                    title={t.saveUserDescription}
                  >
                    💾 {t.saveUser}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Main Selection Area */}
          <div className="flex flex-col items-center justify-center order-2 xl:order-1">
            <div className="bg-gradient-to-br from-zinc-800/50 to-zinc-900/50 rounded-2xl p-8 border border-zinc-700 w-full text-center">
              <AnimatePresence mode="wait">
                {currentParticipant ? (
                  <motion.div
                    key={currentParticipant.id}
                    initial={{ opacity: 0, scale: 0.8, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8, y: -20 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div
                      className="w-24 h-24 rounded-full mx-auto mb-4 shadow-2xl border-4 border-zinc-600 flex items-center justify-center"
                      style={{
                        backgroundColor: currentParticipant.color,
                        boxShadow: `0 20px 40px ${currentParticipant.color}40`,
                      }}
                    >
                      <ParticipantIcon
                        participantId={currentParticipant.id}
                        participantName={currentParticipant.name}
                        className="w-12 h-12 text-white"
                      />
                    </div>
                    <h3 className="text-2xl font-bold text-zinc-100 mb-2">{currentParticipant.name}</h3>
                    <p className="text-lg text-pink-400 bg-pink-500/20 px-4 py-2 rounded-full">
                      {currentParticipant.tickets} tickets
                    </p>
                  </motion.div>
                ) : (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <div className="w-24 h-24 rounded-full mx-auto mb-4 bg-gradient-to-br from-pink-500/20 to-purple-500/20 flex items-center justify-center">
                      <span className="text-3xl">🎲</span>
                    </div>
                    <h3 className="text-xl font-bold text-zinc-400 mb-2">{t.readyToDraw}</h3>
                    <p className="text-zinc-500">{t.clickToSelect}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              <button
                onClick={selectWinner}
                disabled={!canSelectWinner}
                className="mt-4 lg:mt-6 px-4 lg:px-8 py-3 lg:py-4 text-base lg:text-lg font-bold bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 hover:from-pink-600 hover:via-rose-600 hover:to-purple-700 text-white rounded-xl shadow-2xl transform transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {selecting ? (
                  <span className="flex items-center gap-3">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    {t.selecting}
                  </span>
                ) : (
                  t.selectWinner
                )}
              </button>
            </div>
          </div>

          {/* Prizes and Winners Column */}
          <div className="space-y-4 lg:space-y-6 order-1 xl:order-2">
            {/* Prizes */}
            <div>
              <h4 className="text-lg font-bold text-zinc-100 flex items-center gap-2 mb-4">
                <span className="text-pink-500">🏆</span> {t.prizes} ({remainingPrizeCount})
              </h4>
              <div className="space-y-2 lg:space-y-3 max-h-40 lg:max-h-48 overflow-y-auto border border-zinc-700 rounded-lg p-2 lg:p-3 bg-zinc-800/30">
                {prizes.map((prize) => (
                  <motion.div
                    key={prize.id}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex justify-between items-center bg-zinc-800/50 p-3 rounded-lg border border-zinc-700"
                  >
                    <span className="font-semibold text-zinc-100">{prize.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-pink-400 bg-pink-500/20 px-3 py-1 rounded-full text-sm">
                        {prize.remaining}
                      </span>
                      <button
                        onClick={() => removePrize(prize)}
                        className="text-red-400 hover:text-red-300 text-xl"
                      >
                        ×
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Add Prize Form */}
              <div className="mt-4 bg-zinc-800/30 p-4 rounded-lg border border-zinc-700">
                <div className="flex items-center justify-between mb-3">
                  <h5 className="text-sm font-semibold text-zinc-300">{t.addNewPrize}</h5>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowSavedPrizes(true)}
                      className="px-2 py-1 bg-zinc-700 hover:bg-zinc-600 text-zinc-300 text-xs rounded transition-colors"
                    >
                      {t.fromSavedPrizes}
                    </button>
                    <button
                      onClick={() => setShowSavePrizeDialog(true)}
                      className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded transition-colors"
                    >
                      {t.savePrize}
                    </button>
                  </div>
                </div>
                <div className="space-y-3">
                  <input
                    type="text"
                    value={newPrizeName}
                    onChange={(e) => setNewPrizeName(e.target.value)}
                    placeholder={t.prizeName}
                    className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-md text-zinc-100 text-sm"
                  />
                  <input
                    type="number"
                    value={newPrizeCount}
                    onChange={(e) => setNewPrizeCount(e.target.value)}
                    placeholder={t.quantity}
                    min="1"
                    className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-md text-zinc-100 text-sm"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={addPrize}
                      className="flex-1 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-semibold py-2 rounded-lg text-sm"
                    >
                      {t.addPrize}
                    </button>
                    {newPrizeName.trim() && newPrizeCount.trim() && (
                      <button
                        onClick={handleQuickSavePrize}
                        className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg transition-colors"
                        title="Save this prize for quick access"
                      >
                        💾
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Winners */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
                  <span className="text-pink-500">🎉</span> {t.winners} ({winners.length})
                </h4>
                {winners.length > 0 && (
                  <div className="flex flex-col sm:flex-row gap-2">
                    <button
                      onClick={() => handleExportWinners('image')}
                      className="px-2 lg:px-3 py-1 bg-pink-600 hover:bg-pink-700 text-white text-xs rounded transition-colors"
                    >
                      {t.exportAsImage}
                    </button>
                    <button
                      onClick={() => handleExportWinners('json')}
                      className="px-2 lg:px-3 py-1 bg-zinc-600 hover:bg-zinc-700 text-white text-xs rounded transition-colors"
                    >
                      {t.exportAsJSON}
                    </button>
                  </div>
                )}
              </div>
              <div className="space-y-2 lg:space-y-3 max-h-40 lg:max-h-48 overflow-y-auto border border-zinc-700 rounded-lg p-2 lg:p-3 bg-zinc-800/30">
                {winners.length === 0 ? (
                  <div className="text-center text-zinc-500 py-8">
                    <span className="text-3xl mb-2 block">🏆</span>
                    <p className="text-sm">{t.winnersWillAppear}</p>
                  </div>
                ) : (
                  winners.map((win) => (
                    <motion.div
                      key={win.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-zinc-800/50 p-4 rounded-lg border-l-4"
                      style={{ borderLeftColor: win.participant_color }}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div
                          className="w-6 h-6 rounded-full shadow-sm flex items-center justify-center"
                          style={{ backgroundColor: win.participant_color }}
                        >
                          <ParticipantIcon
                            participantId={win.participant_id}
                            participantName={win.participant_name}
                            className="w-4 h-4 text-white"
                          />
                        </div>
                        <span className="font-semibold text-zinc-100">{win.participant_name}</span>
                      </div>
                      <span className="text-sm font-bold text-pink-400 bg-pink-500/20 px-2 py-1 rounded-full">
                        {win.prize_name}
                      </span>
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Saved Users Manager */}
      <SavedUsersManager
        isOpen={showSavedUsers}
        onSelectUser={handleSelectSavedUser}
        onClose={() => setShowSavedUsers(false)}
      />

      {/* Saved Prizes Manager */}
      <SavedPrizesManager
        isOpen={showSavedPrizes}
        onSelectPrize={handleSelectSavedPrize}
        onClose={() => setShowSavedPrizes(false)}
      />

      {/* Save User Dialog */}
      <AnimatePresence>
        {showSaveUserDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
            onClick={() => setShowSaveUserDialog(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 20 }}
              className="bg-zinc-900 rounded-2xl p-6 shadow-2xl max-w-md w-full mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-zinc-100 mb-2">{t.saveUser}</h3>
                <p className="text-sm text-zinc-400">{t.saveUserDescription}</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">{t.enterName}</label>
                  <input
                    type="text"
                    value={saveUserName}
                    onChange={(e) => setSaveUserName(e.target.value)}
                    placeholder={t.enterName}
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-600 rounded-md text-zinc-100 focus:border-pink-500 focus:ring-pink-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">{t.upAddress}</label>
                  <input
                    type="text"
                    value={saveUserUpAddress}
                    onChange={(e) => setSaveUserUpAddress(e.target.value)}
                    placeholder={t.upAddressOptional}
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-600 rounded-md text-zinc-100 focus:border-pink-500 focus:ring-pink-500"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleSaveUser}
                  disabled={!saveUserName.trim() || !saveUserUpAddress.trim()}
                  className="flex-1 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-semibold py-2 rounded-lg shadow-md disabled:opacity-50"
                >
                  {t.saveUser}
                </button>
                <button
                  onClick={() => setShowSaveUserDialog(false)}
                  className="px-6 py-2 border border-zinc-600 text-zinc-300 hover:bg-zinc-800 rounded-lg"
                >
                  {t.cancel}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Save Prize Dialog */}
      <AnimatePresence>
        {showSavePrizeDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
            onClick={() => setShowSavePrizeDialog(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 20 }}
              className="bg-zinc-900 rounded-2xl p-6 shadow-2xl max-w-md w-full mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-zinc-100 mb-2">{t.savePrize}</h3>
                <p className="text-sm text-zinc-400">Save this prize for quick access in future raffles</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">{t.prizeName}</label>
                  <input
                    type="text"
                    value={savePrizeName}
                    onChange={(e) => setSavePrizeName(e.target.value)}
                    placeholder={t.prizeName}
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-600 rounded-md text-zinc-100 focus:border-pink-500 focus:ring-pink-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">Description</label>
                  <input
                    type="text"
                    value={savePrizeDescription}
                    onChange={(e) => setSavePrizeDescription(e.target.value)}
                    placeholder="Prize description (optional)"
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-600 rounded-md text-zinc-100 focus:border-pink-500 focus:ring-pink-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">{t.quantity}</label>
                  <input
                    type="number"
                    value={savePrizeCount}
                    onChange={(e) => setSavePrizeCount(e.target.value)}
                    placeholder={t.quantity}
                    min="1"
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-600 rounded-md text-zinc-100 focus:border-pink-500 focus:ring-pink-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">Image URL</label>
                  <input
                    type="text"
                    value={savePrizeImage}
                    onChange={(e) => setSavePrizeImage(e.target.value)}
                    placeholder="Prize image URL (optional)"
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-600 rounded-md text-zinc-100 focus:border-pink-500 focus:ring-pink-500"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleSavePrize}
                  disabled={!savePrizeName.trim() || !savePrizeCount.trim()}
                  className="flex-1 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-semibold py-2 rounded-lg shadow-md disabled:opacity-50"
                >
                  {t.savePrize}
                </button>
                <button
                  onClick={() => setShowSavePrizeDialog(false)}
                  className="px-6 py-2 border border-zinc-600 text-zinc-300 hover:bg-zinc-800 rounded-lg"
                >
                  {t.cancel}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}

export default PunkableRaffleSystem
