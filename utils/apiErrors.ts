export function extractApiErrors(err: unknown): string {
  if (typeof err === 'string') return err;
  if (err?.response?._data?.message) return err.response._data.message;
  if (err?.response?._data?.errors?.length) return err.response._data.errors.join(', ');
  if (err?.message) return err.message;
  if (err?._data?.message) return err._data.message;
  if (err?._data?.errors?.length) return err._data.errors.join(', ');
  return 'An unknown error occurred';
}
