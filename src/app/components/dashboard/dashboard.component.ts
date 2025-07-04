import { Component, inject, type OnInit, computed } from "@angular/core"
import { catchError } from "rxjs"
import { MatCardModule } from "@angular/material/card"
import { MatIconModule } from "@angular/material/icon"
import { MatButtonModule } from "@angular/material/button"
import { RouterLink } from "@angular/router"
import { CurrencyPipe, DatePipe } from "@angular/common"
import { ExpenseService } from "../../services/expense.service"
import { AuthService } from "../../services/auth.service"

@Component({
  selector: "app-dashboard",
  standalone: true,
  imports: [MatCardModule, MatIconModule, MatButtonModule, RouterLink, CurrencyPipe, DatePipe],
  template: `
    <div class="dashboard-container">
      <div class="welcome-section">
        @if (authService.user(); as user) {
          <h1>Welcome back, {{ user.name }}!</h1>
        } @else {
          <h1>Welcome to Expense Tracker!</h1>
        }
      </div>
      
      <div class="stats-grid">
        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-content">
              <mat-icon class="stat-icon">account_balance_wallet</mat-icon>
              <div class="stat-info">
                <h3>Total Expenses This Month</h3>
                <p class="stat-value">{{ monthlyTotal() | currency }}</p>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
        
        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-content">
              <mat-icon class="stat-icon">receipt</mat-icon>
              <div class="stat-info">
                <h3>Total Expenses</h3>
                <p class="stat-value">{{ totalExpenses() | currency }}</p>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
        
        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-content">
              <mat-icon class="stat-icon">trending_up</mat-icon>
              <div class="stat-info">
                <h3>Number of Expenses</h3>
                <p class="stat-value">{{ expenseService.expenses().length }}</p>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>
      
      <div class="recent-expenses">
        <mat-card>
          <mat-card-header>
            <mat-card-title>Recent Expenses</mat-card-title>
            <button mat-button routerLink="/expenses" color="primary">
              View All
            </button>
          </mat-card-header>
          <mat-card-content>
            @if (recentExpenses().length > 0) {
              <div class="expense-list">
                @for (expense of recentExpenses(); track expense.id) {
                  <div class="expense-item">
                    <div class="expense-info">
                      <h4>{{ expense.title }}</h4>
                      <p>{{ expense.category }} • {{ expense.date | date:'shortDate' }}</p>
                    </div>
                    <div class="expense-amount">
                      {{ expense.amount | currency }}
                    </div>
                  </div>
                }
              </div>
            } @else {
              <p class="no-expenses">No expenses yet. <a routerLink="/expenses/add">Add your first expense</a></p>
            }
          </mat-card-content>
        </mat-card>
      </div>
      
      <div class="quick-actions">
        <button mat-fab color="primary" routerLink="/expenses/add" class="fab">
          <mat-icon>add</mat-icon>
        </button>
      </div>
    </div>
  `,
  styles: [
    `
    .dashboard-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }
    
    .welcome-section {
      margin-bottom: 30px;
    }
    
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }
    
    .stat-card {
      height: 120px;
    }
    
    .stat-content {
      display: flex;
      align-items: center;
      gap: 16px;
      height: 100%;
    }
    
    .stat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      color: var(--mdc-theme-primary);
    }
    
    .stat-info h3 {
      margin: 0 0 8px 0;
      font-size: 14px;
      color: #666;
    }
    
    .stat-value {
      margin: 0;
      font-size: 24px;
      font-weight: bold;
      color: var(--mdc-theme-primary);
    }
    
    .recent-expenses {
      margin-bottom: 30px;
    }
    
    mat-card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .expense-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    
    .expense-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
    }
    
    .expense-info h4 {
      margin: 0 0 4px 0;
    }
    
    .expense-info p {
      margin: 0;
      color: #666;
      font-size: 14px;
    }
    
    .expense-amount {
      font-weight: bold;
      color: var(--mdc-theme-primary);
    }
    
    .no-expenses {
      text-align: center;
      color: #666;
      padding: 20px;
    }
    
    .quick-actions {
      position: fixed;
      bottom: 20px;
      right: 20px;
    }
    
    .fab {
      box-shadow: 0 4px 8px rgba(0,0,0,0.2);
    }
  `,
  ],
})
export class DashboardComponent implements OnInit {
  expenseService = inject(ExpenseService)
  authService = inject(AuthService)

  monthlyTotal = computed(() => {
    const currentMonth = new Date().getMonth()
    const currentYear = new Date().getFullYear()

    return this.expenseService
      .expenses()
      .filter((expense) => {
        const expenseDate = new Date(expense.date)
        return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear
      })
      .reduce((total, expense) => total + expense.amount, 0)
  })

  totalExpenses = computed(() => {
    return this.expenseService.expenses().reduce((total, expense) => total + expense.amount, 0)
  })

  recentExpenses = computed(() => {
    return this.expenseService
      .expenses()
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5)
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
}
