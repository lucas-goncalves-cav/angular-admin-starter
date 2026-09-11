import { Injectable } from '@angular/core';
import { Product, User, UserRole } from '../models';

const FIRST_NAMES = ['Ana', 'Bruno', 'Carla', 'Diego', 'Elisa', 'Felipe', 'Gabriela', 'Henrique', 'Isabela', 'Joao'];
const LAST_NAMES = ['Almeida', 'Barbosa', 'Costa', 'Dias', 'Esteves', 'Ferreira', 'Gomes', 'Henriques'];
const ROLES: UserRole[] = ['admin', 'manager', 'viewer'];
const CATEGORIES = ['Electronics', 'Books', 'Furniture', 'Apparel', 'Sports'];
const PRODUCT_NAMES = [
  'Wireless Mouse',
  'Mechanical Keyboard',
  'Noise Cancelling Headset',
  'Standing Desk',
  'Office Chair',
  'Monitor Arm',
  'USB Hub',
  'Laptop Stand',
  'Desk Lamp',
  'Webcam'
];

/**
 * Deterministic in memory dataset so the starter can be explored without a backend.
 */
@Injectable({ providedIn: 'root' })
export class MockDataService {
  readonly users: User[] = Array.from({ length: 48 }, (_, index) => this.buildUser(index));
  readonly products: Product[] = Array.from({ length: 63 }, (_, index) => this.buildProduct(index));

  private buildUser(index: number): User {
    const first = FIRST_NAMES[index % FIRST_NAMES.length];
    const last = LAST_NAMES[index % LAST_NAMES.length];

    return {
      id: `user-${index + 1}`,
      name: `${first} ${last}`,
      email: `${first.toLowerCase()}.${last.toLowerCase()}${index + 1}@demo.com`,
      role: ROLES[index % ROLES.length],
      active: index % 7 !== 0,
      createdAt: new Date(2025, index % 12, (index % 27) + 1).toISOString()
    };
  }

  private buildProduct(index: number): Product {
    const name = PRODUCT_NAMES[index % PRODUCT_NAMES.length];

    return {
      id: `product-${index + 1}`,
      name: `${name} ${Math.floor(index / PRODUCT_NAMES.length) + 1}`,
      category: CATEGORIES[index % CATEGORIES.length],
      price: Number((49.9 + index * 13.37).toFixed(2)),
      stock: (index * 7) % 120,
      active: index % 9 !== 0,
      createdAt: new Date(2025, index % 12, (index % 27) + 1).toISOString()
    };
  }
}
