"use client"

import { useState, useEffect, useRef, useCallback, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import confetti from "canvas-confetti"
import { RaffleService, type Raffle, type Participant, type Prize, type Winner } from "../lib/raffle-service"
// Removed i18n system - using fixed English text
import { ParticipantIcon } from "../lib/participant-icons"
import { userStorageService, type SavedUser } from "../lib/user-storage"
import { prizeStorageService, type SavedPrize } from "../lib/prize-storage"
import { exportWinnersAsImage, exportWinnersAsJSON, type WinnerExport } from "../lib/export-winners"
import SavedUsersManager from "./SavedUsersManager"
import SavedPrizesManager from "./SavedPrizesManager"
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
  const [showRaffleHistory, setShowRaffleHistory] = useState(false)
  const [newRaffleTitle, setNewRaffleTitle] = useState("")
  const [newRaffleDescription, setNewRaffleDescription] = useState("")
  const [newRaffleImage, setNewRaffleImage] = useState("")
  const [creating, setCreating] = useState(false)
  const [savedRaffles, setSavedRaffles] = useState<Raffle[]>([])

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

  const totalTickets = useMemo(
    () => participants.reduce((sum, participant) => sum + participant.tickets, 0),
    [participants],
  )

  const weightedParticipantPool = useMemo(() => {
    if (participants.length === 0) return []

    return participants.flatMap((participant) =>
      Array.from({ length: Math.max(participant.tickets, 0) }, () => participant),
    )
  }, [participants])

  const availablePrizes = useMemo(
    () => prizes.filter((prize) => prize.remaining > 0),
    [prizes],
  )

  const remainingPrizeCount = useMemo(
    () => prizes.reduce((sum, prize) => sum + prize.remaining, 0),
    [prizes],
  )

  const groupedWinnerSummaries = useMemo(() => {
    if (winners.length === 0) {
      return [] as Array<{
        key: string
        participant: Participant | undefined
        participantName: string
        participantColor: string
        upAddress: string
        prizeList: Array<{ name: string; count: number; wonAt: string }>
        ticketCount: number
        totalPrizes: number
      }>
    }

    const groups = winners.reduce(
      (acc, winner) => {
        const key = `${winner.participant_id}-${winner.up_address ?? "no-up"}`

        if (!acc.has(key)) {
          acc.set(key, {
            key,
            participantId: winner.participant_id,
            participantName: winner.participant_name,
            upAddress: winner.up_address ?? "",
            prizes: new Map<string, { name: string; count: number; wonAt: string }>(),
          })
        }

        const entry = acc.get(key)!
        const existingPrize = entry.prizes.get(winner.prize_name)

        if (existingPrize) {
          entry.prizes.set(winner.prize_name, {
            ...existingPrize,
            count: existingPrize.count + 1,
            wonAt: winner.won_at,
          })
        } else {
          entry.prizes.set(winner.prize_name, {
            name: winner.prize_name,
            count: 1,
            wonAt: winner.won_at,
          })
        }

        return acc
      },
      new Map<
        string,
        {
          key: string
          participantId: string
          participantName: string
          upAddress: string
          prizes: Map<string, { name: string; count: number; wonAt: string }>
        }
      >(),
    )

    return Array.from(groups.values())
      .map((entry) => {
        const participant = participants.find((p) => p.id === entry.participantId)
        const prizeList = Array.from(entry.prizes.values()).sort(
          (a, b) => b.count - a.count || a.name.localeCompare(b.name),
        )
        const ticketCount = participant?.tickets ?? 0
        const totalPrizesWon = prizeList.reduce((sum, prize) => sum + prize.count, 0)

        return {
          key: entry.key,
          participant,
          participantName: entry.participantName,
          participantColor: participant?.color ?? "#8B5CF6",
          upAddress: entry.upAddress,
          prizeList,
          ticketCount,
          totalPrizes: totalPrizesWon,
        }
      })
      .sort((a, b) => b.totalPrizes - a.totalPrizes || b.ticketCount - a.ticketCount)
  }, [participants, winners])

  const raffleStats = useMemo(
    () => [
      { label: "PARTICIPANTS", value: participants.length },
      { label: "PRIZES", value: prizes.length },
      { label: "WINNERS", value: winners.length },
      { label: "REMAINING", value: remainingPrizeCount },
    ],
    [participants.length, prizes.length, winners.length, remainingPrizeCount],
  )

  const handleCreateRaffle = async () => {
    if (!newRaffleTitle.trim()) return

    console.log("Creating raffle with title:", newRaffleTitle.trim())
    setCreating(true)
    
    try {
    const raffle = await RaffleService.createRaffle(
      newRaffleTitle.trim(),
      newRaffleDescription.trim() || undefined,
      newRaffleImage.trim() || undefined,
    )

      console.log("Raffle created:", raffle)

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
      // Save to history
      saveRaffleToHistory(raffle)
        console.log("Raffle state updated successfully")
      } else {
        console.error("Failed to create raffle - raffle is null")
    }
    } catch (error) {
      console.error("Error in handleCreateRaffle:", error)
    } finally {
    setCreating(false)
    }
  }

  // Check for duplicate UP addresses
  const checkDuplicateUpAddress = async (upAddress: string) => {
    if (!upAddress.trim() || !currentRaffle) return false
    return await RaffleService.checkDuplicateUpAddress(currentRaffle.id, upAddress)
  }

  const getRandomWeightedParticipant = useCallback(() => {
    if (participants.length === 0 || totalTickets === 0) return null
    let random = Math.random() * totalTickets

    for (const participant of participants) {
      random -= participant.tickets
      if (random <= 0) {
        return participant
      }
    }

    return participants[participants.length - 1] ?? null
  }, [participants, totalTickets])

  const getRandomPrize = useCallback(() => {
    if (availablePrizes.length === 0) return null
    const randomIndex = Math.floor(Math.random() * availablePrizes.length)
    return availablePrizes[randomIndex]
  }, [availablePrizes])

  const selectWinner = useCallback(async () => {
    if (selecting || participants.length === 0 || !currentRaffle) return

    const prize = getRandomPrize()
    if (!prize) return

    setSelecting(true)
    const selectedWinner = getRandomWeightedParticipant()
    if (!selectedWinner) {
      setSelecting(false)
      return
    }

    let shuffleCount = 0
    const totalShuffles = 12 // Reduced from 15 for better performance

    const shuffle = () => {
      if (shuffleCount < totalShuffles) {
        const pool = weightedParticipantPool.length > 0 ? weightedParticipantPool : participants

        if (pool.length === 0) {
          setSelecting(false)
          return
        }

        const randomIndex = Math.floor(Math.random() * pool.length)
        setCurrentParticipant(pool[randomIndex])

        shuffleCount++
        shuffleRef.current = setTimeout(shuffle, 40 + shuffleCount * 8) // Faster animation
      } else {
        setCurrentParticipant(selectedWinner)
        setLatestWinner({ participant: selectedWinner, prize })
        setShowWinnerAlert(true)

        // Optimized confetti - reduced particle count for better performance
        confetti({
          particleCount: 100, // Reduced from 150
          spread: 70, // Reduced from 80
          origin: { y: 0.6 },
          colors: ["#FF69B4", "#FFB6C1", "#FF1493", "#FFC0CB", "#FF91A4"],
        })

        if (winnerAlertTimeoutRef.current) {
          clearTimeout(winnerAlertTimeoutRef.current)
        }
        winnerAlertTimeoutRef.current = setTimeout(() => {
          setShowWinnerAlert(false)
        }, 3000)

        // Batch state updates for better performance
        const updatePrize = () => {
        RaffleService.updatePrizeRemaining(prize.id, Math.max(0, prize.remaining - 1))
        setPrizes((prev) =>
          prev.map((p) => (p.id === prize.id ? { ...p, remaining: Math.max(0, p.remaining - 1) } : p)),
        )
        }

        const addWinner = () => {
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
        }

        // Execute updates
        updatePrize()
        addWinner()
        setSelecting(false)
      }
    }

    shuffle()
  }, [
    selecting,
    participants,
    currentRaffle,
    getRandomPrize,
    getRandomWeightedParticipant,
    weightedParticipantPool,
  ])

  const addParticipant = async () => {
    if (
      !newParticipantName.trim() ||
      !newParticipantTickets ||
      Number.parseInt(newParticipantTickets) <= 0 ||
      !currentRaffle
    )
      return

    // Check for duplicate UP address in current raffle
    if (newParticipantUpAddress.trim() && (await checkDuplicateUpAddress(newParticipantUpAddress))) {
      setDuplicateUpAddressError("This UP address is already in use in this raffle")
      return
    }

    // Check if user exists in database
    let existingUser = null;
    if (newParticipantUpAddress.trim()) {
      existingUser = userStorageService.getUserByUpAddress(newParticipantUpAddress);
    } else {
      existingUser = userStorageService.getUserByName(newParticipantName.trim());
    }

    if (existingUser) {
      const confirmAdd = confirm(
        `User "${existingUser.name}" already exists in your database.\n\n` +
        `Do you want to add them to this raffle with ${newParticipantTickets} tickets?`
      );
      
      if (!confirmAdd) return;
      
      // Use existing user data
      const participantData = {
        name: existingUser.name,
        tickets: Number.parseInt(newParticipantTickets),
        color: existingUser.color,
        up_address: existingUser.up_address,
      };

      const participant = await RaffleService.addParticipant(currentRaffle.id, participantData);
      if (participant) {
        setParticipants((prev) => [...prev, participant]);
        userStorageService.updateUserUsage(existingUser.id);
        setNewParticipantName("");
        setNewParticipantTickets("");
        setNewParticipantUpAddress("");
        setDuplicateUpAddressError("");
      }
      return;
    }

    // Add new participant
    const participantData = {
      name: newParticipantName.trim(),
      tickets: Number.parseInt(newParticipantTickets),
      color: COLORS[participants.length % COLORS.length],
      up_address: newParticipantUpAddress.trim() || undefined,
    }

    const participant = await RaffleService.addParticipant(currentRaffle.id, participantData)
    if (participant) {
      setParticipants((prev) => [...prev, participant])
      
      // Update saved user usage if exists, or save new user
      if (newParticipantUpAddress.trim()) {
        const savedUser = userStorageService.getUserByUpAddress(newParticipantUpAddress)
        if (savedUser) {
          userStorageService.updateUserUsage(savedUser.id)
        } else {
          // Auto-save new user with UP address
          const color = COLORS[userStorageService.getAllUsers().length % COLORS.length]
          userStorageService.saveUser(newParticipantName, newParticipantUpAddress, color)
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

    // Check if prize exists in database
    const existingPrize = prizeStorageService.getAllPrizes().find(p => 
      p.name.toLowerCase() === newPrizeName.trim().toLowerCase()
    );

    if (existingPrize) {
      const confirmAdd = confirm(
        `Prize "${existingPrize.name}" already exists in your database.\n\n` +
        `Do you want to add it to this raffle with ${newPrizeCount} count?`
      );
      
      if (!confirmAdd) return;
      
      // Use existing prize data
      const prizeData = {
        name: existingPrize.name,
        count: Number.parseInt(newPrizeCount),
      };

      const prize = await RaffleService.addPrize(currentRaffle.id, prizeData);
      if (prize) {
        setPrizes((prev) => [...prev, prize]);
        prizeStorageService.updatePrizeUsage(existingPrize.id);
        setNewPrizeName("");
        setNewPrizeCount("");
      }
      return;
    }

    // Add new prize
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
    const savedUser = userStorageService.saveUser(newParticipantName, newParticipantUpAddress, color)
    
    console.log('User saved successfully:', savedUser)
    alert("User saved successfully!")
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
    if (!newPrizeName.trim()) return

    // Save prize as template (with count 1, not the actual count from form)
    const savedPrize = prizeStorageService.savePrize(newPrizeName, "", 1, "")
    
    console.log('Prize saved successfully as template:', savedPrize)
    alert("Prize saved as template! You can reuse it in future raffles.")
  }

  // Handle export winners - Simplified approach
  const handleExportWinners = (format: 'image' | 'json') => {
    if (!currentRaffle || groupedWinnerSummaries.length === 0) return

    const exportWinners = groupedWinnerSummaries.map((summary) => ({
      participantName: summary.participantName,
      participantUpAddress: summary.upAddress,
      prizeName: summary.prizeList
        .map((prize) => `${prize.name}${prize.count > 1 ? ` x${prize.count}` : ''}`)
        .join(', '),
      prizeDescription: '',
      prizeImage: '',
      selectedAt: new Date().toLocaleString(),
      totalTickets: summary.ticketCount,
      prizeCount: summary.totalPrizes,
    }))

    const winnerData: WinnerExport = {
      raffleName: currentRaffle.title,
      raffleDescription: currentRaffle.description || '',
      raffleImage: currentRaffle.image_url || '',
      winners: exportWinners,
      exportDate: new Date().toLocaleString(),
      totalWinners: exportWinners.length
    }

    if (format === 'image') {
      exportWinnersAsImage(winnerData)
    } else {
      exportWinnersAsJSON(winnerData)
    }
  }

  // Load saved raffles from localStorage
  const loadSavedRaffles = () => {
    try {
      const saved = localStorage.getItem('savedRaffles')
      if (saved) {
        setSavedRaffles(JSON.parse(saved))
      }
    } catch (error) {
      console.error('Error loading saved raffles:', error)
    }
  }

  // Save raffle to localStorage with complete data
  const saveRaffleToHistory = (raffle: Raffle) => {
    try {
      const completeRaffleData = {
        ...raffle,
        participants: participants,
        prizes: prizes,
        winners: winners,
        saved_at: new Date().toISOString(),
        participant_count: participants.length,
        prize_count: prizes.length,
        winner_count: winners.length
      }
      
      const updated = [...savedRaffles, completeRaffleData]
      setSavedRaffles(updated)
      localStorage.setItem('savedRaffles', JSON.stringify(updated))
      console.log('Raffle saved to history:', completeRaffleData)
    } catch (error) {
      console.error('Error saving raffle:', error)
    }
  }

  // Load a saved raffle
  const loadSavedRaffle = (raffle: any) => {
    setCurrentRaffle(raffle)
    
    // Restore all data if available
    if (raffle.participants) {
      setParticipants(raffle.participants)
    }
    if (raffle.prizes) {
      setPrizes(raffle.prizes)
    }
    if (raffle.winners) {
      setWinners(raffle.winners)
    }
    
    setCurrentView("raffle")
    setShowRaffleHistory(false)
    console.log('Raffle loaded from history:', raffle)
  }

  // Load raffle data on component mount
  useEffect(() => {
    loadSavedRaffles()
  }, [])

  // Clear duplicate UP address error when UP address changes
  useEffect(() => {
    if (duplicateUpAddressError) {
      setDuplicateUpAddressError("")
    }
  }, [newParticipantUpAddress])

  // Update raffle history when participants, prizes, or winners change - optimized with debouncing
  const updateRaffleHistory = useCallback(() => {
    if (!currentRaffle) return
    
      const updatedRaffle = {
        ...currentRaffle,
        participants,
        prizes,
        winners,
        saved_at: new Date().toISOString(),
        participant_count: participants.length,
        prize_count: prizes.length,
        winner_count: winners.length
      }
      
    setSavedRaffles(prev => {
      const updatedHistory = prev.map(raffle => 
        raffle.id === currentRaffle.id ? updatedRaffle : raffle
      )
      
      if (updatedHistory.length > 0) {
        localStorage.setItem('savedRaffles', JSON.stringify(updatedHistory))
        return updatedHistory
      } else {
        const newHistory = [...prev, updatedRaffle]
        localStorage.setItem('savedRaffles', JSON.stringify(newHistory))
        return newHistory
      }
    })
  }, [currentRaffle, participants, prizes, winners])

  // Debounced effect to prevent excessive updates
  useEffect(() => {
    const timeoutId = setTimeout(updateRaffleHistory, 500) // 500ms debounce
    return () => clearTimeout(timeoutId)
  }, [updateRaffleHistory])

  // Handle selecting saved user
  const handleSelectSavedUser = (user: SavedUser) => {
    setNewParticipantName(user.name)
    setNewParticipantUpAddress(user.up_address)
    setShowSavedUsers(false)
    userStorageService.updateUserUsage(user.id)
  }

  // Handle selecting saved prize
  const handleSelectSavedPrize = (prize: SavedPrize) => {
    setNewPrizeName(prize.name)
    setNewPrizeCount(prize.count.toString())
    setShowSavedPrizes(false)
    prizeStorageService.updatePrizeUsage(prize.id)
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
      <div className="mx-auto max-w-6xl px-4 pb-8 sm:px-6">
        <div className="relative overflow-hidden border border-zinc-800/60 p-4 rounded-2xl bg-gradient-to-br from-zinc-950/90 to-zinc-900/70 shadow-[0_0_45px_rgba(34,197,94,0.12)]">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(34,197,94,0.12),transparent_65%)]"></div>
          <div className="relative">
          {/* Header */}
          <div className="text-center mb-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-full text-green-400 text-xs font-medium mb-2">
              <span className="w-1 h-1 bg-green-500 rounded-full animate-pulse"></span>
              RAFFLE COMPLETED
            </div>
            <h2 className="text-lg font-bold text-zinc-100 mb-1 font-mono">
              🏆 RAFFLE_RESULTS
            </h2>
            <p className="text-zinc-400 text-xs font-mono">{currentRaffle.title}</p>
          </div>

          {/* Winners Grid - Grouped by Participant */}
          <div data-section="winners" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
            {groupedWinnerSummaries.map((group, index) => {
              const { prizeList, ticketCount, totalPrizes, participantColor, participantName, upAddress } = group

              const getEmoji = () => {
                if (ticketCount >= 20) return "🐋"
                if (ticketCount >= 10) return "💎"
                if (ticketCount >= 5) return "⭐"
                return "🎫"
              }

              const getColorClass = () => {
                if (ticketCount >= 20) return "from-purple-500/10 to-pink-500/10 border-purple-500/20"
                if (ticketCount >= 10) return "from-yellow-500/10 to-orange-500/10 border-yellow-500/20"
                if (ticketCount >= 5) return "from-blue-500/10 to-cyan-500/10 border-blue-500/20"
                return "from-pink-500/10 to-purple-500/10 border-pink-500/20"
              }

              const getCardHeight = () => {
                const baseHeight = 120
                const prizeHeight = 40
                const maxHeight = 300
                return Math.min(baseHeight + prizeList.length * prizeHeight, maxHeight)
              }

              return (
                <motion.div
                  key={group.key}
                  initial={{ opacity: 0, y: 20, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  className={`bg-gradient-to-br ${getColorClass()} p-3 rounded-lg border relative overflow-hidden`}
                  style={{ minHeight: `${getCardHeight()}px` }}
                >
                  <div className="absolute top-0 right-0 w-12 h-12 bg-gradient-to-br from-pink-500/20 to-purple-500/20 rounded-full -translate-y-6 translate-x-6"></div>
                  <div className="relative z-10 h-full flex flex-col">
                    <div className="flex items-center gap-2 mb-2">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
                        style={{ backgroundColor: participantColor }}
                      >
                        {getEmoji()}
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-pink-400 font-mono">{participantName}</h3>
                        <p className="text-zinc-400 text-xs font-mono">
                          {totalPrizes} prize{totalPrizes > 1 ? "s" : ""} • {ticketCount} tickets
                        </p>
                      </div>
                    </div>
                    <div className="space-y-1 flex-1">
                      {prizeList.map((prize, prizeIndex) => (
                        <div key={`${group.key}-${prize.name}-${prizeIndex}`} className="bg-zinc-800/50 p-2 rounded border border-zinc-700">
                          <p className="text-zinc-300 text-xs font-medium">
                            🎁 {prize.name}
                            {prize.count > 1 && (
                              <span className="ml-1 px-1.5 py-0.5 bg-pink-500/20 text-pink-400 text-xs rounded-full">
                                x{prize.count}
                              </span>
                            )}
                          </p>
                          <p className="text-zinc-500 text-xs font-mono">
                            Won: {new Date(prize.wonAt).toLocaleString()}
                          </p>
                        </div>
                      ))}
                      {upAddress && (
                        <p className="text-zinc-500 text-xs font-mono mt-1">
                          UP: {upAddress.slice(0, 20)}{upAddress.length > 20 ? "..." : ""}
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>

          {/* Export and Actions */}
          <div className="flex flex-col sm:flex-row gap-2 justify-center items-center">
            <div className="flex gap-2">
              <button
                onClick={() => handleExportWinners('image')}
                className="group relative overflow-hidden border-2 border-pink-500 bg-gradient-to-r from-pink-900/30 to-rose-900/30 px-4 py-2 text-pink-400 hover:from-pink-800/40 hover:to-rose-800/40 transition-all duration-300 hover:scale-105 font-mono font-bold text-xs rounded-lg"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-pink-500/10 to-rose-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative flex items-center gap-1">
                <span>📸</span>
                  <span>EXPORT_IMAGE</span>
                </div>
              </button>
              <button
                onClick={() => handleExportWinners('json')}
                className="group relative overflow-hidden border-2 border-zinc-500 bg-gradient-to-r from-zinc-900/30 to-zinc-800/30 px-4 py-2 text-zinc-400 hover:from-zinc-800/40 hover:to-zinc-700/40 transition-all duration-300 hover:scale-105 font-mono font-bold text-xs rounded-lg"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-zinc-500/10 to-zinc-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative flex items-center gap-1">
                <span>📄</span>
                  <span>EXPORT_JSON</span>
                </div>
              </button>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentView("raffle")}
                className="group relative overflow-hidden border-2 border-blue-500 bg-gradient-to-r from-blue-900/30 to-cyan-900/30 px-4 py-2 text-blue-400 hover:from-blue-800/40 hover:to-cyan-800/40 transition-all duration-300 hover:scale-105 font-mono font-bold text-xs rounded-lg"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative flex items-center gap-1">
                <span>✏️</span>
                  <span>BACK_TO_EDIT</span>
                </div>
              </button>
              <button
                onClick={() => setCurrentView("selector")}
                className="group relative overflow-hidden border-2 border-zinc-500 bg-gradient-to-r from-zinc-900/30 to-zinc-800/30 px-4 py-2 text-zinc-400 hover:from-zinc-800/40 hover:to-zinc-700/40 transition-all duration-300 hover:scale-105 font-mono font-bold text-xs rounded-lg"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-zinc-500/10 to-zinc-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative flex items-center gap-1">
                <span>🏠</span>
                  <span>NEW_RAFFLE</span>
                </div>
              </button>
            </div>
          </div>
          </div>
        </div>
      </div>
    )
  }

  // Show raffle selector if no current raffle
  if (currentView === "selector") {
    return (
      <section className="mx-auto max-w-6xl px-4 pb-8 sm:px-6">
        <div className="relative overflow-hidden border border-zinc-800/60 p-6 text-sm leading-relaxed text-zinc-300 rounded-2xl bg-gradient-to-br from-zinc-950/90 to-zinc-900/70 shadow-[0_0_45px_rgba(236,72,153,0.08)]">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(236,72,153,0.12),transparent_60%)]"></div>
          <div className="relative space-y-6">
          {/* Language Selector - Inside the main container */}
          <div className="flex justify-end mb-6">
            {/* Language selector removed */}
          </div>
          <div className="text-center mb-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-pink-500/20 to-purple-500/20 border border-pink-500/30 rounded-full text-pink-400 text-xs font-medium mb-2">
              <span className="w-1 h-1 bg-pink-500 rounded-full animate-pulse"></span>
              PUNKABLE_ETHEREAL_RAFFLE_SYSTEM v2.1
            </div>
            <h3 className="text-lg font-bold text-zinc-100 mb-1 font-mono text-center">
              <span className="text-red-500">P.E.R.S.</span>
            </h3>
            <p className="text-xs text-zinc-400 font-mono mb-2">Punkable Ethereal Raffle System</p>
            <div className="max-w-6xl mx-auto space-y-2">
              <p className="text-zinc-300 text-sm leading-relaxed px-2 md:px-0">
                A transparent raffle system that uses <span className="text-green-400 font-semibold">weighted selection</span> based on participant data. 
                Unlike simple random generators, P.E.R.S. considers <span className="text-pink-400 font-semibold">ticket counts and participation history</span> to ensure fair distribution.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {/* Left side - HOW PERS WORKS */}
                <div className="bg-gradient-to-r from-zinc-800/50 to-zinc-900/50 border border-zinc-700/50 rounded-lg p-3 backdrop-blur-sm">
                  <h4 className="text-xs font-bold text-pink-400 mb-1 flex items-center gap-1 font-mono">
                    <span className="text-xs">⚡</span>
                    HOW_P.E.R.S._WORKS
                  </h4>
                  <div className="space-y-2 text-xs">
                    <p className="text-zinc-300">
                      <span className="text-green-400 font-semibold">• Weighted Selection:</span> More tickets = higher chance to win. Each participant's probability is calculated based on their ticket count.
                    </p>
                    <p className="text-zinc-300">
                      <span className="text-blue-400 font-semibold">• Transparent Process:</span> All selections are logged and verifiable. You can see exactly how winners are chosen.
                    </p>
                    <p className="text-zinc-300">
                      <span className="text-purple-400 font-semibold">• Fair Distribution:</span> Designed for community raffles. No hidden algorithms or unfair advantages.
                    </p>
                    <p className="text-zinc-300">
                      <span className="text-pink-400 font-semibold">• Easy to Use:</span> Create raffles, add participants with tickets, and let P.E.R.S. select winners fairly.
                    </p>
                  </div>
                </div>

                {/* Right side - 3 feature cards stacked */}
                <div className="space-y-2 flex flex-col h-full">
                  {/* WEIGHTED_SELECTION */}
                  <div className="group relative overflow-hidden border border-pink-500/30 rounded-lg bg-gradient-to-br from-pink-500/10 to-purple-500/10 p-2 backdrop-blur-sm hover:border-pink-400/50 transition-all duration-300 flex-1 flex flex-col justify-center">
                    <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative">
                      <div className="flex items-center gap-1 mb-1">
                        <div className="w-4 h-4 rounded bg-pink-500/20 flex items-center justify-center">
                          <span className="text-pink-400 text-xs">⚡</span>
                        </div>
                        <h4 className="text-pink-400 font-semibold text-xs">WEIGHTED_SELECTION</h4>
                      </div>
                      <p className="text-xs text-zinc-400 leading-tight">
                        More tickets = higher probability of winning.
                      </p>
                    </div>
                  </div>
                  
                  {/* DATA_STORAGE */}
                  <div className="group relative overflow-hidden border border-green-500/30 rounded-lg bg-gradient-to-br from-green-500/10 to-emerald-500/10 p-2 backdrop-blur-sm hover:border-green-400/50 transition-all duration-300">
                    <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative">
                      <div className="flex items-center gap-1 mb-1">
                        <div className="w-4 h-4 rounded bg-green-500/20 flex items-center justify-center">
                          <span className="text-green-400 text-xs">💾</span>
                        </div>
                        <h4 className="text-green-400 font-semibold text-xs">DATA_STORAGE</h4>
                      </div>
                      <p className="text-xs text-zinc-400 leading-tight">
                        <span className="text-yellow-400 font-semibold">⚠️</span> Stored locally only. Export as backup!
                      </p>
                    </div>
                  </div>
                  
                  {/* FAIR_SELECTION */}
                  <div className="group relative overflow-hidden border border-purple-500/30 rounded-lg bg-gradient-to-br from-purple-500/10 to-pink-500/10 p-2 backdrop-blur-sm hover:border-purple-400/50 transition-all duration-300">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative">
                      <div className="flex items-center gap-1 mb-1">
                        <div className="w-4 h-4 rounded bg-purple-500/20 flex items-center justify-center">
                          <span className="text-purple-400 text-xs">🎉</span>
                        </div>
                        <h4 className="text-purple-400 font-semibold text-xs">FAIR_SELECTION</h4>
                      </div>
                      <p className="text-xs text-zinc-400 leading-tight">
                        Transparent algorithms for community raffles.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center">
            <div className="inline-flex flex-col items-center gap-3">
              <div className={`flex gap-2 w-full ${savedRaffles.length === 0 ? 'max-w-md justify-center' : 'max-w-md md:max-w-none'}`}>
                <motion.button
                  onClick={() => setShowCreateForm(true)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="group relative overflow-hidden border-2 border-pink-500 bg-gradient-to-r from-pink-900/30 to-purple-900/30 px-4 py-2 text-pink-400 hover:from-pink-800/40 hover:to-purple-800/40 transition-all duration-300 hover:scale-105 font-mono font-bold text-xs rounded-lg flex-1"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-pink-400/20 to-purple-400/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative flex items-center justify-center gap-2">
                    <span>⚡</span>
                    <span className="hidden md:inline">INITIALIZE_RAFFLE</span>
                    <span className="md:hidden">CREATE</span>
                  </div>
                </motion.button>
                
                {savedRaffles.length > 0 && (
                  <motion.button
                    onClick={() => setShowRaffleHistory(true)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="group relative overflow-hidden border-2 border-green-500 bg-gradient-to-r from-green-900/30 to-emerald-900/30 px-4 py-2 text-green-400 hover:from-green-800/40 hover:to-emerald-800/40 transition-all duration-300 hover:scale-105 font-mono font-bold text-xs rounded-lg flex-1"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-green-400/20 to-emerald-400/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative flex items-center justify-center gap-2">
                      <span>📁</span>
                      <span className="hidden md:inline">RAFFLE_HISTORY</span>
                      <span className="md:hidden">HISTORY</span>
                    </div>
                  </motion.button>
                )}
              </div>
              <p className="text-zinc-400 text-xs max-w-md px-2 md:px-0">
                Create your first raffle with P.E.R.S. 
                <span className="text-pink-400 font-semibold"> Simple, fair, and transparent.</span>
              </p>
            </div>
          </div>

          <AnimatePresence>
            {showCreateForm && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
                onClick={() => setShowCreateForm(false)}
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.8, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8, y: 20 }}
                  className="bg-zinc-900 border border-zinc-700 rounded-lg shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Terminal Header */}
                  <div className="bg-zinc-800 border-b border-zinc-700 px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      </div>
                      <span className="text-zinc-300 text-sm font-mono">ARCHETYPE_00 // FRAGMENT_RAFFLE_INIT</span>
                    </div>
                    <button
                      onClick={() => setShowCreateForm(false)}
                      className="text-zinc-400 hover:text-zinc-200 transition-colors"
                    >
                      <span className="text-lg">✕</span>
                    </button>
                  </div>
                  
                  {/* Terminal Content */}
                  <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
                    <div className="text-center mb-6">
                      <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-500/20 to-purple-500/20 border border-pink-500/30 rounded-full text-pink-400 text-sm font-medium mb-4">
                        <span className="w-2 h-2 bg-pink-500 rounded-full animate-pulse"></span>
                        FRAGMENT_RESONANCE_INITIALIZATION
                      </div>
                      <h4 className="text-2xl font-bold text-zinc-100 mb-2 font-mono">
                        ⚡ INITIALIZE_RAFFLE
                      </h4>
                      <p className="text-zinc-400 text-sm max-w-xl mx-auto">
                        Configure fragment resonance parameters for optimal selection algorithms. 
                        <span className="text-pink-400 font-semibold"> Every detail matters in the digital consciousness.</span>
                      </p>
                    </div>
                
                <div className="space-y-6">
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="group"
                  >
                    <label className="flex text-sm font-medium text-zinc-300 mb-3 items-center gap-2">
                      <span className="text-pink-400 text-lg">📝</span>
                      Raffle Title <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={newRaffleTitle}
                        onChange={(e) => setNewRaffleTitle(e.target.value)}
                        placeholder="Enter raffle title"
                        className="w-full px-4 py-3 bg-zinc-800/50 border border-pink-500/30 rounded-lg text-zinc-100 focus:border-pink-400 focus:ring-2 focus:ring-pink-400/20 transition-all duration-200 placeholder-zinc-500"
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
                    <label className="flex text-sm font-medium text-zinc-300 mb-3 items-center gap-2">
                      <span className="text-purple-400 text-lg">📝</span>
                      Description
                    </label>
                    <textarea
                      value={newRaffleDescription}
                      onChange={(e) => setNewRaffleDescription(e.target.value)}
                      placeholder="Enter raffle description (optional)"
                      rows={2}
                      className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-600/50 rounded-lg text-zinc-100 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-200 placeholder-zinc-500 resize-none"
                    />
                  </motion.div>
                  
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="group"
                  >
                    <label className="flex text-sm font-medium text-zinc-300 mb-3 items-center gap-2">
                      <span className="text-cyan-400 text-lg">🖼️</span>
                      Image URL
                    </label>
                    <div className="space-y-2">
                      <input
                        type="url"
                        value={newRaffleImage}
                        onChange={(e) => setNewRaffleImage(e.target.value)}
                        placeholder="https://example.com/image.jpg"
                        className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-600/50 rounded-lg text-zinc-100 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-200 placeholder-zinc-500"
                      />
                      {newRaffleImage.trim() && (
                        <div className="bg-zinc-800/30 p-3 rounded-lg border border-zinc-700">
                          <p className="text-zinc-400 text-xs mb-2">Preview:</p>
                          <img 
                            src={newRaffleImage} 
                            alt="Raffle preview" 
                            className="w-full h-24 object-cover rounded-lg"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none'
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </motion.div>
                  
                  {/* LocalStorage Warning */}
                  <motion.div
                    initial={{ opacity: 0, y: 0 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="mb-4 p-3 bg-yellow-900/20 border border-yellow-500/30 rounded-lg"
                  >
                    <div className="flex items-start gap-2">
                      <span className="text-yellow-400 text-sm">⚠️</span>
                      <div className="text-xs text-yellow-300">
                        <p className="font-semibold mb-1">ATTENTION:</p>
                        <p>Your raffles are saved in your browser's localStorage. If you clear cookies or use a different browser, your data will be lost.</p>
                        <p className="mt-1 text-yellow-400">Consider exporting your raffles as backup!</p>
                      </div>
                    </div>
                  </motion.div>
                  
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="flex gap-4 pt-4"
                  >
                    <motion.button
                      onClick={handleCreateRaffle}
                      disabled={!newRaffleTitle.trim() || creating}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold px-6 py-3 rounded-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:shadow-pink-500/25"
                    >
                      {creating ? (
                        <span className="flex items-center justify-center gap-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Creating...
                        </span>
                      ) : (
                        <span className="flex items-center justify-center gap-2">
                          <span>⚡</span>
                          Initialize Raffle
                        </span>
                      )}
                    </motion.button>
                    <motion.button
                      onClick={() => setShowCreateForm(false)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="px-6 py-3 border border-zinc-600 text-zinc-300 hover:bg-zinc-800 hover:border-zinc-500 rounded-lg transition-all duration-200 flex items-center gap-2"
                    >
                      <span>✕</span>
                      Cancel
                    </motion.button>
                  </motion.div>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Raffle History Popup */}
          <AnimatePresence>
            {showRaffleHistory && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
                onClick={() => setShowRaffleHistory(false)}
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.8, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8, y: 20 }}
                  className="bg-zinc-900 border border-zinc-700 rounded-lg shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Terminal Header */}
                  <div className="bg-zinc-800 border-b border-zinc-700 px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      </div>
                      <span className="text-zinc-300 text-sm font-mono">ARCHETYPE_00 // RAFFLE_HISTORY</span>
                    </div>
                    <button
                      onClick={() => setShowRaffleHistory(false)}
                      className="text-zinc-400 hover:text-zinc-200 transition-colors"
                    >
                      <span className="text-lg">✕</span>
                    </button>
                  </div>
                  
                  {/* Terminal Content */}
                  <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
                    <div className="text-center mb-6">
                      <h3 className="text-2xl font-bold text-zinc-100 mb-2 font-mono">
                        📁 RAFFLE_HISTORY
                      </h3>
                      <p className="text-zinc-400 text-sm">
                        Select a previous raffle to load its configuration
                      </p>
                    </div>
                    
                    {savedRaffles.length === 0 ? (
                      <div className="text-center py-12">
                        <div className="text-6xl mb-4">📁</div>
                        <h4 className="text-lg font-semibold text-zinc-300 mb-2 font-mono">NO_RAFFLES_FOUND</h4>
                        <p className="text-zinc-400">Create your first raffle to see it here</p>
                      </div>
                    ) : (
                      <div className="grid gap-4">
                        {savedRaffles.map((raffle, index) => (
                          <motion.div
                            key={raffle.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="group border border-zinc-700 rounded-lg p-4 hover:border-green-500/50 transition-all duration-200 cursor-pointer"
                            onClick={() => loadSavedRaffle(raffle)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <h4 className="text-lg font-semibold text-zinc-100 group-hover:text-green-400 transition-colors">
                                  {raffle.title}
                                </h4>
                                {raffle.description && (
                                  <p className="text-zinc-400 text-sm mt-1 line-clamp-2">
                                    {raffle.description}
                                  </p>
                                )}
                                <div className="flex items-center gap-4 mt-2 text-xs text-zinc-500">
                                  <span>ID: {raffle.id}</span>
                                  <span>Created: {new Date(raffle.created_at).toLocaleDateString()}</span>
                                </div>
                              </div>
                              <div className="text-green-400 group-hover:scale-110 transition-transform">
                                <span className="text-2xl">→</span>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
          </div>
        </div>
      </section>
    )
  }

  if (loading) {
    return (
      <section className="mx-auto max-w-6xl px-4 pb-8 sm:px-6">
        <div className="border border-zinc-800 p-6 text-center">
          <div className="w-16 h-16 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-zinc-400 text-lg">Loading raffle...</p>
        </div>
      </section>
    )
  }

  const canSelectWinner = participants.length > 0 && remainingPrizeCount > 0 && !selecting;

  return (
    <section className="mx-auto max-w-6xl px-4 pb-8 sm:px-6">
      <div className="flex flex-col md:flex-row items-center justify-between mb-2 gap-2">
        <div className="text-center md:text-left">
          <h2 className="text-sm font-bold text-zinc-100 font-mono">P.E.R.S.</h2>
          <div className="text-xs text-zinc-400 font-mono">Punkable Ethereal Raffle System</div>
      </div>
        <div className="text-xs text-zinc-500 font-mono">v2.1</div>
      </div>
      <div className="relative overflow-hidden border border-zinc-800/60 p-4 md:p-6 text-xs leading-relaxed text-zinc-300 rounded-2xl bg-gradient-to-br from-zinc-950/95 to-zinc-900/70 shadow-[0_0_45px_rgba(236,72,153,0.1)]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(236,72,153,0.14),transparent_55%)]"></div>
        <div className="relative space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
          <button
            onClick={goBackToRaffles}
            className="group relative overflow-hidden border-2 border-zinc-500 bg-gradient-to-r from-zinc-900/30 to-zinc-800/30 px-3 py-1.5 text-zinc-400 hover:from-zinc-800/40 hover:to-zinc-700/40 transition-all duration-300 hover:scale-105 font-mono font-bold text-xs rounded-lg"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-zinc-500/10 to-zinc-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative flex items-center gap-1">
              <span>←</span>
              <span>Back to Raffles</span>
            </div>
          </button>
          
          <div className="flex items-center gap-2">
            {currentRaffle?.image_url ? (
              <div className="w-8 h-8 rounded-lg overflow-hidden shadow-lg">
                <img
                  src={currentRaffle.image_url || "/placeholder.svg"}
                  alt="Raffle"
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-pink-500/20 to-purple-500/20 flex items-center justify-center">
                <span className="text-lg">🎲</span>
              </div>
            )}
            <div>
              <h3 className="text-sm font-bold text-zinc-100 font-mono">
                {currentRaffle?.title}
              </h3>
              <p className="text-xs text-zinc-400">{currentRaffle?.description || "A fair and transparent raffle system"}</p>
            </div>
          </div>
          
          <div className="w-24"></div> {/* Spacer for balance */}
        </div>

        {/* Raffle Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {raffleStats.map((stat) => (
            <div
              key={stat.label}
              className="relative overflow-hidden border border-zinc-700/60 rounded-lg bg-zinc-900/60 px-3 py-2"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-zinc-700/10 to-transparent"></div>
              <div className="relative flex flex-col">
                <span className="text-[10px] text-zinc-500 font-mono tracking-wide">{stat.label}</span>
                <span className="text-sm text-zinc-100 font-mono">{stat.value}</span>
              </div>
            </div>
          ))}
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
                    <h4 className="text-lg font-bold text-pink-400 font-mono">🎉 {latestWinner.participant.name} WINS!</h4>
                    <p className="text-pink-200 font-semibold">{latestWinner.prize.name}</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content Grid - 3 Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
          {/* Left Column - Participants */}
          <div className="lg:col-span-3 space-y-2 flex flex-col">
            <h4 className="text-sm font-bold text-zinc-100 flex items-center gap-2 font-mono">
              <span className="text-blue-500">👥</span> Participants ({participants.length})
            </h4>
            <div className="space-y-1 h-40 overflow-y-auto border border-blue-700/50 rounded-lg p-2 bg-blue-900/20 scrollbar-thin scrollbar-thumb-blue-600 scrollbar-track-zinc-800">
              {participants.map((participant) => (
                <motion.div
                  key={participant.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`rounded p-2 border ${
                    participant.tickets >= 20 
                      ? 'bg-gradient-to-r from-purple-900/30 to-pink-900/30 border-purple-500/50' 
                      : participant.tickets >= 10 
                        ? 'bg-gradient-to-r from-yellow-900/30 to-orange-900/30 border-yellow-500/50'
                        : participant.tickets >= 5
                          ? 'bg-gradient-to-r from-blue-900/30 to-cyan-900/30 border-blue-500/50'
                          : 'bg-blue-800/50 border-blue-700'
                  }`}
                  style={{ borderLeft: `4px solid ${participant.color}` }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <div
                        className="w-5 h-5 rounded-full shadow-sm flex items-center justify-center"
                        style={{ backgroundColor: participant.color }}
                      >
                        {participant.tickets >= 20 ? (
                          <span className="text-xs">🐋</span>
                        ) : participant.tickets >= 10 ? (
                          <span className="text-xs">💎</span>
                        ) : participant.tickets >= 5 ? (
                          <span className="text-xs">⭐</span>
                        ) : (
                        <ParticipantIcon
                          participantId={participant.id}
                          participantName={participant.name}
                            className="w-3 h-3 text-white"
                        />
                        )}
                      </div>
                      <span className="font-semibold text-zinc-100 text-xs">{participant.name}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          min="1"
                          value={participant.tickets}
                          onChange={(e) => {
                            const newTickets = Math.max(1, parseInt(e.target.value) || 1);
                            setParticipants(prev => 
                              prev.map(p => 
                                p.id === participant.id 
                                  ? { ...p, tickets: newTickets }
                                  : p
                              )
                            );
                          }}
                          className="w-12 px-2 py-1 text-xs bg-zinc-700 border border-zinc-600 rounded text-zinc-100 focus:border-blue-500 focus:outline-none"
                        />
                        <span className="text-xs text-zinc-400">tickets</span>
                      </div>
                      {participant.up_address && !userStorageService.getUserByUpAddress(participant.up_address) && (
                        <button
                          onClick={() => {
                            const color = COLORS[userStorageService.getAllUsers().length % COLORS.length];
                            const savedUser = userStorageService.saveUser(participant.name, participant.up_address || "", color);
                            console.log('Participant saved to database:', savedUser);
                            alert('Participant saved to database!');
                          }}
                          className="text-green-400 hover:text-green-300 text-sm px-2 py-1 border border-green-400 rounded"
                          title="Save to database"
                        >
                          💾
                        </button>
                      )}
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
            <div className="bg-zinc-800/30 p-3 rounded border border-zinc-700 flex-1 flex flex-col">
              <div className="flex items-center justify-between mb-3">
                <h5 className="text-sm font-semibold text-zinc-300 font-mono">Add New Participant</h5>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowSavedUsers(true)}
                      className="px-2 py-1 bg-zinc-700 hover:bg-zinc-600 text-zinc-300 text-xs rounded transition-colors"
                    >
                      From Saved
                    </button>
                    <button
                      onClick={() => {
                        setSaveUserName(newParticipantName)
                        setSaveUserUpAddress(newParticipantUpAddress)
                        setShowSaveUserDialog(true)
                      }}
                      className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded transition-colors"
                    >
                      Save User
                    </button>
                  </div>
              </div>
              <div className="space-y-2 flex-1">
                <input
                  type="text"
                  value={newParticipantName}
                  onChange={(e) => setNewParticipantName(e.target.value)}
                  placeholder="Enter name"
                  className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded text-zinc-100 text-sm"
                />
                <input
                  type="number"
                  value={newParticipantTickets}
                  onChange={(e) => setNewParticipantTickets(e.target.value)}
                  placeholder="Number of tickets"
                  min="1"
                  className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded text-zinc-100 text-sm"
                />
                <input
                  type="text"
                  value={newParticipantUpAddress}
                  onChange={(e) => setNewParticipantUpAddress(e.target.value)}
                  placeholder="UP Address (optional)"
                  className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded text-zinc-100 text-sm"
                />
                {duplicateUpAddressError && (
                  <p className="text-xs text-red-400">{duplicateUpAddressError}</p>
                )}
                <button
                  onClick={addParticipant}
                  disabled={!!duplicateUpAddressError || !newParticipantName.trim() || !newParticipantTickets.trim() || Number.parseInt(newParticipantTickets) <= 0}
                  className="w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-semibold py-2 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed"
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

          {/* Center Column - Ready to Draw */}
          <div className="lg:col-span-6 flex flex-col justify-center">
            <div className="bg-gradient-to-br from-zinc-800/50 to-zinc-900/50 rounded-lg p-6 border border-zinc-700 h-full flex flex-col justify-center">
              <div className="text-center">
                <h4 className="text-lg font-bold text-zinc-100 mb-4 font-mono">READY_TO_DRAW</h4>
                <div data-section="results" className="flex flex-col items-center justify-center min-h-[200px]">
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
                          className="w-20 h-20 rounded-full mx-auto mb-3 shadow-2xl border-4 border-zinc-600 flex items-center justify-center"
                          style={{
                            backgroundColor: currentParticipant.color,
                            boxShadow: `0 20px 40px ${currentParticipant.color}40`,
                          }}
                        >
                          <ParticipantIcon
                            participantId={currentParticipant.id}
                            participantName={currentParticipant.name}
                            className="w-10 h-10 text-white"
                          />
                        </div>
                        <h3 className="text-xl font-bold text-zinc-100 mb-2 font-mono">{currentParticipant.name}</h3>
                        <p className="text-sm text-pink-400 bg-pink-500/20 px-4 py-2 rounded-full font-mono">
                          {currentParticipant.tickets} tickets
                        </p>
                      </motion.div>
                    ) : (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <div className="w-20 h-20 rounded-full mx-auto mb-3 bg-gradient-to-br from-pink-500/20 to-purple-500/20 flex items-center justify-center">
                          <span className="text-3xl">🎲</span>
                        </div>
                        <h3 className="text-xl font-bold text-zinc-400 mb-2 font-mono">SELECT_WINNER</h3>
                        <p className="text-sm text-zinc-500 font-mono">Click to select winner</p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <button
                    onClick={selectWinner}
                    disabled={!canSelectWinner}
                    className="group relative overflow-hidden border-2 border-pink-500 bg-gradient-to-r from-pink-900/30 to-purple-900/30 px-6 py-3 text-pink-400 hover:from-pink-800/40 hover:to-purple-800/40 transition-all duration-300 hover:scale-105 font-mono font-bold text-sm rounded-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none mt-4"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-pink-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative flex items-center justify-center gap-2">
                      {selecting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-pink-400 border-t-transparent rounded-full animate-spin" />
                          <span>SELECTING...</span>
                        </>
                      ) : (
                        <>
                          <span>🎲</span>
                          <span>SELECT_WINNER</span>
                        </>
                      )}
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>


          {/* Right Column - Prizes */}
          <div className="lg:col-span-3 space-y-2 flex flex-col">
            <h4 className="text-sm font-bold text-zinc-100 flex items-center gap-2 font-mono">
              <span className="text-pink-500">🏆</span> Prizes ({remainingPrizeCount})
            </h4>
            <div className="space-y-1 h-40 overflow-y-auto border border-yellow-700 rounded-lg p-2 bg-gradient-to-br from-yellow-900/20 to-amber-900/20 scrollbar-thin scrollbar-thumb-yellow-600 scrollbar-track-zinc-800">
                {prizes.map((prize) => (
                  <motion.div
                    key={prize.id}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex justify-between items-center bg-zinc-800/50 p-2 rounded border border-zinc-700"
                  >
                    <span className="font-semibold text-zinc-100 text-xs">{prize.name}</span>
                    <div className="flex items-center gap-1">
                      {/* Editable quantity field */}
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          value={prize.remaining}
                          onChange={(e) => {
                            const newCount = Math.max(0, parseInt(e.target.value) || 0);
                            setPrizes(prev => prev.map(p => 
                              p.id === prize.id ? { ...p, remaining: newCount } : p
                            ));
                          }}
                          className="w-12 px-1 py-0.5 bg-zinc-700 border border-zinc-600 rounded text-pink-400 text-center text-xs font-bold focus:border-pink-400 focus:ring-1 focus:ring-pink-400"
                          min="0"
                          title="Click to edit remaining quantity"
                        />
                        <span className="text-xs text-zinc-400">left</span>
                      </div>
                      
                      {/* Save button - only show if not already saved */}
                      {!prizeStorageService.getAllPrizes().find(p => p.name.toLowerCase() === prize.name.toLowerCase()) && (
                        <button
                          onClick={() => {
                            const savedPrize = prizeStorageService.savePrize(prize.name, "", 1, ""); // Save with count 1 as template
                            console.log('Prize saved to database:', savedPrize);
                            alert('Prize saved to database!');
                          }}
                          className="text-green-400 hover:text-green-300 text-sm px-2 py-1 border border-green-400 rounded"
                          title="Save to database"
                        >
                          💾
                        </button>
                      )}
                      
                      {/* Remove button */}
                      <button
                        onClick={() => removePrize(prize)}
                        className="text-red-400 hover:text-red-300 text-xl"
                        title="Remove prize"
                      >
                        ×
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Add Prize Form */}
              <div className="bg-gradient-to-br from-yellow-900/30 to-amber-900/30 p-3 rounded-lg border border-yellow-700 flex-1 flex flex-col">
                <div className="flex items-center justify-between mb-3">
                  <h5 className="text-sm font-semibold text-zinc-300 font-mono">Add New Prize</h5>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowSavedPrizes(true)}
                      className="px-2 py-1 bg-zinc-700 hover:bg-zinc-600 text-zinc-300 text-xs rounded transition-colors"
                    >
                      From Saved
                    </button>
                    <button
                      onClick={() => {
                        setSavePrizeName(newPrizeName)
                        setSavePrizeCount(newPrizeCount)
                        setShowSavePrizeDialog(true)
                      }}
                      className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded transition-colors"
                    >
                      Save Prize
                    </button>
                  </div>
                </div>
                <div className="space-y-3 flex-1">
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
                      disabled={!newPrizeName.trim() || !newPrizeCount.trim() || Number.parseInt(newPrizeCount) <= 0}
                      className="flex-1 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-semibold py-2 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed"
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
          </div>
        </div>

      {/* Winners Section - Full Width - Updated */}
      <div className="mt-4">
        <div className="bg-gradient-to-br from-zinc-800/50 to-zinc-900/50 rounded-lg p-4 border border-zinc-700">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-bold text-zinc-100 flex items-center gap-2 font-mono">
              <span className="text-pink-500">🎉</span> Winners ({winners.length})
            </h4>
            {winners.length > 0 && (
              <button
                onClick={() => setCurrentView("results")}
                className="group relative overflow-hidden border-2 border-green-500 bg-gradient-to-r from-green-900/30 to-emerald-900/30 px-3 py-2 text-green-400 hover:from-green-800/40 hover:to-emerald-800/40 transition-all duration-300 hover:scale-105 font-mono font-bold text-sm rounded-lg animate-pulse"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative flex items-center gap-2">
                  <span>🏆</span>
                  <span>VIEW RESULTS</span>
                </div>
              </button>
            )}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 h-32 overflow-y-auto border border-zinc-700 rounded-lg p-2 bg-zinc-800/30 scrollbar-thin scrollbar-thumb-zinc-600 scrollbar-track-zinc-800">
            {winners.length === 0 ? (
              <div className="col-span-full text-center text-zinc-500 py-4">
                <span className="text-2xl mb-2 block">🎉</span>
                <p className="text-sm font-mono">No winners yet</p>
              </div>
            ) : (
              winners.map((win) => (
                <motion.div
                  key={win.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-zinc-800/50 p-1.5 rounded border-l-2 flex flex-col items-center text-center"
                  style={{ borderLeftColor: win.participant_color }}
                >
                  <div
                    className="w-4 h-4 rounded-full shadow-sm flex items-center justify-center mb-1"
                    style={{ backgroundColor: win.participant_color }}
                  >
                    <ParticipantIcon
                      participantId={win.participant_id}
                      participantName={win.participant_name}
                      className="w-2 h-2 text-white"
                    />
                  </div>
                  <span className="font-semibold text-zinc-100 text-xs truncate w-full">{win.participant_name}</span>
                  <span className="text-xs font-bold text-pink-400 bg-pink-500/20 px-1 py-0.5 rounded-full mt-1">
                    {win.prize_name}
                  </span>
                </motion.div>
              ))
            )}
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
                <h3 className="text-xl font-bold text-zinc-100 font-mono">SAVED_USERS</h3>
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
                <h3 className="text-xl font-bold text-zinc-100 font-mono">SAVED_PRIZES</h3>
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
                <h3 className="text-xl font-bold text-zinc-100 mb-2 font-mono">SAVE_USER</h3>
                <p className="text-sm text-zinc-400 font-mono">Save this user for quick access in future raffles</p>
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
                <h3 className="text-xl font-bold text-zinc-100 mb-2 font-mono">SAVE_PRIZE</h3>
                <p className="text-sm text-zinc-400 font-mono">Save this prize for quick access in future raffles</p>
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

      {/* Saved Users Manager */}
      <SavedUsersManager
        onSelectUser={handleSelectSavedUser}
        onClose={() => setShowSavedUsers(false)}
        isOpen={showSavedUsers}
      />

      {/* Saved Prizes Manager */}
      <SavedPrizesManager
        onSelectPrize={handleSelectSavedPrize}
        onClose={() => setShowSavedPrizes(false)}
        isOpen={showSavedPrizes}
      />

      {/* LocalStorage Warning - Full Width */}
      <div className="mt-6 p-3 bg-yellow-900/20 border border-yellow-500/30 rounded-lg">
        <div className="flex items-start gap-2">
          <span className="text-yellow-400 text-xs">⚠️</span>
          <div className="text-xs text-yellow-300 font-mono">
            <p className="font-semibold mb-1">ATTENTION:</p>
            <p>Your raffles are saved in your browser's localStorage. If you clear cookies or use a different browser, your data will be lost.</p>
            <p className="mt-1 text-yellow-400 font-semibold">Consider exporting your raffles as backup!</p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default PunkableRaffleSystem
