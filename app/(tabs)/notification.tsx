import React, { useContext, useEffect, useState, useCallback } from "react";
import {
  StyleSheet,
  View,
  FlatList,
  ActivityIndicator,
  SafeAreaView,
} from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { AuthContext } from "@/context/authContext";
import { BASE_API_URL } from "@/utils/api";

// Define the type for a notification
interface Notification {
  id_notif: number;
  judul: string;
  isi: string;
  createdAt: string;
}

interface ResponseAPI {
  data?: Notification[];
  errors?: string;
}

export default function NotificationScreen() {
  const authContext = useContext(AuthContext);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!authContext) {
    throw new Error("AuthContext must be used within an AuthProvider");
  }
  const { token, isLoggedIn } = authContext;

  // Function to fetch notifications
  const fetchNotifications = useCallback(
    async (isRefresh = false) => {
      if (!isLoggedIn || !token) {
        setError("Please log in to view notifications");
        setLoading(false);
        setRefreshing(false);
        return;
      }

      try {
        if (isRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        const response = await fetch(BASE_API_URL + "/api/notifications", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const res: ResponseAPI = await response.json();
        if (!response.ok) {
          throw new Error(res.errors || "Failed to fetch notifications");
        }

        if (res.data) {
          setNotifications(res.data);
        } else {
          setNotifications([]);
        }
        setError(null);
      } catch (err) {
        setError("Error fetching notifications");
        console.error(err);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [isLoggedIn, token]
  );

  // Fetch notifications when the component mounts
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Handle pull-to-refresh
  const onRefresh = () => {
    fetchNotifications(true);
  };

  // Format createdAt to WIB and a readable format
  const formatDateWIB = (dateString: string) => {
    const date = new Date(dateString);
    // Convert to WIB (UTC+7)
    const wibOffset = 7 * 60; // 7 hours in minutes
    const localOffset = date.getTimezoneOffset(); // Local timezone offset in minutes
    const wibDate = new Date(
      date.getTime() + (wibOffset + localOffset) * 60 * 1000
    );

    // Format: "DD MMM YYYY, HH:mm WIB"
    return (
      wibDate.toLocaleString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }) + " WIB"
    );
  };

  // Render each notification item
  const renderNotification = ({ item }: { item: Notification }) => (
    <View style={styles.notificationCard}>
      <ThemedText style={styles.notificationTitle}>{item.judul}</ThemedText>
      <ThemedText style={styles.notificationBody}>{item.isi}</ThemedText>
      <ThemedText style={styles.notificationDate}>
        {formatDateWIB(item.createdAt)}
      </ThemedText>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.titleContainer}>
        <ThemedText type="title">Notifikasi</ThemedText>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#808080" style={styles.loader} />
      ) : error ? (
        <ThemedText style={styles.errorText}>{error}</ThemedText>
      ) : (
        <FlatList
          data={notifications}
          renderItem={renderNotification}
          keyExtractor={(item) => item.id_notif.toString()}
          contentContainerStyle={styles.listContainer}
          refreshing={refreshing}
          onRefresh={onRefresh}
          ListEmptyComponent={
            <ThemedText style={styles.emptyText}>
              Tidak ada notifikasi
            </ThemedText>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5", // Light grey background for the entire screen
  },
  titleContainer: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
    marginTop: 25,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  listContainer: {
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  notificationCard: {
    backgroundColor: "#FFFFFF", // White background for cards in light mode
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2, // Subtle shadow for Android
    shadowColor: "#000", // Subtle shadow for iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  notificationBody: {
    fontSize: 14,
    color: "#555",
    marginBottom: 8,
  },
  notificationDate: {
    fontSize: 12,
    color: "#888",
    textAlign: "right",
  },
  errorText: {
    fontSize: 16,
    color: "#FF4444",
    textAlign: "center",
    marginTop: 20,
  },
  emptyText: {
    fontSize: 16,
    color: "#888",
    textAlign: "center",
    marginTop: 20,
  },
  loader: {
    marginTop: 20,
  },
});
