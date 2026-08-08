/**
 * Hook for polling upload job status.
 * Polls every 3 seconds until job completes or fails.
 */

import { useEffect, useRef, useState, useCallback } from "react";
import { getUploadJobStatus } from "@/api/coupon-upload";
import type { CouponUploadJob } from "@/types/csv-upload";

const POLL_INTERVAL_MS = 3000;

interface UseUploadJobReturn {
  job: CouponUploadJob | null;
  isPolling: boolean;
  error: string | null;
  startPolling: (jobId: string) => void;
  stopPolling: () => void;
}

export function useUploadJob(): UseUploadJobReturn {
  const [job, setJob] = useState<CouponUploadJob | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const jobIdRef = useRef<string | null>(null);

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsPolling(false);
    jobIdRef.current = null;
  }, []);

  const poll = useCallback(
    async (jobId: string) => {
      try {
        const status = await getUploadJobStatus(jobId);
        setJob(status);
        setError(null);

        // Stop polling when job is terminal
        if (status.status === "completed" || status.status === "failed") {
          stopPolling();
        }
      } catch (err: any) {
        const message =
          err.response?.data?.message ||
          err.message ||
          "Failed to fetch job status";
        setError(message);
        // Don't stop polling on transient errors — let it retry
      }
    },
    [stopPolling],
  );

  const startPolling = useCallback(
    (jobId: string) => {
      // Clear any existing poll
      stopPolling();

      jobIdRef.current = jobId;
      setIsPolling(true);
      setError(null);
      setJob(null);

      // Fetch immediately, then poll
      poll(jobId);
      intervalRef.current = setInterval(() => {
        if (jobIdRef.current) {
          poll(jobIdRef.current);
        }
      }, POLL_INTERVAL_MS);
    },
    [poll, stopPolling],
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return { job, isPolling, error, startPolling, stopPolling };
}
