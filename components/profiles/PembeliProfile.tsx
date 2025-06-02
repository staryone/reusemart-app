import { ThemedText } from "@/components/ThemedText";
import { AuthContext } from "@/context/authContext";
import { BASE_API_URL } from "@/utils/api";
import React, { useCallback, useContext, useEffect, useState } from "react";
import { Image, RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import LogoutButton from "../LogoutButton";

interface Pembeli {
  nama: string;
  email: string;
  nomor_telepon: string;
  poin_loyalitas: number;
}

interface ResponseAPI {
  data?: Pembeli;
  errors?: string;
}

// Komponen untuk menampilkan bullet point dengan format rapi
const BulletPoint: React.FC<{ label: string; value: string | number }> = ({ label, value }) => (
  <View style={styles.bulletContainer}>
    <ThemedText style={styles.bullet}>•</ThemedText>
    <ThemedText style={styles.bulletText}>
      <ThemedText style={styles.bold}>{label}</ThemedText>: {value}
    </ThemedText>
  </View>
);

// Komponen untuk kartu individual (saldo, rating, poin)
const StatCard: React.FC<{ label: string; value: string | number }> = ({ label, value }) => (
  <View style={styles.statCard}>
    <ThemedText style={styles.statLabel}>{label}</ThemedText>
    <ThemedText style={styles.statValue}>{value}</ThemedText>
  </View>
);

export default function PembeliProfile() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [pembeli, setPembeli] = useState<Pembeli | null>(null);
  const authContext = useContext(AuthContext);

  if (!authContext) {
    throw new Error("AuthContext must be used within an AuthProvider");
  }
  const { token, isLoggedIn } = authContext;

  const fetchProfile = useCallback(
    async (isRefresh = false) => {
      if (!isLoggedIn || !token) {
        setError("Silakan masuk untuk melihat profil");
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

        const response = await fetch(BASE_API_URL + "/api/pembeli/current", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const res: ResponseAPI = await response.json();
        if (!response.ok) {
          throw new Error(res.errors || "Gagal mengambil data profil");
        }

        if (res.data) {
          setPembeli(res.data);
        }
        setError(null);
      } catch (err) {
        setError("Terjadi kesalahan saat mengambil data profil");
        console.error(err);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [isLoggedIn, token]
  );

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const onRefresh = () => {
    fetchProfile(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#5CB85C" />
        }
      >
        {/* Bagian Header */}
        <View style={styles.header}>
          <Image
            source={{ uri: 'https://via.placeholder.com/120' }} // Slightly larger placeholder for avatar
            style={styles.avatar}
          />
          <ThemedText style={styles.profileText}>Halo, {pembeli?.nama || "Pembeli"}</ThemedText>
        </View>

        {/* Bagian Statistik (Saldo, Rating, Poin) */}
        {!loading && !error && pembeli && (
          <View style={styles.statsContainer}>
            <StatCard label="Poin" value={pembeli.poin_loyalitas} />
          </View>
        )}

        {/* Bagian Detail Profil */}
        {loading && (
          <ThemedText style={styles.infoText}>Memuat data profil...</ThemedText>
        )}
        {error && (
          <ThemedText style={styles.errorText}>{error}</ThemedText>
        )}
        {!loading && !error && pembeli && (
          <View style={styles.profileSection}>
            <ThemedText style={styles.sectionTitle}>Detail Profil</ThemedText>
            <BulletPoint label="Nama" value={pembeli.nama} />
            <BulletPoint label="Email" value={pembeli.email} />
            <BulletPoint label="Nomor Telepon" value={pembeli.nomor_telepon} />
          </View>
        )}

        {/* Tombol Logout */}
        <LogoutButton />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F0F4F8", // Lighter background for a modern feel
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: "center",
    marginBottom: 30, // Increased margin for more breathing room
    backgroundColor: "#FFFFFF",
    paddingVertical: 30,
    borderRadius: 15, // Slightly more rounded header
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08, // Softer shadow
    shadowRadius: 10,
    elevation: 6,
  },
  avatar: {
    width: 120, // Slightly larger avatar
    height: 120,
    borderRadius: 60, // Keep it perfectly round
    marginBottom: 20, // Increased margin
    borderWidth: 3, // Thicker border
    borderColor: "#5CB85C", // A slightly darker, more vibrant green
  },
  profileText: {
    textAlign: "center",
    marginBottom: 8,
    fontSize: 32, // Larger font size for prominence
    fontWeight: "700", // Bolder font weight
    color: "#34495E", // Darker text for better contrast
  },
  profileDetail: {
    textAlign: "center",
    color: "#7F8C8D", // Softer grey for description
    fontSize: 15,
    lineHeight: 22,
    paddingHorizontal: 20, // Add horizontal padding
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around", // Distribute space evenly
    marginBottom: 25,
    marginHorizontal: -5, // Counteract card margin for full width
  },
  statCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingVertical: 20, // More vertical padding
    paddingHorizontal: 10,
    borderRadius: 15, // More rounded corners
    marginHorizontal: 7, // Increased margin between cards
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1, // Softer shadow
    shadowRadius: 8,
    elevation: 5,
    alignItems: "center",
  },
  statLabel: {
    fontSize: 13, // Slightly smaller label
    color: "#7F8C8D", // Softer grey
    marginBottom: 6,
    fontWeight: "500",
  },
  statValue: {
    fontSize: 20, // Larger value for impact
    fontWeight: "700", // Bolder value
    color: "#5CB85C", // Vibrant green
  },
  profileSection: {
    marginBottom: 25,
    backgroundColor: "#FFFFFF",
    padding: 25, // More padding inside the section
    borderRadius: 15, // More rounded corners
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1, // Softer shadow
    shadowRadius: 8,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 24, // Larger title
    fontWeight: "700", // Bolder title
    color: "#34495E", // Darker color
    marginBottom: 20, // Increased margin
    borderBottomWidth: 1, // Subtle separator
    borderBottomColor: "#ECF0F1",
    paddingBottom: 10,
  },
  bulletContainer: {
    flexDirection: "row",
    alignItems: "flex-start", // Align bullet with top of text
    marginTop: 12, // Increased spacing between bullets
    paddingLeft: 5,
  },
  bullet: {
    fontSize: 18, // Slightly larger bullet
    color: "#5CB85C", // Green bullet
    marginRight: 10,
    lineHeight: 22, // Match text line height
  },
  bulletText: {
    fontSize: 16,
    color: "#34495E", // Darker text
    lineHeight: 22, // Consistent line height
    flex: 1,
  },
  bold: {
    fontWeight: "600",
    color: "#34495E", // Ensure bold text is also dark
  },
  infoText: {
    textAlign: "center",
    color: "#7F8C8D", // Softer grey for info text
    fontSize: 16,
    marginBottom: 20,
    fontStyle: "italic",
  },
  errorText: {
    textAlign: "center",
    color: "#E74C3C", // A more distinct error red
    fontSize: 16,
    marginBottom: 20,
    fontWeight: "500",
  },
});