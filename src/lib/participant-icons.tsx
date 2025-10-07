// Participant icon utilities using emojis for better compatibility
const PARTICIPANT_ICONS = [
  "👤", "🎭", "🎪", "🎨", "🎯", "🎲", "🎸", "🎺", "🎻", "🎹", 
  "🎵", "🎶", "👑", "⭐", "❤️", "😊", "⚡", "🏆", "🎯", "🔥", 
  "✨", "💎", "💍", "🛡️", "⚔️", "🪄", "🚀", "⚡", "👥", "❌"
]

// Generate a stable hash from a string
function simpleHash(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash // Convert to 32-bit integer
  }
  return Math.abs(hash)
}

// Get icon for participant based on their ID or name
export function getParticipantIcon(participantId: string, participantName: string) {
  // Use ID if available, fallback to name for consistent icon assignment
  const identifier = participantId || participantName
  const hash = simpleHash(identifier)
  const iconIndex = hash % PARTICIPANT_ICONS.length
  return PARTICIPANT_ICONS[iconIndex]
}

// Get icon component as JSX element
export function ParticipantIcon({
  participantId,
  participantName,
  className = "w-4 h-4",
}: {
  participantId: string
  participantName: string
  className?: string
}) {
  const icon = getParticipantIcon(participantId, participantName)
  return <span className={className}>{icon}</span>
}
