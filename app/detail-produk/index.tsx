import { BASE_API_URL } from "@/utils/api";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  Dimensions,
  FlatList,
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
  garansi: string | null;
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
  const [currentImageIndex, setCurrentImageIndex] = useState(0); // State untuk indeks gambar aktif
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string }>();
  const id = params.id;

  const fetchBarangDetails = useCallback(async () => {
    if (!id) {
      setError("ID barang tidak valid");
      setLoading(false);
      console.error("No ID provided in route params");
      return;
    }

    try {
      setLoading(true);
      console.log("Fetching product details for ID:", id);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(`${BASE_API_URL}/api/barang/${id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const res: ResponseAPI = await response.json();
      console.log("API Response:", res);

      if (!response.ok) {
        throw new Error(
          res.errors ||
            `Gagal mengambil detail barang (Status: ${response.status})`
        );
      }

      if (!res.data) {
        throw new Error("Data barang tidak ditemukan");
      }

      setBarang(res.data);
      setError(null);
    } catch (err) {
      const errorMessage =
        err &&
        typeof err === "object" &&
        "name" in err &&
        (err as any).name === "AbortError"
          ? "Permintaan ke server terlalu lama"
          : err && typeof err === "object" && "message" in err
          ? (err as any).message
          : "Terjadi kesalahan saat mengambil detail barang";
      setError(errorMessage);
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchBarangDetails();
  }, [fetchBarangDetails]);

  // Fungsi untuk format tanggal ke lokal Indonesia
  const formatLocalDate = (dateString: string): string => {
    const date = new Date(dateString);
    return `${date.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    })} ${date.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  };

  const getWarrantyStatus = (garansi: string | null): string => {
    if (!garansi) {
      return "Tidak ada";
    }
    const warrantyDate = new Date(garansi);
    const currentDate = new Date(); // Waktu saat ini
    return warrantyDate > currentDate ? "Aktif" : "Berakhir";
  };

  // Render item untuk FlatList gambar
  const renderImageItem = ({ item }: { item: Gambar }) => (
    <Image
      source={{ uri: item.url_gambar || "https://via.placeholder.com/300" }}
      style={styles.productImage}
      contentFit="cover"
    />
  );

  // Handler untuk update indeks gambar saat scroll
  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: any[] }) => {
      if (viewableItems.length > 0) {
        setCurrentImageIndex(viewableItems[0].index || 0);
      }
    },
    []
  );

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
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>Kembali</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Carousel Gambar */}
        <View style={styles.carouselContainer}>
          <FlatList
            data={
              barang.gambar.length > 0
                ? barang.gambar
                : [
                    {
                      id_gambar: 0,
                      url_gambar: "https://via.placeholder.com/300",
                      is_primary: true,
                      id_barang: 0,
                    },
                  ]
            }
            renderItem={renderImageItem}
            keyExtractor={(item) => item.id_gambar.toString()}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onViewableItemsChanged={onViewableItemsChanged}
            viewabilityConfig={{
              itemVisiblePercentThreshold: 50,
            }}
          />
          {/* Indikator Carousel */}
          {barang.gambar.length > 1 && (
            <View style={styles.indicatorContainer}>
              {barang.gambar.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.indicator,
                    currentImageIndex === index && styles.activeIndicator,
                  ]}
                />
              ))}
            </View>
          )}
        </View>

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
                {barang.garansi ? formatLocalDate(barang.garansi) : "-"}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Status Garansi:</Text>
              <Text style={styles.detailValue}>
                {getWarrantyStatus(barang.garansi)}
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

const { width } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  scrollContent: {
    paddingBottom: 16,
  },
  carouselContainer: {
    position: "relative",
  },
  productImage: {
    width: width,
    height: 300,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  indicatorContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    bottom: 10,
    width: "100%",
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#ffffff",
    opacity: 0.5,
    marginHorizontal: 4,
  },
  activeIndicator: {
    opacity: 1,
    backgroundColor: "#38e07b",
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
    marginBottom: 8,
  },
  retryButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  backButton: {
    backgroundColor: "#6b7280",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  backButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
});
