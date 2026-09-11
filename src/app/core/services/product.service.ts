import { Injectable, inject } from '@angular/core';
import { Observable, delay, of, throwError } from 'rxjs';
import { PageRequest, PagedResult, Product, ProductPayload } from '../models';
import { MockDataService } from './mock-data.service';
import { paginate } from './pagination.util';

const LATENCY_MS = 450;

export interface ProductFilter extends PageRequest {
  category?: string;
  active?: boolean;
}

@Injectable({ providedIn: 'root' })
export class ProductService {
  private readonly data = inject(MockDataService);

  categories(): Observable<string[]> {
    const categories = [...new Set(this.data.products.map((product) => product.category))].sort();

    return of(categories);
  }

  list(filter: ProductFilter): Observable<PagedResult<Product>> {
    const filtered = this.data.products.filter((product) => this.matches(product, filter));

    return of(paginate(filtered, filter, this.sortValue)).pipe(delay(LATENCY_MS));
  }

  getById(id: string): Observable<Product> {
    const product = this.data.products.find((candidate) => candidate.id === id);

    return product
      ? of({ ...product }).pipe(delay(LATENCY_MS))
      : throwError(() => new Error(`Product ${id} was not found.`));
  }

  create(payload: ProductPayload): Observable<Product> {
    const product: Product = {
      id: `product-${this.data.products.length + 1}`,
      createdAt: new Date().toISOString(),
      ...payload
    };

    this.data.products.unshift(product);

    return of(product).pipe(delay(LATENCY_MS));
  }

  update(id: string, payload: ProductPayload): Observable<Product> {
    const index = this.data.products.findIndex((candidate) => candidate.id === id);

    if (index < 0) {
      return throwError(() => new Error(`Product ${id} was not found.`));
    }

    this.data.products[index] = { ...this.data.products[index], ...payload };

    return of(this.data.products[index]).pipe(delay(LATENCY_MS));
  }

  remove(id: string): Observable<void> {
    const index = this.data.products.findIndex((candidate) => candidate.id === id);

    if (index < 0) {
      return throwError(() => new Error(`Product ${id} was not found.`));
    }

    this.data.products.splice(index, 1);

    return of(undefined).pipe(delay(LATENCY_MS));
  }

  private matches(product: Product, filter: ProductFilter): boolean {
    if (filter.category && product.category !== filter.category) {
      return false;
    }

    if (filter.active !== undefined && product.active !== filter.active) {
      return false;
    }

    if (!filter.search) {
      return true;
    }

    return product.name.toLowerCase().includes(filter.search.toLowerCase());
  }

  private sortValue(product: Product, key: string): string | number {
    switch (key) {
      case 'price':
        return product.price;
      case 'stock':
        return product.stock;
      case 'category':
        return product.category;
      case 'createdAt':
        return product.createdAt;
      default:
        return product.name;
    }
  }
}
