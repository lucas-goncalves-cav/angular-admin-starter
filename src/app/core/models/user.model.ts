export type UserRole = 'admin' | 'manager' | 'viewer';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  active: boolean;
  createdAt: string;
}

export interface UserPayload {
  name: string;
  email: string;
  role: UserRole;
  active: boolean;
}
