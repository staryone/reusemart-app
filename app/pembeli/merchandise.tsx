// import { AuthContext } from "@/context/authContext";
// import { BASE_API_URL } from "@/utils/api";
// import { Image } from "expo-image";
// import React, { useCallback, useContext, useEffect, useState } from "react";
// import {
//   FlatList,
//   Platform,
//   RefreshControl,
//   StyleSheet,
//   Text,
//   TouchableOpacity,
//   View,
// } from "react-native";
// import Icon from "react-native-vector-icons/MaterialIcons";

// interface Merchandise {
//   id_merchandise: string;
//   nama_merch: string;
//   harga_poin: number;
//   stok: number;
//   url_gambar: string | null;
//   createdAt: string;
//   updatedAt: string;
// }

// interface ResponseAPI {
//   data?: Merchandise[];
//   errors?: string;
// }

// export default function MerchandiseScreen() {
//   const [merchandiseList, setMerchandiseList] = useState<Merchandise[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [refreshing, setRefreshing] = useState(false);
//   const authContext = useContext(AuthContext);

//   const token = authContext?.token;

//   const fetchMerchandiseList = useCallback(async (isRefresh = false) => {
//     try {
//       if (isRefresh) {
//         setRefreshing(true);
//       } else {
//         setLoading(true);
//       }

//       const params = new URLSearchParams({
//         all: "true",
//         minStok: "0", // Fetch all items, including those with 0 stock
//       });

//       const response = await fetch(
//         `${BASE_API_URL}/api/merchandise?${params.toString()}`,
//         {
//           method: "GET",
//           headers: {
//             authorization: `Bearer ${token}`,
//             "Content-Type": "application/json",
//           },
//         }
//       );

//       const res: ResponseAPI = await response.json();
//       if (!response.ok) {
//         throw new Error(res.errors || "Gagal mengambil daftar merchandise");
//       }

//       if (res.data) {
//         setMerchandiseList(res.data);
//       }
//       setError(null);
//     } catch (err) {
//       setError("Terjadi kesalahan saat mengambil daftar merchandise");
//       console.error(err);
//     } finally {
//       setLoading(false);
//       setRefreshing(false);
//     }
//   }, []);

//   useEffect(() => {
//     fetchMerchandiseList();
//   }, [fetchMerchandiseList]);

//   const onRefresh = () => {
//     fetchMerchandiseList(true);
//   };

//   const getPrimaryGambar = (url_gambar: string | null): string => {
//     return url_gambar ? url_gambar : "https://via.placeholder.com/150";
//   };

//   const handleRedeem = (id: string) => {
//     // router.push({
//     //   pathname: "/redeem-merchandise",
//     //   params: { id },
//     // });
//   };

//   const renderMerchandise = ({ item }: { item: Merchandise }) => {
//     const isOutOfStock = item.stok === 0;

//     return (
//       <TouchableOpacity
//         style={styles.card}
//         // onPress={() =>
//         //   router.push({
//         //     pathname: "/detail-merchandise",
//         //     params: { id: item.id_merchandise },
//         //   })
//         // }
//       >
//         <View style={styles.imageContainer}>
//           <Image
//             source={{ uri: getPrimaryGambar(item.url_gambar) }}
//             style={styles.productImage}
//             contentFit="cover"
//           />
//         </View>
//         <View style={styles.cardContent}>
//           <Text style={styles.merchName} numberOfLines={2}>
//             {item.nama_merch}
//           </Text>
//           <Text style={styles.merchPrice}>
//             {item.harga_poin.toLocaleString("id-ID")} Poin
//           </Text>
//           <TouchableOpacity
//             style={[
//               styles.redeemButton,
//               isOutOfStock && styles.redeemButtonDisabled,
//             ]}
//             onPress={() => !isOutOfStock && handleRedeem(item.id_merchandise)}
//             disabled={isOutOfStock}
//           >
//             <Text
//               style={[
//                 styles.redeemButtonText,
//                 isOutOfStock && styles.redeemButtonTextDisabled,
//               ]}
//             >
//               Redeem
//             </Text>
//           </TouchableOpacity>
//         </View>
//       </TouchableOpacity>
//     );
//   };

//   if (loading && !refreshing) {
//     return (
//       <View style={styles.loadingContainer}>
//         <Icon name="loop" size={40} color="#38e07b" />
//         <Text style={styles.loadingText}>Memuat Merchandise...</Text>
//       </View>
//     );
//   }

//   if (error) {
//     return (
//       <View style={styles.errorContainer}>
//         <Icon name="error-outline" size={48} color="#ef4444" />
//         <Text style={styles.errorText}>{error}</Text>
//         <TouchableOpacity
//           style={styles.retryButton}
//           onPress={() => fetchMerchandiseList()}
//         >
//           <Text style={styles.retryButtonText}>Coba Lagi</Text>
//         </TouchableOpacity>
//       </View>
//     );
//   }

//   return (
//     <View style={styles.container}>
//       <FlatList
//         ListHeaderComponent={
//           <>
//             <View style={{ flexDirection: "row", alignItems: "center" }}>
//               <Image
//                 source={require("@/assets/images/icon.png")}
//                 style={styles.logo}
//               />
//               <Text style={styles.titleApps}>ReuseMart Merch</Text>
//             </View>
//           </>
//         }
//         data={merchandiseList}
//         renderItem={renderMerchandise}
//         keyExtractor={(item) => item.id_merchandise}
//         numColumns={2}
//         columnWrapperStyle={styles.columnWrapper}
//         contentContainerStyle={styles.listContent}
//         refreshControl={
//           <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
//         }
//         ListEmptyComponent={
//           <View style={styles.emptyContainer}>
//             <Icon name="inbox" size={48} color="#6b7280" />
//             <Text style={styles.emptyText}>Tidak ada merchandise tersedia</Text>
//           </View>
//         }
//       />
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#f9fafb",
//   },
//   loadingContainer: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     backgroundColor: "#f9fafb",
//   },
//   loadingText: {
//     fontSize: 18,
//     fontWeight: "600",
//     color: "#0e1a13",
//     marginTop: 8,
//   },
//   errorContainer: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     backgroundColor: "#f9fafb",
//     padding: 16,
//   },
//   errorText: {
//     fontSize: 18,
//     fontWeight: "500",
//     color: "#ef4444",
//     textAlign: "center",
//     marginVertical: 16,
//   },
//   retryButton: {
//     backgroundColor: "#38e07b",
//     paddingVertical: 12,
//     paddingHorizontal: 24,
//     borderRadius: 8,
//   },
//   retryButtonText: {
//     color: "#ffffff",
//     fontSize: 16,
//     fontWeight: "600",
//   },
//   listContent: {
//     paddingHorizontal: 8,
//     paddingBottom: 16,
//   },
//   columnWrapper: {
//     justifyContent: "space-between",
//     paddingHorizontal: 8,
//   },
//   card: {
//     backgroundColor: "#ffffff",
//     borderRadius: 12,
//     borderWidth: 1,
//     borderColor: "#e5e7eb",
//     width: "48%",
//     marginBottom: 16,
//     ...Platform.select({
//       ios: {
//         shadowColor: "#000",
//         shadowOffset: { width: 0, height: 2 },
//         shadowOpacity: 0.1,
//         shadowRadius: 4,
//       },
//       android: {
//         elevation: 3,
//       },
//     }),
//   },
//   imageContainer: {
//     position: "relative",
//   },
//   productImage: {
//     width: "100%",
//     height: 120,
//     borderTopLeftRadius: 12,
//     borderTopRightRadius: 12,
//   },
//   cardContent: {
//     padding: 12,
//   },
//   merchName: {
//     fontSize: 14,
//     fontWeight: "500",
//     color: "#0e1a13",
//     marginBottom: 4,
//     height: 40, // Limit height for two lines
//   },
//   merchPrice: {
//     fontSize: 14,
//     fontWeight: "600",
//     color: "#38e07b",
//     marginBottom: 8,
//   },
//   redeemButton: {
//     backgroundColor: "#38e07b",
//     paddingVertical: 8,
//     borderRadius: 6,
//     alignItems: "center",
//   },
//   redeemButtonDisabled: {
//     backgroundColor: "#d1d5db", // Grey color for disabled state
//   },
//   redeemButtonText: {
//     color: "#ffffff",
//     fontSize: 14,
//     fontWeight: "600",
//   },
//   redeemButtonTextDisabled: {
//     color: "#6b7280", // Darker grey for text in disabled state
//   },
//   emptyContainer: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     paddingVertical: 32,
//   },
//   emptyText: {
//     fontSize: 16,
//     fontWeight: "500",
//     color: "#6b7280",
//     marginTop: 8,
//   },
//   logo: {
//     marginTop: 30,
//     marginLeft: 10,
//     width: 50,
//     height: 50,
//     marginBottom: 10,
//     tintColor: "#72C678",
//   },
//   titleApps: {
//     marginTop: 30,
//     fontSize: 20,
//     fontWeight: "700",
//     color: "#0e1a13",
//     marginBottom: 16,
//     paddingHorizontal: 16,
//   },
// });

import { AuthContext } from "@/context/authContext";
import { BASE_API_URL } from "@/utils/api";
import { Image } from "expo-image";
import React, { useCallback, useContext, useEffect, useState } from "react";
import {
  FlatList,
  ImageStyle,
  Modal,
  Platform,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TextStyle,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  ViewStyle,
} from "react-native";
import Toast from "react-native-toast-message";
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

interface Pembeli {
  nama: string;
  email: string;
  nomor_telepon: string;
  poin_loyalitas: number;
}

interface ResponseAPI {
  data?: Merchandise[];
  errors?: string;
}

interface PembeliResponseAPI {
  data?: Pembeli;
  errors?: string;
}
// Define the styles interface to fix TypeScript errors
interface Styles {
  container: ViewStyle;
  loadingContainer: ViewStyle;
  loadingText: TextStyle;
  errorContainer: ViewStyle;
  errorText: TextStyle;
  retryButton: ViewStyle;
  retryButtonText: TextStyle;
  listContent: ViewStyle;
  columnWrapper: ViewStyle;
  card: ViewStyle;
  imageContainer: ViewStyle;
  productImage: ImageStyle;
  outOfStockLabel: ViewStyle;
  outOfStockText: TextStyle;
  cardContent: ViewStyle;
  merchName: TextStyle;
  merchPrice: TextStyle;
  redeemButton: ViewStyle;
  redeemButtonDisabled: ViewStyle;
  redeemButtonText: TextStyle;
  redeemButtonTextDisabled: TextStyle;
  emptyContainer: ViewStyle;
  emptyText: TextStyle;
  logo: ImageStyle;
  titleApps: TextStyle;
  modalOverlay: ViewStyle;
  modalContent: ViewStyle;
  modalTitle: TextStyle;
  modalText: TextStyle;
  modalSubText: TextStyle;
  modalBold: TextStyle;
  modalButtonContainer: ViewStyle;
  modalButton: ViewStyle;
  cancelButton: ViewStyle;
  confirmButton: ViewStyle;
  modalButtonText: TextStyle;
  quantityInputContainer: ViewStyle;
  quantityButton: ViewStyle;
  quantityButtonText: TextStyle;
  quantityInput: TextStyle;
}

export default function MerchandiseScreen() {
  const [merchandiseList, setMerchandiseList] = useState<Merchandise[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [quantityModalVisible, setQuantityModalVisible] = useState(false);
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [selectedMerch, setSelectedMerch] = useState<Merchandise | null>(null);
  const [quantity, setQuantity] = useState("1");
  const authContext = useContext(AuthContext);

  const token = authContext?.token;
  const isLoggedIn = authContext?.isLoggedIn;

  const fetchMerchandiseList = useCallback(
    async (isRefresh = false) => {
      if (!isLoggedIn || !token) {
        setError("Silakan masuk untuk melihat merchandise");
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

        const params = new URLSearchParams({
          all: "true",
          minStok: "0",
        });

        const response = await fetch(
          `${BASE_API_URL}/api/merchandise?${params.toString()}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
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
    },
    [isLoggedIn, token]
  );

  useEffect(() => {
    fetchMerchandiseList();
  }, [fetchMerchandiseList]);

  const onRefresh = () => {
    fetchMerchandiseList(true);
  };

  const getPrimaryGambar = (url_gambar: string | null): string => {
    return url_gambar ? url_gambar : "https://via.placeholder.com/150";
  };

  const handleRedeem = async (
    id: string,
    hargaPoin: number,
    jumlahMerch: number
  ) => {
    if (!isLoggedIn || !token) {
      Toast.show({
        type: "error",
        text1: "Gagal Redeem",
        text2: "Silakan masuk untuk redeem merchandise",
      });
      return;
    }

    try {
      // Fetch buyer's points from /api/pembeli/current
      const pembeliResponse = await fetch(
        `${BASE_API_URL}/api/pembeli/current`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const pembeliRes: PembeliResponseAPI = await pembeliResponse.json();
      if (!pembeliResponse.ok) {
        throw new Error(pembeliRes.errors || "Gagal mengambil poin pengguna");
      }

      const userPoints = pembeliRes.data?.poin_loyalitas || 0;
      const totalPoints = hargaPoin * jumlahMerch;

      // Check if points are sufficient
      if (userPoints < totalPoints) {
        Toast.show({
          type: "error",
          text1: "Poin Tidak Cukup",
          text2: `Anda memiliki ${userPoints} poin, diperlukan ${totalPoints} poin untuk redeem ${jumlahMerch} item.`,
        });
        return;
      }

      // Redeem merchandise via API
      const redeemResponse = await fetch(`${BASE_API_URL}/api/redeem-merch`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id_merchandise: id,
          jumlah_merch: jumlahMerch,
        }),
      });

      const redeemRes = await redeemResponse.json();
      if (!redeemResponse.ok) {
        throw new Error(
          redeemRes.errors || "Gagal melakukan redeem merchandise"
        );
      }

      // Show success toast and refresh merchandise list
      Toast.show({
        type: "success",
        text1: "Redeem Berhasil",
        text2: `Berhasil redeem ${jumlahMerch} ${selectedMerch?.nama_merch}!`,
      });
      fetchMerchandiseList(true);
    } catch (err) {
      Toast.show({
        type: "error",
        text1: "Gagal Redeem",
        text2:
          err && typeof err === "object" && "message" in err
            ? (err as { message?: string }).message
            : "Terjadi kesalahan saat redeem merchandise",
      });
      console.error(err);
    } finally {
      setConfirmModalVisible(false);
      setQuantityModalVisible(false);
    }
  };

  const openQuantityModal = (merch: Merchandise) => {
    setSelectedMerch(merch);
    setQuantity("1"); // Reset quantity to 1
    setQuantityModalVisible(true);
  };

  const openConfirmModal = () => {
    if (!selectedMerch) return;
    const qty = parseInt(quantity);
    if (isNaN(qty) || qty <= 0) {
      Toast.show({
        type: "error",
        text1: "Jumlah Tidak Valid",
        text2: "Masukkan jumlah yang valid (minimal 1).",
      });
      return;
    }
    if (qty > selectedMerch.stok) {
      Toast.show({
        type: "error",
        text1: "Jumlah Melebihi Stok",
        text2: `Stok tersedia hanya ${selectedMerch.stok} item.`,
      });
      return;
    }
    setQuantityModalVisible(false);
    setConfirmModalVisible(true);
  };

  const handleQuantityChange = (text: string) => {
    // Allow only numeric input
    if (/^\d*$/.test(text)) {
      setQuantity(text);
    }
  };

  const incrementQuantity = () => {
    const currentQty = parseInt(quantity) || 0;
    if (selectedMerch && currentQty < selectedMerch.stok) {
      setQuantity((currentQty + 1).toString());
    }
  };

  const decrementQuantity = () => {
    const currentQty = parseInt(quantity) || 0;
    if (currentQty > 1) {
      setQuantity((currentQty - 1).toString());
    }
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
          {isOutOfStock && (
            <View style={styles.outOfStockLabel}>
              <Text
                style={styles.outOfStockText}
                accessibilityLabel="Stok Habis"
              >
                Stok Habis
              </Text>
            </View>
          )}
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
            onPress={() => !isOutOfStock && openQuantityModal(item)}
            disabled={isOutOfStock}
            accessibilityLabel={`Redeem ${item.nama_merch}`}
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
      {/* Quantity Input Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={quantityModalVisible}
        onRequestClose={() => setQuantityModalVisible(false)}
      >
        <TouchableWithoutFeedback
          onPress={() => setQuantityModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Masukkan Jumlah</Text>
                <Text style={styles.modalText}>
                  Redeem{" "}
                  <Text style={styles.modalBold}>
                    {selectedMerch?.nama_merch}
                  </Text>
                </Text>
                <Text style={styles.modalSubText}>
                  Stok tersedia: {selectedMerch?.stok} item
                </Text>
                <View style={styles.quantityInputContainer}>
                  <TouchableOpacity
                    style={styles.quantityButton}
                    onPress={decrementQuantity}
                    accessibilityLabel="Kurangi jumlah"
                  >
                    <Text style={styles.quantityButtonText}>-</Text>
                  </TouchableOpacity>
                  <TextInput
                    style={styles.quantityInput}
                    value={quantity}
                    onChangeText={handleQuantityChange}
                    keyboardType="numeric"
                    accessibilityLabel="Jumlah merchandise"
                    placeholder="1"
                    placeholderTextColor="#6b7280"
                  />
                  <TouchableOpacity
                    style={styles.quantityButton}
                    onPress={incrementQuantity}
                    accessibilityLabel="Tambah jumlah"
                  >
                    <Text style={styles.quantityButtonText}>+</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.modalButtonContainer}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.cancelButton]}
                    onPress={() => setQuantityModalVisible(false)}
                    accessibilityLabel="Batalkan input jumlah"
                  >
                    <Text style={styles.modalButtonText}>Batal</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.confirmButton]}
                    onPress={openConfirmModal}
                    accessibilityLabel="Lanjutkan ke konfirmasi"
                  >
                    <Text style={styles.modalButtonText}>Lanjutkan</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
      {/* Confirmation Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={confirmModalVisible}
        onRequestClose={() => setConfirmModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setConfirmModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Konfirmasi Redeem</Text>
                <Text style={styles.modalText}>
                  Redeem{" "}
                  <Text style={styles.modalBold}>
                    {quantity} {selectedMerch?.nama_merch}
                  </Text>{" "}
                  dengan{" "}
                  <Text style={styles.modalBold}>
                    {(
                      parseInt(quantity) * (selectedMerch?.harga_poin || 0)
                    ).toLocaleString("id-ID")}{" "}
                    poin
                  </Text>
                  ?
                </Text>
                <View style={styles.modalButtonContainer}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.cancelButton]}
                    onPress={() => setConfirmModalVisible(false)}
                    accessibilityLabel="Batalkan redeem"
                  >
                    <Text style={styles.modalButtonText}>Batal</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.confirmButton]}
                    onPress={() =>
                      selectedMerch &&
                      handleRedeem(
                        selectedMerch.id_merchandise,
                        selectedMerch.harga_poin,
                        parseInt(quantity)
                      )
                    }
                    accessibilityLabel="Konfirmasi redeem"
                  >
                    <Text style={styles.modalButtonText}>Konfirmasi</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
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
  outOfStockLabel: {
    position: "absolute",
    top: 10,
    left: 10,
    backgroundColor: "#ef4444",
    borderRadius: 6,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  outOfStockText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "600",
  },
  cardContent: {
    padding: 12,
  },
  merchName: {
    fontSize: 14,
    fontWeight: "500",
    color: "#0e1a13",
    marginBottom: 4,
    height: 40,
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
    backgroundColor: "#d1d5db",
  },
  redeemButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600",
  },
  redeemButtonTextDisabled: {
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 20,
    width: "80%",
    maxWidth: 400,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0e1a13",
    marginBottom: 12,
  },
  modalText: {
    fontSize: 16,
    color: "#0e1a13",
    textAlign: "center",
    marginBottom: 12,
  },
  modalSubText: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 16,
  },
  modalBold: {
    fontWeight: "600",
  },
  modalButtonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 8,
  },
  cancelButton: {
    backgroundColor: "#d1d5db",
  },
  confirmButton: {
    backgroundColor: "#38e07b",
  },
  modalButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  quantityInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  quantityButton: {
    backgroundColor: "#e5e7eb",
    padding: 10,
    borderRadius: 8,
    width: 40,
    alignItems: "center",
  },
  quantityButtonText: {
    fontSize: 20,
    fontWeight: "600",
    color: "#0e1a13",
  },
  quantityInput: {
    backgroundColor: "#f3f4f6",
    borderRadius: 8,
    padding: 10,
    marginHorizontal: 10,
    width: 60,
    textAlign: "center",
    fontSize: 16,
    color: "#0e1a13",
  },
});
