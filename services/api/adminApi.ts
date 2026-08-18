export type MetricType = 'count' | 'sum' | 'ratio' | 'series' | 'ranking';

export interface MetricPoint {
  date: string;
  value: number;
}

export interface MetricRow {
  label: string;
  value: number;
}

export interface Metric {
  key: string;
  label: string;
  type: MetricType;
  value: number | null;
  series: MetricPoint[];
  rows: MetricRow[];
  unit: string | null;
}

export interface MetricGroup {
  key: string;
  label: string;
  metrics: Metric[];
}

export interface EngagementReport {
  period: { start: string; end: string; granularity: string };
  groups: MetricGroup[];
}

export interface AdminUser {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  created_at: string;
  last_seen_at: string | null;
  last_transaction_at: string | null;
  is_admin?: boolean;
  tokens_used: number;
}

export interface AdminUserPage {
  data: AdminUser[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface AdminUsersParams {
  page?: number;
  perPage?: number;
  search?: string;
  joinedOn?: string;
}

export interface OutreachSummary {
  id: number;
  subject: string;
  audience: string;
  recipients: number;
  sent: number;
  created_at: string;
}

export interface UserDetail {
  user: AdminUser & { username?: string; phone?: string };
  counts: Record<string, number>;
  preferences: { country: string | null; language: string | null; currency: string | null };
  last_transaction_at: string | null;
}

export interface MetricsParams {
  days?: number;
  granularity?: 'day' | 'week' | 'month';
}

export type OutreachAudience = 'all' | 'active' | 'inactive' | 'test' | 'specific';

export interface OutreachPayload {
  subject: string;
  body: string;
  cta_label?: string;
  cta_url?: string;
  image_url?: string;
  audience: OutreachAudience;
  user_ids?: number[];
  files?: File[];
}

const adminApi = {
  async metrics(params: MetricsParams = {}): Promise<EngagementReport> {
    const api = useApi();
    const query = new URLSearchParams();
    if (params.days) {
      query.append('days', String(params.days));
    }
    if (params.granularity) {
      query.append('granularity', params.granularity);
    }
    const qs = query.toString();
    const response = await api<{ data: EngagementReport }>(`/admin/metrics${qs ? `?${qs}` : ''}`);
    return response.data;
  },

  async users(params: AdminUsersParams = {}): Promise<AdminUserPage> {
    const api = useApi();
    const query = new URLSearchParams();
    if (params.page) query.set('page', String(params.page));
    if (params.perPage) query.set('per_page', String(params.perPage));
    if (params.search) query.set('search', params.search);
    if (params.joinedOn) query.set('joined_on', params.joinedOn);
    const qs = query.toString();
    const response = await api<{ data: AdminUserPage }>(`/admin/users${qs ? `?${qs}` : ''}`);
    return response.data;
  },

  async outreachHistory(): Promise<OutreachSummary[]> {
    const api = useApi();
    const response = await api<{ data: OutreachSummary[] }>('/admin/outreach');
    return response.data ?? [];
  },

  async userDetail(id: number): Promise<UserDetail> {
    const api = useApi();
    const response = await api<{ data: UserDetail }>(`/admin/users/${id}`);
    return response.data;
  },

  async uploadOutreachMedia(image: File): Promise<{ url: string }> {
    const api = useApi();
    const form = new FormData();
    form.append('image', image);
    const response = await api<{ data: { url: string } }>('/admin/outreach/media', {
      method: 'POST',
      body: form
    });
    return response.data;
  },

  async sendOutreach(payload: OutreachPayload): Promise<{ sent: number }> {
    const api = useApi();
    let body: OutreachPayload | FormData = payload;

    if (payload.files && payload.files.length) {
      const form = new FormData();
      form.append('subject', payload.subject);
      form.append('body', payload.body);
      form.append('audience', payload.audience);
      if (payload.cta_label) form.append('cta_label', payload.cta_label);
      if (payload.cta_url) form.append('cta_url', payload.cta_url);
      if (payload.image_url) form.append('image_url', payload.image_url);
      (payload.user_ids ?? []).forEach((id) => form.append('user_ids[]', String(id)));
      payload.files.forEach((file) => form.append('files[]', file));
      body = form;
    }

    const response = await api<{ data: { sent: number } }>('/admin/outreach/send', {
      method: 'POST',
      body
    });
    return response.data;
  },

  async previewOutreach(payload: Partial<OutreachPayload>): Promise<string> {
    const api = useApi();
    const response = await api<{ data: { html: string } }>('/admin/outreach/preview', {
      method: 'POST',
      body: payload
    });
    return response.data.html;
  }
};

export default adminApi;
export { adminApi };
