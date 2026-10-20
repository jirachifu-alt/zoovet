export type Role = 'ROLE_ADMIN' | 'ROLE_VETERINARIO' | 'ROLE_CLIENTE';

export interface User {
  id: number;
  email: string;
  fullName: string;
  phone?: string;
  address?: string;
  role: Role;
  active?: boolean;
}

export interface AuthResponse {
  token: string;
  id: number;
  email: string;
  fullName: string;
  role: Role;
  phone?: string;
}

export interface LoginRequest {
  email: string;
  password?: string;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  phone?: string;
  password?: string;
  address?: string;
  role?: Role;
}
