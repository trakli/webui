export interface FeedbackItem {
  id: number;
  type: string;
  status: string;
  subject: string | null;
  message: string;
  created_at: string;
}

export function useFeedback() {
  const api = useApi();

  async function list(): Promise<FeedbackItem[]> {
    const response = await api<{ data: FeedbackItem[] }>('/feedback');
    return response.data;
  }

  async function send(payload: {
    type: string;
    subject?: string;
    message: string;
  }): Promise<FeedbackItem> {
    const response = await api<{ data: FeedbackItem }>('/feedback', {
      method: 'POST',
      body: payload
    });
    return response.data;
  }

  return { list, send };
}
