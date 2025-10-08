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
  // Find the complete results section - try multiple selectors
  let resultsSection = document.querySelector('[data-section="results"]') as HTMLElement
  
  if (!resultsSection) {
    // Try finding the results view container
    resultsSection = document.querySelector('.results-view') as HTMLElement
  }
  
  if (!resultsSection) {
    // Try finding by text content - look for "RAFFLE_RESULTS"
    const sections = document.querySelectorAll('div')
    for (const section of sections) {
      if (section.textContent?.includes('RAFFLE_RESULTS') && section.textContent?.includes('EXPORT_WINNERS_IMAGE')) {
        resultsSection = section as HTMLElement
        break
      }
    }
  }
  
  if (!resultsSection) {
    console.error('Results section not found, using fallback')
    createManualCanvas(winnerData)
    return
  }

  console.log('Found results section:', resultsSection)

  // Use html2canvas to capture the actual element
  import('html2canvas').then((html2canvas) => {
    html2canvas.default(resultsSection, {
      backgroundColor: '#0a0a0a', // Dark background
      scale: 2, // Higher resolution
      useCORS: true,
      allowTaint: true,
      width: resultsSection.offsetWidth,
      height: resultsSection.offsetHeight,
      logging: true // Enable logging for debugging
    }).then((canvas) => {
      console.log('Canvas created successfully:', canvas)
      // Convert to image and download
      canvas.toBlob((blob) => {
        if (!blob) {
          console.error('Failed to create blob from canvas')
          createManualCanvas(winnerData)
          return
        }
        
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `raffle-${winnerData.raffleName.replace(/[^a-zA-Z0-9]/g, '-')}-winners-${new Date().toISOString().split('T')[0]}.png`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
        console.log('Image exported successfully')
      })
    }).catch((error) => {
      console.error('Error capturing winners section:', error)
      // Fallback to manual canvas if html2canvas fails
      createManualCanvas(winnerData)
    })
  }).catch((error) => {
    console.error('Error loading html2canvas:', error)
    // Fallback to manual canvas if html2canvas is not available
    createManualCanvas(winnerData)
  })
}

function createManualCanvas(winnerData: WinnerExport): void {
  // Create a canvas element
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  // Set canvas size - larger for better quality
  canvas.width = 1000
  canvas.height = 800

  // Background with gradient like the actual component
  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
  gradient.addColorStop(0, '#0a0a0a')
  gradient.addColorStop(1, '#1a1a1a')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  // Border
  ctx.strokeStyle = '#ff69b4'
  ctx.lineWidth = 4
  ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40)

  // Header background
  ctx.fillStyle = '#1a1a1a'
  ctx.fillRect(30, 30, canvas.width - 60, 120)

  // Title with gradient effect
  ctx.fillStyle = '#ff69b4'
  ctx.font = 'bold 36px monospace'
  ctx.textAlign = 'center'
  ctx.fillText('ARCHETYPE_00 // RAFFLE_RESULTS', canvas.width / 2, 70)

  // Raffle name
  ctx.fillStyle = '#ffffff'
  ctx.font = 'bold 28px monospace'
  ctx.fillText(winnerData.raffleName, canvas.width / 2, 110)

  // Raffle description
  if (winnerData.raffleDescription) {
    ctx.fillStyle = '#a1a1aa'
    ctx.font = '18px monospace'
    ctx.fillText(winnerData.raffleDescription, canvas.width / 2, 140)
  }

  // Winners section header
  ctx.fillStyle = '#ff69b4'
  ctx.font = 'bold 24px monospace'
  ctx.textAlign = 'left'
  ctx.fillText('WINNERS:', 60, 200)

  // Draw winners with better styling
  let yPosition = 250
  winnerData.winners.forEach((winner, index) => {
    if (yPosition > 700) return // Prevent overflow

    // Winner card background
    ctx.fillStyle = '#1a1a1a'
    ctx.fillRect(50, yPosition - 30, canvas.width - 100, 100)

    // Winner card border
    ctx.strokeStyle = '#ff69b4'
    ctx.lineWidth = 2
    ctx.strokeRect(50, yPosition - 30, canvas.width - 100, 100)

    // Winner number
    ctx.fillStyle = '#ff69b4'
    ctx.font = 'bold 20px monospace'
    ctx.fillText(`${index + 1}.`, 70, yPosition)

    // Winner name
    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 18px monospace'
    ctx.fillText(winner.participantName, 100, yPosition)

    // Prize name with icon
    ctx.fillStyle = '#a1a1aa'
    ctx.font = '16px monospace'
    ctx.fillText(`🏆 Prize: ${winner.prizeName}`, 100, yPosition + 25)

    // UP Address (truncated)
    const truncatedUp = winner.participantUpAddress.length > 25 
      ? winner.participantUpAddress.substring(0, 25) + '...'
      : winner.participantUpAddress
    ctx.fillStyle = '#71717a'
    ctx.font = '14px monospace'
    ctx.fillText(`📍 UP: ${truncatedUp}`, 100, yPosition + 50)

    // Selected at time
    ctx.fillStyle = '#71717a'
    ctx.font = '12px monospace'
    ctx.fillText(`⏰ ${winner.selectedAt}`, 100, yPosition + 70)

    yPosition += 120
  })

  // Footer
  ctx.fillStyle = '#71717a'
  ctx.font = '14px monospace'
  ctx.textAlign = 'center'
  ctx.fillText(`Exported on ${winnerData.exportDate} | Total Winners: ${winnerData.totalWinners}`, canvas.width / 2, 760)

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
