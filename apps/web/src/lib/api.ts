import { ComponentSummary, ComponentDetail, Category, AuthResponse, UserProfile } from '@vac/shared';

const getApiBase = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  if (typeof window !== 'undefined' && window.location?.origin && window.location.origin !== 'null') {
    return '/api';
  }
  return 'http://localhost:4000/api';
};

const API_BASE = getApiBase();

class ApiClient {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('vac_auth_token');
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('vac_auth_token', token);
    } else {
      localStorage.removeItem('vac_auth_token');
    }
  }

  getToken(): string | null {
    return this.token;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    const json = await res.json();

    if (!res.ok || !json.success) {
      const message = json.error?.message || 'Network request failed';
      throw new Error(message);
    }

    return json.data;
  }

  // Health
  async getHealth() {
    const res = await fetch(`${API_BASE}/health`);
    return res.json();
  }

  // Auth
  async login(credentials: { email: string; pass: string }): Promise<AuthResponse> {
    const data = await this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: credentials.email, password: credentials.pass }),
    });
    this.setToken(data.token);
    return data;
  }

  async register(details: { name: string; email: string; pass: string }): Promise<AuthResponse> {
    const data = await this.request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name: details.name, email: details.email, password: details.pass }),
    });
    this.setToken(data.token);
    return data;
  }

  async getCurrentUser(): Promise<UserProfile> {
    return this.request<UserProfile>('/auth/me');
  }

  logout() {
    this.setToken(null);
  }

  // Components
  async getComponents(params?: { search?: string; category?: string; sort?: string }): Promise<ComponentSummary[]> {
    const query = new URLSearchParams();
    if (params?.search) query.set('search', params.search);
    if (params?.category) query.set('category', params.category);
    if (params?.sort) query.set('sort', params.sort);
    const qs = query.toString() ? `?${query.toString()}` : '';
    return this.request<ComponentSummary[]>(`/components${qs}`);
  }

  async getComponentBySlug(slug: string): Promise<ComponentDetail> {
    return this.request<ComponentDetail>(`/components/${slug}`);
  }

  // Categories
  async getCategories(): Promise<Category[]> {
    return this.request<Category[]>('/categories');
  }
}

export const api = new ApiClient();
