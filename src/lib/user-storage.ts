// User storage service for managing saved users with UP addresses
export interface SavedUser {
  id: string
  name: string
  up_address: string
  color: string
  created_at: string
  last_used: string
  use_count: number
}

const STORAGE_KEY = "punkable_saved_users"

class UserStorageService {
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
    return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  // Get all saved users
  getAllUsers(): SavedUser[] {
    return this.getFromStorage<SavedUser[]>(STORAGE_KEY, [])
  }

  // Save a new user
  saveUser(name: string, up_address: string, color: string): SavedUser {
    const users = this.getAllUsers()
    const now = new Date().toISOString()
    
    const newUser: SavedUser = {
      id: this.generateId(),
      name: name.trim(),
      up_address: up_address.trim(),
      color,
      created_at: now,
      last_used: now,
      use_count: 1
    }

    users.push(newUser)
    this.setToStorage(STORAGE_KEY, users)
    return newUser
  }

  // Update user usage (when they're added to a raffle)
  updateUserUsage(userId: string): void {
    const users = this.getAllUsers()
    const userIndex = users.findIndex(user => user.id === userId)
    
    if (userIndex !== -1) {
      users[userIndex].last_used = new Date().toISOString()
      users[userIndex].use_count += 1
      this.setToStorage(STORAGE_KEY, users)
    }
  }

  // Delete a user
  deleteUser(userId: string): boolean {
    const users = this.getAllUsers()
    const filteredUsers = users.filter(user => user.id !== userId)
    
    if (filteredUsers.length === users.length) return false
    
    this.setToStorage(STORAGE_KEY, filteredUsers)
    return true
  }

  // Get user by UP address
  getUserByUpAddress(upAddress: string): SavedUser | null {
    const users = this.getAllUsers()
    return users.find(user => 
      user.up_address.toLowerCase() === upAddress.toLowerCase()
    ) || null
  }

  // Get user by name
  getUserByName(name: string): SavedUser | null {
    const users = this.getAllUsers()
    return users.find(user => 
      user.name.toLowerCase() === name.toLowerCase()
    ) || null
  }

  // Get most used users (for quick access)
  getMostUsedUsers(limit: number = 10): SavedUser[] {
    const users = this.getAllUsers()
    return users
      .sort((a, b) => b.use_count - a.use_count)
      .slice(0, limit)
  }

  // Get recently used users
  getRecentlyUsedUsers(limit: number = 10): SavedUser[] {
    const users = this.getAllUsers()
    return users
      .sort((a, b) => new Date(b.last_used).getTime() - new Date(a.last_used).getTime())
      .slice(0, limit)
  }

  // Check if user exists by name or UP address
  userExists(name: string, upAddress: string): { exists: boolean; user?: SavedUser } {
    const users = this.getAllUsers()
    const existingUser = users.find(user => 
      user.name.toLowerCase() === name.toLowerCase() || 
      user.up_address.toLowerCase() === upAddress.toLowerCase()
    )
    
    return {
      exists: !!existingUser,
      user: existingUser
    }
  }

  // Clear all saved users
  clearAllUsers(): void {
    if (!this.isClient()) return
    localStorage.removeItem(STORAGE_KEY)
  }

  // Export users data
  exportUsers(): string {
    const users = this.getAllUsers()
    const data = {
      users,
      exportedAt: new Date().toISOString(),
      version: "1.0"
    }
    return JSON.stringify(data, null, 2)
  }

  // Import users data
  importUsers(jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData)
      if (data.users && Array.isArray(data.users)) {
        this.setToStorage(STORAGE_KEY, data.users)
        return true
      }
      return false
    } catch (error) {
      console.error("Error importing users:", error)
      return false
    }
  }
}

export const userStorageService = new UserStorageService()
