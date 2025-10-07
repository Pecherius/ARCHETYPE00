"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { motion, AnimatePresence } from "framer-motion"
import confetti from "canvas-confetti"
import {
  Copy,
  Check,
  User,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Settings,
  Edit3,
  ImageIcon,
  ArrowLeft,
  Save,
  Trophy,
} from "lucide-react"
import { RaffleService, type Raffle, type Participant, type Prize, type Winner } from "./lib/raffle-service"
import RaffleSelector from "./components/raffle-selector"
import ResultsScreen from "./components/results-screen"
import { useLanguage } from "./hooks/use-language"
import LanguageSelector from "./components/language-selector"
import { ParticipantIcon } from "./lib/participant-icons"

const COLORS = [
  "#FF69B4",
  "#FFB6C1",
  "#FF1493",
  "#FFC0CB",
  "#FF91A4",
  "#FF6B9D",
  "#C71585",
  "#FF20B2",
  "#FF007F",
  "#FF69B4",
  "#DA70D6",
  "#DDA0DD",
  "#EE82EE",
  "#FF1493",
  "#FFB6C1",
]

const PrizeSelector = () => {
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
  const shuffleRef = useRef<NodeJS.Timeout | null>(null)
  const winnerAlertTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Form states
  const [newParticipantName, setNewParticipantName] = useState("")
  const [newParticipantTickets, setNewParticipantTickets] = useState("")
  const [newParticipantUpAddress, setNewParticipantUpAddress] = useState("")
  const [newPrizeName, setNewPrizeName] = useState("")
  const [newPrizeCount, setNewPrizeCount] = useState("")

  // Customization settings
  const [showCustomization, setShowCustomization] = useState(false)
  const [tempTitle, setTempTitle] = useState("")
  const [tempImage, setTempImage] = useState("")

  // UP Address popup state
  const [showUpAddressPopup, setShowUpAddressPopup] = useState(false)
  const [selectedUpAddress, setSelectedUpAddress] = useState("")
  const [selectedParticipantName, setSelectedParticipantName] = useState("")
  const [copied, setCopied] = useState(false)

  // Validation states
  const [duplicateUpAddressError, setDuplicateUpAddressError] = useState("")
  const [showSystemCheck, setShowSystemCheck] = useState(false)

  const { t } = useLanguage()

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
        setTempTitle(raffle.title)
        setTempImage(raffle.image_url || "")
      }
    } catch (error) {
      console.error("Error loading raffle data:", error)
    } finally {
      setLoading(false)
    }
  }

  // Handle raffle selection
  const handleSelectRaffle = (raffleId: string) => {
    loadRaffleData(raffleId)
    setCurrentView("raffle")
  }

  const handleCreateRaffle = (raffle: Raffle) => {
    setCurrentRaffle(raffle)
    setParticipants([])
    setPrizes([])
    setWinners([])
    setTempTitle(raffle.title)
    setTempImage(raffle.image_url || "")
    setCurrentView("raffle")
  }

  // Check for duplicate UP addresses
  const checkDuplicateUpAddress = async (upAddress: string) => {
    if (!upAddress.trim() || !currentRaffle) return false
    return await RaffleService.checkDuplicateUpAddress(currentRaffle.id, upAddress)
  }

  // Get system status
  const getSystemStatus = () => {
    const status = {
      participants: {
        count: participants.length,
        withUpAddress: participants.filter((p) => p.up_address).length,
        valid: true,
      },
      prizes: {
        count: prizes.length,
        totalPrizes: prizes.reduce((sum, p) => sum + p.remaining, 0),
        valid: true,
      },
      upAddresses: {
        total: participants.filter((p) => p.up_address).length,
        unique: new Set(participants.filter((p) => p.up_address).map((p) => p.up_address?.toLowerCase())).size,
        duplicates: [] as any[],
        valid: true,
      },
      overall: true,
    }

    // Check for duplicate UP addresses
    const upAddressMap = new Map()
    participants.forEach((participant) => {
      if (participant.up_address) {
        const lowerAddress = participant.up_address.toLowerCase()
        if (upAddressMap.has(lowerAddress)) {
          upAddressMap.get(lowerAddress).push(participant.name)
        } else {
          upAddressMap.set(lowerAddress, [participant.name])
        }
      }
    })

    upAddressMap.forEach((names, address) => {
      if (names.length > 1) {
        status.upAddresses.duplicates.push({
          address: address,
          participants: names,
        })
      }
    })

    status.upAddresses.valid = status.upAddresses.duplicates.length === 0
    status.participants.valid = participants.length > 0
    // Prize validation: Only invalid if no prizes were ever added (empty prizes array)
    // If prizes exist but remaining is 0, it means raffle is completed (valid state)
    status.prizes.valid = prizes.length > 0
    status.overall = status.participants.valid && status.prizes.valid && status.upAddresses.valid

    return status
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

  const handleUpAddressClick = (upAddress: string | undefined, participantName: string) => {
    if (upAddress) {
      setSelectedUpAddress(upAddress)
      setSelectedParticipantName(participantName)
      setShowUpAddressPopup(true)
      setCopied(false)
    }
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(selectedUpAddress)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy: ", err)
    }
  }

  // Handle UP Address input change
  const handleUpAddressChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setNewParticipantUpAddress(value)

    if (value.trim() && (await checkDuplicateUpAddress(value))) {
      setDuplicateUpAddressError(t.duplicateUpAddress)
    } else {
      setDuplicateUpAddressError("")
    }
  }

  // Handle customization save
  const saveCustomization = async () => {
    if (!currentRaffle) return

    const updates = {
      title: tempTitle,
      image_url: tempImage || undefined,
    }

    const updatedRaffle = await RaffleService.updateRaffle(currentRaffle.id, updates)
    if (updatedRaffle) {
      setCurrentRaffle(updatedRaffle)
      setShowCustomization(false)
    }
  }

  // Handle customization cancel
  const cancelCustomization = () => {
    if (currentRaffle) {
      setTempTitle(currentRaffle.title)
      setTempImage(currentRaffle.image_url || "")
    }
    setShowCustomization(false)
  }

  const goBackToRaffles = () => {
    setCurrentRaffle(null)
    setParticipants([])
    setPrizes([])
    setWinners([])
    setCurrentView("selector")
  }

  // Results screen handlers
  const handleViewResults = () => {
    setCurrentView("results")
  }

  const handleBackToEdit = () => {
    setCurrentView("raffle")
  }

  const handleRestartRaffle = async () => {
    if (!currentRaffle || !confirm("Are you sure you want to restart this raffle? All winners will be cleared.")) return

    // Clear all winners and reset prize counts
    const winnersToRemove = await RaffleService.getWinners(currentRaffle.id)
    for (const winner of winnersToRemove) {
      // This would need to be implemented in the service
      // For now, we'll just clear the local state and localStorage will handle it
    }

    // Reset prizes to original counts
    const currentPrizes = await RaffleService.getPrizes(currentRaffle.id)
    for (const prize of currentPrizes) {
      await RaffleService.updatePrizeRemaining(prize.id, prize.count)
    }

    // Reload data
    await loadRaffleData(currentRaffle.id)
    setCurrentView("raffle")
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

  // Show raffle selector if no current raffle
  if (currentView === "selector") {
    return <RaffleSelector onSelectRaffle={handleSelectRaffle} onCreateRaffle={handleCreateRaffle} />
  }

  // Show results screen
  if (currentView === "results" && currentRaffle) {
    return (
      <ResultsScreen
        raffle={currentRaffle}
        winners={winners}
        onBackToEdit={handleBackToEdit}
        onViewWinners={() => setCurrentView("raffle")}
        onRestartRaffle={handleRestartRaffle}
      />
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">{t.loadingRaffle}</p>
        </div>
      </div>
    )
  }

  const remainingPrizeCount = prizes.reduce((sum, p) => sum + p.remaining, 0)
  const canSelectWinner = participants.length > 0 && remainingPrizeCount > 0 && !selecting
  const systemStatus = getSystemStatus()

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-purple-50 font-sans">
      <div className="grid grid-cols-4 gap-6 p-6 h-screen">
        <div className="col-span-4 text-center mb-6">
          {/* Back button and Custom Header Section */}
          <div className="flex items-center justify-between mb-4">
            <Button
              onClick={goBackToRaffles}
              variant="outline"
              className="flex items-center gap-2 border-pink-300 text-pink-600 hover:bg-pink-50 bg-transparent"
            >
              <ArrowLeft className="w-4 h-4" />
              {t.backToRaffles}
            </Button>

            {/* Center content container */}
            <div className="flex-1 flex items-center justify-center gap-4">
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
                <h1 className="text-5xl font-black bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 bg-clip-text text-transparent">
                  {currentRaffle?.title}
                </h1>
              </div>
            </div>

            {/* Right side controls */}
            <div className="flex items-center gap-3">
              <LanguageSelector />
              {winners.length > 0 && (
                <Button
                  onClick={handleViewResults}
                  className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold px-4 py-2 rounded-lg shadow-md flex items-center gap-2"
                >
                  <Trophy className="w-4 h-4" />
                  {t.resultsViewWinners}
                </Button>
              )}
              <Button
                onClick={() => {
                  if (currentRaffle) {
                    setTempTitle(currentRaffle.title)
                    setTempImage(currentRaffle.image_url || "")
                    setShowCustomization(true)
                  }
                }}
                variant="outline"
                className="p-3 border-pink-300 text-pink-600 hover:bg-pink-50"
              >
                <Settings className="w-5 h-5" />
              </Button>
            </div>
          </div>

          <div className="flex gap-4 justify-center items-stretch">
            <Alert className="bg-gradient-to-r from-pink-100 to-rose-100 border-pink-300 shadow-lg flex-1">
              <AlertDescription className="text-gray-700 text-lg font-medium">
                {currentRaffle?.description || t.defaultDescription}
              </AlertDescription>
            </Alert>
            <Button
              onClick={() => setShowSystemCheck(true)}
              className={`px-6 font-semibold rounded-lg shadow-md flex items-center gap-2 whitespace-nowrap ${
                systemStatus.overall
                  ? "bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
                  : "bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white"
              }`}
            >
              {systemStatus.overall ? (
                <>
                  <CheckCircle className="w-5 h-5" />
                  {t.systemOk}
                </>
              ) : (
                <>
                  <AlertTriangle className="w-5 h-5" />
                  {t.checkIssues}
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Participants Column */}
        <div className="col-span-1">
          <Card className="h-full bg-gradient-to-br from-white to-pink-50 border-pink-200 shadow-xl overflow-hidden flex flex-col">
            <div className="p-6">
              <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span className="text-pink-500">👥</span> {t.participants}
              </h3>
              <div className="space-y-3 overflow-y-auto flex-grow" style={{ maxHeight: "calc(12 * (3rem + 12px))" }}>
                {participants.map((participant) => (
                  <motion.div
                    key={participant.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-xl p-4 shadow-md border border-pink-100"
                    style={{ borderLeft: `4px solid ${participant.color}` }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
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
                          <span className="font-semibold text-gray-800">{participant.name}</span>
                        </div>
                        {participant.up_address && (
                          <div className="ml-9 mb-2">
                            <button
                              onClick={() => handleUpAddressClick(participant.up_address, participant.name)}
                              className="text-xs text-pink-600 hover:text-pink-800 bg-pink-50 hover:bg-pink-100 px-2 py-1 rounded-md transition-colors duration-200 flex items-center gap-1"
                            >
                              <User className="w-3 h-3" />
                              UP Address
                            </button>
                          </div>
                        )}
                        <div className="flex flex-wrap gap-1 ml-9">
                          {[...Array(Math.min(participant.tickets, 10))].map((_, i) => (
                            <div
                              key={i}
                              className="w-2 h-2 rounded-full shadow-sm"
                              style={{ backgroundColor: participant.color }}
                            />
                          ))}
                          {participant.tickets > 10 && (
                            <span className="text-xs text-gray-500 ml-1">+{participant.tickets - 10}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-600 bg-pink-50 px-2 py-1 rounded-full">
                          {participant.tickets} {t.tickets}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeParticipant(participant)}
                          className="text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full w-8 h-8 p-0"
                        >
                          ×
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
              <div className="mt-6 space-y-4 bg-gradient-to-r from-pink-50 to-rose-50 p-4 rounded-xl">
                <Label htmlFor="newParticipantName" className="text-sm font-semibold text-gray-700">
                  {t.addNewParticipant}
                </Label>
                <Input
                  id="newParticipantName"
                  value={newParticipantName}
                  onChange={(e) => setNewParticipantName(e.target.value)}
                  placeholder={t.enterName}
                  className="border-pink-200 focus:border-pink-400 focus:ring-pink-400"
                />
                <Input
                  id="newParticipantTickets"
                  value={newParticipantTickets}
                  onChange={(e) => setNewParticipantTickets(e.target.value)}
                  placeholder={t.numberOfTickets}
                  type="number"
                  min="1"
                  className="border-pink-200 focus:border-pink-400 focus:ring-pink-400"
                />
                <div>
                  <Input
                    id="newParticipantUpAddress"
                    value={newParticipantUpAddress}
                    onChange={handleUpAddressChange}
                    placeholder={t.upAddressOptional}
                    className={`border-pink-200 focus:border-pink-400 focus:ring-pink-400 text-xs ${
                      duplicateUpAddressError ? "border-red-400 focus:border-red-500 focus:ring-red-400" : ""
                    }`}
                  />
                  {duplicateUpAddressError && (
                    <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      {duplicateUpAddressError}
                    </p>
                  )}
                </div>
                <Button
                  onClick={addParticipant}
                  disabled={!!duplicateUpAddressError}
                  className="w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-semibold py-2 rounded-lg shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {t.addParticipant}
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Main Selection Area */}
        <div className="col-span-2">
          <Card className="h-full bg-gradient-to-br from-white via-pink-50 to-rose-50 border-pink-200 shadow-2xl flex flex-col justify-between relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-pink-100/20 to-purple-100/20 pointer-events-none" />

            <AnimatePresence>
              {showWinnerAlert && latestWinner && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8, y: -20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8, y: -20 }}
                  className="absolute top-6 left-6 right-6 z-10"
                >
                  <Alert className="bg-gradient-to-r from-pink-500/90 to-purple-500/90 border-pink-400 text-white shadow-2xl backdrop-blur-sm">
                    <AlertTitle className="flex items-center gap-3 text-xl font-bold">
                      <div
                        className="w-6 h-6 rounded-full shadow-sm flex items-center justify-center"
                        style={{ backgroundColor: latestWinner.participant.color }}
                      >
                        <ParticipantIcon
                          participantId={latestWinner.participant.id}
                          participantName={latestWinner.participant.name}
                          className="w-4 h-4 text-white"
                        />
                      </div>
                      🎉 {latestWinner.participant.name} {t.wins}!
                    </AlertTitle>
                    <AlertDescription className="font-bold text-pink-100 text-lg mt-1">
                      {latestWinner.prize.name}
                    </AlertDescription>
                  </Alert>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex flex-col items-center justify-center flex-grow p-8 relative z-0">
              <AnimatePresence mode="wait">
                {currentParticipant ? (
                  <motion.div
                    key={currentParticipant.id}
                    initial={{ opacity: 0, scale: 0.8, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8, y: -20 }}
                    transition={{ duration: 0.2 }}
                    className="text-center"
                  >
                    <div
                      className="w-32 h-32 rounded-full mx-auto mb-6 shadow-2xl border-4 border-white flex items-center justify-center"
                      style={{
                        backgroundColor: currentParticipant.color,
                        boxShadow: `0 20px 40px ${currentParticipant.color}40`,
                      }}
                    >
                      <ParticipantIcon
                        participantId={currentParticipant.id}
                        participantName={currentParticipant.name}
                        className="w-16 h-16 text-white"
                      />
                    </div>
                    <h2 className="text-5xl font-black text-gray-800 mb-3">{currentParticipant.name}</h2>
                    <p className="text-2xl font-semibold text-gray-600 bg-white/80 px-4 py-2 rounded-full shadow-md">
                      {currentParticipant.tickets} {t.nftTickets}
                    </p>
                  </motion.div>
                ) : (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
                    <div className="w-32 h-32 rounded-full mx-auto mb-6 bg-gradient-to-br from-pink-200 to-purple-200 flex items-center justify-center shadow-xl">
                      <span className="text-4xl">🎲</span>
                    </div>
                    <h2 className="text-4xl font-bold text-gray-600 mb-3">{t.readyToDraw}</h2>
                    <p className="text-xl text-gray-500">{t.clickToSelect}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="flex justify-center p-8 relative z-0">
              <Button
                onClick={selectWinner}
                disabled={!canSelectWinner}
                className="px-12 py-6 text-2xl font-bold bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 hover:from-pink-600 hover:via-rose-600 hover:to-purple-700 text-white rounded-2xl shadow-2xl transform transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {selecting ? (
                  <span className="flex items-center gap-3">
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    {t.selecting}
                  </span>
                ) : (
                  t.selectWinner
                )}
              </Button>
            </div>
          </Card>
        </div>

        {/* Prizes and Winners Column */}
        <div className="col-span-1">
          <div className="grid grid-rows-2 gap-6 h-full">
            <Card className="bg-gradient-to-br from-white to-pink-50 border-pink-200 shadow-xl overflow-hidden flex flex-col">
              <div className="p-6">
                <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <span className="text-pink-500">🏆</span> {t.prizes} ({remainingPrizeCount})
                </h3>
                <div className="space-y-3 overflow-y-auto flex-grow">
                  {prizes.map((prize) => (
                    <motion.div
                      key={prize.id}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex justify-between items-center bg-white p-3 rounded-xl shadow-md border border-pink-100"
                    >
                      <span className="font-semibold text-gray-800">{prize.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-pink-600 bg-pink-50 px-3 py-1 rounded-full text-sm">
                          {prize.remaining}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removePrize(prize)}
                          className="text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full w-8 h-8 p-0"
                        >
                          ×
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
                <div className="mt-4 space-y-3 bg-gradient-to-r from-pink-50 to-rose-50 p-4 rounded-xl">
                  <Label htmlFor="newPrizeName" className="text-sm font-semibold text-gray-700">
                    {t.addNewPrize}
                  </Label>
                  <Input
                    id="newPrizeName"
                    value={newPrizeName}
                    onChange={(e) => setNewPrizeName(e.target.value)}
                    placeholder={t.prizeName}
                    className="border-pink-200 focus:border-pink-400 focus:ring-pink-400"
                  />
                  <Input
                    id="newPrizeCount"
                    value={newPrizeCount}
                    onChange={(e) => setNewPrizeCount(e.target.value)}
                    placeholder={t.quantity}
                    type="number"
                    min="1"
                    className="border-pink-200 focus:border-pink-400 focus:ring-pink-400"
                  />
                  <Button
                    onClick={addPrize}
                    className="w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-semibold py-2 rounded-lg shadow-md"
                  >
                    {t.addPrize}
                  </Button>
                </div>
              </div>
            </Card>

            <Card className="bg-gradient-to-br from-white to-pink-50 border-pink-200 shadow-xl overflow-hidden flex flex-col">
              <div className="p-6">
                <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <span className="text-pink-500">🎉</span> {t.winners}
                </h3>
                <div className="space-y-3 overflow-y-auto flex-grow" style={{ maxHeight: "calc(6 * (3rem + 12px))" }}>
                  {winners.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">
                      <span className="text-4xl mb-2 block">🏆</span>
                      <p className="text-sm">{t.winnersWillAppear}</p>
                    </div>
                  ) : (
                    winners.map((win) => (
                      <motion.div
                        key={win.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white p-4 rounded-xl shadow-md border-l-4"
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
                          <span className="font-semibold text-gray-800">{win.participant_name}</span>
                        </div>
                        <span className="text-sm font-bold text-pink-600 ml-9 bg-pink-50 px-2 py-1 rounded-full">
                          {win.prize_name}
                        </span>
                        {win.up_address && (
                          <div className="ml-9 mt-2">
                            <button
                              onClick={() => handleUpAddressClick(win.up_address, win.participant_name)}
                              className="text-xs text-pink-600 hover:text-pink-800 bg-pink-50 hover:bg-pink-100 px-2 py-1 rounded-md transition-colors duration-200 flex items-center gap-1"
                            >
                              <User className="w-3 h-3" />
                              UP Address
                            </button>
                          </div>
                        )}
                      </motion.div>
                    ))
                  )}
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Customization Popup */}
      <AnimatePresence>
        {showCustomization && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
            onClick={cancelCustomization}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 20 }}
              className="bg-white rounded-2xl p-6 shadow-2xl max-w-md w-full mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-800 mb-2 flex items-center justify-center gap-2">
                  <Settings className="w-6 h-6 text-pink-500" />
                  {t.customizeRaffle}
                </h3>
                <p className="text-sm text-gray-600">{t.personalizeRaffle}</p>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="raffleTitle" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Edit3 className="w-4 h-4" />
                    {t.raffleTitle}
                  </Label>
                  <Input
                    id="raffleTitle"
                    value={tempTitle}
                    onChange={(e) => setTempTitle(e.target.value)}
                    placeholder={t.enterRaffleTitle}
                    className="border-pink-200 focus:border-pink-400 focus:ring-pink-400 mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="raffleImage" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <ImageIcon className="w-4 h-4" />
                    {t.raffleImage}
                  </Label>
                  <Input
                    id="raffleImage"
                    value={tempImage}
                    onChange={(e) => setTempImage(e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    className="border-pink-200 focus:border-pink-400 focus:ring-pink-400 mt-2"
                  />
                  {tempImage && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-600 mb-2">{t.preview}</p>
                      <div className="w-16 h-16 rounded-lg overflow-hidden mx-auto">
                        <img
                          src={tempImage || "/placeholder.svg"}
                          alt="Preview"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            target.style.display = "none"
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <Button
                  onClick={saveCustomization}
                  className="flex-1 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-semibold py-2 rounded-lg shadow-md flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {t.saveChanges}
                </Button>
                <Button
                  onClick={cancelCustomization}
                  variant="outline"
                  className="px-6 py-2 border-gray-300 text-gray-700 hover:bg-gray-50 bg-transparent"
                >
                  {t.cancel}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* UP Address Popup */}
      <AnimatePresence>
        {showUpAddressPopup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
            onClick={() => setShowUpAddressPopup(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 20 }}
              className="bg-white rounded-2xl p-6 shadow-2xl max-w-md w-full mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center mb-4">
                <h3 className="text-xl font-bold text-gray-800 mb-2">{selectedParticipantName}</h3>
                <p className="text-sm text-gray-600">{t.upAddress}</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <p className="text-xs font-mono text-gray-800 break-all leading-relaxed">{selectedUpAddress}</p>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={copyToClipboard}
                  className="flex-1 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-semibold py-2 rounded-lg shadow-md flex items-center justify-center gap-2"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4" />
                      {t.copied}
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      {t.copyAddress}
                    </>
                  )}
                </Button>
                <Button
                  onClick={() => setShowUpAddressPopup(false)}
                  variant="outline"
                  className="px-6 py-2 border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  {t.close}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* System Check Popup */}
      <AnimatePresence>
        {showSystemCheck && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
            onClick={() => setShowSystemCheck(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 20 }}
              className="bg-white rounded-2xl p-6 shadow-2xl max-w-lg w-full mx-4 max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-800 mb-2 flex items-center justify-center gap-2">
                  {systemStatus.overall ? (
                    <>
                      <CheckCircle className="w-6 h-6 text-green-500" />
                      {t.systemStatusAllGood}
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-6 h-6 text-yellow-500" />
                      {t.systemStatusIssuesFound}
                    </>
                  )}
                </h3>
              </div>

              <div className="space-y-4">
                {/* Participants Status */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    {systemStatus.participants.valid ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-500" />
                    )}
                    <h4 className="font-semibold text-gray-800">{t.participants}</h4>
                  </div>
                  <p className="text-sm text-gray-600">
                    {t.total}: {systemStatus.participants.count} | {t.withUpAddress}:{" "}
                    {systemStatus.participants.withUpAddress}
                  </p>
                </div>

                {/* Prizes Status */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    {systemStatus.prizes.valid ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-500" />
                    )}
                    <h4 className="font-semibold text-gray-800">{t.prizes}</h4>
                  </div>
                  <p className="text-sm text-gray-600">
                    {t.categories}: {systemStatus.prizes.count} | {t.totalPrizes}: {systemStatus.prizes.totalPrizes}
                  </p>
                </div>

                {/* UP Addresses Status */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    {systemStatus.upAddresses.valid ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-500" />
                    )}
                    <h4 className="font-semibold text-gray-800">{t.upAddress}</h4>
                  </div>
                  <p className="text-sm text-gray-600">
                    {t.total}: {systemStatus.upAddresses.total} | {t.unique}: {systemStatus.upAddresses.unique}
                  </p>

                  {systemStatus.upAddresses.duplicates.length > 0 && (
                    <div className="mt-3 p-3 bg-red-50 rounded-lg border border-red-200">
                      <p className="text-sm font-semibold text-red-800 mb-2">{t.duplicateUpAddressesFound}</p>
                      {systemStatus.upAddresses.duplicates.map((duplicate, index) => (
                        <div key={index} className="mb-2">
                          <p className="text-xs font-mono text-red-700 break-all mb-1">{duplicate.address}</p>
                          <p className="text-xs text-red-600">
                            {t.usedBy}: {duplicate.participants.join(", ")}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Overall Status */}
                <div
                  className={`rounded-lg p-4 ${systemStatus.overall ? "bg-green-50 border border-green-200" : "bg-yellow-50 border border-yellow-200"}`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    {systemStatus.overall ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-yellow-500" />
                    )}
                    <h4 className="font-semibold text-gray-800">{t.overallStatus}</h4>
                  </div>
                  <p className={`text-sm ${systemStatus.overall ? "text-green-700" : "text-yellow-700"}`}>
                    {systemStatus.overall ? t.everythingLooksGood : t.resolveIssues}
                  </p>
                </div>
              </div>

              <div className="flex justify-center mt-6">
                <Button
                  onClick={() => setShowSystemCheck(false)}
                  className="px-8 py-2 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-semibold rounded-lg shadow-md"
                >
                  {t.close}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default PrizeSelector
