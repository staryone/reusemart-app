import { AuthContext } from "@/context/authContext";
import { BASE_API_URL } from "@/utils/api";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { router } from "expo-router";
import React, { useCallback, useContext, useEffect, useState } from "react";
import {
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/MaterialIcons";
import LogoutButton from "../LogoutButton";

export type RootStackParamList = {
  PembeliProfile: undefined;
  DaftarTransaksi: undefined;
  Pembayaran: { idTransaksi: number };
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

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

export default function PembeliProfile() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [pembeli, setPembeli] = useState<Pembeli | null>(null);
  const authContext = useContext(AuthContext);
  const navigation = useNavigation<NavigationProp>();

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

        const response = await fetch(`${BASE_API_URL}/api/pembeli/current`, {
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
    // Add focus listener to refresh profile when screen is focused
    const unsubscribe = navigation.addListener("focus", () => {
      fetchProfile();
    });

    // Clean up listener on unmount
    return unsubscribe;
  }, [fetchProfile, navigation]);

  const onRefresh = () => {
    fetchProfile(true);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.mainContainer}>
        <View style={[styles.header, styles.backdropBlur]}>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Profil</Text>
          </View>
        </View>
        <ScrollView
          style={styles.scrollView}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <View style={styles.profileSection}>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>
                {pembeli?.nama || "Ethan Carter"}
              </Text>
            </View>
          </View>
          <Text style={styles.sectionTitle}>Akun</Text>
          <View style={styles.accountSection}>
            <TouchableOpacity style={styles.accountItem}>
              <View style={styles.accountIconContainer}>
                <Icon name="email" size={24} color="#38e07b" />
              </View>
              <View style={styles.accountTextContainer}>
                <Text style={styles.accountLabel}>Email</Text>
                <Text style={styles.accountValue}>
                  {pembeli?.email || "ethan.carter@email.com"}
                </Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity style={styles.accountItem}>
              <View style={styles.accountIconContainer}>
                <Icon name="phone" size={24} color="#38e07b" />
              </View>
              <View style={styles.accountTextContainer}>
                <Text style={styles.accountLabel}>Nomor Telepon</Text>
                <Text style={styles.accountValue}>
                  {pembeli?.nomor_telepon || "+1 (555) 123-4567"}
                </Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.accountItem}
              onPress={() => router.push("/pembeli/daftarTransaksi")}
            >
              <View style={styles.accountIconContainer}>
                <Icon name="history" size={24} color="#38e07b" />
              </View>
              <View style={styles.accountTextContainer}>
                <Text style={styles.accountLabel}>Daftar Transaksi</Text>
                <Text style={styles.accountValue}>Lihat riwayat transaksi</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.accountItem}
              onPress={() => router.push("/pembeli/merchandise")}
            >
              <View style={styles.accountIconContainer}>
                <Icon name="card-giftcard" size={24} color="#38e07b" />
              </View>
              <View style={styles.accountTextContainer}>
                <Text style={styles.accountLabel}>Merchandise</Text>
                <Text style={styles.accountValue}>
                  Lihat dan tukar merchandise
                </Text>
              </View>
            </TouchableOpacity>
          </View>
          <View style={[styles.rewardCardSecondary, styles.pointsCard]}>
            <View style={styles.rewardItem}>
              <Icon name="military-tech" size={20} color="#8b5cf6" />
              <Text style={styles.rewardLabelSecondary}>Poin</Text>
            </View>
            <Text style={styles.rewardValueSecondary}>
              {pembeli?.poin_loyalitas || 150} Pts
            </Text>
          </View>
          <LogoutButton />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  mainContainer: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "space-between",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 18,
    color: "#0e1a13",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    fontSize: 18,
    color: "#ef4444",
  },
  header: {
    position: "sticky",
    top: 0,
    padding: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  backdropBlur: {
    backgroundColor: "rgba(255, 255, 255, 0.8)",
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 20,
    fontWeight: "700",
    color: "#0e1a13",
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  profileSection: {
    width: "100%",
    flexDirection: "column",
    alignItems: "center",
    marginBottom: 24,
  },
  profileInfo: {
    flexDirection: "column",
    alignItems: "center",
    paddingTop: 24,
  },
  profileName: {
    fontSize: 24,
    fontWeight: "700",
    color: "#0e1a13",
    textAlign: "center",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#0e1a13",
    marginBottom: 8,
    marginTop: 24,
  },
  accountSection: {
    marginBottom: 16,
  },
  accountItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    padding: 12,
    borderRadius: 12,
    marginBottom: 4,
  },
  accountIconContainer: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    backgroundColor: "#e8f2ec",
  },
  accountTextContainer: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "center",
    marginLeft: 16,
  },
  accountLabel: {
    fontSize: 12,
    fontWeight: "500",
    color: "#6b7280",
  },
  accountValue: {
    fontSize: 16,
    fontWeight: "500",
    color: "#0e1a13",
  },
  rewardCardSecondary: {
    flex: 1,
    flexDirection: "column",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#ffffff",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  pointsCard: {
    marginTop: 12,
    marginBottom: 15,
  },
  rewardItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  rewardLabelSecondary: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6b7280",
    marginLeft: 8,
  },
  rewardValueSecondary: {
    fontSize: 24,
    fontWeight: "700",
    color: "#0e1a13",
  },
});
