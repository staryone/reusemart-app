import { AuthContext } from "@/context/authContext";
import { BASE_API_URL } from "@/utils/api";
import { Image } from "expo-image";
import React, { useCallback, useContext, useEffect, useState } from "react";
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

interface Merchandise {
  id_merchandise: string;
  nama_merch: string;
  harga_poin: number;
  stok: number;
  url_gambar: string | null;
  createdAt: string;
  updatedAt: string;
}

interface ResponseAPI {
  data?: Merchandise[];
  errors?: string;
}

export default function MerchandiseScreen() {
  const [merchandiseList, setMerchandiseList] = useState<Merchandise[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const authContext = useContext(AuthContext);

  const token = authContext?.token;

  const fetchMerchandiseList = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const params = new URLSearchParams({
        all: "true",
        minStok: "0", // Fetch all items, including those with 0 stock
      });

      const response = await fetch(
        `${BASE_API_URL}/api/merchandise?${params.toString()}`,
        {
          method: "GET",
          headers: {
            authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const res: ResponseAPI = await response.json();
      if (!response.ok) {
        throw new Error(res.errors || "Gagal mengambil daftar merchandise");
      }

      if (res.data) {
        setMerchandiseList(res.data);
      }
      setError(null);
    } catch (err) {
      setError("Terjadi kesalahan saat mengambil daftar merchandise");
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchMerchandiseList();
  }, [fetchMerchandiseList]);

  const onRefresh = () => {
    fetchMerchandiseList(true);
  };

  const getPrimaryGambar = (url_gambar: string | null): string => {
    return url_gambar ? url_gambar : "https://via.placeholder.com/150";
  };

  const handleRedeem = (id: string) => {
    // router.push({
    //   pathname: "/redeem-merchandise",
    //   params: { id },
    // });
  };

  const renderMerchandise = ({ item }: { item: Merchandise }) => {
    const isOutOfStock = item.stok === 0;

    return (
      <TouchableOpacity
        style={styles.card}
        // onPress={() =>
        //   router.push({
        //     pathname: "/detail-merchandise",
        //     params: { id: item.id_merchandise },
        //   })
        // }
      >
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: getPrimaryGambar(item.url_gambar) }}
            style={styles.productImage}
            contentFit="cover"
          />
        </View>
        <View style={styles.cardContent}>
          <Text style={styles.merchName} numberOfLines={2}>
            {item.nama_merch}
          </Text>
          <Text style={styles.merchPrice}>
            {item.harga_poin.toLocaleString("id-ID")} Poin
          </Text>
          <TouchableOpacity
            style={[
              styles.redeemButton,
              isOutOfStock && styles.redeemButtonDisabled,
            ]}
            onPress={() => !isOutOfStock && handleRedeem(item.id_merchandise)}
            disabled={isOutOfStock}
          >
            <Text
              style={[
                styles.redeemButtonText,
                isOutOfStock && styles.redeemButtonTextDisabled,
              ]}
            >
              Redeem
            </Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <Icon name="loop" size={40} color="#38e07b" />
        <Text style={styles.loadingText}>Memuat Merchandise...</Text>
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
          onPress={() => fetchMerchandiseList()}
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
              <Text style={styles.titleApps}>ReuseMart Merch</Text>
            </View>
          </>
        }
        data={merchandiseList}
        renderItem={renderMerchandise}
        keyExtractor={(item) => item.id_merchandise}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="inbox" size={48} color="#6b7280" />
            <Text style={styles.emptyText}>Tidak ada merchandise tersedia</Text>
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
  imageContainer: {
    position: "relative",
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
  merchName: {
    fontSize: 14,
    fontWeight: "500",
    color: "#0e1a13",
    marginBottom: 4,
    height: 40, // Limit height for two lines
  },
  merchPrice: {
    fontSize: 14,
    fontWeight: "600",
    color: "#38e07b",
    marginBottom: 8,
  },
  redeemButton: {
    backgroundColor: "#38e07b",
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: "center",
  },
  redeemButtonDisabled: {
    backgroundColor: "#d1d5db", // Grey color for disabled state
  },
  redeemButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600",
  },
  redeemButtonTextDisabled: {
    color: "#6b7280", // Darker grey for text in disabled state
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
});
