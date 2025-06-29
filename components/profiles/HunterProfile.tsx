import { AuthContext } from "@/context/authContext";
import { BASE_API_URL } from "@/utils/api";
import { useNavigation } from "@react-navigation/native";
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

interface Barang {
  nama_barang: string;
  harga_barang: number;
  komisi: number;
  tanggal_masuk: string;
  tanggal_laku: string;
}

interface DetailPenitipan {
  barang: Barang[];
}

interface hunter {
  nama: string;
  email: string;
  nomor_telepon: string;
  komisi: number;
  detail_penitipan: DetailPenitipan[];
}

interface ResponseAPI {
  data?: hunter;
  errors?: string;
}

export default function HunterProfile() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [hunter, sethunter] = useState<hunter | null>(null);
  const [selectedCommission, setSelectedCommission] = useState<number | null>(
    null
  );
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | null>(null);
  const authContext = useContext(AuthContext);
  const navigation = useNavigation();

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

        const response = await fetch(`${BASE_API_URL}/api/pegawai/current`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const res: ResponseAPI = await response.json();
        if (!response.ok) {
          throw new Error(res.errors || "Gagal mengambil data profil");
        }

        if (res.data) {
          sethunter(res.data);
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

  const toggleCommissionDetails = (index: number) => {
    setSelectedCommission(selectedCommission === index ? null : index);
  };

  const handleSort = () => {
    setSortOrder((prev) => {
      if (prev === null) return "asc";
      if (prev === "asc") return "desc";
      return null;
    });
  };

  const sortedCommissions = useCallback(() => {
    if (!hunter?.detail_penitipan || sortOrder === null) {
      return (
        hunter?.detail_penitipan?.flatMap((penitipan) => penitipan.barang) || []
      );
    }

    const allCommissions = hunter.detail_penitipan.flatMap(
      (penitipan) => penitipan.barang
    );
    return [...allCommissions].sort((a, b) => {
      return sortOrder === "asc" ? a.komisi - b.komisi : b.komisi - a.komisi;
    });
  }, [hunter, sortOrder]);

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
        {/* Header */}
        <View style={[styles.header, styles.backdropBlur]}>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Profil</Text>
          </View>
        </View>

        {/* Main Content */}
        <ScrollView
          style={styles.scrollView}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <View style={styles.profileSection}>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>
                {hunter?.nama || "Ethan Carter"}
              </Text>
              <Text style={styles.profileLocation}>Hunter</Text>
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
                  {hunter?.email || "ethan.carter@email.com"}
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
                  {hunter?.nomor_telepon || "+1 (555) 123-4567"}
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          <View style={styles.rewardsSection}>
            <View style={styles.rewardCard}>
              <View style={styles.rewardItem}>
                <Icon name="account-balance-wallet" size={20} color="white" />
                <Text style={styles.rewardLabel}>Saldo</Text>
              </View>
              <Text style={styles.rewardValue}>
                Rp{hunter?.komisi?.toLocaleString("id-ID") || "125.00"}
              </Text>
            </View>
          </View>

          {/* Commission History */}
          <View style={styles.commissionHeader}>
            <Text style={styles.sectionTitle}>Riwayat Komisi</Text>
            <TouchableOpacity style={styles.sortButton} onPress={handleSort}>
              <Icon
                name={
                  sortOrder === "asc"
                    ? "arrow-upward"
                    : sortOrder === "desc"
                    ? "arrow-downward"
                    : "sort"
                }
                size={20}
                color="#38e07b"
              />
              <Text style={styles.sortButtonText}>
                {sortOrder === null
                  ? "Urutkan"
                  : sortOrder === "asc"
                  ? "Terkecil"
                  : "Terbesar"}
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.commissionSection}>
            {sortedCommissions().length > 0 ? (
              sortedCommissions().map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.commissionItem}
                  onPress={() => toggleCommissionDetails(index)}
                >
                  <View style={styles.commissionContent}>
                    <Text style={styles.commissionDate}>
                      {new Date(item.tanggal_laku).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </Text>
                    <Text style={styles.commissionValue}>
                      + Rp{item.komisi.toLocaleString("id-ID")}
                    </Text>
                  </View>
                  {selectedCommission === index && (
                    <View style={styles.commissionDetails}>
                      <Text style={styles.commissionDetailText}>
                        Nama Barang: {item.nama_barang}
                      </Text>
                      <Text style={styles.commissionDetailText}>
                        Harga Barang: Rp
                        {item.harga_barang.toLocaleString("id-ID")}
                      </Text>
                      <Text style={styles.commissionDetailText}>
                        Tanggal Masuk:{" "}
                        {new Date(item.tanggal_masuk).toLocaleDateString(
                          "id-ID",
                          {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          }
                        )}
                      </Text>
                      <Text style={styles.commissionDetailText}>
                        Tanggal Terjual:{" "}
                        {new Date(item.tanggal_laku).toLocaleDateString(
                          "id-ID",
                          {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          }
                        )}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))
            ) : (
              <Text style={styles.noCommissionText}>
                Belum ada riwayat komisi
              </Text>
            )}
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
    marginBottom: 15,
    marginTop: 10,
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
  profileLocation: {
    fontSize: 16,
    fontWeight: "400",
    color: "#6b7280",
    textAlign: "center",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#0e1a13",
    marginBottom: 8,
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
  rewardsSection: {
    flexDirection: "row",
    gap: 20,
    marginBottom: 12,
  },
  rewardCard: {
    flex: 1,
    flexDirection: "column",
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#38e07b",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  rewardItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  rewardLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#ffffff",
    marginLeft: 8,
  },
  rewardValue: {
    fontSize: 24,
    fontWeight: "700",
    color: "#ffffff",
  },
  commissionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
    marginTop: 24,
  },
  sortButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e8f2ec",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  sortButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#38e07b",
    marginLeft: 4,
  },
  commissionSection: {
    marginBottom: 16,
  },
  commissionItem: {
    backgroundColor: "#ffffff",
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
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
  commissionContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  commissionDate: {
    fontSize: 14,
    fontWeight: "500",
    color: "#0e1a13",
  },
  commissionValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#38e07b",
  },
  commissionDetails: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  commissionDetailText: {
    fontSize: 14,
    fontWeight: "400",
    color: "#0e1a13",
    marginBottom: 4,
  },
  noCommissionText: {
    fontSize: 14,
    fontWeight: "400",
    color: "#6b7280",
    textAlign: "center",
  },
});
