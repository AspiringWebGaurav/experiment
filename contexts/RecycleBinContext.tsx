"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import {
  RecycleBinItem,
  RecycleBinItemSource,
  RecycleBinStats,
  RecycleBinFilters,
} from "@/types/recycleBin";
import {
  notifyError,
  notifyItemMovedToRecycleBin,
  notifyItemRestored,
  notifyItemDeleted,
  notifySuccess,
  notifyInfo,
} from "@/lib/notifications";

interface RecycleBinContextType {
  items: RecycleBinItem[];
  loading: boolean;
  stats: RecycleBinStats;
  moveToRecycleBin: (
    source: RecycleBinItemSource,
    data: any,
    originalId: string
  ) => Promise<void>;
  restoreItem: (recycleBinId: string) => Promise<any>;
  permanentlyDelete: (recycleBinId: string) => Promise<void>;
  permanentlyDeleteAll: () => Promise<void>;
  extendExpiry: (recycleBinId: string, days: 15 | 30) => Promise<void>;
  getFilteredItems: (filters?: RecycleBinFilters) => RecycleBinItem[];
  refreshItems: () => void;
}

const RecycleBinContext = createContext<RecycleBinContextType | undefined>(
  undefined
);

export const useRecycleBin = () => {
  const context = useContext(RecycleBinContext);
  if (!context) {
    throw new Error("useRecycleBin must be used within RecycleBinProvider");
  }
  return context;
};

interface RecycleBinProviderProps {
  children: ReactNode;
}

export const RecycleBinProvider: React.FC<RecycleBinProviderProps> = ({
  children,
}) => {
  const [currentUserId, setCurrentUserId] = useState<string | null>(
    "portfolio-user"
  );
  const [items, setItems] = useState<RecycleBinItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<RecycleBinStats>({
    total: 0,
    todos: 0,
    timesheets: 0,
    timeLogs: 0,
    notifications: 0,
    projects: 0,
    testimonials: 0,
    workExperiences: 0,
    contactSubmissions: 0,
    expiringWithin24Hours: 0,
  });

  // Set user ID on mount
  useEffect(() => {
    setCurrentUserId("portfolio-user");
  }, []);

  // Load items from Firestore with real-time listener
  useEffect(() => {
    if (!currentUserId) return;

    setLoading(true);

    const setupListener = async () => {
      try {
        const { db } = await import("@/lib/firebase");
        const { collection, query, orderBy, onSnapshot } = await import(
          "firebase/firestore"
        );

        const recycleBinRef = collection(db, "recycleBin");
        const q = query(recycleBinRef, orderBy("deletedAt", "desc"));

        const unsubscribe = onSnapshot(
          q,
          (snapshot) => {
            const recycleBinItems: RecycleBinItem[] = [];
            snapshot.forEach((doc) => {
              const data = doc.data();
              recycleBinItems.push({
                id: doc.id,
                ...data,
                deletedAt:
                  data.deletedAt?.toDate?.()?.toISOString() || data.deletedAt,
                expiryDate:
                  data.expiryDate?.toDate?.()?.toISOString() || data.expiryDate,
              } as RecycleBinItem);
            });
            setItems(recycleBinItems);
            setLoading(false);
          },
          (error) => {
            console.error("Error loading recycle bin from Firestore:", error);
            setItems([]);
            setLoading(false);
          }
        );

        return unsubscribe;
      } catch (error) {
        console.error("Error setting up Firestore listener:", error);
        setLoading(false);
      }
    };

    let unsubscribe: (() => void) | undefined;
    setupListener().then((unsub) => {
      unsubscribe = unsub;
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [currentUserId]);

  // Update stats when items change
  useEffect(() => {
    updateStats();
  }, [items]);

  // Helper function to clean data for Firestore (remove undefined values)
  const cleanFirestoreData = (data: any): any => {
    if (data === null || data === undefined) {
      return null;
    }

    if (Array.isArray(data)) {
      return data.map(cleanFirestoreData).filter((item) => item !== null);
    }

    if (typeof data === "object" && data !== null) {
      // Handle Date objects - convert to ISO string
      if (data instanceof Date) {
        return data.toISOString();
      }

      // Handle Firestore Timestamp objects - convert to ISO string
      if (data.toDate && typeof data.toDate === "function") {
        try {
          return data.toDate().toISOString();
        } catch (e) {
          return null;
        }
      }

      const cleaned: any = {};
      Object.keys(data).forEach((key) => {
        const value = data[key];
        // Skip undefined values completely
        if (value !== undefined) {
          const cleanedValue = cleanFirestoreData(value);
          // Only add non-null values
          if (cleanedValue !== null || value === null) {
            cleaned[key] = cleanedValue;
          }
        }
      });
      return cleaned;
    }

    return data;
  };

  const saveItemToFirestore = async (item: RecycleBinItem): Promise<void> => {
    try {
      const { db } = await import("@/lib/firebase");
      const { collection, doc, setDoc, Timestamp } = await import(
        "firebase/firestore"
      );

      const recycleBinRef = collection(db, "recycleBin");

      // Clean the data to remove undefined values
      const cleanedData = cleanFirestoreData(item.data);

      // Convert dates to Firestore Timestamps
      const firestoreItem = {
        ...item,
        data: cleanedData,
        deletedAt: Timestamp.fromDate(new Date(item.deletedAt)),
        expiryDate: Timestamp.fromDate(new Date(item.expiryDate)),
      };

      await setDoc(doc(recycleBinRef, item.id), firestoreItem);
    } catch (error) {
      console.error("Error saving to Firestore:", error);
      throw error;
    }
  };

  const deleteItemFromFirestore = async (itemId: string): Promise<void> => {
    try {
      const { db } = await import("@/lib/firebase");
      const { collection, doc, deleteDoc } = await import("firebase/firestore");

      const recycleBinRef = collection(db, "recycleBin");
      await deleteDoc(doc(recycleBinRef, itemId));
    } catch (error) {
      console.error("Error deleting from Firestore:", error);
      throw error;
    }
  };

  const updateStats = () => {
    const now = new Date().getTime();
    const oneDayFromNow = now + 24 * 60 * 60 * 1000;

    const newStats: RecycleBinStats = {
      total: items.length,
      todos: items.filter((item) => item.source === "todo").length,
      timesheets: items.filter((item) => item.source === "timesheet").length,
      timeLogs: items.filter((item) => item.source === "time-tracker").length,
      notifications: items.filter((item) => item.source === "notification")
        .length,
      projects: items.filter((item) => item.source === "project").length,
      testimonials: items.filter((item) => item.source === "testimonial")
        .length,
      workExperiences: items.filter((item) => item.source === "workExperience")
        .length,
      contactSubmissions: items.filter(
        (item) => item.source === "contactSubmission"
      ).length,
      expiringWithin24Hours: items.filter(
        (item) => new Date(item.expiryDate).getTime() <= oneDayFromNow
      ).length,
    };

    setStats(newStats);
  };

  const moveToRecycleBin = useCallback(
    async (
      source: RecycleBinItemSource,
      data: any,
      originalId: string
    ): Promise<void> => {
      if (!currentUserId) {
        notifyError("User not authenticated");
        return;
      }

      try {
        const now = new Date();
        const expiryDate = new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000); // Default 15 days

        const recycleBinItem: RecycleBinItem = {
          id: `rb_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          originalId,
          userId: currentUserId,
          source,
          data,
          deletedAt: now.toISOString(),
          expiryDate: expiryDate.toISOString(),
          expiryDays: 15,
          deletedBy: currentUserId,
        };

        await saveItemToFirestore(recycleBinItem);

        notifyItemMovedToRecycleBin(source, 15);
      } catch (error) {
        console.error("Error moving to recycle bin:", error);
        notifyError("Failed to move item to Recycle Bin");
      }
    },
    [currentUserId]
  );

  const restoreItem = useCallback(
    async (recycleBinId: string): Promise<any> => {
      const item = items.find((i) => i.id === recycleBinId);
      if (!item) {
        notifyError("Item not found");
        return null;
      }

      try {
        // For Firestore-backed items, restore to Firestore
        if (
          item.source === "project" ||
          item.source === "testimonial" ||
          item.source === "workExperience" ||
          item.source === "contactSubmission"
        ) {
          const collectionName = getCollectionName(item.source);
          if (collectionName) {
            // Import Firestore
            const { db } = await import("@/lib/firebase");
            const { collection, doc, setDoc, Timestamp } = await import(
              "firebase/firestore"
            );

            // Helper to convert ISO date strings back to Timestamps
            const convertDatesToTimestamps = (obj: any): any => {
              if (obj === null || obj === undefined) return obj;

              if (Array.isArray(obj)) {
                return obj.map(convertDatesToTimestamps);
              }

              if (typeof obj === "object") {
                const converted: any = {};
                for (const key in obj) {
                  const value = obj[key];
                  // Check if it's an ISO date string
                  if (
                    typeof value === "string" &&
                    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)
                  ) {
                    try {
                      converted[key] = Timestamp.fromDate(new Date(value));
                    } catch (e) {
                      converted[key] = value;
                    }
                  } else if (typeof value === "object" && value !== null) {
                    converted[key] = convertDatesToTimestamps(value);
                  } else if (value !== undefined) {
                    converted[key] = value;
                  }
                }
                return converted;
              }

              return obj;
            };

            // Clean and convert the data
            const cleanData = cleanFirestoreData(item.data);
            const restoredData = convertDatesToTimestamps(cleanData);

            // Restore to Firestore with proper timestamps
            await setDoc(doc(collection(db, collectionName), item.originalId), {
              ...restoredData,
              updatedAt: Timestamp.now(),
            });
          }
        }

        // Remove from recycle bin in Firestore
        await deleteItemFromFirestore(recycleBinId);

        notifyItemRestored(item.source);
        return item.data; // Return the data so caller can restore it
      } catch (error) {
        console.error("Error restoring item:", error);
        notifyError("Failed to restore item");
        return null;
      }
    },
    [items]
  );

  const getCollectionName = (source: RecycleBinItemSource): string | null => {
    switch (source) {
      case "project":
        return "projects";
      case "testimonial":
        return "testimonials";
      case "workExperience":
        return "workExperiences";
      case "contactSubmission":
        return "contactSubmissions";
      default:
        return null;
    }
  };

  const permanentlyDelete = useCallback(
    async (recycleBinId: string): Promise<void> => {
      try {
        await deleteItemFromFirestore(recycleBinId);
        notifyItemDeleted("Item");
      } catch (error) {
        console.error("Error permanently deleting:", error);
        notifyError("Failed to delete item");
      }
    },
    []
  );

  const permanentlyDeleteAll = useCallback(async (): Promise<void> => {
    if (!currentUserId) {
      notifyError("User not authenticated");
      return;
    }

    if (!confirm("Permanently delete all items? This cannot be undone!")) {
      return;
    }

    try {
      // Delete all items from Firestore
      const deletePromises = items.map((item) =>
        deleteItemFromFirestore(item.id)
      );
      await Promise.all(deletePromises);

      notifySuccess("All items permanently deleted");
    } catch (error) {
      console.error("Error deleting all items:", error);
      notifyError("Failed to delete all items");
    }
  }, [currentUserId, items]);

  const extendExpiry = useCallback(
    async (recycleBinId: string, days: 15 | 30): Promise<void> => {
      try {
        const item = items.find((i) => i.id === recycleBinId);
        if (!item) {
          notifyError("Item not found");
          return;
        }

        const now = new Date();
        const newExpiryDate = new Date(
          now.getTime() + days * 24 * 60 * 60 * 1000
        );

        const updatedItem = {
          ...item,
          expiryDate: newExpiryDate.toISOString(),
          expiryDays: days,
        };

        await saveItemToFirestore(updatedItem);
        notifySuccess(`Expiry extended to ${days} days`);
      } catch (error) {
        console.error("Error extending expiry:", error);
        notifyError("Failed to extend expiry");
      }
    },
    [items]
  );

  const autoCleanupExpiredItems = useCallback(async () => {
    if (!currentUserId) return;

    const now = new Date().getTime();
    const expiredItems = items.filter(
      (item) => new Date(item.expiryDate).getTime() <= now
    );

    if (expiredItems.length > 0) {
      try {
        const deletePromises = expiredItems.map((item) =>
          deleteItemFromFirestore(item.id)
        );
        await Promise.all(deletePromises);

        notifyInfo(
          `${expiredItems.length} expired item(s) automatically deleted`,
          "Items in Recycle Bin are automatically removed after expiry."
        );
      } catch (error) {
        console.error("Error auto-cleaning expired items:", error);
      }
    }
  }, [currentUserId, items]);

  // Auto-cleanup expired items
  useEffect(() => {
    const interval = setInterval(() => {
      autoCleanupExpiredItems();
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [autoCleanupExpiredItems]);

  const getFilteredItems = useCallback(
    (filters?: RecycleBinFilters): RecycleBinItem[] => {
      let filtered = [...items];

      if (filters?.source) {
        filtered = filtered.filter((item) => item.source === filters.source);
      }

      if (filters?.searchTerm) {
        const term = filters.searchTerm.toLowerCase();
        filtered = filtered.filter((item) => {
          const dataStr = JSON.stringify(item.data).toLowerCase();
          return dataStr.includes(term) || item.source.includes(term);
        });
      }

      // Sort
      const sortBy = filters?.sortBy || "deletedAt";
      const sortOrder = filters?.sortOrder || "desc";

      filtered.sort((a, b) => {
        let aVal, bVal;

        switch (sortBy) {
          case "deletedAt":
            aVal = new Date(a.deletedAt).getTime();
            bVal = new Date(b.deletedAt).getTime();
            break;
          case "expiryDate":
            aVal = new Date(a.expiryDate).getTime();
            bVal = new Date(b.expiryDate).getTime();
            break;
          case "source":
            aVal = a.source;
            bVal = b.source;
            break;
          default:
            return 0;
        }

        if (sortOrder === "asc") {
          return aVal > bVal ? 1 : -1;
        } else {
          return aVal < bVal ? 1 : -1;
        }
      });

      return filtered;
    },
    [items]
  );

  const refreshItems = useCallback(() => {
    // Items are auto-refreshed via Firestore real-time listener
    // No manual refresh needed
  }, []);

  const value: RecycleBinContextType = {
    items,
    loading,
    stats,
    moveToRecycleBin,
    restoreItem,
    permanentlyDelete,
    permanentlyDeleteAll,
    extendExpiry,
    getFilteredItems,
    refreshItems,
  };

  return (
    <RecycleBinContext.Provider value={value}>
      {children}
    </RecycleBinContext.Provider>
  );
};
