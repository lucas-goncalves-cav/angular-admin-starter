import { Injectable, inject } from '@angular/core';
import { Observable, delay, of, throwError } from 'rxjs';
import { PageRequest, PagedResult, User, UserPayload } from '../models';
import { MockDataService } from './mock-data.service';
import { paginate } from './pagination.util';

const LATENCY_MS = 450;

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly data = inject(MockDataService);

  list(request: PageRequest): Observable<PagedResult<User>> {
    const filtered = this.data.users.filter((user) => this.matches(user, request.search));

    return of(paginate(filtered, request, this.sortValue)).pipe(delay(LATENCY_MS));
  }

  getById(id: string): Observable<User> {
    const user = this.data.users.find((candidate) => candidate.id === id);

    return user
      ? of({ ...user }).pipe(delay(LATENCY_MS))
      : throwError(() => new Error(`User ${id} was not found.`));
  }

  create(payload: UserPayload): Observable<User> {
    const user: User = {
      id: `user-${this.data.users.length + 1}`,
      createdAt: new Date().toISOString(),
      ...payload
    };

    this.data.users.unshift(user);

    return of(user).pipe(delay(LATENCY_MS));
  }

  update(id: string, payload: UserPayload): Observable<User> {
    const index = this.data.users.findIndex((candidate) => candidate.id === id);

    if (index < 0) {
      return throwError(() => new Error(`User ${id} was not found.`));
    }

    this.data.users[index] = { ...this.data.users[index], ...payload };

    return of(this.data.users[index]).pipe(delay(LATENCY_MS));
  }

  remove(id: string): Observable<void> {
    const index = this.data.users.findIndex((candidate) => candidate.id === id);

    if (index < 0) {
      return throwError(() => new Error(`User ${id} was not found.`));
    }

    this.data.users.splice(index, 1);

    return of(undefined).pipe(delay(LATENCY_MS));
  }

  private matches(user: User, search?: string): boolean {
    if (!search) {
      return true;
    }

    const term = search.toLowerCase();

    return user.name.toLowerCase().includes(term) || user.email.toLowerCase().includes(term);
  }

  private sortValue(user: User, key: string): string | number {
    switch (key) {
      case 'email':
        return user.email;
      case 'role':
        return user.role;
      case 'createdAt':
        return user.createdAt;
      default:
        return user.name;
    }
  }
}
