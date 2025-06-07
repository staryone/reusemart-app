import { AuthContext } from '@/context/authContext';
import { BASE_API_URL } from '@/utils/api';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { Modal, Platform, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LogoutButton from '../LogoutButton';

export type RootStackParamList = {
  PembeliProfile: undefined;
  Pembayaran: { idTransaksi: number };
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export interface Barang {
  id_barang: string;
  nama_barang: string;
  deskripsi: string;
  harga: number;
  status: string;
  garansi: string;
  berat: number;
  createdAt: string;
  updatedAt: string;
  errors?: string;
  detail_transaksi?: DetailTransaksi;
  id_qc?: string;
  nama_qc?: string;
}

interface DetailTransaksi {
  is_rating: boolean;
  komisi_hunter: number;
  komisi_penitip: number;
  komisi_reusemart: number;
  barang: Barang;
}

interface Transaksi {
  id_transaksi: number;
  tanggal_transaksi: string;
  total_harga: number;
  status_Pembayaran: string;
  tanggal_pembayaran?: string;
  batas_pembayaran: string;
  bukti_transfer: string;
  potongan_poin: number;
  metode_pengiriman: string;
  ongkos_kirim: number;
  total_akhir: number;
  detail_transaksi: DetailTransaksi[];
  pembeli: Pembeli;
  total_poin: number;
  errors?: string;
  pengiriman?: {
    status_pengiriman: string;
    tanggal: string;
  };
}

interface Pembeli {
  nama: string;
  email: string;
  nomor_telepon: string;
  poin_loyalitas: number;
  transaksi: Transaksi[];
}

interface ResponseAPI {
  data?: Pembeli;
  errors?: string;
}

enum StatusPengiriman {
  DIPROSES = "DIPROSES",
  SIAP_DIAMBIL = "SIAP_DIAMBIL",
  SEDANG_DIKIRIM = "SEDANG_DIKIRIM",
  SUDAH_DITERIMA = "SUDAH_DITERIMA",
}

const statusStyles: Record<
  string,
  { text: string; bgColor: string; textColor: string }
> = {
  BELUM_DIBAYAR: {
    text: "Belum Dibayar",
    bgColor: '#fef9c3',
    textColor: '#713f12',
  },
  SUDAH_DIBAYAR: {
    text: "Sudah Dibayar",
    bgColor: '#bfdbfe',
    textColor: '#1e3a8a',
  },
  DITERIMA: {
    text: "Sedang Diproses",
    bgColor: '#d1fae5',
    textColor: '#065f46',
  },
  DIBATALKAN: {
    text: "Dibatalkan Sistem",
    bgColor: '#fee2e2',
    textColor: '#991b1b',
  },
  DITOLAK: {
    text: "Ditolak oleh CS",
    bgColor: '#fee2e2',
    textColor: '#991b1b',
  },
  [StatusPengiriman.DIPROSES]: {
    text: "Proses Packing",
    bgColor: '#fed7aa',
    textColor: '#7c2d12',
  },
  [StatusPengiriman.SIAP_DIAMBIL]: {
    text: "Siap Diambil",
    bgColor: '#fef9c3',
    textColor: '#713f12',
  },
  [StatusPengiriman.SEDANG_DIKIRIM]: {
    text: "Sedang Dikirim",
    bgColor: '#bfdbfe',
    textColor: '#1e3a8a',
  },
  [StatusPengiriman.SUDAH_DITERIMA]: {
    text: "Selesai",
    bgColor: '#d1fae5',
    textColor: '#065f46',
  },
};

interface CardTransaksiProps {
  transaksi: Transaksi;
  onOpenModal: (transaksi: Transaksi) => void;
}

const CardTransaksi: React.FC<CardTransaksiProps> = ({ transaksi, onOpenModal }) => {
  const formattedDate = format(new Date(transaksi.tanggal_transaksi), 'dd MMM yyyy', { locale: id });
  const formatYear = format(new Date(transaksi.tanggal_transaksi), 'yyyy');
  const formatMonth = format(new Date(transaksi.tanggal_transaksi), 'MM');

  const getFirstBarang = (transaksi: Transaksi) => {
    const firstDetail = transaksi.detail_transaksi?.[0];
    return firstDetail?.barang || null;
  };

  const currentStatus =
    transaksi.pengiriman && transaksi.pengiriman.status_pengiriman
      ? statusStyles[transaksi.pengiriman.status_pengiriman] || {
          text: transaksi.pengiriman.status_pengiriman,
          bgColor: '#f3f4f6',
          textColor: '#1f2937',
        }
      : statusStyles[transaksi.status_Pembayaran] || {
          text: transaksi.status_Pembayaran,
          bgColor: '#f3f4f6',
          textColor: '#1f2937',
        };

  const handleOpenModal = () => {
    console.log('Opening modal for transaction:', transaksi.id_transaksi);
    onOpenModal(transaksi);
  };

  return (
    <View style={styles.transactionCard}>
      <View style={styles.transactionLeft}>
        <Text style={styles.transactionDate}>{formattedDate}</Text>
        <Text style={styles.transactionId}>
          {formatYear}.{formatMonth}.{transaksi.id_transaksi}
        </Text>
      </View>
      <View style={styles.transactionCenter}>
        <Text style={styles.transactionItemName} numberOfLines={2}>
          {getFirstBarang(transaksi)?.nama_barang || 'Barang tidak tersedia'}
          {transaksi.detail_transaksi.length > 1 &&
            ` + ${transaksi.detail_transaksi.length - 1} barang lainnya`}
        </Text>
        <Text style={styles.transactionItemPrice}>
          Rp {getFirstBarang(transaksi)?.harga.toLocaleString() || 'N/A'}
        </Text>
        <View style={styles.transactionActions}>
          <View style={[styles.statusBadge, { backgroundColor: currentStatus.bgColor }]}>
            <Text style={[styles.statusText, { color: currentStatus.textColor }]}>
              {currentStatus.text}
            </Text>
          </View>
        </View>
        <TouchableOpacity onPress={handleOpenModal} accessibilityLabel="Lihat detail transaksi">
          <Text style={styles.detailLink}>Lihat Detail Transaksi</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.transactionRight}>
        <Text style={styles.transactionLabel}>Total Belanja</Text>
        <Text style={styles.transactionValue}>
          Rp {transaksi.total_akhir.toLocaleString()}
        </Text>
      </View>
    </View>
  );
};

interface TransactionDetailModalProps {
  transaksi: Transaksi | null;
  visible: boolean;
  onClose: () => void;
}

const TransactionDetailModal: React.FC<TransactionDetailModalProps> = ({ transaksi, visible, onClose }) => {
  console.log('Modal visible:', visible, 'Transaction:', transaksi);
  console.log('Detail Transaksi:', transaksi?.detail_transaksi);

  if (!transaksi || !visible) {
    console.log('Modal not rendered: transaksi or visible is falsy');
    return null;
  }

  const formatDate = (dateStr?: string) => {
    try {
      if (!dateStr) return '-';
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) throw new Error('Invalid date');
      return format(date, 'dd MMMM yyyy, HH:mm', { locale: id }) + ' WIB';
    } catch (error) {
      console.warn('Date format error:', error);
      return '-';
    }
  };

  const formattedDateTransaksi = formatDate(transaksi.tanggal_transaksi);
  const formattedDatePembayaran = formatDate(transaksi.tanggal_pembayaran);
  const formattedDateBatas = formatDate(transaksi.batas_pembayaran);
  const formattedDatePengiriman = formatDate(transaksi.pengiriman?.tanggal);
  const status_pengiriman = transaksi.pengiriman?.status_pengiriman || '-';
  const formatYear = transaksi.tanggal_transaksi
    ? format(new Date(transaksi.tanggal_transaksi), 'yyyy', { locale: id })
    : 'N/A';
  const formatMonth = transaksi.tanggal_transaksi
    ? format(new Date(transaksi.tanggal_transaksi), 'MM', { locale: id })
    : 'N/A';

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContainer, { minHeight: 300 }]}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Detail Transaksi</Text>
            <TouchableOpacity onPress={() => {
              console.log('Closing modal');
              onClose();
            }} accessibilityLabel="Tutup modal">
              <Icon name="close" size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>
          <ScrollView style={[styles.modalContent, { flexGrow: 1 }]}>
            <View style={styles.modalSection}>
              <Text style={styles.modalText}>
                <Text style={styles.modalLabel}>Nomor Transaksi: </Text>
                <Text>{formatYear}.{formatMonth}.{transaksi.id_transaksi}</Text>
              </Text>
              <Text style={styles.modalText}>
                <Text style={styles.modalLabel}>Tanggal Transaksi: </Text>
                <Text>{formattedDateTransaksi}</Text>
              </Text>
            </View>
            <View style={styles.modalSection}>
              <Text style={styles.modalSectionTitle}>Daftar Barang</Text>
              {transaksi.detail_transaksi.length > 0 ? (
                transaksi.detail_transaksi.map((detail, index) => {
                  console.log('Rendering item:', detail.barang);
                  const barang = Array.isArray(detail.barang) ? detail.barang[0] : detail.barang;
                  return (
                    <View
                      key={index}
                      style={[styles.itemContainer, index === transaksi.detail_transaksi.length - 1 ? {} : styles.itemBorder]}
                    >
                      <Text style={styles.itemName}>
                        {barang?.nama_barang || 'N/A'}
                      </Text>
                      <Text style={styles.itemPrice}>
                        Rp {barang?.harga ? barang.harga.toLocaleString() : 'N/A'}
                      </Text>
                    </View>
                  );
                })
              ) : (
                <Text style={styles.noItems}>Tidak ada barang dalam transaksi ini.</Text>
              )}
            </View>
            <View style={styles.modalSection}>
              <Text style={styles.modalSectionTitle}>Pengiriman</Text>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Metode Pengiriman</Text>
                <Text style={styles.detailValue}>{transaksi.metode_pengiriman || '-'}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Biaya Pengiriman</Text>
                <Text style={styles.detailValue}>
                  Rp {transaksi.ongkos_kirim ? transaksi.ongkos_kirim.toLocaleString() : '-'}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Status Pengiriman</Text>
                <Text style={styles.detailValue}>{status_pengiriman}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Tanggal Pengiriman</Text>
                <Text style={styles.detailValue}>{formattedDatePengiriman}</Text>
              </View>
            </View>
            <View style={styles.modalSection}>
              <Text style={styles.modalSectionTitle}>Ringkasan Pembayaran</Text>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Subtotal Barang</Text>
                <Text style={styles.detailValue}>
                  Rp {transaksi.total_harga.toLocaleString()}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Potongan Poin</Text>
                <Text style={styles.detailValue}>
                  Rp {transaksi.potongan_poin.toLocaleString()}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabelBold}>Total Akhir</Text>
                <Text style={styles.detailValueBold}>
                  Rp {transaksi.total_akhir.toLocaleString()}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Batas Pembayaran</Text>
                <Text style={styles.detailValue}>{formattedDateBatas}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Tanggal Pembayaran</Text>
                <Text style={styles.detailValue}>{formattedDatePembayaran}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Status Pembayaran</Text>
                <Text style={styles.detailValue}>{transaksi.status_Pembayaran}</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>Tutup</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

export default function PembeliProfile() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [pembeli, setPembeli] = useState<Pembeli | null>(null);
  const [transaksi, setTransaksi] = useState<Transaksi[]>([]);
  const [selectedTransaksi, setSelectedTransaksi] = useState<Transaksi | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const authContext = useContext(AuthContext);
  const navigation = useNavigation<NavigationProp>();

  if (!authContext) {
    throw new Error('AuthContext must be used within an AuthProvider');
  }
  const { token, isLoggedIn } = authContext;

  const fetchProfile = useCallback(
    async (isRefresh = false) => {
      if (!isLoggedIn || !token) {
        setError('Silakan masuk untuk melihat profil');
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
          throw new Error(res.errors || 'Gagal mengambil data profil');
        }

        if (res.data) {
          setPembeli(res.data);
          setTransaksi(res.data.transaksi);
        }
        setError(null);
      } catch (err) {
        setError('Terjadi kesalahan saat mengambil data profil');
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

  const openModal = (transaksi: Transaksi) => {
    console.log('Opening modal with transaction:', transaksi);
    setSelectedTransaksi(transaksi);
    setModalVisible(true);
  };

  const closeModal = () => {
    console.log('Closing modal');
    setSelectedTransaksi(null);
    setModalVisible(false);
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
                {pembeli?.nama || 'Ethan Carter'}
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
                  {pembeli?.email || 'ethan.carter@email.com'}
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
                  {pembeli?.nomor_telepon || '+1 (555) 123-4567'}
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
          <Text style={styles.sectionTitle}>Daftar Transaksi</Text>
          <View style={styles.transactionSection}>
            {transaksi.length === 0 ? (
              <Text style={styles.noItems}>Tidak ada transaksi.</Text>
            ) : (
              transaksi.map((trx) => (
                <CardTransaksi
                  key={trx.id_transaksi}
                  transaksi={trx}
                  onOpenModal={openModal}
                />
              ))
            )}
          </View>
          <LogoutButton />
        </ScrollView>
        <TransactionDetailModal
          transaksi={selectedTransaksi}
          visible={modalVisible}
          onClose={closeModal}
        />
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
    position: 'sticky',
    top: 0,
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
  profileSection: {
    width: '100%',
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: 24,
  },
  profileInfo: {
    flexDirection: 'column',
    alignItems: 'center',
    paddingTop: 24,
  },
  profileName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0e1a13',
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0e1a13',
    marginBottom: 8,
    marginTop: 24,
  },
  accountSection: {
    marginBottom: 16,
  },
  accountItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 12,
    borderRadius: 12,
    marginBottom: 4,
  },
  accountIconContainer: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: '#e8f2ec',
  },
  accountTextContainer: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    marginLeft: 16,
  },
  accountLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6b7280',
  },
  accountValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#0e1a13',
  },
  rewardCardSecondary: {
    flex: 1,
    flexDirection: 'column',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#ffffff',
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
  pointsCard: {
    marginTop: 12,
    marginBottom: 15,
  },
  rewardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  rewardLabelSecondary: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
    marginLeft: 8,
  },
  rewardValueSecondary: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0e1a13',
  },
  transactionSection: {
    marginBottom: 16,
  },
  transactionCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
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
  transactionLeft: {
    width: '25%',
    flexDirection: 'column',
  },
  transactionCenter: {
    width: '50%',
    flexDirection: 'column',
  },
  transactionRight: {
    width: '25%',
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
  transactionDate: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  transactionId: {
    fontSize: 12,
    color: '#9ca3af',
  },
  transactionItemName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0e1a13',
    marginBottom: 4,
  },
  transactionItemPrice: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  transactionActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  transactionLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6b7280',
  },
  transactionValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0e1a13',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  detailLink: {
    fontSize: 14,
    fontWeight: '600',
    color: '#72C678',
  },
  noItems: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    width: '90%',
    height: '90%',
    padding: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0e1a13',
  },
  modalContent: {
    flex: 1,
  },
  modalSection: {
    marginBottom: 16,
  },
  modalSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0e1a13',
    marginBottom: 8,
  },
  modalText: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  modalLabel: {
    fontWeight: '600',
    color: '#0e1a13',
  },
  itemContainer: {
    paddingBottom: 16,
  },
  itemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  itemName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0e1a13',
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  detailLabelBold: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0e1a13',
  },
  detailValue: {
    fontSize: 14,
    color: '#0e1a13',
  },
  detailValueBold: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0e1a13',
  },
  closeButton: {
    backgroundColor: '#72C678',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: 'flex-end',
  },
  closeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
});