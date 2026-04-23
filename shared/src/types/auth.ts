export interface LoginPayload {
  email: string;
  password: string;
  timezone?: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  name: string;
  timezone?: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    name: string;
    timezone: string;
  };
  token: string;
}

export interface JWTPayload {
  userId: string;
  timezone: string;
}
