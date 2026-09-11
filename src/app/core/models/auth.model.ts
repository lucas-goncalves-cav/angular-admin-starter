import { UserRole } from './user.model';

export interface Credentials {
  email: string;
  password: string;
}

export interface AuthenticatedUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface AuthSession {
  token: string;
  expiresAt: number;
  user: AuthenticatedUser;
}
