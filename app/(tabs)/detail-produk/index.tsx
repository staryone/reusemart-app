import { BASE_API_URL } from "@/utils/api";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Image } from "expo-image";
import React, { useCallback, useEffect, useState } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";

interface Barang {
  id: string;
  nama_barang: string;
  harga: number;
  gambar: Gambar[];
  deskripsi: string;
  garansi: string;
  berat: number;
  kategori: Kategori;
  penitip: Penitip;
}

interface Gambar {
  id_gambar: number;
  url_gambar: string;
  is_primary: boolean;
  id_barang: number;
}

interface Kategori {
  id_kategori: number;
  nama_kategori: string;
}

interface Penitip {
  id_penitip: string;
  nama: string;
  rating: number;
  is_top_seller: boolean;
}

interface ResponseAPI {
  data?: Barang;
  errors?: string;
}

export default function ProductDetails() {
  const [barang, setBarang] = useState<Barang | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const route = useRoute();
  const navigation = useNavigation();
  const { id } = route.params as { id: string };

  const fetchBarangDetails = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`${BASE_API_URL}/api/barang/${id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const res: ResponseAPI = await response.json();
      if (!response.ok) {
        throw new Error(res.errors || "Gagal mengambil detail barang");
      }

      if (res.data) {
        setBarang(res.data);
      }
      setError(null);
    } catch (err) {
      setError("Terjadi kesalahan saat mengambil detail barang");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchBarangDetails();
  }, [fetchBarangDetails]);

  const getPrimaryGambar = (gambars: Gambar[]): string => {
    const primaryGambar = gambars.find((gambar) => gambar.is_primary);
    return primaryGambar
      ? primaryGambar.url_gambar
      : "https://via.placeholder.com/300";
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Icon name="loop" size={40} color="#38e07b" />
        <Text style={styles.loadingText}>Memuat Detail Produk...</Text>
      </View>
    );
  }

  if (error || !barang) {
    return (
      <View style={styles.errorContainer}>
        <Icon name="error-outline" size={48} color="#ef4444" />
        <Text style={styles.errorText}>
          {error || "Produk tidak ditemukan"}
        </Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={fetchBarangDetails}
        >
          <Text style={styles.retryButtonText}>Coba Lagi</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Image
          source={{ uri: getPrimaryGambar(barang.gambar) }}
          style={styles.productImage}
          contentFit="cover"
        />
        <View style={styles.contentContainer}>
          <Text style={styles.barangName}>{barang.nama_barang}</Text>
          <Text style={styles.barangPrice}>
            Rp{barang.harga.toLocaleString("id-ID")}
          </Text>
          <View style={styles.detailCard}>
            <Text style={styles.detailTitle}>Detail Produk</Text>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Kategori:</Text>
              <Text style={styles.detailValue}>
                {barang.kategori.nama_kategori}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Berat:</Text>
              <Text style={styles.detailValue}>{barang.berat} gram</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Garansi:</Text>
              <Text style={styles.detailValue}>
                {barang.garansi || "Tidak ada"}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Deskripsi:</Text>
              <Text style={styles.detailValue}>{barang.deskripsi}</Text>
            </View>
          </View>
          <View style={styles.sellerCard}>
            <Text style={styles.detailTitle}>Informasi Penjual</Text>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Nama:</Text>
              <Text style={styles.detailValue}>{barang.penitip.nama}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Rating:</Text>
              <Text style={styles.detailValue}>{barang.penitip.rating}/5</Text>
            </View>
            {barang.penitip.is_top_seller && (
              <View style={styles.topSellerBadge}>
                <Icon name="star" size={16} color="#5145CD" />
                <Text style={styles.topSellerText}>Top Seller</Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  scrollContent: {
    paddingBottom: 16,
  },
  productImage: {
    width: "100%",
    height: 300,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  barangName: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0e1a13",
    marginBottom: 8,
  },
  barangPrice: {
    fontSize: 18,
    fontWeight: "600",
    color: "#38e07b",
    marginBottom: 16,
  },
  detailCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    padding: 16,
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  sellerCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    padding: 16,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  detailTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0e1a13",
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: "row",
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6b7280",
    width: 100,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: "400",
    color: "#0e1a13",
    flex: 1,
  },
  topSellerBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#B4C6FF",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    alignSelf: "flex-start",
    marginTop: 8,
  },
  topSellerText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#5145CD",
    marginLeft: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f9fafb",
  },
  loadingText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#0e1a13",
    marginTop: 8,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f9fafb",
    padding: 16,
  },
  errorText: {
    fontSize: 18,
    fontWeight: "500",
    color: "#ef4444",
    textAlign: "center",
    marginVertical: 16,
  },
  retryButton: {
    backgroundColor: "#38e07b",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
});
