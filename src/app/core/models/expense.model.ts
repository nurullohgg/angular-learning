export interface Expense {
  id: string
  title: string
  amount: number
  category: string
  date: string 
  note?: string
}

export type ExpenseCategory = "Food" | "Transport" | "Entertainment" | "Bills"

export const EXPENSE_CATEGORIES: ExpenseCategory[] = ["Food", "Transport", "Entertainment", "Bills"]
