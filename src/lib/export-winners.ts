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

  // Header section
  ctx.fillStyle = '#1a1a1a'
  ctx.fillRect(30, 30, canvas.width - 60, 150)

  // Title
  ctx.fillStyle = '#ff69b4'
  ctx.font = 'bold 42px monospace'
  ctx.textAlign = 'center'
  ctx.fillText('ARCHETYPE_00 // RAFFLE_RESULTS', canvas.width / 2, 80)

  // Raffle name
  ctx.fillStyle = '#ffffff'
  ctx.font = 'bold 32px monospace'
  ctx.fillText(winnerData.raffleName, canvas.width / 2, 120)

  // Status badge
  ctx.fillStyle = '#00ff88'
  ctx.font = 'bold 18px monospace'
  ctx.fillText('RAFFLE COMPLETED', canvas.width / 2, 150)

  // PERS branding
  ctx.fillStyle = '#a1a1aa'
  ctx.font = '16px monospace'
  ctx.fillText('Punkable Ethereal Raffle System (P.E.R.S.)', canvas.width / 2, 170)

  // Winners section header
  ctx.fillStyle = '#ff69b4'
  ctx.font = 'bold 28px monospace'
  ctx.textAlign = 'left'
  ctx.fillText('WINNERS:', 60, 220)

  // Draw grouped winners
  let yPosition = 280
  groupedWinnersArray.forEach((group: any, index) => {
    if (yPosition > canvas.height - 100) return

    // Winner card background
    ctx.fillStyle = '#1a1a1a'
    ctx.fillRect(50, yPosition - 40, canvas.width - 100, 120)

    // Winner card border
    ctx.strokeStyle = '#ff69b4'
    ctx.lineWidth = 2
    ctx.strokeRect(50, yPosition - 40, canvas.width - 100, 120)

    // Winner number and name
    ctx.fillStyle = '#ff69b4'
    ctx.font = 'bold 24px monospace'
    ctx.fillText(`${index + 1}.`, 70, yPosition)

    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 22px monospace'
    ctx.fillText(group.participantName, 120, yPosition)

    // Ticket count
    ctx.fillStyle = '#a1a1aa'
    ctx.font = '16px monospace'
    ctx.fillText(`${group.totalTickets} tickets`, 120, yPosition + 30)

    // Prizes won
    ctx.fillStyle = '#00ff88'
    ctx.font = 'bold 18px monospace'
    ctx.fillText('PRIZES WON:', 120, yPosition + 55)

    // List prizes
    let prizeY = yPosition + 80
    group.prizes.forEach((prize: any) => {
      ctx.fillStyle = '#a1a1aa'
      ctx.font = '16px monospace'
      const prizeText = prize.count > 1 ? `🏆 ${prize.name} x${prize.count}` : `🏆 ${prize.name}`
      ctx.fillText(prizeText, 140, prizeY)
      prizeY += 20
    })

    // UP Address (truncated)
    const truncatedUp = group.participantUpAddress.length > 30 
      ? group.participantUpAddress.substring(0, 30) + '...'
      : group.participantUpAddress
    ctx.fillStyle = '#71717a'
    ctx.font = '14px monospace'
    ctx.fillText(`📍 UP: ${truncatedUp}`, 120, prizeY + 10)

    yPosition += 140
  })

  // Footer
  ctx.fillStyle = '#71717a'
  ctx.font = '16px monospace'
  ctx.textAlign = 'center'
  ctx.fillText(`Exported on ${winnerData.exportDate} | Total Winners: ${groupedWinnersArray.length}`, canvas.width / 2, canvas.height - 30)

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
