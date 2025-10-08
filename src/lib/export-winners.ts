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
  // Group winners by participant to avoid duplicates
  const groupedWinners = winnerData.winners.reduce((acc: any, winner) => {
    const key = `${winner.participantName}-${winner.participantUpAddress}`
    if (!acc[key]) {
      acc[key] = {
        participantName: winner.participantName,
        participantUpAddress: winner.participantUpAddress,
        totalTickets: winner.totalTickets || 0,
        prizes: []
      }
    }
    acc[key].prizes.push({
      name: winner.prizeName,
      count: winner.prizeCount || 1,
      selectedAt: winner.selectedAt
    })
    return acc
  }, {})

  const groupedWinnersArray = Object.values(groupedWinners)

  // Create a canvas element
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  // Calculate dynamic height based on number of winners
  const baseHeight = 400
  const winnerHeight = 140
  const totalHeight = Math.max(baseHeight + (groupedWinnersArray.length * winnerHeight), 600)
  
  canvas.width = 1200
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

  // Draw grouped winners with enhanced UI
  let yPosition = 280
  groupedWinnersArray.forEach((group: any, index) => {
    if (yPosition > canvas.height - 100) return

    // Winner card background with gradient
    const cardGradient = ctx.createLinearGradient(50, yPosition - 40, 50, yPosition + 80)
    cardGradient.addColorStop(0, '#1a1a1a')
    cardGradient.addColorStop(1, '#2a2a2a')
    ctx.fillStyle = cardGradient
    ctx.fillRect(50, yPosition - 40, canvas.width - 100, 120)

    // Winner card border with glow effect
    ctx.strokeStyle = '#ff69b4'
    ctx.lineWidth = 2
    ctx.strokeRect(50, yPosition - 40, canvas.width - 100, 120)

    // Winner number badge
    ctx.fillStyle = '#ff69b4'
    ctx.fillRect(60, yPosition - 35, 30, 25)
    ctx.fillStyle = '#000000'
    ctx.font = 'bold 16px monospace'
    ctx.textAlign = 'center'
    ctx.fillText(`${index + 1}`, 75, yPosition - 18)

    // Winner name with better styling
    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 20px monospace'
    ctx.textAlign = 'left'
    ctx.fillText(group.participantName, 100, yPosition - 10)

    // Ticket count badge
    ctx.fillStyle = '#a1a1aa'
    ctx.fillRect(100, yPosition + 5, 120, 20)
    ctx.fillStyle = '#000000'
    ctx.font = 'bold 12px monospace'
    ctx.fillText(`${group.totalTickets} tickets`, 110, yPosition + 18)

    // Prizes won section
    ctx.fillStyle = '#00ff88'
    ctx.font = 'bold 16px monospace'
    ctx.fillText('PRIZES WON:', 100, yPosition + 40)

    // List prizes with better styling
    let prizeY = yPosition + 60
    group.prizes.forEach((prize: any) => {
      ctx.fillStyle = '#a1a1aa'
      ctx.font = '14px monospace'
      const prizeText = prize.count > 1 ? `🏆 ${prize.name} x${prize.count}` : `🏆 ${prize.name}`
      ctx.fillText(prizeText, 120, prizeY)
      prizeY += 18
    })

    // UP Address with background
    const truncatedUp = group.participantUpAddress.length > 25 
      ? group.participantUpAddress.substring(0, 25) + '...'
      : group.participantUpAddress
    ctx.fillStyle = '#2a2a2a'
    ctx.fillRect(100, prizeY + 5, 300, 18)
    ctx.fillStyle = '#71717a'
    ctx.font = '12px monospace'
    ctx.fillText(`📍 UP: ${truncatedUp}`, 105, prizeY + 17)

    yPosition += 140
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
  ctx.fillText(`👥 Total Winners: ${groupedWinnersArray.length}`, canvas.width / 2, canvas.height - 25)

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
