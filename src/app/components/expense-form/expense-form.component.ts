import { Component, inject, type OnInit, signal } from "@angular/core"
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms"
import { Router, ActivatedRoute } from "@angular/router"
import { catchError } from "rxjs"
import { MatCardModule } from "@angular/material/card"
import { MatFormFieldModule } from "@angular/material/form-field"
import { MatInputModule } from "@angular/material/input"
import { MatSelectModule } from "@angular/material/select"
import { MatButtonModule } from "@angular/material/button"
import { MatIconModule } from "@angular/material/icon"
import { MatDatepickerModule } from "@angular/material/datepicker"
import { MatNativeDateModule } from "@angular/material/core"
import { ExpenseService } from "../../services/expense.service"
import { EXPENSE_CATEGORIES } from "../../core/models/expense.model"

@Component({
  selector: "app-expense-form",
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule,
  ],
  template: `
    <div class="form-container">
      <mat-card class="form-card">
        <mat-card-header>
          <mat-card-title>
            <mat-icon>{{ isEditMode() ? 'edit' : 'add' }}</mat-icon>
            {{ isEditMode() ? 'Edit Expense' : 'Add New Expense' }}
          </mat-card-title>
        </mat-card-header>
        
        <mat-card-content>
          <form [formGroup]="form" (ngSubmit)="submit()">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Title</mat-label>
              <input matInput formControlName="title" placeholder="Enter expense title">
              @if (form.get('title')?.hasError('required') && form.get('title')?.touched) {
                <mat-error>Title is required</mat-error>
              }
            </mat-form-field>
            
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Amount</mat-label>
              <input matInput type="number" formControlName="amount" placeholder="0.00" step="0.01">
              @if (form.get('amount')?.hasError('required') && form.get('amount')?.touched) {
                <mat-error>Amount is required</mat-error>
              }
              @if (form.get('amount')?.hasError('min') && form.get('amount')?.touched) {
                <mat-error>Amount must be greater than 0</mat-error>
              }
            </mat-form-field>
            
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Category</mat-label>
              <mat-select formControlName="category">
                @for (category of categories; track category) {
                  <mat-option [value]="category">
                    <mat-icon>{{ getCategoryIcon(category) }}</mat-icon>
                    {{ category }}
                  </mat-option>
                }
              </mat-select>
              @if (form.get('category')?.hasError('required') && form.get('category')?.touched) {
                <mat-error>Category is required</mat-error>
              }
            </mat-form-field>
            
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Date</mat-label>
              <input matInput [matDatepicker]="picker" formControlName="date">
              <mat-datepicker-toggle matIconSuffix [for]="picker"></mat-datepicker-toggle>
              <mat-datepicker #picker></mat-datepicker>
              @if (form.get('date')?.hasError('required') && form.get('date')?.touched) {
                <mat-error>Date is required</mat-error>
              }
            </mat-form-field>
            
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Note (Optional)</mat-label>
              <textarea matInput formControlName="note" rows="3" placeholder="Add a note about this expense"></textarea>
            </mat-form-field>
            
            <div class="form-actions">
              <button mat-button type="button" (click)="cancel()">
                <mat-icon>cancel</mat-icon>
                Cancel
              </button>
              <button mat-raised-button color="primary" type="submit" [disabled]="form.invalid || isSubmitting()">
                <mat-icon>{{ isEditMode() ? 'save' : 'add' }}</mat-icon>
                {{ isSubmitting() ? 'Saving...' : (isEditMode() ? 'Update Expense' : 'Add Expense') }}
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [
    `
    .form-container {
      display: flex;
      justify-content: center;
      padding: 20px;
    }
    
    .form-card {
      width: 100%;
      max-width: 600px;
    }
    
    .full-width {
      width: 100%;
      margin-bottom: 16px;
    }
    
    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      margin-top: 20px;
    }
    
    mat-card-title {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    mat-option {
      display: flex;
      align-items: center;
      gap: 8px;
    }
  `,
  ],
})
export class ExpenseFormComponent implements OnInit {
  private expenseService = inject(ExpenseService)
  private router = inject(Router)
  private route = inject(ActivatedRoute)

  categories = EXPENSE_CATEGORIES
  isEditMode = signal(false)
  isSubmitting = signal(false)
  expenseId = signal<string | null>(null)

  form = new FormGroup({
    title: new FormControl("", [Validators.required]),
    amount: new FormControl<number | null>(null, [Validators.required, Validators.min(0.01)]),
    category: new FormControl("", [Validators.required]),
    date: new FormControl<Date | null>(new Date(), [Validators.required]),
    note: new FormControl(""),
  })

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get("id")
    if (id) {
      this.isEditMode.set(true)
      this.expenseId.set(id)
      this.loadExpense(id)
    }
  }

  private loadExpense(id: string): void {
    this.expenseService
      .getExpenseById(id)
      .pipe(
        catchError((err) => {
          console.error("Error loading expense:", err)
          alert("Failed to load expense. Redirecting to expenses list.")
          this.router.navigate(["/expenses"])
          throw err
        }),
      )
      .subscribe((expense) => {
        this.form.patchValue({
          title: expense.title,
          amount: expense.amount,
          category: expense.category,
          date: new Date(expense.date),
          note: expense.note || "",
        })
      })
  }

  submit(): void {
    if (this.form.valid) {
      this.isSubmitting.set(true)

      const formValue = this.form.value
      const expenseData = {
        title: formValue.title!,
        amount: formValue.amount!,
        category: formValue.category!,
        date: formValue.date!.toISOString().split("T")[0], // Convert to YYYY-MM-DD format
        note: formValue.note || undefined,
      }

      const operation = this.isEditMode()
        ? this.expenseService.updateExpense(this.expenseId()!, expenseData)
        : this.expenseService.addExpense(expenseData)

      operation
        .pipe(
          catchError((err) => {
            console.error("Error saving expense:", err)
            alert("Failed to save expense. Please try again.")
            this.isSubmitting.set(false)
            throw err
          }),
        )
        .subscribe(() => {
          this.isSubmitting.set(false)
          this.router.navigate(["/expenses"])
        })
    }
  }

  cancel(): void {
    this.router.navigate(["/expenses"])
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
