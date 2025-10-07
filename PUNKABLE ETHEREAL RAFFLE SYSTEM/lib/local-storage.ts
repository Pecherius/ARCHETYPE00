// Local storage service for managing raffle data
import type { Raffle, Participant, Prize, Winner } from "./types"

const STORAGE_KEYS = {
  RAFFLES: "punkable_raffles",
  PARTICIPANTS: "punkable_participants",
  PRIZES: "punkable_prizes",
  WINNERS: "punkable_winners",
} as const

class LocalStorageService {
  private isClient(): boolean {
    return typeof window !== "undefined"
  }

  private getFromStorage<T>(key: string, defaultValue: T): T {
    if (!this.isClient()) return defaultValue

    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : defaultValue
    } catch (error) {
      console.error(`Error reading from localStorage key "${key}":`, error)
      return defaultValue
    }
  }

  private setToStorage<T>(key: string, value: T): void {
    if (!this.isClient()) return

    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.error(`Error writing to localStorage key "${key}":`, error)
    }
  }

  private generateId(): string {
    return `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  // Raffle operations
  getAllRaffles(): Raffle[] {
    return this.getFromStorage<Raffle[]>(STORAGE_KEYS.RAFFLES, [])
  }

  getRaffle(id: string): Raffle | null {
    const raffles = this.getAllRaffles()
    return raffles.find((raffle) => raffle.id === id) || null
  }

  createRaffle(title: string, description?: string, imageUrl?: string): Raffle {
    const raffles = this.getAllRaffles()
    const now = new Date().toISOString()
    const newRaffle: Raffle = {
      id: this.generateId(),
      title,
      description,
      image_url: imageUrl,
      status: "active",
      created_at: now,
      updated_at: now,
    }

    raffles.unshift(newRaffle)
    this.setToStorage(STORAGE_KEYS.RAFFLES, raffles)
    return newRaffle
  }

  updateRaffle(id: string, updates: Partial<Raffle>): Raffle | null {
    const raffles = this.getAllRaffles()
    const index = raffles.findIndex((raffle) => raffle.id === id)

    if (index === -1) return null

    raffles[index] = {
      ...raffles[index],
      ...updates,
      updated_at: new Date().toISOString(),
    }

    this.setToStorage(STORAGE_KEYS.RAFFLES, raffles)
    return raffles[index]
  }

  deleteRaffle(id: string): boolean {
    const raffles = this.getAllRaffles()
    const filteredRaffles = raffles.filter((raffle) => raffle.id !== id)

    if (filteredRaffles.length === raffles.length) return false

    this.setToStorage(STORAGE_KEYS.RAFFLES, filteredRaffles)

    // Also clean up related data
    this.deleteParticipantsByRaffleId(id)
    this.deletePrizesByRaffleId(id)
    this.deleteWinnersByRaffleId(id)

    return true
  }

  // Participant operations
  getAllParticipants(): Participant[] {
    return this.getFromStorage<Participant[]>(STORAGE_KEYS.PARTICIPANTS, [])
  }

  getParticipants(raffleId: string): Participant[] {
    const participants = this.getAllParticipants()
    return participants.filter((participant) => participant.raffle_id === raffleId)
  }

  addParticipant(raffleId: string, participantData: Omit<Participant, "id" | "raffle_id" | "created_at">): Participant {
    const participants = this.getAllParticipants()
    const newParticipant: Participant = {
      id: this.generateId(),
      raffle_id: raffleId,
      created_at: new Date().toISOString(),
      ...participantData,
    }

    participants.push(newParticipant)
    this.setToStorage(STORAGE_KEYS.PARTICIPANTS, participants)
    return newParticipant
  }

  removeParticipant(id: string): boolean {
    const participants = this.getAllParticipants()
    const filteredParticipants = participants.filter((participant) => participant.id !== id)

    if (filteredParticipants.length === participants.length) return false

    this.setToStorage(STORAGE_KEYS.PARTICIPANTS, filteredParticipants)
    return true
  }

  private deleteParticipantsByRaffleId(raffleId: string): void {
    const participants = this.getAllParticipants()
    const filteredParticipants = participants.filter((participant) => participant.raffle_id !== raffleId)
    this.setToStorage(STORAGE_KEYS.PARTICIPANTS, filteredParticipants)
  }

  checkDuplicateUpAddress(raffleId: string, upAddress: string, excludeId?: string): boolean {
    const participants = this.getParticipants(raffleId)
    return participants.some(
      (participant) =>
        participant.up_address?.toLowerCase() === upAddress.toLowerCase() && participant.id !== excludeId,
    )
  }

  // Prize operations
  getAllPrizes(): Prize[] {
    return this.getFromStorage<Prize[]>(STORAGE_KEYS.PRIZES, [])
  }

  getPrizes(raffleId: string): Prize[] {
    const prizes = this.getAllPrizes()
    return prizes.filter((prize) => prize.raffle_id === raffleId)
  }

  addPrize(raffleId: string, prizeData: Omit<Prize, "id" | "raffle_id" | "created_at" | "remaining">): Prize {
    const prizes = this.getAllPrizes()
    const newPrize: Prize = {
      id: this.generateId(),
      raffle_id: raffleId,
      created_at: new Date().toISOString(),
      remaining: prizeData.count,
      ...prizeData,
    }

    prizes.push(newPrize)
    this.setToStorage(STORAGE_KEYS.PRIZES, prizes)
    return newPrize
  }

  removePrize(id: string): boolean {
    const prizes = this.getAllPrizes()
    const filteredPrizes = prizes.filter((prize) => prize.id !== id)

    if (filteredPrizes.length === prizes.length) return false

    this.setToStorage(STORAGE_KEYS.PRIZES, filteredPrizes)
    return true
  }

  updatePrizeRemaining(id: string, remaining: number): Prize | null {
    const prizes = this.getAllPrizes()
    const index = prizes.findIndex((prize) => prize.id === id)

    if (index === -1) return null

    prizes[index] = {
      ...prizes[index],
      remaining: Math.max(0, remaining),
    }

    this.setToStorage(STORAGE_KEYS.PRIZES, prizes)
    return prizes[index]
  }

  private deletePrizesByRaffleId(raffleId: string): void {
    const prizes = this.getAllPrizes()
    const filteredPrizes = prizes.filter((prize) => prize.raffle_id !== raffleId)
    this.setToStorage(STORAGE_KEYS.PRIZES, filteredPrizes)
  }

  // Winner operations
  getAllWinners(): Winner[] {
    return this.getFromStorage<Winner[]>(STORAGE_KEYS.WINNERS, [])
  }

  getWinners(raffleId: string): Winner[] {
    const winners = this.getAllWinners()
    return winners.filter((winner) => winner.raffle_id === raffleId)
  }

  addWinner(winnerData: Omit<Winner, "id" | "won_at">): Winner {
    const winners = this.getAllWinners()
    const newWinner: Winner = {
      id: this.generateId(),
      won_at: new Date().toISOString(),
      ...winnerData,
    }

    winners.push(newWinner)
    this.setToStorage(STORAGE_KEYS.WINNERS, winners)
    return newWinner
  }

  clearWinners(raffleId: string): void {
    const winners = this.getAllWinners()
    const filteredWinners = winners.filter((winner) => winner.raffle_id !== raffleId)
    this.setToStorage(STORAGE_KEYS.WINNERS, filteredWinners)
  }

  private deleteWinnersByRaffleId(raffleId: string): void {
    const winners = this.getAllWinners()
    const filteredWinners = winners.filter((winner) => winner.raffle_id !== raffleId)
    this.setToStorage(STORAGE_KEYS.WINNERS, filteredWinners)
  }

  // Statistics
  getRaffleStats(raffleId: string) {
    const participants = this.getParticipants(raffleId)
    const prizes = this.getPrizes(raffleId)
    const winners = this.getWinners(raffleId)

    const totalTickets = participants.reduce((sum, p) => sum + p.tickets, 0)
    const totalPrizes = prizes.reduce((sum, p) => sum + p.count, 0)
    const remainingPrizes = prizes.reduce((sum, p) => sum + p.remaining, 0)

    return {
      participantCount: participants.length,
      totalTickets,
      prizeCount: prizes.length,
      totalPrizes,
      remainingPrizes,
      winnerCount: winners.length,
      participants,
      prizes,
      winners,
    }
  }

  // Utility methods
  clearAllData(): void {
    if (!this.isClient()) return

    Object.values(STORAGE_KEYS).forEach((key) => {
      localStorage.removeItem(key)
    })
  }

  exportData(): string {
    const data = {
      raffles: this.getAllRaffles(),
      participants: this.getAllParticipants(),
      prizes: this.getAllPrizes(),
      winners: this.getAllWinners(),
      exportedAt: new Date().toISOString(),
    }
    return JSON.stringify(data, null, 2)
  }

  importData(jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData)

      if (data.raffles) this.setToStorage(STORAGE_KEYS.RAFFLES, data.raffles)
      if (data.participants) this.setToStorage(STORAGE_KEYS.PARTICIPANTS, data.participants)
      if (data.prizes) this.setToStorage(STORAGE_KEYS.PRIZES, data.prizes)
      if (data.winners) this.setToStorage(STORAGE_KEYS.WINNERS, data.winners)

      return true
    } catch (error) {
      console.error("Error importing data:", error)
      return false
    }
  }
}

export const localStorageService = new LocalStorageService()
