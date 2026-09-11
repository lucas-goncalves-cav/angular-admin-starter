import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { PagedResult, Product, ProductPayload, TableColumn } from '../../core/models';
import { ProductService } from '../../core/services/product.service';
import { ToastService } from '../../core/services/toast.service';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog.component';
import { DataTableComponent, SortState } from '../../shared/components/data-table.component';
import { IconComponent } from '../../shared/components/icon.component';
import { PageHeaderComponent } from '../../shared/components/page-header.component';
import { PaginationComponent } from '../../shared/components/pagination.component';
import { ProductFormComponent } from './product-form.component';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    PageHeaderComponent,
    DataTableComponent,
    PaginationComponent,
    ConfirmDialogComponent,
    ProductFormComponent,
    IconComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-header
      title="Products"
      description="Catalog of products available in the store."
      [breadcrumbs]="[{ label: 'Home', route: '/dashboard' }, { label: 'Products' }]"
    >
      <button type="button" class="btn-primary" (click)="openCreate()">
        <app-icon name="plus" [size]="16" />
        New product
      </button>
    </app-page-header>

    <div class="card">
      <div class="flex flex-col gap-3 border-b border-slate-200 p-4 sm:flex-row dark:border-slate-800">
        <div class="relative flex-1">
          <span class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            <app-icon name="search" [size]="16" />
          </span>
          <input class="form-input pl-9" placeholder="Search by name" [formControl]="search" />
        </div>

        <select class="form-input sm:w-48" [formControl]="category">
          <option value="">All categories</option>
          @for (option of categories(); track option) {
            <option [value]="option">{{ option }}</option>
          }
        </select>

        <select class="form-input sm:w-40" [formControl]="status">
          <option value="">All statuses</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>
      </div>

      <app-data-table
        [columns]="columns"
        [rows]="result().items"
        [loading]="loading()"
        [sort]="sort()"
        (sortChange)="changeSort($event)"
        emptyTitle="No products found"
        emptyDescription="Adjust the filters or create a new product."
      >
        <ng-template #actions let-product>
          <div class="flex justify-end gap-1">
            <button type="button" class="btn-secondary px-2 py-1" (click)="openEdit(product)" aria-label="Edit product">
              <app-icon name="edit" [size]="15" />
            </button>
            <button type="button" class="btn-secondary px-2 py-1 text-red-600 dark:text-red-400" (click)="pendingDelete.set(product)" aria-label="Delete product">
              <app-icon name="trash" [size]="15" />
            </button>
          </div>
        </ng-template>
      </app-data-table>

      <app-pagination
        [page]="result().page"
        [pageSize]="result().pageSize"
        [totalItems]="result().totalItems"
        [totalPages]="result().totalPages"
        (pageChange)="changePage($event)"
        (pageSizeChange)="changePageSize($event)"
      />
    </div>

    @if (formOpen()) {
      <app-product-form
        [product]="selected()"
        [categories]="categories()"
        [saving]="saving()"
        (saved)="save($event)"
        (cancelled)="closeForm()"
      />
    }

    @if (pendingDelete(); as product) {
      <app-confirm-dialog
        title="Delete product"
        [message]="'Are you sure you want to delete ' + product.name + '?'"
        (confirmed)="remove(product)"
        (cancelled)="pendingDelete.set(null)"
      />
    }
  `
})
export class ProductsComponent {
  private readonly productService = inject(ProductService);
  private readonly toast = inject(ToastService);

  readonly search = new FormControl('', { nonNullable: true });
  readonly category = new FormControl('', { nonNullable: true });
  readonly status = new FormControl('', { nonNullable: true });

  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly formOpen = signal(false);
  readonly selected = signal<Product | null>(null);
  readonly pendingDelete = signal<Product | null>(null);
  readonly categories = signal<string[]>([]);
  readonly sort = signal<SortState | null>({ sortBy: 'name', sortDescending: false });
  readonly result = signal<PagedResult<Product>>({ items: [], totalItems: 0, page: 1, pageSize: 10, totalPages: 1 });

  readonly columns: TableColumn<Product>[] = [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'category', label: 'Category', sortable: true },
    {
      key: 'price',
      label: 'Price',
      sortable: true,
      align: 'right',
      value: (product) => product.price.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
    },
    { key: 'stock', label: 'Stock', sortable: true, align: 'right' },
    { key: 'active', label: 'Status', align: 'center', value: (product) => (product.active ? 'Active' : 'Inactive') }
  ];

  constructor() {
    this.productService.categories().subscribe((categories) => this.categories.set(categories));

    this.search.valueChanges
      .pipe(debounceTime(350), distinctUntilChanged(), takeUntilDestroyed())
      .subscribe(() => this.load(1));

    this.category.valueChanges.pipe(takeUntilDestroyed()).subscribe(() => this.load(1));
    this.status.valueChanges.pipe(takeUntilDestroyed()).subscribe(() => this.load(1));

    this.load(1);
  }

  changePage(page: number): void {
    this.load(page);
  }

  changePageSize(pageSize: number): void {
    this.result.update((current) => ({ ...current, pageSize }));
    this.load(1);
  }

  changeSort(sort: SortState): void {
    this.sort.set(sort);
    this.load(this.result().page);
  }

  openCreate(): void {
    this.selected.set(null);
    this.formOpen.set(true);
  }

  openEdit(product: Product): void {
    this.selected.set(product);
    this.formOpen.set(true);
  }

  closeForm(): void {
    this.formOpen.set(false);
    this.selected.set(null);
  }

  save(payload: ProductPayload): void {
    this.saving.set(true);
    const current = this.selected();
    const request = current ? this.productService.update(current.id, payload) : this.productService.create(payload);

    request.subscribe({
      next: () => {
        this.saving.set(false);
        this.closeForm();
        this.toast.success(current ? 'Product updated.' : 'Product created.');
        this.load(this.result().page);
      },
      error: (error: Error) => {
        this.saving.set(false);
        this.toast.error(error.message);
      }
    });
  }

  remove(product: Product): void {
    this.productService.remove(product.id).subscribe({
      next: () => {
        this.pendingDelete.set(null);
        this.toast.success('Product deleted.');
        this.load(this.result().page);
      },
      error: (error: Error) => {
        this.pendingDelete.set(null);
        this.toast.error(error.message);
      }
    });
  }

  private load(page: number): void {
    this.loading.set(true);

    this.productService
      .list({
        page,
        pageSize: this.result().pageSize,
        search: this.search.value,
        category: this.category.value || undefined,
        active: this.status.value === '' ? undefined : this.status.value === 'true',
        sortBy: this.sort()?.sortBy,
        sortDescending: this.sort()?.sortDescending
      })
      .subscribe({
        next: (result) => {
          this.result.set(result);
          this.loading.set(false);
        },
        error: () => {
          this.loading.set(false);
          this.toast.error('Could not load products.');
        }
      });
  }
}
