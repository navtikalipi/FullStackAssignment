export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

export interface AuthResponse {
  token: string;
  userId: number;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

export interface SignupRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface SigninRequest {
  email: string;
  password: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: number;
}
