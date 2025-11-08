"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useRecycleBin } from "@/contexts/RecycleBinContext";
import { useRouter } from "next/navigation";
import {
  Trash2,
  RotateCcw,
  Clock,
  AlertTriangle,
  Search,
  Filter,
  Calendar,
  CheckCircle2,
  ListTodo,
  Timer,
  Bell,
  X,
  ArrowUpDown,
  ArrowLeft,
  Home,
  Mail,
  MessageSquare,
} from "lucide-react";
import { RecycleBinItemSource, RecycleBinFilters } from "@/types/recycleBin";
import { toast } from "sonner";

export default function RecycleBin() {
  const router = useRouter();
  const {
    items,
    loading,
    stats,
    restoreItem,
    permanentlyDelete,
    permanentlyDeleteAll,
    extendExpiry,
    getFilteredItems,
  } = useRecycleBin();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSource, setSelectedSource] = useState<
    RecycleBinItemSource | "all"
  >("all");
  const [sortBy, setSortBy] = useState<"deletedAt" | "expiryDate" | "source">(
    "deletedAt"
  );
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  const [deletingItem, setDeletingItem] = useState<string | null>(null);
  const [restoringItem, setRestoringItem] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  // Prevent hydration mismatch by waiting for client-side mount
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Keyboard navigation - Escape to go back
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        router.back();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [router]);

  const filters: RecycleBinFilters = {
    source: selectedSource === "all" ? undefined : selectedSource,
    searchTerm: searchTerm || undefined,
    sortBy,
    sortOrder,
  };

  const filteredItems = useMemo(
    () => getFilteredItems(filters),
    [getFilteredItems, filters]
  );

  const handleRestore = async (
    recycleBinId: string,
    source: RecycleBinItemSource
  ) => {
    try {
      setRestoringItem(recycleBinId);
      const restoredData = await restoreItem(recycleBinId);

      if (!restoredData) {
        toast.error("Failed to restore item");
        return;
      }

      // Handle restoration based on source
      switch (source) {
        case "todo":
          try {
            const todos = JSON.parse(
              localStorage.getItem(`todos_${restoredData.userId}`) || "[]"
            );
            todos.push(restoredData);
            localStorage.setItem(
              `todos_${restoredData.userId}`,
              JSON.stringify(todos)
            );
          } catch (error) {
            console.error("Error restoring todo to localStorage:", error);
          }
          break;

        case "timesheet":
        case "time-tracker":
          // For timesheet and time-tracker, restore via API if needed
          console.log("Restore via API for:", source, restoredData);
          break;

        case "notification":
          // Restore notification if needed
          console.log("Notification restored:", restoredData);
          break;

        case "project":
        case "testimonial":
        case "workExperience":
        case "contactSubmission":
          // These are managed by Context APIs and Firestore
          // Restoration handled automatically in RecycleBinContext
          console.log("Firestore item restored - Context will sync:", source);
          break;

        default:
          console.warn("Unknown source type:", source);
      }

      toast.success(`${getSourceLabel(source)} restored successfully`);
    } catch (error) {
      console.error("Error in handleRestore:", error);
      toast.error("Failed to restore item");
    } finally {
      setRestoringItem(null);
    }
  };

  const handlePermanentDelete = async (recycleBinId: string) => {
    if (
      !confirm("Permanently delete this item? This action cannot be undone!")
    ) {
      return;
    }

    try {
      setDeletingItem(recycleBinId);
      await permanentlyDelete(recycleBinId);
      toast.success("Item permanently deleted");
    } catch (error) {
      console.error("Error deleting item:", error);
      toast.error("Failed to delete item");
    } finally {
      setDeletingItem(null);
    }
  };

  const handleEmptyBin = async () => {
    if (items.length === 0) {
      toast.info("Recycle bin is already empty");
      return;
    }

    if (
      !confirm(
        `Permanently delete all ${items.length} items? This action cannot be undone!`
      )
    ) {
      return;
    }

    try {
      await permanentlyDeleteAll();
      toast.success("Recycle bin emptied successfully");
    } catch (error) {
      console.error("Error emptying recycle bin:", error);
      toast.error("Failed to empty recycle bin");
    }
  };

  const getSourceIcon = (source: RecycleBinItemSource) => {
    switch (source) {
      case "todo":
        return <ListTodo className="w-4 h-4" />;
      case "timesheet":
        return <Calendar className="w-4 h-4" />;
      case "time-tracker":
        return <Timer className="w-4 h-4" />;
      case "notification":
        return <Bell className="w-4 h-4" />;
      case "project":
        return <CheckCircle2 className="w-4 h-4" />;
      case "testimonial":
        return <MessageSquare className="w-4 h-4" />;
      case "workExperience":
        return <Clock className="w-4 h-4" />;
      case "contactSubmission":
        return <Mail className="w-4 h-4" />;
      default:
        return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const getSourceLabel = (source: RecycleBinItemSource) => {
    switch (source) {
      case "todo":
        return "Todo";
      case "timesheet":
        return "Timesheet";
      case "time-tracker":
        return "Time Log";
      case "notification":
        return "Notification";
      case "project":
        return "Project";
      case "testimonial":
        return "Testimonial";
      case "workExperience":
        return "Work Experience";
      case "contactSubmission":
        return "Contact Submission";
      default:
        return "Unknown";
    }
  };

  const getSourceColor = (source: RecycleBinItemSource) => {
    switch (source) {
      case "todo":
        return "bg-blue-100 text-blue-800";
      case "timesheet":
        return "bg-green-100 text-green-800";
      case "time-tracker":
        return "bg-purple-100 text-purple-800";
      case "notification":
        return "bg-yellow-100 text-yellow-800";
      case "project":
        return "bg-orange-100 text-orange-800";
      case "testimonial":
        return "bg-pink-100 text-pink-800";
      case "workExperience":
        return "bg-indigo-100 text-indigo-800";
      case "contactSubmission":
        return "bg-teal-100 text-teal-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTimeRemaining = (expiryDate: string) => {
    const now = new Date().getTime();
    const expiry = new Date(expiryDate).getTime();
    const diff = expiry - now;

    if (diff <= 0) return "Expired";

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) return `${days}d ${hours}h`;
    return `${hours}h`;
  };

  const isExpiringSoon = (expiryDate: string) => {
    const now = new Date().getTime();
    const expiry = new Date(expiryDate).getTime();
    const diff = expiry - now;
    return diff <= 24 * 60 * 60 * 1000; // Less than 24 hours
  };

  const formatItemPreview = (item: any, source: RecycleBinItemSource) => {
    switch (source) {
      case "todo":
        return {
          title: item.title || "Untitled Todo",
          description: item.description || "No description",
        };
      case "timesheet":
      case "time-tracker":
        return {
          title: `${item.date || "Unknown date"} - ${
            item.project || "No project"
          }`,
          description: `${item.hours || 0}h - ${
            item.description || "No description"
          }`,
        };
      case "notification":
        return {
          title: item.title || "Notification",
          description: item.message || "No message",
        };
      default:
        return { title: "Unknown", description: "" };
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb Navigation */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-sm">
            <button
              onClick={() => router.push("/admin/dashboard")}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <Home className="w-4 h-4" />
              <span>Dashboard</span>
            </button>
            <span className="text-gray-400">/</span>
            <span className="text-gray-900 font-medium">Recycle Bin</span>
          </div>
        </div>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.back()}
                className="p-2 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 transition-colors"
                title="Go back"
              >
                <ArrowLeft className="w-5 h-5 text-gray-700" />
              </button>
              <div className="p-3 bg-red-100 rounded-lg">
                <Trash2 className="w-8 h-8 text-red-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Recycle Bin
                </h1>
                <p className="text-gray-600 text-sm">
                  Deleted items are kept for 15-30 days before permanent
                  deletion
                </p>
              </div>
            </div>
            <button
              onClick={() => router.push("/admin/dashboard")}
              className="hidden md:flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Home className="w-4 h-4" />
              <span>Back to Dashboard</span>
            </button>
          </div>
        </div>

        {/* Stats Cards - Admin Panel Items */}
        {isMounted ? (
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
            <div className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-gray-500">
              <div className="text-2xl font-bold text-gray-900">
                {stats.total}
              </div>
              <div className="text-sm text-gray-600">Total Items</div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-orange-500">
              <div className="text-2xl font-bold text-orange-600">
                {stats.projects}
              </div>
              <div className="text-sm text-gray-600">Projects</div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-pink-500">
              <div className="text-2xl font-bold text-pink-600">
                {stats.testimonials}
              </div>
              <div className="text-sm text-gray-600">Testimonials</div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-indigo-500">
              <div className="text-2xl font-bold text-indigo-600">
                {stats.workExperiences}
              </div>
              <div className="text-sm text-gray-600">Work Exp</div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-teal-500">
              <div className="text-2xl font-bold text-teal-600">
                {stats.contactSubmissions}
              </div>
              <div className="text-sm text-gray-600">Contact Forms</div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-red-500">
              <div className="text-2xl font-bold text-red-600">
                {stats.expiringWithin24Hours}
              </div>
              <div className="text-sm text-gray-600">Expiring Soon</div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-gray-300 animate-pulse"
              >
                <div className="h-8 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-20"></div>
              </div>
            ))}
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg p-4 shadow-sm mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900"
              />
            </div>

            {/* Source Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select
                value={selectedSource}
                onChange={(e) => setSelectedSource(e.target.value as any)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 appearance-none"
                aria-label="Filter by source"
                title="Filter by source"
              >
                <option value="all">All Sources</option>
                <option value="todo">Todos</option>
                <option value="timesheet">Timesheets</option>
                <option value="time-tracker">Time Logs</option>
                <option value="notification">Notifications</option>
              </select>
            </div>

            {/* Sort By */}
            <div className="relative">
              <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 appearance-none"
                aria-label="Sort by"
                title="Sort by"
              >
                <option value="deletedAt">Deleted Date</option>
                <option value="expiryDate">Expiry Date</option>
                <option value="source">Source</option>
              </select>
            </div>

            {/* Delete All Button */}
            <button
              onClick={handleEmptyBin}
              disabled={loading || items.length === 0}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Empty Bin
            </button>
          </div>
        </div>

        {/* Items List */}
        <div className="space-y-3">
          {filteredItems.length === 0 ? (
            <div className="bg-white rounded-lg p-12 text-center shadow-sm">
              <Trash2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Recycle Bin is Empty
              </h3>
              <p className="text-gray-600">
                {searchTerm || selectedSource !== "all"
                  ? "No items match your filters"
                  : "Deleted items will appear here"}
              </p>
            </div>
          ) : (
            filteredItems.map((item) => {
              const preview = formatItemPreview(item.data, item.source);
              const timeRemaining = getTimeRemaining(item.expiryDate);
              const expiringSoon = isExpiringSoon(item.expiryDate);
              const isExpanded = expandedItem === item.id;

              return (
                <div
                  key={item.id}
                  className="bg-white rounded-lg shadow-sm overflow-hidden"
                >
                  <div className="p-4">
                    <div className="flex items-start gap-4">
                      {/* Source Icon */}
                      <div
                        className={`p-2 rounded-lg ${getSourceColor(
                          item.source
                        )}`}
                      >
                        {getSourceIcon(item.source)}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 truncate">
                              {preview.title}
                            </h3>
                            <p className="text-sm text-gray-600 line-clamp-2">
                              {preview.description}
                            </p>
                          </div>
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap ${getSourceColor(
                              item.source
                            )}`}
                          >
                            {getSourceLabel(item.source)}
                          </span>
                        </div>

                        {/* Meta Info */}
                        <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                          <span>
                            Deleted:{" "}
                            {new Date(item.deletedAt).toLocaleDateString()}
                          </span>
                          <span
                            className={
                              expiringSoon ? "text-red-600 font-semibold" : ""
                            }
                          >
                            {expiringSoon && (
                              <AlertTriangle className="w-3 h-3 inline mr-1" />
                            )}
                            Expires in: {timeRemaining}
                          </span>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => handleRestore(item.id, item.source)}
                            disabled={
                              restoringItem === item.id ||
                              deletingItem === item.id
                            }
                            className="px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 text-sm"
                          >
                            {restoringItem === item.id ? (
                              <>
                                <Clock className="w-3 h-3 animate-spin" />
                                Restoring...
                              </>
                            ) : (
                              <>
                                <RotateCcw className="w-3 h-3" />
                                Restore
                              </>
                            )}
                          </button>

                          <button
                            onClick={() =>
                              extendExpiry(
                                item.id,
                                item.expiryDays === 15 ? 30 : 15
                              )
                            }
                            disabled={
                              restoringItem === item.id ||
                              deletingItem === item.id
                            }
                            className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 text-sm"
                          >
                            <Clock className="w-3 h-3" />
                            {item.expiryDays === 15
                              ? "Extend to 30d"
                              : "Set to 15d"}
                          </button>

                          <button
                            onClick={() => handlePermanentDelete(item.id)}
                            disabled={
                              restoringItem === item.id ||
                              deletingItem === item.id
                            }
                            className="px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 text-sm"
                          >
                            {deletingItem === item.id ? (
                              <>
                                <Clock className="w-3 h-3 animate-spin" />
                                Deleting...
                              </>
                            ) : (
                              <>
                                <Trash2 className="w-3 h-3" />
                                Delete Forever
                              </>
                            )}
                          </button>

                          <button
                            onClick={() =>
                              setExpandedItem(isExpanded ? null : item.id)
                            }
                            disabled={
                              restoringItem === item.id ||
                              deletingItem === item.id
                            }
                            className="px-3 py-1.5 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 text-sm"
                          >
                            {isExpanded ? "Hide" : "View"} Details
                          </button>
                        </div>

                        {/* Expanded Details */}
                        {isExpanded && (
                          <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                            <pre className="text-xs text-gray-700 overflow-auto">
                              {JSON.stringify(item.data, null, 2)}
                            </pre>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
