/**
 * API functions for CSV coupon upload.
 */

import axiosInstance from "./axios";
import type { CouponUploadJob } from "@/types/csv-upload";

/**
 * Upload a CSV file for async coupon processing.
 * @returns The job ID for polling status.
 */
export async function uploadCouponCSV(
  file: File,
  offerId: string,
): Promise<{ job_id: string }> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("offer_id", offerId);

  const response = await axiosInstance.post("/coupon/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return response.data.data;
}

/**
 * Poll the status of an upload job.
 */
export async function getUploadJobStatus(
  jobId: string,
): Promise<CouponUploadJob> {
  const response = await axiosInstance.get(`/coupon/upload/${jobId}/status`);
  return response.data.data;
}

/**
 * Get the merchant's upload history.
 */
export async function getUploadHistory(): Promise<CouponUploadJob[]> {
  const response = await axiosInstance.get("/coupon/upload/history");
  return response.data.data;
}
