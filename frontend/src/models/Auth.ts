export interface User {
  id: string;
  email: string;
  displayName: string | null;
}

export interface AuthContextType {
  user: User | null;
  isLoggedIn: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  displayName?: string;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  user: {
    id: string;
    email: string;
    displayName: string | null;
  };
}

export interface CurrentUserResponse {
  success: boolean;
  user: {
    id: string;
    email: string;
    displayName: string | null;
  };
}