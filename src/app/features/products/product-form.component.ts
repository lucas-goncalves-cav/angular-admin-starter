import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Product, ProductPayload } from '../../core/models';
import { ModalComponent } from '../../shared/components/modal.component';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [ReactiveFormsModule, ModalComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-modal [title]="product() ? 'Edit product' : 'New product'" (closed)="cancelled.emit()">
      <form class="space-y-4" [formGroup]="form" (ngSubmit)="submit()">
        <div>
          <label class="form-label" for="productName">Name</label>
          <input id="productName" class="form-input" formControlName="name" />
          @if (invalid('name')) {
            <p class="form-error">Name is required.</p>
          }
        </div>

        <div>
          <label class="form-label" for="productCategory">Category</label>
          <select id="productCategory" class="form-input" formControlName="category">
            @for (category of categories(); track category) {
              <option [value]="category">{{ category }}</option>
            }
          </select>
        </div>

        <div class="grid gap-4 sm:grid-cols-2">
          <div>
            <label class="form-label" for="price">Price</label>
            <input id="price" type="number" step="0.01" min="0.01" class="form-input" formControlName="price" />
            @if (invalid('price')) {
              <p class="form-error">Price must be greater than zero.</p>
            }
          </div>

          <div>
            <label class="form-label" for="stock">Stock</label>
            <input id="stock" type="number" min="0" class="form-input" formControlName="stock" />
            @if (invalid('stock')) {
              <p class="form-error">Stock cannot be negative.</p>
            }
          </div>
        </div>

        <label class="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
          <input type="checkbox" formControlName="active" class="h-4 w-4 rounded border-slate-300 text-brand-600" />
          Active
        </label>

        <div class="flex justify-end gap-2 pt-2">
          <button type="button" class="btn-secondary" (click)="cancelled.emit()">Cancel</button>
          <button type="submit" class="btn-primary" [disabled]="saving()">Save</button>
        </div>
      </form>
    </app-modal>
  `
})
export class ProductFormComponent {
  private readonly formBuilder = inject(FormBuilder);

  readonly product = input<Product | null>(null);
  readonly categories = input<string[]>([]);
  readonly saving = input(false);
  readonly saved = output<ProductPayload>();
  readonly cancelled = output<void>();

  readonly form = this.formBuilder.nonNullable.group({
    name: ['', Validators.required],
    category: ['', Validators.required],
    price: [0, [Validators.required, Validators.min(0.01)]],
    stock: [0, [Validators.required, Validators.min(0)]],
    active: [true]
  });

  constructor() {
    queueMicrotask(() => {
      const current = this.product();

      this.form.patchValue(
        current
          ? {
              name: current.name,
              category: current.category,
              price: current.price,
              stock: current.stock,
              active: current.active
            }
          : { category: this.categories()[0] ?? '' }
      );
    });
  }

  invalid(control: 'name' | 'price' | 'stock'): boolean {
    const field = this.form.controls[control];

    return field.invalid && (field.dirty || field.touched);
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();

      return;
    }

    this.saved.emit(this.form.getRawValue());
  }
}
