"use client";

import React, { useState, useMemo } from "react";
import { useContactSubmissions } from "@/contexts/ContactSubmissionContext";
import { useRecycleBin } from "@/contexts/RecycleBinContext";
import {
  Mail,
  MailOpen,
  Trash2,
  Archive,
  Search,
  Filter,
  X,
  Loader2,
  AlertCircle,
  Clock,
  CheckCircle,
  User,
  MessageSquare,
  Calendar,
} from "lucide-react";
import { toast } from "sonner";
import { ContactSubmission } from "@/types/contactSubmission";
import { formatDistanceToNow } from "date-fns";

export default function ContactSubmissionManager() {
  const {
    submissions,
    loading,
    deleteSubmission,
    replyToSubmission,
    markAsRead,
    markAsArchived,
    getNewSubmissionsCount,
  } = useContactSubmissions();

  const { moveToRecycleBin } = useRecycleBin();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "unread" | "read" | "archived"
  >("all");
  const [viewingSubmission, setViewingSubmission] =
    useState<ContactSubmission | null>(null);
  const [deletingSubmission, setDeletingSubmission] =
    useState<ContactSubmission | null>(null);

  // Filter and search submissions
  const filteredSubmissions = useMemo(() => {
    let filtered = submissions;

    // Filter by status
    if (statusFilter !== "all") {
      if (statusFilter === "unread") {
        filtered = filtered.filter((s) => s.status === "new");
      } else if (statusFilter === "read") {
        filtered = filtered.filter(
          (s) => s.status === "read" || s.status === "replied"
        );
      } else {
        filtered = filtered.filter((s) => s.status === statusFilter);
      }
    }

    // Search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (s) =>
          s.name.toLowerCase().includes(query) ||
          s.email.toLowerCase().includes(query) ||
          s.message.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [submissions, statusFilter, searchQuery]);

  // Stats
  const stats = useMemo(() => {
    const unread = submissions.filter((s) => s.status === "new").length;
    const read = submissions.filter(
      (s) =>
        s.status === "read" || s.status === "replied" || s.status === "archived"
    ).length;

    return {
      total: submissions.length,
      unread: unread,
      read: read,
      archived: submissions.filter((s) => s.status === "archived").length,
    };
  }, [submissions]);

  /**
   * Handle viewing submission
   */
  const handleView = async (submission: ContactSubmission) => {
    setViewingSubmission(submission);

    // Mark as read if it's new
    if (submission.status === "new") {
      await markAsRead(submission.id);
    }
  };

  /**
   * Handle delete
   */
  const handleDelete = async (id: string) => {
    const submission = submissions.find((s) => s.id === id);
    if (submission) {
      setDeletingSubmission(submission);
    }
  };

  /**
   * Confirm delete - Move to recycle bin instead of permanent delete
   */
  const confirmDelete = async () => {
    if (!deletingSubmission) return;

    try {
      // Move to recycle bin first
      await moveToRecycleBin(
        "contactSubmission",
        deletingSubmission,
        deletingSubmission.id
      );

      // Then delete from active submissions
      await deleteSubmission(deletingSubmission.id);

      if (viewingSubmission?.id === deletingSubmission.id) {
        setViewingSubmission(null);
      }
      setDeletingSubmission(null);
      toast.success("Submission moved to recycle bin");
    } catch (error) {
      toast.error("Failed to delete submission");
      console.error(error);
    }
  };

  /**
   * Handle archive
   */
  const handleArchive = async (id: string) => {
    await markAsArchived(id);
    if (viewingSubmission?.id === id) {
      setViewingSubmission(null);
    }
  };

  /**
   * Get status badge
   */
  const getStatusBadge = (status: string) => {
    const badges = {
      new: (
        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded-full">
          <Mail className="w-3 h-3" />
          Unread
        </span>
      ),
      read: (
        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-full">
          <MailOpen className="w-3 h-3" />
          Read
        </span>
      ),
      replied: (
        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-full">
          <CheckCircle className="w-3 h-3" />
          Read
        </span>
      ),
      archived: (
        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-gray-700 bg-gray-100 rounded-full">
          <Archive className="w-3 h-3" />
          Archived
        </span>
      ),
    };
    return badges[status as keyof typeof badges] || null;
  };

  if (loading && submissions.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          <div className="text-sm text-gray-600">Total</div>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="text-2xl font-bold text-blue-700">{stats.unread}</div>
          <div className="text-sm text-blue-600">Unread</div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="text-2xl font-bold text-green-700">{stats.read}</div>
          <div className="text-sm text-green-600">Read</div>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="text-2xl font-bold text-gray-700">
            {stats.archived}
          </div>
          <div className="text-sm text-gray-600">Archived</div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, email, or message..."
              className="w-full pl-10 pr-4 py-2 bg-white text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-400"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(
                  e.target.value as "all" | "unread" | "read" | "archived"
                )
              }
              className="px-4 py-2 bg-white text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Filter by status"
              title="Filter by status"
            >
              <option value="all">All Status</option>
              <option value="unread">Unread</option>
              <option value="read">Read</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>
      </div>

      {/* Submissions List */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        {filteredSubmissions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-500">
            <Mail className="w-16 h-16 mb-4 text-gray-300" />
            <p className="text-lg font-medium">No submissions found</p>
            <p className="text-sm">
              {searchQuery || statusFilter !== "all"
                ? "Try adjusting your filters"
                : "Contact form submissions will appear here"}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredSubmissions.map((submission) => (
              <div
                key={submission.id}
                className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                  submission.status === "new" ? "bg-blue-50/30" : ""
                }`}
                onClick={() => handleView(submission)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="font-medium text-gray-900">
                          {submission.name}
                        </span>
                      </div>
                      <span className="text-sm text-gray-500">
                        {submission.email}
                      </span>
                      {getStatusBadge(submission.status)}
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                      {submission.message}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDistanceToNow(new Date(submission.createdAt), {
                          addSuffix: true,
                        })}
                      </span>
                      {submission.isReplied && submission.repliedAt && (
                        <span className="flex items-center gap-1 text-green-600">
                          <CheckCircle className="w-3 h-3" />
                          Replied{" "}
                          {formatDistanceToNow(new Date(submission.repliedAt), {
                            addSuffix: true,
                          })}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {submission.status === "new" && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          markAsRead(submission.id);
                          toast.success("Marked as read");
                        }}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Mark as Read"
                      >
                        <MailOpen className="w-4 h-4" />
                      </button>
                    )}
                    {submission.status !== "archived" && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleArchive(submission.id);
                        }}
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Archive"
                      >
                        <Archive className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(submission.id);
                      }}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* View Submission Modal - Horizontal Layout */}
      {viewingSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4 flex items-center justify-between rounded-t-xl">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">
                    Contact Submission Details
                  </h3>
                  <p className="text-blue-100 text-sm">
                    Review and manage submission
                  </p>
                </div>
              </div>
              <button
                onClick={() => setViewingSubmission(null)}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content - Horizontal Layout */}
            <div className="p-6">
              {/* Top Info Bar */}
              <div className="grid grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-blue-700 mb-2">
                    <Clock className="w-4 h-4" />
                    <span className="text-xs font-semibold uppercase tracking-wide">
                      Received
                    </span>
                  </div>
                  <p className="text-sm font-bold text-gray-900">
                    {formatDistanceToNow(
                      new Date(viewingSubmission.createdAt),
                      {
                        addSuffix: true,
                      }
                    )}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    {new Date(viewingSubmission.createdAt).toLocaleString(
                      "en-US",
                      {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      }
                    )}
                  </p>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-green-700 mb-2">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-xs font-semibold uppercase tracking-wide">
                      Status
                    </span>
                  </div>
                  <div className="mt-1">
                    {getStatusBadge(viewingSubmission.status)}
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    {viewingSubmission.status === "new" ? "Unread" : "Read"}
                  </p>
                </div>

                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-purple-700 mb-2">
                    <User className="w-4 h-4" />
                    <span className="text-xs font-semibold uppercase tracking-wide">
                      Sender
                    </span>
                  </div>
                  <p className="text-sm font-bold text-gray-900 truncate">
                    {viewingSubmission.name}
                  </p>
                  <p className="text-xs text-gray-600 mt-1 truncate">
                    {viewingSubmission.email}
                  </p>
                </div>

                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-orange-700 mb-2">
                    <Mail className="w-4 h-4" />
                    <span className="text-xs font-semibold uppercase tracking-wide">
                      Reply
                    </span>
                  </div>
                  <p className="text-sm font-bold text-gray-900">
                    {viewingSubmission.isReplied ? "Replied" : "Pending"}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    {viewingSubmission.isReplied && viewingSubmission.repliedAt
                      ? formatDistanceToNow(
                          new Date(viewingSubmission.repliedAt),
                          { addSuffix: true }
                        )
                      : "No reply yet"}
                  </p>
                </div>
              </div>

              {/* Main Content - Horizontal Split */}
              <div className="grid grid-cols-2 gap-6 mb-6">
                {/* Left: Contact Details */}
                <div className="space-y-4">
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-5">
                    <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4 flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Contact Information
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs font-medium text-gray-500 uppercase">
                          Full Name
                        </label>
                        <p className="text-base font-semibold text-gray-900 mt-1">
                          {viewingSubmission.name}
                        </p>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-500 uppercase">
                          Email Address
                        </label>
                        <a
                          href={`mailto:${viewingSubmission.email}`}
                          className="text-base font-semibold text-blue-600 hover:text-blue-700 hover:underline mt-1 block"
                        >
                          {viewingSubmission.email}
                        </a>
                      </div>
                      {viewingSubmission.userAgent && (
                        <div>
                          <label className="text-xs font-medium text-gray-500 uppercase">
                            Browser
                          </label>
                          <p
                            className="text-sm text-gray-700 mt-1 truncate"
                            title={viewingSubmission.userAgent}
                          >
                            {viewingSubmission.userAgent.substring(0, 50)}...
                          </p>
                        </div>
                      )}
                      {viewingSubmission.ipAddress && (
                        <div>
                          <label className="text-xs font-medium text-gray-500 uppercase">
                            IP Address
                          </label>
                          <p className="text-sm text-gray-700 mt-1">
                            {viewingSubmission.ipAddress}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Timestamps */}
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-5">
                    <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4 flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Timeline
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs font-medium text-gray-500 uppercase">
                          Submitted At
                        </label>
                        <p className="text-sm font-semibold text-gray-900 mt-1">
                          {new Date(viewingSubmission.createdAt).toLocaleString(
                            "en-US",
                            {
                              weekday: "long",
                              month: "long",
                              day: "numeric",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                              second: "2-digit",
                            }
                          )}
                        </p>
                      </div>
                      {viewingSubmission.isReplied &&
                        viewingSubmission.repliedAt && (
                          <>
                            <div>
                              <label className="text-xs font-medium text-gray-500 uppercase">
                                Replied At
                              </label>
                              <p className="text-sm font-semibold text-gray-900 mt-1">
                                {new Date(
                                  viewingSubmission.repliedAt
                                ).toLocaleString("en-US", {
                                  weekday: "long",
                                  month: "long",
                                  day: "numeric",
                                  year: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                  second: "2-digit",
                                })}
                              </p>
                            </div>
                            {viewingSubmission.repliedBy && (
                              <div>
                                <label className="text-xs font-medium text-gray-500 uppercase">
                                  Replied By
                                </label>
                                <p className="text-sm font-semibold text-gray-900 mt-1">
                                  {viewingSubmission.repliedBy}
                                </p>
                              </div>
                            )}
                          </>
                        )}
                    </div>
                  </div>
                </div>

                {/* Right: Message Content */}
                <div className="space-y-4">
                  <div className="bg-white border-2 border-gray-200 rounded-lg p-5 h-full">
                    <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4 flex items-center gap-2">
                      <MessageSquare className="w-4 h-4" />
                      Message
                    </h4>
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 min-h-[200px]">
                      <p className="text-gray-900 whitespace-pre-wrap leading-relaxed">
                        {viewingSubmission.message}
                      </p>
                    </div>
                  </div>

                  {/* Reply Message if exists */}
                  {viewingSubmission.isReplied &&
                    viewingSubmission.replyMessage && (
                      <div className="bg-green-50 border-2 border-green-200 rounded-lg p-5">
                        <h4 className="text-sm font-semibold text-green-900 uppercase tracking-wide mb-4 flex items-center gap-2">
                          <CheckCircle className="w-4 h-4" />
                          Your Reply
                        </h4>
                        <div className="bg-white border border-green-200 rounded-lg p-4">
                          <p className="text-gray-900 whitespace-pre-wrap leading-relaxed">
                            {viewingSubmission.replyMessage}
                          </p>
                        </div>
                      </div>
                    )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-4 border-t-2 border-gray-200">
                <div className="text-sm text-gray-600">
                  <p className="font-medium">
                    Admin can reply manually via email:{" "}
                    <a
                      href={`mailto:${viewingSubmission.email}`}
                      className="text-blue-600 hover:underline"
                    >
                      {viewingSubmission.email}
                    </a>
                  </p>
                </div>
                <div className="flex gap-3">
                  {viewingSubmission.status === "new" && (
                    <button
                      onClick={() => {
                        markAsRead(viewingSubmission.id);
                        toast.success("Marked as read");
                      }}
                      className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                      <MailOpen className="w-4 h-4" />
                      Mark as Read
                    </button>
                  )}
                  {viewingSubmission.status !== "archived" && (
                    <button
                      onClick={() => {
                        handleArchive(viewingSubmission.id);
                        setViewingSubmission(null);
                      }}
                      className="flex items-center gap-2 px-5 py-2.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
                    >
                      <Archive className="w-4 h-4" />
                      Archive
                    </button>
                  )}
                  <button
                    onClick={() => {
                      handleDelete(viewingSubmission.id);
                      setViewingSubmission(null);
                    }}
                    className="flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                  <button
                    onClick={() => setViewingSubmission(null)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-4 flex items-center gap-3 rounded-t-xl">
              <div className="p-2 bg-white/20 rounded-lg">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Confirm Deletion</h3>
                <p className="text-red-100 text-sm">
                  This action cannot be undone
                </p>
              </div>
            </div>

            <div className="p-6">
              <p className="text-gray-900 mb-6">
                Are you sure you want to delete the submission from{" "}
                <span className="font-semibold">{deletingSubmission.name}</span>{" "}
                ({deletingSubmission.email})?
              </p>

              <div className="flex gap-3">
                <button
                  onClick={confirmDelete}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
                <button
                  onClick={() => setDeletingSubmission(null)}
                  className="flex-1 px-6 py-3 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
