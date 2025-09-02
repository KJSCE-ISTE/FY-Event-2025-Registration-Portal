import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';
import type { User } from '../types';

const TOKEN_KEY = 'iste_auth_token';

export const auth = {
  setToken: (token: string) => {
    Cookies.set(TOKEN_KEY, token, { expires: 1 }); // 1 day
  },

  getToken: (): string | null => {
    return Cookies.get(TOKEN_KEY) || null;
  },

  removeToken: () => {
    Cookies.remove(TOKEN_KEY);
  },

  getCurrentUser: (): User | null => {
    const token = auth.getToken();
    if (!token) return null;

    try {
      const decoded = jwtDecode<User>(token);
      return decoded;
    } catch (error) {
      console.error('Error decoding token:', error);
      auth.removeToken();
      return null;
    }
  },

  isAuthenticated: (): boolean => {
    const token = auth.getToken();
    if (!token) return false;

    try {
      const decoded = jwtDecode<{ exp: number }>(token);
      const currentTime = Date.now() / 1000;
      return decoded.exp > currentTime;
    } catch (error) {
      console.error('Error checking token expiration:', error);
      auth.removeToken();
      return false;
    }
  },

  getAuthHeader: () => {
    const token = auth.getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }
};
