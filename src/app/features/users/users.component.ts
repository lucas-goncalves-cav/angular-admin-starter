import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { PagedResult, TableColumn, User, UserPayload } from '../../core/models';
import { ToastService } from '../../core/services/toast.service';
import { UserService } from '../../core/services/user.service';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog.component';
import { DataTableComponent, SortState } from '../../shared/components/data-table.component';
import { IconComponent } from '../../shared/components/icon.component';
import { PageHeaderComponent } from '../../shared/components/page-header.component';
import { PaginationComponent } from '../../shared/components/pagination.component';
import { UserFormComponent } from './user-form.component';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    PageHeaderComponent,
    DataTableComponent,
    PaginationComponent,
    ConfirmDialogComponent,
    UserFormComponent,
    IconComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-header
      title="Users"
      description="Manage the people who have access to the platform."
      [breadcrumbs]="[{ label: 'Home', route: '/dashboard' }, { label: 'Users' }]"
    >
      <button type="button" class="btn-primary" (click)="openCreate()">
        <app-icon name="plus" [size]="16" />
        New user
      </button>
    </app-page-header>

    <div class="card">
      <div class="border-b border-slate-200 p-4 dark:border-slate-800">
        <div class="relative max-w-sm">
          <span class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            <app-icon name="search" [size]="16" />
          </span>
          <input class="form-input pl-9" placeholder="Search by name or email" [formControl]="search" />
        </div>
      </div>

      <app-data-table
        [columns]="columns"
        [rows]="result().items"
        [loading]="loading()"
        [sort]="sort()"
        (sortChange)="changeSort($event)"
        emptyTitle="No users found"
        emptyDescription="Adjust the search or create a new user."
      >
        <ng-template #actions let-user>
          <div class="flex justify-end gap-1">
            <button type="button" class="btn-secondary px-2 py-1" (click)="openEdit(user)" aria-label="Edit user">
              <app-icon name="edit" [size]="15" />
            </button>
            <button type="button" class="btn-secondary px-2 py-1 text-red-600 dark:text-red-400" (click)="confirmDelete(user)" aria-label="Delete user">
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
      <app-user-form [user]="selected()" [saving]="saving()" (saved)="save($event)" (cancelled)="closeForm()" />
    }

    @if (pendingDelete(); as user) {
      <app-confirm-dialog
        title="Delete user"
        [message]="'Are you sure you want to delete ' + user.name + '?'"
        (confirmed)="remove(user)"
        (cancelled)="pendingDelete.set(null)"
      />
    }
  `
})
export class UsersComponent {
  private readonly userService = inject(UserService);
  private readonly toast = inject(ToastService);

  readonly search = new FormControl('', { nonNullable: true });
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly formOpen = signal(false);
  readonly selected = signal<User | null>(null);
  readonly pendingDelete = signal<User | null>(null);
  readonly sort = signal<SortState | null>({ sortBy: 'name', sortDescending: false });
  readonly result = signal<PagedResult<User>>({ items: [], totalItems: 0, page: 1, pageSize: 10, totalPages: 1 });

  readonly columns: TableColumn<User>[] = [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'role', label: 'Role', sortable: true },
    { key: 'active', label: 'Status', align: 'center', value: (user) => (user.active ? 'Active' : 'Inactive') },
    {
      key: 'createdAt',
      label: 'Created',
      sortable: true,
      align: 'right',
      value: (user) => new Date(user.createdAt).toLocaleDateString('en-US')
    }
  ];

  constructor() {
    this.search.valueChanges
      .pipe(debounceTime(350), distinctUntilChanged(), takeUntilDestroyed())
      .subscribe(() => this.load(1));

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

  openEdit(user: User): void {
    this.selected.set(user);
    this.formOpen.set(true);
  }

  closeForm(): void {
    this.formOpen.set(false);
    this.selected.set(null);
  }

  save(payload: UserPayload): void {
    this.saving.set(true);
    const current = this.selected();
    const request = current ? this.userService.update(current.id, payload) : this.userService.create(payload);

    request.subscribe({
      next: () => {
        this.saving.set(false);
        this.closeForm();
        this.toast.success(current ? 'User updated.' : 'User created.');
        this.load(this.result().page);
      },
      error: (error: Error) => {
        this.saving.set(false);
        this.toast.error(error.message);
      }
    });
  }

  confirmDelete(user: User): void {
    this.pendingDelete.set(user);
  }

  remove(user: User): void {
    this.userService.remove(user.id).subscribe({
      next: () => {
        this.pendingDelete.set(null);
        this.toast.success('User deleted.');
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

    this.userService
      .list({
        page,
        pageSize: this.result().pageSize,
        search: this.search.value,
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
          this.toast.error('Could not load users.');
        }
      });
  }
}
