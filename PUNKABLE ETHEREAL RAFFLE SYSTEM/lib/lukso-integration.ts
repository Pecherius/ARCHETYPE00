// LUKSO blockchain integration utilities
export interface LuksoTransaction {
  id: string
  winner_id: string
  up_address: string
  prize_name: string
  nft_contract?: string
  token_id?: string
  transaction_hash?: string
  status: "pending" | "sent" | "confirmed" | "failed"
  created_at: string
  sent_at?: string
  confirmed_at?: string
}

export interface NFTPrize {
  id: string
  name: string
  contract_address?: string
  token_ids?: string[]
  metadata_url?: string
  image_url?: string
}

// Generate batch transaction data for LUKSO
export function generateBatchTransactionData(winners: any[]) {
  return winners
    .filter((winner) => winner.up_address)
    .map((winner) => ({
      to: winner.up_address,
      prizeName: winner.prize_name,
      participantName: winner.participant_name,
      winnerData: {
        id: winner.id,
        raffle_id: winner.raffle_id,
        participant_id: winner.participant_id,
        prize_id: winner.prize_id,
      },
    }))
}

// Export winners data for external tools
export function exportWinnersForLukso(winners: any[]) {
  const winnersWithAddresses = winners.filter((w) => w.up_address)

  return {
    summary: {
      total_winners: winners.length,
      winners_with_up_address: winnersWithAddresses.length,
      winners_without_address: winners.length - winnersWithAddresses.length,
    },
    batch_data: winnersWithAddresses.map((winner, index) => ({
      batch_index: index + 1,
      recipient_address: winner.up_address,
      recipient_name: winner.participant_name,
      prize: winner.prize_name,
      raffle_winner_id: winner.id,
      // Ready for LUKSO Universal Profile interaction
      lukso_data: {
        to: winner.up_address,
        // You can add NFT contract address and token ID here
        contract: "", // To be filled with your NFT contract
        tokenId: "", // To be filled with specific token ID
      },
    })),
  }
}

// Validate UP addresses format
export function validateUpAddress(address: string): boolean {
  // Basic validation for Universal Profile addresses (similar to Ethereum addresses)
  const upAddressRegex = /^0x[a-fA-F0-9]{40}$/
  return upAddressRegex.test(address)
}

// Generate CSV for external tools
export function generateCSVForBatchSend(winners: any[]): string {
  const headers = ["Recipient_Address", "Recipient_Name", "Prize_Name", "Winner_ID", "Raffle_ID", "Notes"]

  const rows = winners
    .filter((w) => w.up_address)
    .map((winner) => [
      winner.up_address,
      winner.participant_name,
      winner.prize_name,
      winner.id,
      winner.raffle_id,
      `Winner of ${winner.prize_name} from raffle`,
    ])

  return [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n")
}
