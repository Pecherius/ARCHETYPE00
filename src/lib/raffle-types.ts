// Core types for the raffle system
export interface Raffle {
  id: string
  title: string
  description?: string
  image_url?: string
  status: "active" | "completed" | "paused"
  created_at: string
  updated_at: string
}

export interface Participant {
  id: string
  raffle_id: string
  name: string
  tickets: number
  up_address?: string
  color: string
  created_at: string
}

export interface Prize {
  id: string
  raffle_id: string
  name: string
  count: number
  remaining: number
  created_at: string
}

export interface Winner {
  id: string
  raffle_id: string
  participant_id: string
  prize_id: string
  participant_name: string
  prize_name: string
  participant_color: string
  up_address?: string
  won_at: string
}

// Statistics interface
export interface RaffleStats {
  participantCount: number
  totalTickets: number
  prizeCount: number
  totalPrizes: number
  remainingPrizes: number
  winnerCount: number
  participants: Participant[]
  prizes: Prize[]
  winners: Winner[]
}
