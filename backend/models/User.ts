export interface User {
  id?: number;
  username: string;
  email: string;
  password: string;
  is_anonymous: boolean;
  created_at?: Date;
  updated_at?: Date;
}

export interface CreateUserRequest {
  username: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface UserResponse {
  id: number;
  username: string;
  email: string;
  is_anonymous: boolean;
  created_at: Date;
}
