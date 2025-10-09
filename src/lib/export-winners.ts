// Export winners functionality
export interface WinnerExport {
  raffleName: string
  raffleDescription: string
  raffleImage: string
  winners: Array<{
    participantName: string
    participantUpAddress: string
    prizeName: string
    prizeDescription: string
    prizeImage: string
    selectedAt: string
    totalTickets?: number
    prizeCount?: number
  }>
  exportDate: string
  totalWinners: number
}

export function exportWinnersAsImage(winnerData: WinnerExport): void {
  // Always use manual canvas generation for clean, consistent results
  createManualCanvas(winnerData)
}

function createManualCanvas(winnerData: WinnerExport): void {
  // Winners are already grouped and consolidated in the data
  const winners = winnerData.winners

  // Debug logging
  console.log('Export data received:', {
    raffleName: winnerData.raffleName,
    winnersCount: winners.length,
    winners: winners.map(w => ({
      name: w.participantName,
      upAddress: w.participantUpAddress,
      tickets: w.totalTickets,
      prizeName: w.prizeName,
      prizeCount: w.prizeCount
    }))
  })

  // Create a canvas element
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  // Calculate dynamic dimensions based on number of winners
  const baseHeight = 400
  const winnersPerRow = 3 // Winners per row
  const winnerWidth = 380 // Width per winner card
  const winnerHeight = 200 // Height per winner card
  
  const rows = Math.ceil(winners.length / winnersPerRow)
  const totalWidth = Math.max(1400, winnersPerRow * winnerWidth + 100) // Increased minimum width
  const totalHeight = Math.max(600, baseHeight + (rows * winnerHeight) + 50)
  
  canvas.width = totalWidth
  canvas.height = totalHeight

  // Background with gradient
  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
  gradient.addColorStop(0, '#0a0a0a')
  gradient.addColorStop(1, '#1a1a1a')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  // Main border
  ctx.strokeStyle = '#ff69b4'
  ctx.lineWidth = 3
  ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40)

  // Header section with gradient background
  const headerGradient = ctx.createLinearGradient(30, 30, 30, 180)
  headerGradient.addColorStop(0, '#1a1a1a')
  headerGradient.addColorStop(1, '#2a2a2a')
  ctx.fillStyle = headerGradient
  ctx.fillRect(30, 30, canvas.width - 60, 150)

  // Header border
  ctx.strokeStyle = '#ff69b4'
  ctx.lineWidth = 2
  ctx.strokeRect(30, 30, canvas.width - 60, 150)

  // Status badge background
  ctx.fillStyle = '#00ff88'
  ctx.fillRect(50, 50, 200, 30)
  ctx.fillStyle = '#000000'
  ctx.font = 'bold 14px monospace'
  ctx.textAlign = 'center'
  ctx.fillText('RAFFLE COMPLETED', 150, 70)

  // Title with glow effect
  ctx.fillStyle = '#ff69b4'
  ctx.font = 'bold 36px monospace'
  ctx.textAlign = 'center'
  ctx.fillText('PUNKABLE ETHEREAL RAFFLE SYSTEM', canvas.width / 2, 100)

  // PERS branding with icon
  ctx.fillStyle = '#a1a1aa'
  ctx.font = 'bold 20px monospace'
  ctx.fillText('P.E.R.S. // RAFFLE_RESULTS', canvas.width / 2, 130)

  // Raffle name with better styling
  ctx.fillStyle = '#ffffff'
  ctx.font = 'bold 24px monospace'
  ctx.fillText(winnerData.raffleName, canvas.width / 2, 160)

  // Winners section header with background
  ctx.fillStyle = '#2a2a2a'
  ctx.fillRect(50, 200, canvas.width - 100, 40)
  ctx.strokeStyle = '#ff69b4'
  ctx.lineWidth = 2
  ctx.strokeRect(50, 200, canvas.width - 100, 40)
  
  ctx.fillStyle = '#ff69b4'
  ctx.font = 'bold 24px monospace'
  ctx.textAlign = 'left'
  ctx.fillText('🏆 WINNERS:', 70, 225)

  // Draw winners in grid layout
  let currentRow = 0
  let currentCol = 0
  
  winners.forEach((winner: any, index) => {
    const x = 50 + (currentCol * winnerWidth)
    const y = 280 + (currentRow * winnerHeight)
    
    // Winner card background with gradient
    const cardGradient = ctx.createLinearGradient(x, y, x, y + winnerHeight - 20)
    cardGradient.addColorStop(0, '#1a1a1a')
    cardGradient.addColorStop(1, '#2a2a2a')
    ctx.fillStyle = cardGradient
    ctx.fillRect(x, y, winnerWidth - 20, winnerHeight - 20)

    // Winner card border with glow effect
    ctx.strokeStyle = '#ff69b4'
    ctx.lineWidth = 2
    ctx.strokeRect(x, y, winnerWidth - 20, winnerHeight - 20)

    // Winner number badge
    ctx.fillStyle = '#ff69b4'
    ctx.fillRect(x + 10, y + 10, 30, 25)
    ctx.fillStyle = '#000000'
    ctx.font = 'bold 16px monospace'
    ctx.textAlign = 'center'
    ctx.fillText(`${index + 1}`, x + 25, y + 28)

    // Winner name with UP address inline
    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 18px monospace'
    ctx.textAlign = 'left'
    
    // Calculate name width to position UP address
    const nameWidth = ctx.measureText(winner.participantName).width
    const upStartX = x + 50 + nameWidth + 10 // 10px space after name
    
    // Draw name
    ctx.fillText(winner.participantName, x + 50, y + 30)
    
    // Draw UP address inline
    const truncatedUp = winner.participantUpAddress.length > 15 
      ? winner.participantUpAddress.substring(0, 15) + '...'
      : winner.participantUpAddress
    ctx.fillStyle = '#71717a'
    ctx.font = '12px monospace'
    ctx.fillText(`📍 ${truncatedUp}`, upStartX, y + 30)

    // Ticket count badge
    ctx.fillStyle = '#a1a1aa'
    ctx.fillRect(x + 50, y + 45, 120, 20)
    ctx.fillStyle = '#000000'
    ctx.font = 'bold 12px monospace'
    ctx.fillText(`${winner.totalTickets} tickets`, x + 60, y + 58)

    // Prizes won section - horizontal layout
    ctx.fillStyle = '#00ff88'
    ctx.font = 'bold 14px monospace'
    ctx.fillText('PRIZES:', x + 50, y + 85)

    // Parse and display prizes horizontally
    const prizes = winner.prizeName.split(', ')
    let prizeX = x + 50
    let prizeY = y + 105
    
    prizes.forEach((prize: string) => {
      // Check if we need to wrap to next line within the card
      if (prizeX > x + winnerWidth - 80) {
        prizeX = x + 50
        prizeY += 25
      }
      
      // Prize badge background
      ctx.fillStyle = '#2a2a2a'
      ctx.fillRect(prizeX, prizeY - 15, Math.min(prize.length * 7 + 15, 150), 25)
      ctx.strokeStyle = '#00ff88'
      ctx.lineWidth = 1
      ctx.strokeRect(prizeX, prizeY - 15, Math.min(prize.length * 7 + 15, 150), 25)
      
      // Prize text
      ctx.fillStyle = '#a1a1aa'
      ctx.font = '11px monospace'
      ctx.fillText(prize.trim(), prizeX + 3, prizeY)
      
      prizeX += Math.min(prize.length * 7 + 20, 170) // Move to next prize position
    })

    // Move to next position
    currentCol++
    if (currentCol >= winnersPerRow) {
      currentCol = 0
      currentRow++
    }
  })

  // Footer with background
  ctx.fillStyle = '#1a1a1a'
  ctx.fillRect(50, canvas.height - 60, canvas.width - 100, 40)
  ctx.strokeStyle = '#ff69b4'
  ctx.lineWidth = 1
  ctx.strokeRect(50, canvas.height - 60, canvas.width - 100, 40)
  
  ctx.fillStyle = '#71717a'
  ctx.font = '14px monospace'
  ctx.textAlign = 'center'
  ctx.fillText(`📅 Exported on ${winnerData.exportDate}`, canvas.width / 2, canvas.height - 40)
  ctx.fillText(`👥 Total Winners: ${winners.length}`, canvas.width / 2, canvas.height - 25)

  // Convert to image and download
  canvas.toBlob((blob) => {
    if (!blob) return
    
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `raffle-${winnerData.raffleName.replace(/[^a-zA-Z0-9]/g, '-')}-winners-${new Date().toISOString().split('T')[0]}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  })
}

export function exportWinnersAsJSON(winnerData: WinnerExport): void {
  const dataStr = JSON.stringify(winnerData, null, 2)
  const dataBlob = new Blob([dataStr], { type: 'application/json' })
  
  const url = URL.createObjectURL(dataBlob)
  const link = document.createElement('a')
  link.href = url
  link.download = `raffle-${winnerData.raffleName.replace(/[^a-zA-Z0-9]/g, '-')}-winners-${new Date().toISOString().split('T')[0]}.json`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
