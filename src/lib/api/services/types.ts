/**
 * Standard API response envelope (see InvoiceHub doc §4.1):
 *   { "success": true, "data": {...}, "meta": { page, size, total } }
 *
 * Service functions unwrap `.data` so callers get the payload directly.
 * If your backend returns the payload without this envelope, change the
 * `.then(r => r.data.data)` calls in the service files to `.then(r => r.data)`.
 */
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: { page: number; size: number; total: number };
}
