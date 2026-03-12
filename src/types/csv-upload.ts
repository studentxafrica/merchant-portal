/**
 * Types for CSV coupon upload feature.
 */

/** Parsed row from a merchant's CSV file */
export interface CsvCouponRow {
  coupon_code: string;
  expiry_date: string; // ISO date string
  row_number: number; // Original row number in CSV (for error reporting)
}

/** Validation error for a single CSV row */
export interface CsvValidationError {
  row_number: number;
  field: string;
  message: string;
}

/** Result of client-side CSV parsing and validation */
export interface CsvParseResult {
  valid: CsvCouponRow[];
  errors: CsvValidationError[];
  total: number;
}

/** Error detail for a single row that failed server-side processing */
export interface UploadRowError {
  row: number;
  coupon_code: string;
  reason: string;
}

/** Upload job status returned by the backend */
export type UploadJobStatus = "pending" | "processing" | "completed" | "failed";

/** Upload job record from the backend */
export interface CouponUploadJob {
  id: string;
  status: UploadJobStatus;
  offer_id: string;
  offer?: {
    id: string;
    title: string;
  };
  total_rows: number;
  processed_rows: number;
  successful_rows: number;
  failed_rows: number;
  errors: UploadRowError[];
  created_at: string;
  completed_at?: string;
}
