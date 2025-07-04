import { Component, inject } from "@angular/core"
import { Router, RouterModule, RouterOutlet } from "@angular/router"
import { MatToolbarModule } from "@angular/material/toolbar"
import { MatButtonModule } from "@angular/material/button"
import { MatIconModule } from "@angular/material/icon"
import { MatMenuModule } from "@angular/material/menu"
import { AuthService } from "./services/auth.service"

@Component({
  selector: "app-root",
  standalone: true,
  imports: [RouterModule, RouterOutlet, MatToolbarModule, MatButtonModule, MatIconModule, MatMenuModule],
  template: `
    <mat-toolbar color="primary">
      <span>Expense Tracker</span>
      
      <div class="nav-buttons">
        <button mat-button routerLink="/dashboard">
          <mat-icon>dashboard</mat-icon>
          Dashboard
        </button>
        <button mat-button routerLink="/expenses">
          <mat-icon>receipt</mat-icon>
          Expenses
        </button>
      </div>
      
      <span class="spacer"></span>
      
      @if (authService.user(); as user) {
        <button mat-button [matMenuTriggerFor]="userMenu">
          <mat-icon>person</mat-icon>
          {{ user.name }}
        </button>
        <mat-menu #userMenu="matMenu">
          <button mat-menu-item (click)="logout()">
            <mat-icon>logout</mat-icon>
            Logout
          </button>
        </mat-menu>
      } @else {
        <button mat-button routerLink="/login">
          <mat-icon>login</mat-icon>
          Login
        </button>
      }
    </mat-toolbar>
    
    <main class="main-content">
      <router-outlet />
    </main>
  `,
  styles: [
    `
    .nav-buttons {
      display: flex;
      gap: 8px;
      margin-left: 16px;
    }
    
    .spacer {
      flex: 1 1 auto;
    }
    
    .main-content {
      padding: 20px;
      max-width: 1200px;
      margin: 0 auto;
    }
  `,
  ],
})
export class AppComponent {
  authService = inject(AuthService)
  private router = inject(Router)

  logout(): void {
    this.authService.logout()
    this.router.navigate(["/login"])
  }
}
