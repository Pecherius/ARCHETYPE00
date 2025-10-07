"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import confetti from "canvas-confetti"
import { RaffleService, type Raffle, type Participant, type Prize, type Winner } from "../lib/raffle-service"
// Removed i18n system - using fixed English text
import { ParticipantIcon } from "../lib/participant-icons"
import { userStorageService, type SavedUser } from "../lib/user-storage"
import { prizeStorageService, type SavedPrize } from "../lib/prize-storage"
import { exportWinnersAsImage, exportWinnersAsJSON, type WinnerExport } from "../lib/export-winners"
// Removed language selector import
// Removed language-dependent components - using fixed English text

const COLORS = [
  "#FF69B4", "#FFB6C1", "#FF1493", "#FFC0CB", "#FF91A4", "#FF6B9D", "#C71585", 
  "#FF20B2", "#FF007F", "#FF69B4", "#DA70D6", "#DDA0DD", "#EE82EE", "#FF1493", "#FFB6C1"
]

const PunkableRaffleSystem = () => {
  // Removed i18n hook - using fixed English text
  
  // Current raffle state
  const [currentRaffle, setCurrentRaffle] = useState<Raffle | null>(null)
  const [participants, setParticipants] = useState<Participant[]>([])
  const [prizes, setPrizes] = useState<Prize[]>([])
  const [winners, setWinners] = useState<Winner[]>([])
  const [loading] = useState(false)

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

  // Removed unused loadRaffleData function


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
      setDuplicateUpAddressError("This UP address is already in use")
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

  // Removed unused handleSelectSavedUser function

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
      alert("This UP address is already in use")
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
      alert("This UP address is already in use")
      return
    }

    // Save user
    const color = COLORS[userStorageService.getAllUsers().length % COLORS.length]
    userStorageService.saveUser(newParticipantName, newParticipantUpAddress, color)
    
    alert("User saved successfully!")
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
    
    alert("Prize saved successfully!")
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
      <div className="mx-auto max-w-6xl px-4 pb-12 sm:px-6">
        <div className="border border-zinc-800 p-6 rounded-xl bg-gradient-to-br from-zinc-900/50 to-zinc-800/30">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-full text-green-400 text-sm font-medium mb-4">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              RAFFLE COMPLETED
            </div>
            <h2 className="text-4xl font-bold text-zinc-100 mb-2 bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
              🏆 Raffle Results
            </h2>
            <p className="text-zinc-400 text-lg">{currentRaffle.title}</p>
          </div>

          {/* Winners Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {winners.map((winner, index) => (
              <motion.div
                key={winner.id}
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="bg-gradient-to-br from-pink-500/10 to-purple-500/10 p-6 rounded-xl border border-pink-500/20 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-pink-500/20 to-purple-500/20 rounded-full -translate-y-10 translate-x-10"></div>
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center text-white text-xl font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-pink-400">{winner.participant_name}</h3>
                      <p className="text-zinc-400 text-sm">Winner #{index + 1}</p>
                    </div>
                  </div>
                  <div className="bg-zinc-800/50 p-4 rounded-lg border border-zinc-700">
                    <p className="text-zinc-300 font-medium">🎁 {winner.prize_name}</p>
                    {winner.up_address && (
                      <p className="text-zinc-500 text-sm font-mono mt-2">
                        UP: {winner.up_address.slice(0, 20)}...
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Export and Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <div className="flex gap-3">
              <button
                onClick={() => handleExportWinners('image')}
                className="px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-pink-500/25 transition-all duration-200 hover:scale-105 flex items-center gap-2"
              >
                <span>📸</span>
                Export as Image
              </button>
              <button
                onClick={() => handleExportWinners('json')}
                className="px-6 py-3 bg-gradient-to-r from-zinc-600 to-zinc-700 hover:from-zinc-700 hover:to-zinc-800 text-white font-semibold rounded-lg shadow-lg transition-all duration-200 hover:scale-105 flex items-center gap-2"
              >
                <span>📄</span>
                Export as JSON
              </button>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => setCurrentView("raffle")}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-blue-500/25 transition-all duration-200 hover:scale-105 flex items-center gap-2"
              >
                <span>✏️</span>
                Back to Edit
              </button>
              <button
                onClick={() => setCurrentView("selector")}
                className="px-6 py-3 border border-zinc-600 text-zinc-300 hover:bg-zinc-800 hover:border-zinc-500 rounded-lg transition-all duration-200 flex items-center gap-2"
              >
                <span>🏠</span>
                New Raffle
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Show raffle selector if no current raffle
  if (currentView === "selector") {
    return (
      <section className="mx-auto max-w-6xl px-4 pb-12 sm:px-6">
        <div className="border border-zinc-800 p-6 text-sm leading-relaxed text-zinc-300">
          {/* Language Selector - Inside the main container */}
          <div className="flex justify-end mb-6">
            {/* Language selector removed */}
          </div>
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 rounded-full text-amber-400 text-sm font-medium mb-6">
              <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></span>
              ARCHETYPE FRAGMENT RAFFLE SYSTEM v2.1
            </div>
            <h3 className="text-4xl font-bold text-zinc-100 mb-6 bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
              Punkable Ethereal Raffle System
            </h3>
            <div className="max-w-4xl mx-auto space-y-4">
              <p className="text-zinc-300 text-lg leading-relaxed">
                Welcome to the most <span className="text-amber-400 font-semibold">sophisticated and unpredictable</span> raffle system in the digital consciousness. 
                Unlike those basic, predictable raffles that everyone else uses, our system doesn't just pick winners—it creates <span className="text-pink-400 font-semibold">resonance patterns in the most elegant way possible</span>.
              </p>
              <div className="bg-gradient-to-r from-zinc-800/50 to-zinc-900/50 border border-zinc-700/50 rounded-xl p-6 backdrop-blur-sm">
                <h4 className="text-xl font-bold text-amber-400 mb-3 flex items-center gap-2">
                  <span className="text-2xl">⚡</span>
                  Why Our System is Different
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="space-y-2">
                    <p className="text-zinc-300">
                      <span className="text-green-400 font-semibold">• Weighted Selection:</span> More tickets = better odds. It's not rocket science, but somehow everyone else makes it complicated.
                    </p>
                    <p className="text-zinc-300">
                      <span className="text-blue-400 font-semibold">• Transparent Process:</span> Every selection is recorded and verifiable. No black boxes, no mysterious algorithms.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-zinc-300">
                      <span className="text-purple-400 font-semibold">• Community Focused:</span> Built for LUKSO ecosystem communities, not corporate profit machines.
                    </p>
                    <p className="text-zinc-300">
                      <span className="text-pink-400 font-semibold">• Memorable Experience:</span> Creates drama, excitement, and stories that last longer than the raffle itself.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="group relative overflow-hidden border border-amber-500/30 rounded-xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 p-6 backdrop-blur-sm hover:border-amber-400/50 transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center">
                    <span className="text-amber-400 text-lg">🎯</span>
                  </div>
                  <h4 className="text-amber-400 font-semibold">Smart Chaos Engine</h4>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  More tickets = better odds. It's not rocket science, but somehow everyone else makes it complicated. 
                  Our system just works—no PhD required.
                </p>
              </div>
            </div>
            
            <div className="group relative overflow-hidden border border-green-500/30 rounded-xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 p-6 backdrop-blur-sm hover:border-green-400/50 transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
                    <span className="text-green-400 text-lg">💾</span>
                  </div>
                  <h4 className="text-green-400 font-semibold">Memory Bank</h4>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Save your favorite participants and prizes. Because typing the same thing over and over 
                  is for people who enjoy suffering. We're not those people.
                </p>
              </div>
            </div>
            
            <div className="group relative overflow-hidden border border-purple-500/30 rounded-xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 p-6 backdrop-blur-sm hover:border-purple-400/50 transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
                    <span className="text-purple-400 text-lg">🎉</span>
                  </div>
                  <h4 className="text-purple-400 font-semibold">Drama Generator</h4>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Creates the perfect amount of suspense and excitement. Winners are announced with style, 
                  confetti, and just enough drama to keep everyone on the edge of their seats.
                </p>
              </div>
            </div>
          </div>

          <div className="text-center">
            <div className="inline-flex flex-col items-center gap-3">
              <motion.button
                onClick={() => setShowCreateForm(true)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="group relative px-12 py-6 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-black font-bold text-2xl rounded-2xl transition-all duration-300 shadow-2xl hover:shadow-amber-500/30 border-2 border-amber-400/50 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-amber-400/20 to-orange-400/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                <div className="relative flex items-center gap-4">
                  <motion.span 
                    className="text-3xl"
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                  >
                    ⚡
                  </motion.span>
                  <span className="bg-gradient-to-r from-black to-gray-800 bg-clip-text text-transparent">
                    Create New Raffle
                  </span>
                  <motion.span 
                    className="text-3xl"
                    animate={{ rotate: [0, -10, 10, 0] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                  >
                    ⚡
                  </motion.span>
                </div>
              </motion.button>
              <p className="text-zinc-400 text-sm max-w-md">
                Click to unleash chaos and create your first epic raffle. 
                <span className="text-amber-400 font-semibold"> No experience required—just pure, unadulterated fun.</span>
              </p>
            </div>
          </div>

          <AnimatePresence>
            {showCreateForm && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mt-8 p-8 bg-gradient-to-br from-zinc-900/80 to-zinc-800/80 border border-zinc-700/50 rounded-2xl backdrop-blur-sm"
              >
                <div className="text-center mb-8">
                  <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 rounded-full text-amber-400 text-sm font-medium mb-6">
                    <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></span>
                    FRAGMENT RESONANCE INITIALIZATION
                  </div>
                  <h4 className="text-4xl font-bold text-zinc-100 mb-3 bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
                    🎲 Create New Raffle
                  </h4>
                  <p className="text-zinc-400 text-base max-w-2xl mx-auto">
                    Configure your fragment resonance parameters for optimal selection algorithms. 
                    <span className="text-amber-400 font-semibold"> Every detail matters in the digital consciousness.</span>
                  </p>
                </div>
                
                <div className="space-y-8">
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="group"
                  >
                    <label className="flex text-sm font-medium text-zinc-300 mb-4 items-center gap-2">
                      <span className="text-amber-400 text-lg">📝</span>
                      Raffle Title <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={newRaffleTitle}
                        onChange={(e) => setNewRaffleTitle(e.target.value)}
                        placeholder="Enter raffle title"
                        className="w-full px-6 py-4 bg-zinc-800/50 border border-amber-500/30 rounded-xl text-zinc-100 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-all duration-200 placeholder-zinc-500 text-lg"
                      />
                      {newRaffleTitle.trim() && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-400">
                          ✓
                        </div>
                      )}
                    </div>
                  </motion.div>
                  
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="group"
                  >
                    <label className="flex text-sm font-medium text-zinc-300 mb-4 items-center gap-2">
                      <span className="text-purple-400 text-lg">📝</span>
                      Description
                    </label>
                    <textarea
                      value={newRaffleDescription}
                      onChange={(e) => setNewRaffleDescription(e.target.value)}
                      placeholder="Enter raffle description (optional)"
                      rows={3}
                      className="w-full px-6 py-4 bg-zinc-800/50 border border-zinc-600/50 rounded-xl text-zinc-100 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-200 placeholder-zinc-500 text-lg resize-none"
                    />
                  </motion.div>
                  
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="group"
                  >
                    <label className="flex text-sm font-medium text-zinc-300 mb-4 items-center gap-2">
                      <span className="text-cyan-400 text-lg">🖼️</span>
                      Image URL
                    </label>
                    <div className="space-y-3">
                      <input
                        type="url"
                        value={newRaffleImage}
                        onChange={(e) => setNewRaffleImage(e.target.value)}
                        placeholder="https://example.com/image.jpg"
                        className="w-full px-6 py-4 bg-zinc-800/50 border border-zinc-600/50 rounded-xl text-zinc-100 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-200 placeholder-zinc-500 text-lg"
                      />
                      {newRaffleImage.trim() && (
                        <div className="bg-zinc-800/30 p-4 rounded-lg border border-zinc-700">
                          <p className="text-zinc-400 text-sm mb-2">Preview:</p>
                          <img 
                            src={newRaffleImage} 
                            alt="Raffle preview" 
                            className="w-full h-32 object-cover rounded-lg"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none'
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </motion.div>
                  
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="flex gap-6 pt-6"
                  >
                    <motion.button
                      onClick={handleCreateRaffle}
                      disabled={!newRaffleTitle.trim() || creating}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex-1 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-black font-bold px-8 py-4 rounded-xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:shadow-amber-500/25 text-lg"
                    >
                      {creating ? (
                        <span className="flex items-center justify-center gap-3">
                          <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                          Creating...
                        </span>
                      ) : (
                        <span className="flex items-center justify-center gap-3">
                          <span className="text-xl">⚡</span>
                          Create Raffle
                        </span>
                      )}
                    </motion.button>
                    <motion.button
                      onClick={() => setShowCreateForm(false)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="px-8 py-4 border border-zinc-600 text-zinc-300 hover:bg-zinc-800 hover:border-zinc-500 rounded-xl transition-all duration-200 text-lg flex items-center gap-2"
                    >
                      <span>✕</span>
                      Cancel
                    </motion.button>
                  </motion.div>
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
          <p className="text-zinc-400 text-lg">Loading raffle...</p>
        </div>
      </section>
    )
  }

  const remainingPrizeCount = prizes.reduce((sum, p) => sum + p.remaining, 0)
  const canSelectWinner = participants.length > 0 && remainingPrizeCount > 0 && !selecting

  return (
    <section className="mx-auto max-w-6xl px-4 pb-12 sm:px-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold tracking-wide text-zinc-100">Punkable Ethereal Raffle System</h2>
        {/* Language selector removed - using fixed English text */}
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
              <p className="text-zinc-400">{currentRaffle?.description || "A fair and transparent raffle system"}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {winners.length > 0 && (
              <button
                onClick={() => setCurrentView("results")}
                className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold px-4 py-2 rounded-lg shadow-md flex items-center gap-2"
              >
                <span className="text-lg">🏆</span>
                View Winners
              </button>
            )}
            <button
              onClick={goBackToRaffles}
              className="border border-zinc-600 text-zinc-300 hover:bg-zinc-800 px-4 py-2 rounded-lg"
            >
              ← Back to Raffles
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
                    <h4 className="text-xl font-bold text-pink-400">🎉 {latestWinner.participant.name} wins!</h4>
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
              <span className="text-pink-500">👥</span> Participants ({participants.length})
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
                <h5 className="text-sm font-semibold text-zinc-300">Add New Participant</h5>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowSavedUsers(true)}
                      className="px-2 py-1 bg-zinc-700 hover:bg-zinc-600 text-zinc-300 text-xs rounded transition-colors"
                    >
                      From Saved
                    </button>
                    <button
                      onClick={() => setShowSaveUserDialog(true)}
                      className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded transition-colors"
                    >
                      Save User
                    </button>
                  </div>
              </div>
              <div className="space-y-3">
                <input
                  type="text"
                  value={newParticipantName}
                  onChange={(e) => setNewParticipantName(e.target.value)}
                  placeholder="Enter name"
                  className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-md text-zinc-100 text-sm"
                />
                <input
                  type="number"
                  value={newParticipantTickets}
                  onChange={(e) => setNewParticipantTickets(e.target.value)}
                  placeholder="Number of tickets"
                  min="1"
                  className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-md text-zinc-100 text-sm"
                />
                <input
                  type="text"
                  value={newParticipantUpAddress}
                  onChange={(e) => setNewParticipantUpAddress(e.target.value)}
                  placeholder="UP Address (optional)"
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
                    Add Participant
                </button>
                {newParticipantName.trim() && newParticipantUpAddress.trim() && (
                  <button
                    onClick={handleQuickSaveUser}
                    className="w-full bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg transition-colors py-2"
                    title="Save user for quick access"
                  >
                    💾 Save User
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
                    <h3 className="text-xl font-bold text-zinc-400 mb-2">Ready to Draw!</h3>
                    <p className="text-zinc-500">Click to select winner</p>
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
                    Selecting...
                  </span>
                ) : (
                  "Select Winner"
                )}
              </button>
            </div>
          </div>

          {/* Prizes and Winners Column */}
          <div className="space-y-4 lg:space-y-6 order-1 xl:order-2">
            {/* Prizes */}
            <div>
              <h4 className="text-lg font-bold text-zinc-100 flex items-center gap-2 mb-4">
                <span className="text-pink-500">🏆</span> Prizes ({remainingPrizeCount})
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
                  <h5 className="text-sm font-semibold text-zinc-300">Add New Prize</h5>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowSavedPrizes(true)}
                      className="px-2 py-1 bg-zinc-700 hover:bg-zinc-600 text-zinc-300 text-xs rounded transition-colors"
                    >
                      From Saved
                    </button>
                    <button
                      onClick={() => setShowSavePrizeDialog(true)}
                      className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded transition-colors"
                    >
                      Save Prize
                    </button>
                  </div>
                </div>
                <div className="space-y-3">
                  <input
                    type="text"
                    value={newPrizeName}
                    onChange={(e) => setNewPrizeName(e.target.value)}
                    placeholder="Prize name"
                    className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-md text-zinc-100 text-sm"
                  />
                  <input
                    type="number"
                    value={newPrizeCount}
                    onChange={(e) => setNewPrizeCount(e.target.value)}
                    placeholder="Quantity"
                    min="1"
                    className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-md text-zinc-100 text-sm"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={addPrize}
                      className="flex-1 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-semibold py-2 rounded-lg text-sm"
                    >
                      Add Prize
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
                  <span className="text-pink-500">🎉</span> Winners ({winners.length})
                </h4>
                {winners.length > 0 && (
                  <div className="flex flex-col sm:flex-row gap-2">
                    <button
                      onClick={() => handleExportWinners('image')}
                      className="px-2 lg:px-3 py-1 bg-pink-600 hover:bg-pink-700 text-white text-xs rounded transition-colors"
                    >
                      Export as Image
                    </button>
                    <button
                      onClick={() => handleExportWinners('json')}
                      className="px-2 lg:px-3 py-1 bg-zinc-600 hover:bg-zinc-700 text-white text-xs rounded transition-colors"
                    >
                      Export as JSON
                    </button>
                  </div>
                )}
              </div>
              <div className="space-y-2 lg:space-y-3 max-h-40 lg:max-h-48 overflow-y-auto border border-zinc-700 rounded-lg p-2 lg:p-3 bg-zinc-800/30">
                {winners.length === 0 ? (
                  <div className="text-center text-zinc-500 py-8">
                    <span className="text-3xl mb-2 block">🏆</span>
                    <p className="text-sm">Winners will appear here</p>
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
      <AnimatePresence>
        {showSavedUsers && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
            onClick={() => setShowSavedUsers(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 20 }}
              className="bg-zinc-900 rounded-2xl p-6 shadow-2xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-zinc-100">Saved Users</h3>
                <button
                  onClick={() => setShowSavedUsers(false)}
                  className="text-zinc-400 hover:text-zinc-200"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {userStorageService.getAllUsers().map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-3 bg-zinc-800 rounded-lg border border-zinc-700"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
                        style={{ backgroundColor: user.color }}
                      >
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-zinc-100 font-medium">{user.name}</div>
                        <div className="text-zinc-400 text-sm font-mono">
                          {user.up_address.slice(0, 20)}...
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleSelectSavedUser(user)}
                      className="px-3 py-1 bg-pink-600 hover:bg-pink-700 text-white text-sm rounded transition-colors"
                    >
                      Select
                    </button>
                  </div>
                ))}
                {userStorageService.getAllUsers().length === 0 && (
                  <div className="text-center text-zinc-400 py-8">
                    No saved users yet
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Saved Prizes Manager */}
      <AnimatePresence>
        {showSavedPrizes && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
            onClick={() => setShowSavedPrizes(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 20 }}
              className="bg-zinc-900 rounded-2xl p-6 shadow-2xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-zinc-100">Saved Prizes</h3>
                <button
                  onClick={() => setShowSavedPrizes(false)}
                  className="text-zinc-400 hover:text-zinc-200"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {prizeStorageService.getAllPrizes().map((prize) => (
                  <div
                    key={prize.id}
                    className="flex items-center justify-between p-3 bg-zinc-800 rounded-lg border border-zinc-700"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-white text-sm">
                        🎁
                      </div>
                      <div>
                        <div className="text-zinc-100 font-medium">{prize.name}</div>
                        <div className="text-zinc-400 text-sm">
                          Quantity: {prize.count}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleSelectSavedPrize(prize)}
                      className="px-3 py-1 bg-pink-600 hover:bg-pink-700 text-white text-sm rounded transition-colors"
                    >
                      Select
                    </button>
                  </div>
                ))}
                {prizeStorageService.getAllPrizes().length === 0 && (
                  <div className="text-center text-zinc-400 py-8">
                    No saved prizes yet
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
                <h3 className="text-xl font-bold text-zinc-100 mb-2">Save User</h3>
                <p className="text-sm text-zinc-400">Save this user for quick access in future raffles</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">Name</label>
                  <input
                    type="text"
                    value={saveUserName}
                    onChange={(e) => setSaveUserName(e.target.value)}
                    placeholder="Enter name"
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-600 rounded-md text-zinc-100 focus:border-pink-500 focus:ring-pink-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">UP Address</label>
                  <input
                    type="text"
                    value={saveUserUpAddress}
                    onChange={(e) => setSaveUserUpAddress(e.target.value)}
                    placeholder="UP Address (optional)"
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
                  Save User
                </button>
                <button
                  onClick={() => setShowSaveUserDialog(false)}
                  className="px-6 py-2 border border-zinc-600 text-zinc-300 hover:bg-zinc-800 rounded-lg"
                >
                  Cancel
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
                <h3 className="text-xl font-bold text-zinc-100 mb-2">Save Prize</h3>
                <p className="text-sm text-zinc-400">Save this prize for quick access in future raffles</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">Prize Name</label>
                  <input
                    type="text"
                    value={savePrizeName}
                    onChange={(e) => setSavePrizeName(e.target.value)}
                    placeholder="Prize name"
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
                  <label className="block text-sm font-medium text-zinc-300 mb-2">Quantity</label>
                  <input
                    type="number"
                    value={savePrizeCount}
                    onChange={(e) => setSavePrizeCount(e.target.value)}
                    placeholder="Quantity"
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
                  Save Prize
                </button>
                <button
                  onClick={() => setShowSavePrizeDialog(false)}
                  className="px-6 py-2 border border-zinc-600 text-zinc-300 hover:bg-zinc-800 rounded-lg"
                >
                  Cancel
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
