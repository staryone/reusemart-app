import { AuthContext } from '@/context/authContext';
import { BASE_API_URL } from '@/utils/api';
import { router } from 'expo-router';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { Image, Platform, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface Gambar {
  id_gambar: string;
  url_gambar: string;
  is_primary: boolean;
}

interface Kategori {
  id_kategori: string;
  nama_kategori: string;
}

interface Barang {
  id_barang: string;
  nama_barang: string;
  harga: number;
  status: string;
  kategori: Kategori;
  gambar: Gambar[];
}

interface DetailPenitipan {
  id_dtl_penitipan: string;
  barang: Barang;
  tanggal_masuk: string;
  tanggal_akhir: string;
  batas_ambil: string;
  is_perpanjang: boolean;
}

interface Penitip {
  nama: string;
  alamat: string;
  email: string;
  nomor_telepon: string;
  saldo: number;
  rating: number;
  poin: number;
  is_top_seller: boolean;
  penitipan: { detail_penitipan: DetailPenitipan[] }[];
}

interface ResponseAPI {
  data?: Penitip;
  errors?: string;
}

export default function DaftarBarang() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [penitip, setPenitip] = useState<Penitip | null>(null);
  const authContext = useContext(AuthContext);

  if (!authContext) {
    throw new Error('AuthContext must be used within an AuthProvider');
  }
  const { token, isLoggedIn } = authContext;

  const fetchPenitipan = useCallback(
    async (isRefresh = false) => {
      if (!isLoggedIn || !token) {
        setError('Silakan masuk untuk melihat daftar barang');
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

        const response = await fetch(`${BASE_API_URL}/api/penitip/current`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const res: ResponseAPI = await response.json();
        if (!response.ok) {
          throw new Error(res.errors || 'Gagal mengambil data barang');
        }

        if (res.data) {
          setPenitip(res.data);
        }
        setError(null);
      } catch (err) {
        setError('Terjadi kesalahan saat mengambil data barang');
        console.error(err);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [isLoggedIn, token]
  );

  useEffect(() => {
    fetchPenitipan();
  }, [fetchPenitipan]);

  const onRefresh = () => {
    fetchPenitipan(true);
  };

  // Format price to Indonesian Rupiah
  const formatRupiah = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value);
  };

  // Get primary image or fallback
  const getPrimaryGambar = (gambars: Gambar[]): string => {
    const primaryGambar = gambars.find((gambar) => gambar.is_primary);
    return primaryGambar ? primaryGambar.url_gambar : 'https://via.placeholder.com/150';
  };

  // Flatten penitipan to get detail_penitipan list
  const detailPenitipanList = penitip?.penitipan
    ? penitip.penitipan.flatMap((penitipan) => penitipan.detail_penitipan)
    : [];

  if(loading) {
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
            <TouchableOpacity
              onPress={() => 
                router.canGoBack() ? router.back() : router.push("/(tabs)/Profil")
              }
              accessible
              accessibilityLabel="Kembali ke profil"
            >
              <Icon name="arrow-back" size={24} color="#0e1a13" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Daftar Barang</Text>
          </View>
        </View>

        {/* Main Content */}
        <ScrollView
          style={styles.scrollView}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {/* Barang Section */}
          <View style={styles.barangSection}>
            {detailPenitipanList.length === 0 ? (
              <Text style={styles.noItemsText}>Tidak ada barang ditemukan</Text>
            ) : (
              detailPenitipanList.map((item) => (
                <View key={item.id_dtl_penitipan} style={styles.barangCard}>
                  <Image
                    source={{ uri: getPrimaryGambar(item.barang.gambar) }}
                    style={styles.barangImage}
                    resizeMode="cover"
                  />
                  <View style={styles.barangInfo}>
                    <Text style={styles.barangName}>{item.barang.nama_barang}</Text>
                    <Text style={styles.barangPrice}>{formatRupiah(item.barang.harga)}</Text>
                    <Text style={styles.barangCategory}>{item.barang.kategori.nama_kategori}</Text>
                    <View
                      style={[
                        styles.statusBadge,
                        {
                          backgroundColor:
                            item.barang.status === 'TERSEDIA'
                              ? '#38e07b'
                              : item.barang.status === 'TERJUAL'
                              ? '#3b82f6'
                              : item.barang.status === 'DIDONASIKAN'
                              ? '#8b5cf6'
                              : item.barang.status === 'KEMBALI'
                              ? '#ef4444'
                              : item.barang.status === 'MENUNGGU_KEMBALI'
                              ? '#f59e0b'
                              : '#6b7280',
                        },
                      ]}
                    >
                      <Text style={styles.statusText}>
                        {item.barang.status === 'MENUNGGU_KEMBALI' ? 'MENUNGGU DIAMBIL' : item.barang.status}
                      </Text>
                    </View>
                  </View>
                </View>
              ))
            )}
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  mainContainer: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: '#0e1a13',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 18,
    color: '#ef4444',
  },
  header: {
    padding: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backdropBlur: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '700',
    color: '#0e1a13',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  barangSection: {
    marginBottom: 16,
    marginTop: 24,
  },
  barangCard: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  barangImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  barangInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  barangName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0e1a13',
    marginBottom: 4,
  },
  barangPrice: {
    fontSize: 14,
    fontWeight: '500',
    color: '#38e07b',
    marginBottom: 4,
  },
  barangCategory: {
    fontSize: 12,
    fontWeight: '400',
    color: '#6b7280',
    marginBottom: 4,
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#ffffff',
  },
  noItemsText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginVertical: 16,
  },
});