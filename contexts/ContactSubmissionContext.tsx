"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { toast } from "sonner";
import {
  ContactSubmission,
  CreateContactSubmissionDTO,
  UpdateContactSubmissionDTO,
  ReplyToSubmissionDTO,
  ContactSubmissionOperationResult,
} from "@/types/contactSubmission";

interface ContactSubmissionContextType {
  submissions: ContactSubmission[];
  loading: boolean;
  error: string | null;
  createSubmission: (
    data: CreateContactSubmissionDTO
  ) => Promise<ContactSubmissionOperationResult>;
  updateSubmission: (
    data: UpdateContactSubmissionDTO
  ) => Promise<ContactSubmissionOperationResult>;
  deleteSubmission: (id: string) => Promise<ContactSubmissionOperationResult>;
  replyToSubmission: (
    data: ReplyToSubmissionDTO
  ) => Promise<ContactSubmissionOperationResult>;
  markAsRead: (id: string) => Promise<ContactSubmissionOperationResult>;
  markAsArchived: (id: string) => Promise<ContactSubmissionOperationResult>;
  getNewSubmissionsCount: () => number;
  getUnreadSubmissionsCount: () => number;
  refreshSubmissions: () => Promise<void>;
}

const ContactSubmissionContext = createContext<
  ContactSubmissionContextType | undefined
>(undefined);

export function ContactSubmissionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [submissions, setSubmissions] = useState<ContactSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch all contact submissions
   */
  const fetchSubmissions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/contact-submissions");
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to fetch contact submissions");
      }

      // Convert date strings back to Date objects
      const submissions = data.submissions.map((s: any) => ({
        ...s,
        createdAt: new Date(s.createdAt),
        updatedAt: new Date(s.updatedAt),
        repliedAt: s.repliedAt ? new Date(s.repliedAt) : undefined,
      }));

      setSubmissions(submissions);
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to fetch contact submissions";
      setError(errorMessage);
      console.error("Error fetching contact submissions:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Create a new contact submission
   */
  const createSubmission = async (
    data: CreateContactSubmissionDTO
  ): Promise<ContactSubmissionOperationResult> => {
    try {
      const response = await fetch("/api/contact-submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        return {
          success: false,
          error: result.error || "Failed to submit contact form",
          validationErrors: result.validationErrors,
        };
      }

      // Convert dates
      const submission = {
        ...result.submission,
        createdAt: new Date(result.submission.createdAt),
        updatedAt: new Date(result.submission.updatedAt),
      };

      // Add to state
      setSubmissions((prev) => [submission, ...prev]);

      return { success: true, data: submission };
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to submit contact form";
      return { success: false, error: errorMessage };
    }
  };

  /**
   * Update a contact submission
   */
  const updateSubmission = async (
    data: UpdateContactSubmissionDTO
  ): Promise<ContactSubmissionOperationResult> => {
    try {
      const response = await fetch("/api/contact-submissions", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        toast.error(result.error || "Failed to update submission");
        return { success: false, error: result.error };
      }

      // Convert dates
      const updated = {
        ...result.submission,
        createdAt: new Date(result.submission.createdAt),
        updatedAt: new Date(result.submission.updatedAt),
        repliedAt: result.submission.repliedAt
          ? new Date(result.submission.repliedAt)
          : undefined,
      };

      // Update state
      setSubmissions((prev) =>
        prev.map((s) => (s.id === updated.id ? updated : s))
      );

      toast.success("Submission updated successfully");
      return { success: true, data: updated };
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to update submission";
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  /**
   * Delete a contact submission
   */
  const deleteSubmission = async (
    id: string
  ): Promise<ContactSubmissionOperationResult> => {
    try {
      const response = await fetch(`/api/contact-submissions?id=${id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        toast.error(result.error || "Failed to delete submission");
        return { success: false, error: result.error };
      }

      // Remove from state
      setSubmissions((prev) => prev.filter((s) => s.id !== id));

      toast.success("Submission deleted successfully");
      return { success: true };
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to delete submission";
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  /**
   * Reply to a contact submission
   */
  const replyToSubmission = async (
    data: ReplyToSubmissionDTO
  ): Promise<ContactSubmissionOperationResult> => {
    try {
      const response = await fetch("/api/contact-submissions/reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        toast.error(result.error || "Failed to send reply");
        return { success: false, error: result.error };
      }

      // Convert dates
      const updated = {
        ...result.submission,
        createdAt: new Date(result.submission.createdAt),
        updatedAt: new Date(result.submission.updatedAt),
        repliedAt: new Date(result.submission.repliedAt),
      };

      // Update state
      setSubmissions((prev) =>
        prev.map((s) => (s.id === updated.id ? updated : s))
      );

      toast.success("Reply sent successfully");
      return { success: true, data: updated };
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to send reply";
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  /**
   * Mark submission as read
   */
  const markAsRead = async (
    id: string
  ): Promise<ContactSubmissionOperationResult> => {
    return updateSubmission({ id, status: "read" });
  };

  /**
   * Mark submission as archived
   */
  const markAsArchived = async (
    id: string
  ): Promise<ContactSubmissionOperationResult> => {
    return updateSubmission({ id, status: "archived" });
  };

  /**
   * Get count of new submissions
   */
  const getNewSubmissionsCount = () => {
    return submissions.filter((s) => s.status === "new").length;
  };

  /**
   * Get count of unread submissions
   */
  const getUnreadSubmissionsCount = () => {
    return submissions.filter((s) => s.status === "new" || s.status === "read")
      .length;
  };

  /**
   * Refresh submissions
   */
  const refreshSubmissions = async () => {
    await fetchSubmissions();
  };

  // Fetch submissions on mount
  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

  const value: ContactSubmissionContextType = {
    submissions,
    loading,
    error,
    createSubmission,
    updateSubmission,
    deleteSubmission,
    replyToSubmission,
    markAsRead,
    markAsArchived,
    getNewSubmissionsCount,
    getUnreadSubmissionsCount,
    refreshSubmissions,
  };

  return (
    <ContactSubmissionContext.Provider value={value}>
      {children}
    </ContactSubmissionContext.Provider>
  );
}

export function useContactSubmissions() {
  const context = useContext(ContactSubmissionContext);
  if (context === undefined) {
    throw new Error(
      "useContactSubmissions must be used within a ContactSubmissionProvider"
    );
  }
  return context;
}
