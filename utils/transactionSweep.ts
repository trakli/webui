import { api } from '~/services/api';
import type { TransactionQueryParams } from '~/types/transaction';

const PAGE_SIZE = 200;
const CONCURRENCY = 6;

export interface SweepResult {
  rows: any[];
  truncated: boolean;
}

export async function sweepTransactions(
  params: Omit<TransactionQueryParams, 'page' | 'limit'>,
  maxPages = 30
): Promise<SweepResult> {
  const fetchPage = (page: number) => api.transactions.fetchAll({ ...params, page, limit: PAGE_SIZE });

  const first = await fetchPage(1);
  const lastPage = Math.max(1, first?.last_page || 1);
  const target = Math.min(lastPage, maxPages);
  const pages: any[][] = new Array(target);
  pages[0] = first?.data || [];

  const queue = Array.from({ length: target - 1 }, (_, i) => i + 2);
  let cursor = 0;
  const worker = async () => {
    while (cursor < queue.length) {
      const page = queue[cursor++];
      pages[page - 1] = (await fetchPage(page))?.data || [];
    }
  };
  await Promise.all(Array.from({ length: Math.min(CONCURRENCY, queue.length) }, worker));

  return { rows: pages.flat(), truncated: lastPage > maxPages };
}
