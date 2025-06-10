import { AuthContext } from "@/context/authContext";
import { BASE_API_URL } from "@/utils/api";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  FlatList,
  ImageStyle,
  Platform,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import Toast from "react-native-toast-message";
import Icon from "react-native-vector-icons/MaterialIcons";

interface RedeemMerch {
  id_redeem_merch: number;
  tanggal_redeem: string;
  tanggal_ambil: string | null;
  id_pembeli: number;
  id_merchandise: number;
  jumlah_merch: number;
  status: "SUDAH_DIAMBIL" | "BELUM_DIAMBIL";
  pembeli: {
    id_pembeli: number;
    id_user: number;
    nama: string;
    nomor_telepon: string;
    poin_loyalitas: number;
  };
  merchandise: {
    id_merchandise: number;
    nama_merch: string;
    harga_poin: number;
    stok: number;
    url_gambar: string | null;
    createdAt: string;
    updatedAt: string;
  };
}

interface ResponseAPI {
  data?: RedeemMerch[];
  totalItems?: number;
  errors?: string;
}

interface Styles {
  container: ViewStyle;
  loadingContainer: ViewStyle;
  loadingText: TextStyle;
  errorContainer: ViewStyle;
  errorText: TextStyle;
  retryButton: ViewStyle;
  retryButtonText: TextStyle;
  listContent: ViewStyle;
  card: ViewStyle;
  imageContainer: ViewStyle;
  productImage: ImageStyle;
  cardContent: ViewStyle;
  merchName: TextStyle;
  quantityText: TextStyle;
  pointsText: TextStyle;
  statusText: TextStyle;
  dateText: TextStyle;
  emptyContainer: ViewStyle;
  emptyText: TextStyle;
  headerContainer: ViewStyle;
  headerText: TextStyle;
  searchInput: TextStyle;
  searchContainer: ViewStyle;
  backButton: ViewStyle;
  backButtonText: TextStyle;
}

export default function RedeemHistoryScreen() {
  const [redeemList, setRedeemList] = useState<RedeemMerch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [search, setSearch] = useState("");
  const [hasMore, setHasMore] = useState(true);
  const authContext = useContext(AuthContext);
  const router = useRouter();
  const searchTimeout = useRef<number | null>(null);
  const LIMIT = 10;

  const token = authContext?.token;
  const isLoggedIn = authContext?.isLoggedIn;

  const fetchRedeemHistory = useCallback(
    async (isRefresh = false, pageNum = 1, searchQuery = "") => {
      if (!isLoggedIn || !token) {
        setError("Silakan masuk untuk melihat riwayat redeem");
        setLoading(false);
        setRefreshing(false);
        return;
      }

      try {
        if (isRefresh || pageNum === 1) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        const params = new URLSearchParams({
          page: pageNum.toString(),
          limit: LIMIT.toString(),
          ...(searchQuery && { search: searchQuery }),
        });

        const response = await fetch(
          `${BASE_API_URL}/api/redeem-merch/my-lists?${params.toString()}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          const res: ResponseAPI = await response.json().catch(() => ({}));
          throw new Error(
            res.errors || `Gagal mengambil riwayat redeem: ${response.status}`
          );
        }

        const res: ResponseAPI = await response.json();
        if (res.data) {
          if (pageNum === 1) {
            setRedeemList(res.data);
          } else {
            setRedeemList((prev) => [...prev, ...res.data!]);
          }
          setTotalItems(res.totalItems || 0);
          setHasMore(res.data.length === LIMIT);
          setPage(pageNum);
          setError(null);
        } else {
          throw new Error("Data tidak ditemukan");
        }
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Terjadi kesalahan saat mengambil riwayat redeem"
        );
        console.error(err);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [isLoggedIn, token]
  );

  useEffect(() => {
    fetchRedeemHistory();
    return () => {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }
    };
  }, [fetchRedeemHistory]);

  const onRefresh = () => {
    setPage(1);
    setSearch("");
    fetchRedeemHistory(true, 1, "");
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      fetchRedeemHistory(false, page + 1, search);
    }
  };

  const handleSearch = (text: string) => {
    setSearch(text);
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }
    searchTimeout.current = setTimeout(() => {
      setPage(1);
      fetchRedeemHistory(true, 1, text);
    }, 500);
  };

  const getPrimaryGambar = (url_gambar: string | null): string => {
    return url_gambar ? url_gambar : "https://via.placeholder.com/80";
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "-";
    try {
      return new Date(dateStr).toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return "-";
    }
  };

  const renderRedeemItem = ({ item }: { item: RedeemMerch }) => (
    <View style={styles.card}>
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: getPrimaryGambar(item.merchandise.url_gambar) }}
          style={styles.productImage}
          contentFit="cover"
        />
      </View>
      <View style={styles.cardContent}>
        <Text style={styles.merchName} numberOfLines={2}>
          {item.merchandise.nama_merch}
        </Text>
        <Text style={styles.quantityText}>Jumlah: {item.jumlah_merch}</Text>
        <Text style={styles.pointsText}>
          Total Poin:{" "}
          {(item.jumlah_merch * item.merchandise.harga_poin).toLocaleString(
            "id-ID"
          )}{" "}
          Poin
        </Text>
        <Text style={styles.statusText}>
          Status:{" "}
          {item.status === "SUDAH_DIAMBIL" ? "Sudah Diambil" : "Belum Diambil"}
        </Text>
        <Text style={styles.dateText}>
          Redeem: {formatDate(item.tanggal_redeem)}
        </Text>
        <Text style={styles.dateText}>
          Diambil: {formatDate(item.tanggal_ambil)}
        </Text>
      </View>
    </View>
  );

  if (loading && !refreshing && page === 1) {
    return (
      <View style={styles.loadingContainer}>
        <Icon name="loop" size={40} color="#38e07b" />
        <Text style={styles.loadingText}>Memuat Riwayat...</Text>
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
          onPress={() => fetchRedeemHistory(true, 1, search)}
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
          <View style={styles.headerContainer}>
            <View style={styles.searchContainer}>
              <Icon
                name="search"
                size={20}
                color="#6b7280"
                style={{ marginRight: 8 }}
              />
              <TextInput
                style={styles.searchInput}
                placeholder="Cari nama merchandise"
                value={search}
                onChangeText={handleSearch}
                accessibilityLabel="Cari riwayat redeem"
              />
            </View>
          </View>
        }
        data={redeemList}
        renderItem={renderRedeemItem}
        keyExtractor={(item) => item.id_redeem_merch.toString()}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="inbox" size={48} color="#6b7280" />
            <Text style={styles.emptyText}>Tidak ada riwayat redeem</Text>
          </View>
        }
        ListFooterComponent={
          loading && page > 1 ? (
            <View style={styles.loadingContainer}>
              <Icon name="loop" size={30} color="#38e07b" />
              <Text style={styles.loadingText}>Memuat lebih banyak...</Text>
            </View>
          ) : null
        }
      />
      <Toast />
    </View>
  );
}

const styles = StyleSheet.create<Styles>({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  loadingContainer: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f9fafb",
    paddingVertical: 16,
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
  card: {
    flexDirection: "row",
    backgroundColor: "#ffffff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    marginBottom: 12,
    padding: 8,
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
    marginRight: 12,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  cardContent: {
    flex: 1,
    justifyContent: "center",
  },
  merchName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0e1a13",
    marginBottom: 4,
  },
  quantityText: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 2,
  },
  pointsText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#38e07b",
    marginBottom: 2,
  },
  statusText: {
    fontSize: 14,
    color: "#0e1a13",
    marginBottom: 2,
  },
  dateText: {
    fontSize: 14,
    color: "#6b7280",
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
  headerContainer: {
    paddingHorizontal: 16,
    marginTop: 20,
    marginBottom: 16,
  },
  headerText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0e1a13",
    marginLeft: 12,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f3f4f6",
    borderRadius: 8,
    paddingHorizontal: 12,
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#0e1a13",
    paddingVertical: 10,
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: "#0e1a13",
  },
});
