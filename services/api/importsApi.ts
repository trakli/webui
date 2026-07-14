import type { ImportSession, ConfirmPayload, ConfirmResponse } from '~/types/import';
import { extractResponseData } from './apiHelpers';

const importsApi = {
  async analyze(file: File, documentType?: string): Promise<ImportSession> {
    const api = useApi();

    const formData = new FormData();
    formData.append('file', file);
    if (documentType) {
      formData.append('document_type', documentType);
    }

    const response = await api<{ data: ImportSession }>('/import/analyze', {
      method: 'POST',
      body: formData
    });

    return extractResponseData(response, {} as ImportSession);
  },

  async confirm(payload: ConfirmPayload): Promise<ConfirmResponse> {
    const api = useApi();

    const response = await api<{ data: ConfirmResponse }>('/import/confirm', {
      method: 'POST',
      body: payload
    });

    return extractResponseData(response, { created_count: 0, errors: [] });
  },

  async getSessions(): Promise<ImportSession[]> {
    const api = useApi();

    const response = await api<{ data: ImportSession[] }>('/import/sessions');

    return extractResponseData(response, []);
  },

  async getSession(id: number): Promise<ImportSession> {
    const api = useApi();

    const response = await api<{ data: ImportSession }>(`/import/sessions/${id}`);

    return extractResponseData(response, {} as ImportSession);
  },

  async deleteSession(id: number): Promise<void> {
    const api = useApi();

    await api(`/import/sessions/${id}`, { method: 'DELETE' });
  }
};

export default importsApi;
export { importsApi };
