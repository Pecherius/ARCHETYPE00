import { localStorageService } from "./local-storage"
import type { Raffle, Participant, Prize, Winner } from "./types"

export class RaffleService {
  // Raffle operations
  static async createRaffle(title: string, description?: string, imageUrl?: string): Promise<Raffle | null> {
    try {
      return localStorageService.createRaffle(title, description, imageUrl)
    } catch (error) {
      console.error("Error creating raffle:", error)
      return null
    }
  }

  static async getRaffle(id: string): Promise<Raffle | null> {
    try {
      return localStorageService.getRaffle(id)
    } catch (error) {
      console.error("Error fetching raffle:", error)
      return null
    }
  }

  static async updateRaffle(id: string, updates: Partial<Raffle>): Promise<Raffle | null> {
    try {
      return localStorageService.updateRaffle(id, updates)
    } catch (error) {
      console.error("Error updating raffle:", error)
      return null
    }
  }

  static async getAllRaffles(): Promise<Raffle[]> {
    try {
      return localStorageService.getAllRaffles()
    } catch (error) {
      console.error("Error fetching raffles:", error)
      return []
    }
  }

  static async deleteRaffle(id: string): Promise<boolean> {
    try {
      return localStorageService.deleteRaffle(id)
    } catch (error) {
      console.error("Error deleting raffle:", error)
      return false
    }
  }

  // Participant operations
  static async addParticipant(
    raffleId: string,
    participant: Omit<Participant, "id" | "raffle_id" | "created_at">,
  ): Promise<Participant | null> {
    try {
      return localStorageService.addParticipant(raffleId, participant)
    } catch (error) {
      console.error("Error adding participant:", error)
      return null
    }
  }

  static async getParticipants(raffleId: string): Promise<Participant[]> {
    try {
      return localStorageService.getParticipants(raffleId)
    } catch (error) {
      console.error("Error fetching participants:", error)
      return []
    }
  }

  static async removeParticipant(id: string): Promise<boolean> {
    try {
      return localStorageService.removeParticipant(id)
    } catch (error) {
      console.error("Error removing participant:", error)
      return false
    }
  }

  static async checkDuplicateUpAddress(raffleId: string, upAddress: string, excludeId?: string): Promise<boolean> {
    try {
      return localStorageService.checkDuplicateUpAddress(raffleId, upAddress, excludeId)
    } catch (error) {
      console.error("Error checking duplicate UP address:", error)
      return false
    }
  }

  // Prize operations
  static async addPrize(
    raffleId: string,
    prize: Omit<Prize, "id" | "raffle_id" | "created_at" | "remaining">,
  ): Promise<Prize | null> {
    try {
      return localStorageService.addPrize(raffleId, prize)
    } catch (error) {
      console.error("Error adding prize:", error)
      return null
    }
  }

  static async getPrizes(raffleId: string): Promise<Prize[]> {
    try {
      return localStorageService.getPrizes(raffleId)
    } catch (error) {
      console.error("Error fetching prizes:", error)
      return []
    }
  }

  static async removePrize(id: string): Promise<boolean> {
    try {
      return localStorageService.removePrize(id)
    } catch (error) {
      console.error("Error removing prize:", error)
      return false
    }
  }

  static async updatePrizeRemaining(id: string, remaining: number): Promise<Prize | null> {
    try {
      return localStorageService.updatePrizeRemaining(id, remaining)
    } catch (error) {
      console.error("Error updating prize remaining:", error)
      return null
    }
  }

  // Winner operations
  static async addWinner(winner: Omit<Winner, "id" | "won_at">): Promise<Winner | null> {
    try {
      return localStorageService.addWinner(winner)
    } catch (error) {
      console.error("Error adding winner:", error)
      return null
    }
  }

  static async getWinners(raffleId: string): Promise<Winner[]> {
    try {
      return localStorageService.getWinners(raffleId)
    } catch (error) {
      console.error("Error fetching winners:", error)
      return []
    }
  }

  static async clearWinners(raffleId: string): Promise<void> {
    try {
      localStorageService.clearWinners(raffleId)
    } catch (error) {
      console.error("Error clearing winners:", error)
    }
  }

  // Statistics
  static async getRaffleStats(raffleId: string) {
    try {
      return localStorageService.getRaffleStats(raffleId)
    } catch (error) {
      console.error("Error getting raffle stats:", error)
      return {
        participantCount: 0,
        totalTickets: 0,
        prizeCount: 0,
        totalPrizes: 0,
        remainingPrizes: 0,
        winnerCount: 0,
        participants: [],
        prizes: [],
        winners: [],
      }
    }
  }
}

// Export types for convenience
export type { Raffle, Participant, Prize, Winner }

// Named export for compatibility
