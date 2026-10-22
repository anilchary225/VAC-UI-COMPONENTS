import {
  ComponentSummary,
  ComponentDetail,
  Category,
  AuthResponse,
  UserProfile,
  Collection,
  CreateCollectionRequest,
  UpdateProfileRequest,
} from '@vac/shared';

const getApiBase = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  if (typeof window !== 'undefined' && window.location?.origin && window.location.origin !== 'null') {
    return '/api';
  }
  return 'http://localhost:4000/api';
};

export const API_BASE = getApiBase();
export const getOAuthUrl = (provider: 'github' | 'google') => `${API_BASE}/auth/oauth/${provider}`;

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

  async updateProfile(data: UpdateProfileRequest): Promise<UserProfile> {
    return this.request<UserProfile>('/auth/profile', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
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

  // Favorites
  async getFavorites(): Promise<string[]> {
    return this.request<string[]>('/favorites');
  }

  async addFavorite(slug: string): Promise<{ componentSlug: string }> {
    return this.request<{ componentSlug: string }>(`/favorites/${slug}`, {
      method: 'POST',
    });
  }

  async removeFavorite(slug: string): Promise<void> {
    await this.request<void>(`/favorites/${slug}`, {
      method: 'DELETE',
    });
  }

  // Collections
  async getCollections(): Promise<Collection[]> {
    return this.request<Collection[]>('/collections');
  }

  async createCollection(data: CreateCollectionRequest): Promise<Collection> {
    return this.request<Collection>('/collections', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getCollectionById(id: string): Promise<Collection> {
    return this.request<Collection>(`/collections/${id}`);
  }

  async updateCollection(id: string, data: { name?: string; description?: string }): Promise<Collection> {
    return this.request<Collection>(`/collections/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteCollection(id: string): Promise<void> {
    await this.request<void>(`/collections/${id}`, {
      method: 'DELETE',
    });
  }

  async addComponentToCollection(collectionId: string, componentSlug: string): Promise<Collection> {
    return this.request<Collection>(`/collections/${collectionId}/items`, {
      method: 'POST',
      body: JSON.stringify({ componentSlug }),
    });
  }

  async removeComponentFromCollection(collectionId: string, componentSlug: string): Promise<Collection> {
    return this.request<Collection>(`/collections/${collectionId}/items/${componentSlug}`, {
      method: 'DELETE',
    });
  }

  // ---------------------------------------------------------------------------
  // Admin & Component Studio APIs
  // ---------------------------------------------------------------------------
  async getAdminOverview(): Promise<{
    totalComponents: number;
    publishedCount: number;
    draftCount: number;
    deprecatedCount: number;
    validationIssuesCount: number;
    recentComponents: Array<{
      id: string;
      slug: string;
      name: string;
      category: string;
      status: string;
      currentVersion: string;
      updatedAt: string;
    }>;
    recentAuditLogs: Array<{
      id: string;
      action: string;
      actorEmail: string;
      actorName: string;
      resourceType: string;
      resourceId: string;
      details: Record<string, any>;
      createdAt: string;
    }>;
  }> {
    return this.request('/admin/overview');
  }

  async getAdminComponents(params: {
    search?: string;
    category?: string;
    status?: string;
    sort?: string;
    order?: string;
    page?: number;
    limit?: number;
  } = {}): Promise<{
    components: any[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }> {
    const query = new URLSearchParams();
    if (params.search) query.set('search', params.search);
    if (params.category && params.category !== 'all') query.set('category', params.category);
    if (params.status && params.status !== 'all') query.set('status', params.status);
    if (params.sort) query.set('sort', params.sort);
    if (params.order) query.set('order', params.order);
    if (params.page) query.set('page', params.page.toString());
    if (params.limit) query.set('limit', params.limit.toString());

    return this.request(`/admin/components?${query.toString()}`);
  }

  async getAdminComponent(idOrSlug: string): Promise<any> {
    return this.request(`/admin/components/${idOrSlug}`);
  }

  async createAdminComponent(data: {
    name: string;
    slug: string;
    description: string;
    category: string;
    tags?: string[];
    documentation?: string;
    license?: string;
    author?: string;
  }): Promise<any> {
    return this.request('/admin/components', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateAdminComponent(idOrSlug: string, data: any): Promise<any> {
    return this.request(`/admin/components/${idOrSlug}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async validateAdminComponent(idOrSlug: string): Promise<{
    report: {
      valid: boolean;
      errors: string[];
      issues: Array<{ field?: string; file?: string; message: string }>;
      checkedAt: string;
    };
    component: any;
  }> {
    return this.request(`/admin/components/${idOrSlug}/validate`, {
      method: 'POST',
    });
  }

  async publishAdminComponent(idOrSlug: string, data: { version?: string; changelog?: string }): Promise<{
    component: any;
    version: any;
  }> {
    return this.request(`/admin/components/${idOrSlug}/publish`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async deprecateAdminComponent(idOrSlug: string, reason?: string): Promise<any> {
    return this.request(`/admin/components/${idOrSlug}/deprecate`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }

  async deprecateAdminRelease(idOrSlug: string, version: string, reason?: string): Promise<any> {
    return this.request(`/admin/components/${idOrSlug}/versions/${version}/deprecate`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }

  async getAdminVersions(idOrSlug: string): Promise<any[]> {
    return this.request(`/admin/components/${idOrSlug}/versions`);
  }

  // Public Registry
  async getRegistryVersions(slug: string): Promise<{
    slug: string;
    versions: string[];
    latest: string;
    details?: Array<{
      version: string;
      publishedAt: string;
      changelog?: string;
      deprecated?: boolean;
      deprecationReason?: string;
    }>;
  }> {
    return this.request(`/registry/components/${slug}/versions`);
  }

  async getRegistryManifest(slug: string, version: string): Promise<any> {
    return this.request(`/registry/components/${slug}/${version}`);
  }

  async compareRegistryVersions(slug: string, fromVersion: string, toVersion: string): Promise<any> {
    return this.request(`/registry/components/${slug}/compare?from=${fromVersion}&to=${toVersion}`);
  }

  async getAdminCategories(): Promise<any[]> {
    return this.request('/admin/categories');
  }

  async createAdminCategory(data: { name: string; slug: string; description?: string; icon?: string }): Promise<any> {
    return this.request('/admin/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getAdminAuditLogs(params: { action?: string; resourceType?: string; page?: number; limit?: number } = {}): Promise<{
    logs: any[];
    pagination: { total: number; page: number; limit: number; totalPages: number };
  }> {
    const query = new URLSearchParams();
    if (params.action) query.set('action', params.action);
    if (params.resourceType) query.set('resourceType', params.resourceType);
    if (params.page) query.set('page', params.page.toString());
    if (params.limit) query.set('limit', params.limit.toString());
    return this.request(`/admin/audit-logs?${query.toString()}`);
  }

  async getAdminAnalytics(): Promise<any> {
    return this.request('/admin/analytics');
  }

  async getAdminConfig(): Promise<any> {
    return this.request('/admin/config');
  }

  async getAdminUsers(): Promise<any[]> {
    return this.request('/admin/users');
  }

  async getAdminRegistry(): Promise<any[]> {
    return this.request('/admin/registry');
  }
}

export const api = new ApiClient();

