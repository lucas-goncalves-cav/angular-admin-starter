# angular-admin-starter

Reusable Angular admin dashboard starter, ready to be the foundation of any internal management system.

![Angular](https://img.shields.io/badge/Angular-19-DD0031)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-06B6D4)
![Docker](https://img.shields.io/badge/Docker-Enabled-2496ED)
![License](https://img.shields.io/badge/license-MIT-green)

## Description

A production shaped starting point for Angular admin panels. It ships an authenticated shell with sidebar navigation,
breadcrumbs, dark mode, a reusable data table, modals, toasts, loading and empty states, plus two fully working CRUD
screens backed by an in memory dataset so the whole thing can be explored without a backend.

## Objective

Avoid rebuilding the same admin scaffolding on every project. Everything that is normally copied between systems is
already here and decoupled: layout, guards, HTTP interceptors, form patterns and presentation components.

## Technologies

| Area | Stack |
| --- | --- |
| Framework | Angular 19, standalone components, signals |
| Language | TypeScript |
| Styling | Tailwind CSS with class based dark mode |
| Reactivity | RxJS, Angular signals |
| Tooling | ESLint, angular-eslint, Prettier |
| Infrastructure | Docker, nginx, GitHub Actions |

## Features

- Login screen with reactive forms, validation and demo accounts
- Route protection through `authGuard`, `guestGuard` and a parameterized `roleGuard`
- HTTP interceptors for bearer token, global loading bar and error handling
- Responsive layout with collapsible sidebar, header and breadcrumbs
- Dark mode persisted in local storage and falling back to the system preference
- Dashboard with metric cards, period filter and three chart types drawn with plain SVG
- Users and products screens with search, filters, sorting, pagination and modal forms
- Confirmation dialogs, toasts, skeleton loading, empty states and a 404 page
- Menu driven by a plain configuration object with per role visibility

## Architecture

```
src/app/
  core/             Singleton concerns: models, services, guards, interceptors, config
  shared/           Presentation components and charts reused across features
  layout/           Application shell: sidebar, header, main layout
  features/         Route level screens, each one lazy loaded
```

The `core` layer holds everything that must exist once per application. The `shared` layer has no knowledge of business
rules and communicates only through inputs and outputs. Each feature is lazily loaded through `loadComponent`, so the
initial bundle stays small.

State is handled with Angular signals for local component state and RxJS for asynchronous streams, which keeps change
detection on `OnPush` across every component.

## Project structure

```
src/app/
  core/
    config/menu.config.ts           Sidebar definition
    guards/                         authGuard, guestGuard, roleGuard
    interceptors/                   auth, loading and error interceptors
    models/                         Typed contracts shared by the application
    services/                       Auth, theme, toast, loading and data services
  shared/
    charts/                         Line, bar and donut charts in plain SVG
    components/                     DataTable, Modal, ConfirmDialog, StatCard, PageHeader,
                                    Pagination, EmptyState, Skeleton, Loading, Toast, Icon
  layout/
    header.component.ts
    sidebar.component.ts
    main-layout.component.ts
  features/
    auth/                           Login
    dashboard/                      Metrics and charts
    users/                          User CRUD
    products/                       Product CRUD
    not-found/                      404 page
```

## How to run

### Locally

```bash
git clone https://github.com/lucas-goncalves-cav/angular-admin-starter.git
cd angular-admin-starter
npm install
npm start
```

The application starts at `http://localhost:4200`.

### With Docker

```bash
cp .env.example .env
docker compose up -d
```

The built application is served by nginx at `http://localhost:4200`.

### Available scripts

```bash
npm start        # development server
npm run build    # production build
npm run lint     # eslint with angular-eslint rules
npm test         # unit tests
```

## Configuration

### Demo accounts

Authentication is mocked so the starter runs without a backend. Any of the accounts below works:

| Email | Password | Role |
| --- | --- | --- |
| `admin@demo.com` | `admin123` | admin |
| `manager@demo.com` | `manager123` | manager |
| `viewer@demo.com` | `viewer123` | viewer |

The `viewer` role cannot reach the users screen, which demonstrates `roleGuard` in action.

### Environment variables

| Variable | Description | Default |
| --- | --- | --- |
| `WEB_PORT` | Host port used by Docker Compose | `4200` |
| `API_URL` | Base URL of the backend the app should consume | `your_api_url_here` |

No real credentials are stored in this repository.

### Configuring the menu

The sidebar is generated from a plain object in `src/app/core/config/menu.config.ts`:

```typescript
export const MENU: MenuSection[] = [
  {
    label: 'Overview',
    items: [{ title: 'Dashboard', route: '/dashboard', icon: 'dashboard' }]
  },
  {
    label: 'Management',
    items: [
      { title: 'Users', route: '/users', icon: 'users', roles: ['admin', 'manager'] },
      { title: 'Products', route: '/products', icon: 'products' }
    ]
  }
];
```

Items without a `roles` array are visible to everyone. Icons refer to keys registered in `IconComponent`.

### Connecting a real backend

The services under `core/services` return `Observable` values and are the only place aware of where data comes from.
Replacing the mocked implementation with `HttpClient` calls does not require touching any component:

```typescript
list(request: PageRequest): Observable<PagedResult<User>> {
  return this.http.get<PagedResult<User>>('/api/users', { params: toHttpParams(request) });
}
```

The interceptors already attach the bearer token, drive the global loading bar and translate HTTP errors into toasts.

## Reusable components

| Component | Purpose |
| --- | --- |
| `DataTable` | Generic table with sorting, custom cell templates, action templates, loading and empty states |
| `Pagination` | Page navigation with configurable page size |
| `Modal` | Accessible dialog with backdrop dismissal |
| `ConfirmDialog` | Destructive action confirmation built on top of `Modal` |
| `PageHeader` | Title, description, breadcrumbs and action slot |
| `StatCard` | Metric card with trend indicator |
| `EmptyState` | Placeholder for empty collections |
| `Skeleton` | Animated content placeholder |
| `Loading` | Inline spinner |
| `ToastContainer` | Stacked notifications with auto dismissal |
| `Icon` | Inline SVG icon set without external dependencies |

## Roadmap

- [ ] Internationalization with Angular i18n
- [ ] User preferences screen
- [ ] Table column visibility and CSV export
- [ ] Unit tests for guards, interceptors and reusable components
- [ ] Storybook catalog for the shared components

## License

Distributed under the MIT License. See [LICENSE](LICENSE) for details.
