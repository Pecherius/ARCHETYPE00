// Prize storage service for managing saved prizes
export interface SavedPrize {
  id: string
  name: string
  description: string
  count: number
  image: string
  created_at: string
  last_used: string
  use_count: number
}

const STORAGE_KEY = "punkable_saved_prizes"

class PrizeStorageService {
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
    return `prize_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  // Get all saved prizes
  getAllPrizes(): SavedPrize[] {
    return this.getFromStorage<SavedPrize[]>(STORAGE_KEY, [])
  }

  // Save a new prize
  savePrize(name: string, description: string, count: number, image: string): SavedPrize {
    const prizes = this.getAllPrizes()
    const now = new Date().toISOString()
    
    const newPrize: SavedPrize = {
      id: this.generateId(),
      name: name.trim(),
      description: description.trim(),
      count,
      image: image.trim(),
      created_at: now,
      last_used: now,
      use_count: 1
    }

    prizes.push(newPrize)
    this.setToStorage(STORAGE_KEY, prizes)
    return newPrize
  }

  // Update prize usage (when they're added to a raffle)
  updatePrizeUsage(prizeId: string): void {
    const prizes = this.getAllPrizes()
    const prizeIndex = prizes.findIndex(prize => prize.id === prizeId)
    
    if (prizeIndex !== -1) {
      prizes[prizeIndex].last_used = new Date().toISOString()
      prizes[prizeIndex].use_count += 1
      this.setToStorage(STORAGE_KEY, prizes)
    }
  }

  // Delete a prize
  deletePrize(prizeId: string): boolean {
    const prizes = this.getAllPrizes()
    const filteredPrizes = prizes.filter(prize => prize.id !== prizeId)
    
    if (filteredPrizes.length === prizes.length) return false
    
    this.setToStorage(STORAGE_KEY, filteredPrizes)
    return true
  }

  // Get most used prizes (for quick access)
  getMostUsedPrizes(limit: number = 10): SavedPrize[] {
    const prizes = this.getAllPrizes()
    return prizes
      .sort((a, b) => b.use_count - a.use_count)
      .slice(0, limit)
  }

  // Get recently used prizes
  getRecentlyUsedPrizes(limit: number = 10): SavedPrize[] {
    const prizes = this.getAllPrizes()
    return prizes
      .sort((a, b) => new Date(b.last_used).getTime() - new Date(a.last_used).getTime())
      .slice(0, limit)
  }

  // Clear all saved prizes
  clearAllPrizes(): void {
    if (!this.isClient()) return
    localStorage.removeItem(STORAGE_KEY)
  }
}

export const prizeStorageService = new PrizeStorageService()
