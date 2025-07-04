import { Injectable, inject, signal } from "@angular/core"
import { HttpClient } from "@angular/common/http"
import { type Observable, tap } from "rxjs"
import { Expense } from "../core/models/expense.model"

@Injectable({
  providedIn: "root",
})
export class ExpenseService {
  private readonly API_URL = "https://expense-json-api.onrender.com/expenses"
  private http = inject(HttpClient)

  expenses = signal<Expense[]>([])

  getExpenses(): Observable<Expense[]> {
    return this.http.get<Expense[]>(this.API_URL).pipe(tap((expenses) => this.expenses.set(expenses)))
  }

  getExpenseById(id: string): Observable<Expense> {
    return this.http.get<Expense>(`${this.API_URL}/${id}`)
  }

  addExpense(expense: Omit<Expense, "id">): Observable<Expense> {
    const newExpense = {
      ...expense,
      id: this.generateId(),
    }
    return this.http.post<Expense>(this.API_URL, newExpense).pipe(tap(() => this.refreshExpenses()))
  }

  updateExpense(id: string, expense: Omit<Expense, "id">): Observable<Expense> {
    return this.http.put<Expense>(`${this.API_URL}/${id}`, { ...expense, id }).pipe(tap(() => this.refreshExpenses()))
  }

  deleteExpense(id: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`).pipe(tap(() => this.refreshExpenses()))
  }

  private refreshExpenses(): void {
    this.getExpenses().subscribe()
  }

  private generateId(): string {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9)
  }
}
