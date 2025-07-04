import { Component, inject, type OnInit, signal, computed } from "@angular/core"
import { Router } from "@angular/router"
import { catchError } from "rxjs"
import { MatCardModule } from "@angular/material/card"
import { MatButtonModule } from "@angular/material/button"
import { MatIconModule } from "@angular/material/icon"
import { MatSelectModule } from "@angular/material/select"
import { MatFormFieldModule } from "@angular/material/form-field"
import { MatMenuModule } from "@angular/material/menu"
import { CurrencyPipe, DatePipe } from "@angular/common"
import { FormsModule } from "@angular/forms"
import { ExpenseService } from "../../services/expense.service"
import { EXPENSE_CATEGORIES } from "../../core/models/expense.model"

@Component({
  selector: "app-expenses",
  standalone: true,
  imports: [
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatFormFieldModule,
    MatMenuModule,
    CurrencyPipe,
    DatePipe,
    FormsModule,
  ],
  template: `
    <div class="expenses-container">
      <div class="header">
        <h1>Your Expenses</h1>
        <button mat-raised-button color="primary" (click)="addExpense()">
          <mat-icon>add</mat-icon>
          Add Expense
        </button>
      </div>
      
      <div class="filters">
        <mat-form-field appearance="outline">
          <mat-label>Filter by Category</mat-label>
          <mat-select [(value)]="selectedCategory" (selectionChange)="onFilterChange()">
            <mat-option value="">All Categories</mat-option>
            @for (category of categories; track category) {
              <mat-option [value]="category">{{ category }}</mat-option>
            }
          </mat-select>
        </mat-form-field>
        
        <mat-form-field appearance="outline">
          <mat-label>Sort by Amount</mat-label>
          <mat-select [(value)]="sortOrder" (selectionChange)="onSortChange()">
            <mat-option value="desc">Highest to Lowest</mat-option>
            <mat-option value="asc">Lowest to Highest</mat-option>
          </mat-select>
        </mat-form-field>
      </div>
      
      @if (filteredAndSortedExpenses().length > 0) {
        <div class="expenses-grid">
          @for (expense of filteredAndSortedExpenses(); track expense.id) {
            <mat-card class="expense-card">
              <mat-card-header>
                <mat-card-title>{{ expense.title }}</mat-card-title>
                <button mat-icon-button [matMenuTriggerFor]="menu">
                  <mat-icon>more_vert</mat-icon>
                </button>
                <mat-menu #menu="matMenu">
                  <button mat-menu-item (click)="editExpense(expense.id)">
                    <mat-icon>edit</mat-icon>
                    Edit
                  </button>
                  <button mat-menu-item (click)="deleteExpense(expense.id)" class="delete-button">
                    <mat-icon>delete</mat-icon>
                    Delete
                  </button>
                </mat-menu>
              </mat-card-header>
              
              <mat-card-content>
                <div class="expense-details">
                  <div class="amount">{{ expense.amount | currency }}</div>
                  <div class="category">
                    <mat-icon>{{ getCategoryIcon(expense.category) }}</mat-icon>
                    {{ expense.category }}
                  </div>
                  <div class="date">{{ expense.date | date:'fullDate' }}</div>
                  @if (expense.note) {
                    <div class="note">{{ expense.note }}</div>
                  }
                </div>
              </mat-card-content>
            </mat-card>
          }
        </div>
      } @else {
        <div class="no-expenses">
          <mat-icon class="no-expenses-icon">receipt</mat-icon>
          <h2>No expenses found</h2>
          <p>Start tracking your expenses by adding your first one!</p>
          <button mat-raised-button color="primary" (click)="addExpense()">
            <mat-icon>add</mat-icon>
            Add Your First Expense
          </button>
        </div>
      }
    </div>
  `,
  styles: [
    `
    .expenses-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }
    
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 30px;
    }
    
    .filters {
      display: flex;
      gap: 20px;
      margin-bottom: 30px;
      flex-wrap: wrap;
    }
    
    .filters mat-form-field {
      min-width: 200px;
    }
    
    .expenses-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 20px;
    }
    
    .expense-card {
      transition: transform 0.2s ease-in-out;
    }
    
    .expense-card:hover {
      transform: translateY(-2px);
    }
    
    mat-card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .expense-details {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    
    .amount {
      font-size: 24px;
      font-weight: bold;
      color: var(--mdc-theme-primary);
    }
    
    .category {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #666;
    }
    
    .date {
      color: #666;
      font-size: 14px;
    }
    
    .note {
      font-style: italic;
      color: #888;
      font-size: 14px;
    }
    
    .no-expenses {
      text-align: center;
      padding: 60px 20px;
      color: #666;
    }
    
    .no-expenses-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      margin-bottom: 16px;
      opacity: 0.5;
    }
    
    .delete-button {
      color: #f44336;
    }
  `,
  ],
})
export class ExpensesComponent implements OnInit {
  private expenseService = inject(ExpenseService)
  private router = inject(Router)

  categories = EXPENSE_CATEGORIES
  selectedCategory = signal<string>("")
  sortOrder = signal<"asc" | "desc">("desc")

  filteredAndSortedExpenses = computed(() => {
    let expenses = this.expenseService.expenses()

    // Filter category
    if (this.selectedCategory()) {
      expenses = expenses.filter((expense) => expense.category === this.selectedCategory())
    }

    // Sort 
    expenses = expenses.sort((a, b) => {
      return this.sortOrder() === "desc" ? b.amount - a.amount : a.amount - b.amount
    })

    return expenses
  })

  ngOnInit(): void {
    this.expenseService
      .getExpenses()
      .pipe(
        catchError((err) => {
          console.error("Error loading expenses:", err)
          throw err
        }),
      )
      .subscribe()
  }

  onFilterChange(): void {
    // Trigger computed signal update
  }

  onSortChange(): void {
    // Trigger computed signal update
  }

  addExpense(): void {
    this.router.navigate(["/expenses/add"])
  }

  editExpense(id: string): void {
    this.router.navigate(["/expenses/edit", id])
  }

  deleteExpense(id: string): void {
    if (confirm("Are you sure you want to delete this expense?")) {
      this.expenseService
        .deleteExpense(id)
        .pipe(
          catchError((err) => {
            console.error("Error deleting expense:", err)
            alert("Failed to delete expense. Please try again.")
            throw err
          }),
        )
        .subscribe()
    }
  }

  getCategoryIcon(category: string): string {
    const icons: Record<string, string> = {
      Food: "restaurant",
      Transport: "directions_car",
      Entertainment: "movie",
      Bills: "receipt_long",
    }
    return icons[category] || "receipt"
  }
}
