import { describe, it, expect, vi, beforeEach } from 'vitest';
import transactionApi from '@/services/transactionApi';

const mockApi = vi.fn();

vi.mock('#imports', () => ({
  useApi: () => mockApi
}));

vi.stubGlobal('useApi', () => mockApi);

describe('transactionApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('addFilesBulk', () => {
    it('posts a multipart FormData body to /transactions/{id}/files', async () => {
      mockApi.mockResolvedValueOnce({ data: { id: 7 } });

      const file = new File(['x'], 'photo.png', { type: 'image/png' });
      await transactionApi.addFilesBulk(7, [file]);

      const [url, options] = mockApi.mock.calls[0];
      expect(url).toBe('/transactions/7/files');
      expect(options.method).toBe('POST');
      expect(options.body).toBeInstanceOf(FormData);

      const sent = options.body.getAll('files[]');
      expect(sent).toHaveLength(1);
      expect((sent[0] as File).name).toBe('photo.png');
    });

    it('appends every picked file under files[]', async () => {
      mockApi.mockResolvedValueOnce({ data: { id: 7 } });

      const files = [
        new File(['x'], 'a.png', { type: 'image/png' }),
        new File(['x'], 'b.pdf', { type: 'application/pdf' })
      ];
      await transactionApi.addFilesBulk(7, files);

      const [, options] = mockApi.mock.calls[0];
      expect(options.body.getAll('files[]')).toHaveLength(2);
    });
  });

  describe('deleteFile', () => {
    it('issues DELETE to /transactions/{id}/files/{fileId}', async () => {
      mockApi.mockResolvedValueOnce({ data: { id: 7 } });

      await transactionApi.deleteFile(7, 99);

      const [url, options] = mockApi.mock.calls[0];
      expect(url).toBe('/transactions/7/files/99');
      expect(options.method).toBe('DELETE');
    });
  });

  describe('fetchFileBlob', () => {
    it('requests /files/{id} with responseType blob so previews stay authenticated', async () => {
      const blob = new Blob(['x']);
      mockApi.mockResolvedValueOnce(blob);

      const result = await transactionApi.fetchFileBlob(42);

      const [url, options] = mockApi.mock.calls[0];
      expect(url).toBe('/files/42');
      expect(options.responseType).toBe('blob');
      expect(result).toBe(blob);
    });
  });
});
