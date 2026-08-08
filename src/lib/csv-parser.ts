/**
 * Client-side CSV parser and validator for coupon uploads.
 * Zero external dependencies — uses native FileReader + string splitting.
 */

import type {
  CsvCouponRow,
  CsvValidationError,
  CsvParseResult,
} from "@/types/csv-upload";

const REQUIRED_HEADERS = ["coupon_code", "expiry_date"];
const MAX_CODE_LENGTH = 64;
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

/**
 * Read and parse a CSV file into structured rows.
 * Validates headers and basic structure.
 */
export async function parseCSV(file: File): Promise<CsvParseResult> {
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      valid: [],
      errors: [
        {
          row_number: 0,
          field: "file",
          message: `File exceeds maximum size of 5MB (${(file.size / 1024 / 1024).toFixed(1)}MB)`,
        },
      ],
      total: 0,
    };
  }

  const text = await readFileAsText(file);
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  if (lines.length < 2) {
    return {
      valid: [],
      errors: [
        {
          row_number: 0,
          field: "file",
          message: "CSV must contain a header row and at least one data row",
        },
      ],
      total: 0,
    };
  }

  // Validate headers
  const headers = lines[0]
    .toLowerCase()
    .split(",")
    .map((h) => h.trim());
  const missingHeaders = REQUIRED_HEADERS.filter((h) => !headers.includes(h));
  if (missingHeaders.length > 0) {
    return {
      valid: [],
      errors: [
        {
          row_number: 1,
          field: "headers",
          message: `Missing required headers: ${missingHeaders.join(", ")}. Expected: ${REQUIRED_HEADERS.join(", ")}`,
        },
      ],
      total: 0,
    };
  }

  const codeIndex = headers.indexOf("coupon_code");
  const dateIndex = headers.indexOf("expiry_date");

  // Parse data rows
  const rows: CsvCouponRow[] = [];
  const parseErrors: CsvValidationError[] = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = parseCsvLine(lines[i]);
    const rowNumber = i + 1; // 1-indexed, accounting for header

    if (cols.length < REQUIRED_HEADERS.length) {
      parseErrors.push({
        row_number: rowNumber,
        field: "row",
        message: `Expected at least ${REQUIRED_HEADERS.length} columns, found ${cols.length}`,
      });
      continue;
    }

    rows.push({
      coupon_code: cols[codeIndex].trim(),
      expiry_date: cols[dateIndex].trim(),
      row_number: rowNumber,
    });
  }

  // Validate parsed rows
  const { valid, errors: validationErrors } = validateRows(rows);

  return {
    valid,
    errors: [...parseErrors, ...validationErrors],
    total: lines.length - 1, // Exclude header
  };
}

/**
 * Parse a single CSV line, handling quoted fields.
 */
function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && i + 1 < line.length && line[i + 1] === '"') {
        current += '"';
        i++; // Skip escaped quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      result.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}

/**
 * Validate parsed CSV rows for data quality.
 */
export function validateRows(rows: CsvCouponRow[]): {
  valid: CsvCouponRow[];
  errors: CsvValidationError[];
} {
  const errors: CsvValidationError[] = [];
  const valid: CsvCouponRow[] = [];
  const seenCodes = new Set<string>();

  for (const row of rows) {
    let hasError = false;

    // Validate coupon_code
    if (!row.coupon_code || row.coupon_code.length === 0) {
      errors.push({
        row_number: row.row_number,
        field: "coupon_code",
        message: "Coupon code is required",
      });
      hasError = true;
    } else if (row.coupon_code.length > MAX_CODE_LENGTH) {
      errors.push({
        row_number: row.row_number,
        field: "coupon_code",
        message: `Coupon code exceeds ${MAX_CODE_LENGTH} characters`,
      });
      hasError = true;
    } else if (seenCodes.has(row.coupon_code.toUpperCase())) {
      errors.push({
        row_number: row.row_number,
        field: "coupon_code",
        message: `Duplicate coupon code: ${row.coupon_code}`,
      });
      hasError = true;
    }

    // Validate expiry_date
    const parsedDate = new Date(row.expiry_date);
    if (!row.expiry_date || isNaN(parsedDate.getTime())) {
      errors.push({
        row_number: row.row_number,
        field: "expiry_date",
        message: `Invalid date format: "${row.expiry_date}". Use ISO format (YYYY-MM-DD)`,
      });
      hasError = true;
    } else if (parsedDate <= new Date()) {
      errors.push({
        row_number: row.row_number,
        field: "expiry_date",
        message: `Expiry date must be in the future`,
      });
      hasError = true;
    }

    if (!hasError) {
      seenCodes.add(row.coupon_code.toUpperCase());
      valid.push(row);
    }
  }

  return { valid, errors };
}

/**
 * Generate a downloadable sample CSV template string.
 */
export function generateSampleCSV(): string {
  return [
    "coupon_code,expiry_date",
    "SAVE10-ABC123,2026-06-30",
    "SAVE10-DEF456,2026-06-30",
    "SAVE10-GHI789,2026-06-30",
  ].join("\n");
}

/**
 * Trigger a file download in the browser.
 */
export function downloadCSVTemplate(): void {
  const csvContent = generateSampleCSV();
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "coupon_upload_template.csv";
  link.click();
  URL.revokeObjectURL(url);
}

/**
 * Read a File as text using FileReader.
 */
function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsText(file);
  });
}
