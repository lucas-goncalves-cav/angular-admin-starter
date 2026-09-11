export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  active: boolean;
  createdAt: string;
}

export interface ProductPayload {
  name: string;
  category: string;
  price: number;
  stock: number;
  active: boolean;
}
