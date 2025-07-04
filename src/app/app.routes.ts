import type { Routes } from "@angular/router"
import { DashboardComponent } from "./components/dashboard/dashboard.component"
import { ExpensesComponent } from "./components/expenses/expenses.component"
import { ExpenseFormComponent } from "./components/expense-form/expense-form.component"
import { LoginComponent } from "./components/login/login.component"

export const routes: Routes = [
  { path: "", redirectTo: "/dashboard", pathMatch: "full" },
  { path: "dashboard", component: DashboardComponent },
  { path: "expenses", component: ExpensesComponent },
  { path: "expenses/add", component: ExpenseFormComponent },
  { path: "expenses/edit/:id", component: ExpenseFormComponent },
  { path: "login", component: LoginComponent },
  { path: "**", redirectTo: "/dashboard" },
]
