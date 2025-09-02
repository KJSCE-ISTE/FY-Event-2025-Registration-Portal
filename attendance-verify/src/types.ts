export interface User {
  id: number;
  email: string;
  name: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

export interface AttendanceResponse {
  message: string;
  user: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    year: string;
    branch: string;
    attended: boolean;
    created_at: string;
  };
}

export interface GoogleCredentialResponse {
  credential: string;
  select_by: string;
}
