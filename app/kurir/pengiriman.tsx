import { router } from "expo-router";
import React, { useCallback, useContext, useEffect, useState } from "react";
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Modal,
  Alert,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { AuthContext } from "@/context/authContext";
import { BASE_API_URL } from "@/utils/api";

interface Filter {
  id: string;
  label: string;
  icon: string;
}

interface Shipment {
  id_pengiriman: string;
  nama_pembeli: string;
  alamat: string;
  tanggal: string;
  status_pengiriman: string;
  statusColor: string;
  statusIcon: string;
  statusTextColor: string;
  disabled: boolean;
}

interface ResponseAPI {
  data: Shipment[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  errors?: string;
}

enum StatusPengiriman {
  DIPROSES = "DIPROSES",
  SEDANG_DIKIRIM = "SEDANG_DIKIRIM",
  SUDAH_DITERIMA = "SUDAH_DITERIMA",
}

const filters: Filter[] = [
  { id: "ALL", label: "Semua", icon: "filter-list" },
  { id: "SEDANG_DIKIRIM", label: "Dalam Perjalanan", icon: "local-shipping" },
  { id: "SUDAH_DITERIMA", label: "Terkirim", icon: "check-circle" },
  { id: "DIPROSES", label: "Diproses", icon: "inventory-2" },
];

const getStatusStyles = (status: string) => {
  switch (status) {
    case StatusPengiriman.SEDANG_DIKIRIM:
      return {
        statusColor: "#ECFDF3",
        statusIcon: "local-shipping",
        statusTextColor: "#027A48",
        disabled: false,
      };
    case StatusPengiriman.SUDAH_DITERIMA:
      return {
        statusColor: "#ECFDF3",
        statusIcon: "check-circle",
        statusTextColor: "#027A48",
        disabled: true,
      };
    case StatusPengiriman.DIPROSES:
      return {
        statusColor: "#EFF8FF",
        statusIcon: "inventory-2",
        statusTextColor: "#175CD3",
        disabled: false,
      };
    default:
      return {
        statusColor: "#FEF3F2",
        statusIcon: "error-outline",
        statusTextColor: "#B42318",
        disabled: true,
      };
  }
};

const formatStatusText = (status: string): string => {
  switch (status) {
    case StatusPengiriman.DIPROSES:
      return "Sedang Diproses";
    case StatusPengiriman.SEDANG_DIKIRIM:
      return "Sedang Dikirim";
    case StatusPengiriman.SUDAH_DITERIMA:
      return "Pengiriman Selesai";
    default:
      return status;
  }
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

const ShipmentScreen: React.FC = () => {
  const [selectedFilter, setSelectedFilter] = useState("SEDANG_DIKIRIM");
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedShipmentId, setSelectedShipmentId] = useState<string | null>(
    null
  );
  const authContext = useContext(AuthContext);

  if (!authContext) {
    throw new Error("AuthContext must be used within an AuthProvider");
  }
  const { token, isLoggedIn } = authContext;

  const fetchShipments = useCallback(
    async (isRefresh = false) => {
      if (!isLoggedIn || !token) {
        setError("Silakan masuk untuk melihat daftar pengiriman");
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

        const response = await fetch(
          `${BASE_API_URL}/api/pengiriman/lists-dikirim-kurir?status=${selectedFilter}&page=1&limit=10`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const res: ResponseAPI = await response.json();
        if (!response.ok) {
          throw new Error(res.errors || "Gagal mengambil data pengiriman");
        }

        const formattedShipments: Shipment[] = res.data.map((p: any) => ({
          id_pengiriman: p.id_pengiriman,
          nama_pembeli: p.transaksi.pembeli.nama,
          alamat: p.transaksi.alamat?.detail_alamat || "Alamat tidak tersedia",
          tanggal: p.tanggal,
          status_pengiriman: p.status_pengiriman,
          ...getStatusStyles(p.status_pengiriman),
        }));

        setShipments(formattedShipments);
        setError(null);
      } catch (err) {
        setError("Terjadi kesalahan saat mengambil data pengiriman");
        console.error(err);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [isLoggedIn, token, selectedFilter]
  );

  const confirmDelivery = useCallback(
    async (id_pengiriman: string) => {
      if (!isLoggedIn || !token) {
        setError("Silakan masuk untuk mengkonfirmasi pengiriman");
        return;
      }

      try {
        setModalVisible(false); // Close modal
        const response = await fetch(
          `${BASE_API_URL}/api/pengiriman/konfirmasi-pengiriman`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ id_pengiriman }),
          }
        );

        const res = await response.json();
        if (!response.ok) {
          throw new Error(res.errors || "Gagal mengkonfirmasi pengiriman");
        }

        // Show success alert
        Alert.alert("Sukses", "Pengiriman berhasil dikonfirmasi!", [
          { text: "OK", onPress: () => fetchShipments(true) },
        ]);
      } catch (err) {
        // Show error alert
        Alert.alert(
          "Gagal",
          "Terjadi kesalahan saat mengkonfirmasi pengiriman",
          [{ text: "OK" }]
        );
        console.error(err);
      }
    },
    [isLoggedIn, token, fetchShipments]
  );

  const handleConfirmPress = (id_pengiriman: string) => {
    setSelectedShipmentId(id_pengiriman);
    setModalVisible(true);
  };

  useEffect(() => {
    fetchShipments();
  }, [fetchShipments, selectedFilter]);

  const onRefresh = () => {
    fetchShipments(true);
  };

  if (loading) {
    return (
      <View style={styles.root}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.root}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      {/* Confirmation Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Konfirmasi Pengiriman</Text>
            <Text style={styles.modalMessage}>
              Apakah Anda yakin ingin mengkonfirmasi pengiriman ini telah sampai
              ke tujuan?
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalCancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalCancelButtonText}>Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalConfirmButton]}
                onPress={() =>
                  selectedShipmentId && confirmDelivery(selectedShipmentId)
                }
              >
                <Text style={styles.modalConfirmButtonText}>Ya</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() =>
            router.canGoBack() ? router.back() : router.push("/(tabs)/Profil")
          }
          style={styles.backButton}
        >
          <Icon name="arrow-back" size={24} color="#1D2939" />
        </TouchableOpacity>
        <Text style={styles.title}>Daftar Pengiriman</Text>
      </View>

      {/* Shipment List with Filter */}
      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Filter List */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterContainer}
        >
          {filters.map((filter) => (
            <TouchableOpacity
              key={filter.id}
              style={[
                styles.filterButton,
                selectedFilter === filter.id
                  ? styles.selectedButton
                  : styles.unselectedButton,
              ]}
              onPress={() => setSelectedFilter(filter.id)}
            >
              <Icon
                name={filter.icon}
                size={16}
                color={selectedFilter === filter.id ? "#FFFFFF" : "#027A48"}
                style={styles.icon}
              />
              <Text
                style={[
                  styles.filterText,
                  selectedFilter === filter.id
                    ? styles.selectedText
                    : styles.unselectedText,
                ]}
              >
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Shipment Cards */}
        {shipments.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Tidak ada data pengiriman</Text>
          </View>
        ) : (
          shipments.map((shipment) => (
            <View key={shipment.id_pengiriman} style={styles.card}>
              <View style={styles.cardContent}>
                <View style={styles.info}>
                  <Text style={styles.id}>
                    ID:{" "}
                    <Text style={styles.idValue}>{shipment.id_pengiriman}</Text>
                  </Text>
                  <Text style={styles.name}>{shipment.nama_pembeli}</Text>
                  <Text style={styles.address}>{shipment.alamat}</Text>
                  <Text style={styles.date}>
                    Tanggal: {formatDate(shipment.tanggal)}
                  </Text>
                </View>
                <View
                  style={[
                    styles.status,
                    { backgroundColor: shipment.statusColor },
                  ]}
                >
                  <Icon
                    name={shipment.statusIcon}
                    size={14}
                    color={shipment.statusTextColor}
                    style={styles.statusIcon}
                  />
                  <Text
                    style={[
                      styles.statusText,
                      { color: shipment.statusTextColor },
                    ]}
                  >
                    {formatStatusText(shipment.status_pengiriman)}
                  </Text>
                </View>
              </View>
              <View style={styles.cardFooter}>
                <TouchableOpacity
                  style={[
                    styles.button,
                    shipment.disabled
                      ? styles.disabledButton
                      : styles.activeButton,
                  ]}
                  disabled={shipment.disabled}
                  onPress={() => handleConfirmPress(shipment.id_pengiriman)}
                >
                  <Icon
                    name="check-circle-outline"
                    size={16}
                    color={shipment.disabled ? "#4B5563" : "#FFFFFF"}
                  />
                  <Text
                    style={[
                      styles.buttonText,
                      shipment.disabled
                        ? styles.disabledButtonText
                        : styles.activeButtonText,
                    ]}
                  >
                    Konfirmasi Sampai ke Tujuan
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#F0FDF4",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 16,
    paddingTop: 20,
    paddingBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    position: "sticky",
    top: 0,
    zIndex: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
  },
  title: {
    flex: 1,
    textAlign: "center",
    color: "#101828",
    fontSize: 20,
    fontWeight: "700",
    letterSpacing: -0.3,
    paddingRight: 40,
    fontFamily: "NotoSans-Bold",
  },
  container: {
    padding: 16,
    gap: 16,
  },
  filterContainer: {
    flexDirection: "row",
    paddingHorizontal: 0,
    paddingBottom: 8,
    gap: 8,
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 9999,
    paddingVertical: 8,
    paddingHorizontal: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  selectedButton: {
    backgroundColor: "#72C678",
  },
  unselectedButton: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D0D5DD",
  },
  icon: {
    marginRight: 8,
  },
  filterText: {
    fontSize: 14,
    fontWeight: "500",
    fontFamily: "NotoSans-Medium",
  },
  selectedText: {
    color: "#FFFFFF",
  },
  unselectedText: {
    color: "#027A48",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
    overflow: "hidden",
  },
  cardContent: {
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  info: {
    flex: 1,
  },
  id: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6B7280",
    fontFamily: "NotoSans-Medium",
  },
  idValue: {
    fontWeight: "600",
    color: "#101828",
  },
  name: {
    fontSize: 18,
    fontWeight: "600",
    color: "#101828",
    marginTop: 4,
    fontFamily: "NotoSans-SemiBold",
  },
  address: {
    fontSize: 14,
    color: "#4B5563",
    marginTop: 4,
    fontFamily: "NotoSans-Regular",
  },
  date: {
    fontSize: 14,
    color: "#4B5563",
    marginTop: 4,
    fontFamily: "NotoSans-Regular",
  },
  status: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 9999,
    paddingVertical: 2,
    paddingHorizontal: 10,
  },
  statusIcon: {
    marginRight: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "500",
    fontFamily: "NotoSans-Medium",
  },
  cardFooter: {
    backgroundColor: "#F9FAFB",
    padding: 12,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  activeButton: {
    backgroundColor: "#72C678",
  },
  disabledButton: {
    backgroundColor: "#D1D5DB",
  },
  buttonText: {
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 8,
    fontFamily: "NotoSans-SemiBold",
  },
  activeButtonText: {
    color: "#FFFFFF",
  },
  disabledButtonText: {
    color: "#4B5563",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 18,
    color: "#101828",
    fontFamily: "NotoSans-Regular",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    fontSize: 18,
    color: "#ef4444",
    fontFamily: "NotoSans-Regular",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  emptyText: {
    fontSize: 16,
    color: "#6B7280",
    fontFamily: "NotoSans-Regular",
    textAlign: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 20,
    width: "80%",
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#101828",
    marginBottom: 12,
    fontFamily: "NotoSans-SemiBold",
  },
  modalMessage: {
    fontSize: 14,
    color: "#4B5563",
    textAlign: "center",
    marginBottom: 20,
    fontFamily: "NotoSans-Regular",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  modalButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 5,
  },
  modalCancelButton: {
    backgroundColor: "#D1D5DB",
  },
  modalConfirmButton: {
    backgroundColor: "#72C678",
  },
  modalCancelButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4B5563",
    fontFamily: "NotoSans-SemiBold",
  },
  modalConfirmButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
    fontFamily: "NotoSans-SemiBold",
  },
});

export default ShipmentScreen;
