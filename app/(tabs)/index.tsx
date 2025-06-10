// import { Image } from "expo-image";
// import { StyleSheet } from "react-native";

// import ParallaxScrollView from "@/components/ParallaxScrollView";
// import { ThemedText } from "@/components/ThemedText";

// export default function HomeScreen() {
//   return (
//     <ParallaxScrollView
//       headerBackgroundColor={{ light: "#A1CEDC", dark: "#1D3D47" }}
//       headerImage={
//         <Image
//           source={require("@/assets/images/partial-react-logo.png")}
//           style={styles.reactLogo}
//         />
//       }
//     >
//       <ThemedText type="defaultSemiBold">Ini Halaman Utama</ThemedText>
//     </ParallaxScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   titleContainer: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 8,
//   },
//   stepContainer: {
//     gap: 8,
//     marginBottom: 8,
//   },
//   reactLogo: {
//     height: 178,
//     width: 290,
//     bottom: 0,
//     left: 0,
//     position: "absolute",
//   },
// });

import { BASE_API_URL } from "@/utils/api";
import { Image } from "expo-image";
import { router } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  FlatList,
  Platform,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";

interface Barang {
  id: string;
  id_barang: number;
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
  data?: Barang[];
  errors?: string;
}

export default function HomeScreen() {
  const [barangList, setBarangList] = useState<Barang[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchBarangList = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const params = new URLSearchParams({
        status: "TERSEDIA",
        all: "true",
      });

      const response = await fetch(
        `${BASE_API_URL}/api/barang/lists?${params.toString()}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const res: ResponseAPI = await response.json();
      if (!response.ok) {
        throw new Error(res.errors || "Gagal mengambil daftar barang");
      }

      if (res.data) {
        setBarangList(res.data);
      }
      setError(null);
    } catch (err) {
      setError("Terjadi kesalahan saat mengambil daftar barang");
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchBarangList();
  }, [fetchBarangList]);

  const onRefresh = () => {
    fetchBarangList(true);
  };

  const getPrimaryGambar = (gambars: Gambar[]): string => {
    const primaryGambar = gambars.find((gambar) => gambar.is_primary);
    return primaryGambar
      ? primaryGambar.url_gambar
      : "https://via.placeholder.com/150";
  };

  const getWarrantyStatus = (garansi: string | null): string => {
    if (!garansi) {
      return "Tidak ada";
    }
    const warrantyDate = new Date(garansi);
    if (isNaN(warrantyDate.getTime())) {
      return "Tidak ada";
    }
    const currentDate = new Date();
    return warrantyDate > currentDate ? "Aktif" : "Berakhir";
  };

  // const renderBarang = ({ item }: { item: Barang }) => (
  //   <TouchableOpacity
  //     style={styles.card}
  //     onPress={() =>
  //       router.push({
  //         pathname: "/detail-produk",
  //         params: { id: item.id_barang },
  //       })
  //     }
  //   >
  //     <Image
  //       source={{ uri: getPrimaryGambar(item.gambar) }}
  //       style={styles.productImage}
  //       contentFit="cover"
  //     />
  //     <View style={styles.cardContent}>
  //       <Text style={styles.barangName} numberOfLines={2}>
  //         {item.nama_barang}
  //       </Text>
  //       <Text style={styles.barangPrice}>
  //         Rp{item.harga.toLocaleString("id-ID")}
  //       </Text>
  //     </View>
  //   </TouchableOpacity>
  // );
  const renderBarang = ({ item }: { item: Barang }) => {
    const isWarrantyActive = getWarrantyStatus(item.garansi) === "Aktif";

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() =>
          router.push({
            pathname: "/detail-produk",
            params: { id: item.id_barang },
          })
        }
      >
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: getPrimaryGambar(item.gambar) }}
            style={styles.productImage}
            contentFit="cover"
          />
          {isWarrantyActive && (
            <View style={styles.warrantyBadge}>
              <Text style={styles.warrantyText}>Bergaransi</Text>
            </View>
          )}
        </View>
        <View style={styles.cardContent}>
          <Text style={styles.barangName} numberOfLines={2}>
            {item.nama_barang}
          </Text>
          <Text style={styles.barangPrice}>
            Rp{item.harga.toLocaleString("id-ID")}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <Icon name="loop" size={40} color="#38e07b" />
        <Text style={styles.loadingText}>Memuat Produk...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Icon name="error-outline" size={48} color="#ef4444" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => fetchBarangList()}
        >
          <Text style={styles.retryButtonText}>Coba Lagi</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        ListHeaderComponent={
          <>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Image
                source={require("@/assets/images/icon.png")}
                style={styles.logo}
              />
              <Text style={styles.titleApps}>ReuseMart</Text>
            </View>
          </>
        }
        data={barangList}
        renderItem={renderBarang}
        keyExtractor={(item) => item.id_barang.toString()} // Use id_barang as key
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="inbox" size={48} color="#6b7280" />
            <Text style={styles.emptyText}>Tidak ada produk tersedia</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  banner: {
    width: "100%",
    height: 150,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0e1a13",
    marginBottom: 16,
    paddingHorizontal: 16,
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
  listContent: {
    paddingHorizontal: 8,
    paddingBottom: 16,
  },
  columnWrapper: {
    justifyContent: "space-between",
    paddingHorizontal: 8,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    width: "48%",
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
  productImage: {
    width: "100%",
    height: 120,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  cardContent: {
    padding: 12,
  },
  barangName: {
    fontSize: 14,
    fontWeight: "500",
    color: "#0e1a13",
    marginBottom: 4,
    height: 40, // Limit height for two lines
  },
  barangPrice: {
    fontSize: 14,
    fontWeight: "600",
    color: "#38e07b",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#6b7280",
    marginTop: 8,
  },
  logo: {
    marginTop: 30,
    marginLeft: 10,
    width: 50,
    height: 50,
    marginBottom: 10,
    tintColor: "#72C678",
  },
  titleApps: {
    marginTop: 30,
    fontSize: 20,
    fontWeight: "700",
    color: "#0e1a13",
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  imageContainer: {
    position: "relative",
  },
  warrantyBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "#38e07b",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  warrantyText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "600",
  },
});
