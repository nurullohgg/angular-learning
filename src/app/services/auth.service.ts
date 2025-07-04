import { Injectable, signal } from "@angular/core"
import { User } from "../core/models/user.interface"

@Injectable({
  providedIn: "root",
})
export class AuthService {
  private readonly STORAGE_KEY = "expense-tracker-user"

  user = signal<User | null>(null)

  constructor() {
    this.loadUserFromStorage()
  }

  login(name: string): void {
    const user: User = { name }
    this.user.set(user)
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(user))
  }

  logout(): void {
    this.user.set(null)
    localStorage.removeItem(this.STORAGE_KEY)
  }

  private loadUserFromStorage(): void {
    const stored = localStorage.getItem(this.STORAGE_KEY)
    if (stored) {
      try {
        const user = JSON.parse(stored) as User
        this.user.set(user)
      } catch (error) {
        console.error("Error parsing stored user:", error)
        localStorage.removeItem(this.STORAGE_KEY)
      }
    }
  }
}
