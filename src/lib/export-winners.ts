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
  }>
  exportDate: string
  totalWinners: number
}

export function exportWinnersAsImage(winnerData: WinnerExport): void {
  // Create a canvas element
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  // Set canvas size
  canvas.width = 800
  canvas.height = 600

  // Background
  ctx.fillStyle = '#0a0a0a'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  // Title
  ctx.fillStyle = '#ffffff'
  ctx.font = 'bold 32px monospace'
  ctx.textAlign = 'center'
  ctx.fillText('RAFFLE RESULTS', canvas.width / 2, 60)

  // Raffle name
  ctx.fillStyle = '#ff69b4'
  ctx.font = 'bold 24px monospace'
  ctx.fillText(winnerData.raffleName, canvas.width / 2, 100)

  // Raffle description
  if (winnerData.raffleDescription) {
    ctx.fillStyle = '#a1a1aa'
    ctx.font = '16px monospace'
    ctx.fillText(winnerData.raffleDescription, canvas.width / 2, 130)
  }

  // Winners section
  ctx.fillStyle = '#ffffff'
  ctx.font = 'bold 20px monospace'
  ctx.textAlign = 'left'
  ctx.fillText('WINNERS:', 50, 180)

  // Draw winners
  let yPosition = 220
  winnerData.winners.forEach((winner, index) => {
    if (yPosition > 500) return // Prevent overflow

    // Winner number
    ctx.fillStyle = '#ff69b4'
    ctx.font = 'bold 16px monospace'
    ctx.fillText(`${index + 1}.`, 50, yPosition)

    // Winner name
    ctx.fillStyle = '#ffffff'
    ctx.font = '16px monospace'
    ctx.fillText(winner.participantName, 80, yPosition)

    // Prize name
    ctx.fillStyle = '#a1a1aa'
    ctx.font = '14px monospace'
    ctx.fillText(`Prize: ${winner.prizeName}`, 80, yPosition + 20)

    // UP Address (truncated)
    const truncatedUp = winner.participantUpAddress.length > 20 
      ? winner.participantUpAddress.substring(0, 20) + '...'
      : winner.participantUpAddress
    ctx.fillStyle = '#71717a'
    ctx.font = '12px monospace'
    ctx.fillText(`UP: ${truncatedUp}`, 80, yPosition + 40)

    yPosition += 80
  })

  // Footer
  ctx.fillStyle = '#71717a'
  ctx.font = '12px monospace'
  ctx.textAlign = 'center'
  ctx.fillText(`Exported on ${winnerData.exportDate}`, canvas.width / 2, 580)

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
