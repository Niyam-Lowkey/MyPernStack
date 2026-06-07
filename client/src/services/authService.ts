import api from './api';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'customer';
  is_active: boolean;
}

export interface LoginResponse {
  status: string;
  data: {
    user: User;
    accessToken: string;
  };
}

export interface MeResponse {
  status: string;
  data: {
    user: User;
  };
}

export const authService = {
  login: async (credentials: { email: string; password?: string; rememberMe?: boolean }): Promise<LoginResponse> => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  logout: async (): Promise<void> => {
    await api.post('/auth/logout');
    localStorage.removeItem('accessToken');
    window.dispatchEvent(new Event('auth-logout'));
  },

  getMe: async (): Promise<MeResponse> => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

export default authService;
