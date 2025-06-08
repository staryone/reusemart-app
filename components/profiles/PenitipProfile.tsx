import { AuthContext } from '@/context/authContext';
import { BASE_API_URL } from '@/utils/api';
import { useNavigation } from '@react-navigation/native';
import { router } from 'expo-router';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { Platform, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import FontAwesome from 'react-native-vector-icons/FontAwesome6';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LogoutButton from '../LogoutButton';

interface Penitip {
  nama: string;
  alamat: string;
  email: string;
  nomor_telepon: string;
  saldo: number;
  rating: number;
  poin: number;
  is_top_seller: boolean;
}

interface ResponseAPI {
  data?: Penitip;
  errors?: string;
}

export default function PenitipProfile() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [penitip, setPenitip] = useState<Penitip | null>(null);
  const authContext = useContext(AuthContext);
  const navigation = useNavigation();

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

        const response = await fetch(`${BASE_API_URL}/api/penitip/current`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const res: ResponseAPI = await response.json();
        if (!response.ok) {
          throw new Error(res.errors || 'Gagal mengambil data profil');
        }

        if (res.data) {
          setPenitip(res.data);
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
          {/* Profile Section */}
          <View style={styles.profileSection}>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>
                {penitip?.nama || 'Ethan Carter'}
              </Text>
              <Text style={styles.profileLocation}>
                {penitip?.alamat || 'San Francisco, CA'}
              </Text>
              {penitip?.is_top_seller ? (
                <View style={styles.badgeTopSeller}>
                  <Text style={styles.topSellerFont}>Top Seller</Text>
                  <FontAwesome name="award" size={24} color={'#5145CD'} />
                </View>
              ) : null}
            </View>
          </View>

          {/* Account Section */}
          <Text style={styles.sectionTitle}>Akun</Text>
          <View style={styles.accountSection}>
            <TouchableOpacity style={styles.accountItem}>
              <View style={styles.accountIconContainer}>
                <Icon name="email" size={24} color="#38e07b" />
              </View>
              <View style={styles.accountTextContainer}>
                <Text style={styles.accountLabel}>Email</Text>
                <Text style={styles.accountValue}>
                  {penitip?.email || 'ethan.carter@email.com'}
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
                  {penitip?.nomor_telepon || '+1 (555) 123-4567'}
                </Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.accountItem}
              onPress={() => router.push('/penitip/daftarBarang')}
            >
              <View style={styles.accountIconContainer}>
                <Icon name="list" size={24} color="#38e07b" />
              </View>
              <View style={styles.accountTextContainer}>
                <Text style={styles.accountLabel}>Daftar Barang</Text>
                <Text style={styles.accountValue}>Lihat barang yang dititipkan</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Rewards Section */}
          <View style={styles.rewardsSection}>
            <View style={styles.rewardCard}>
              <View style={styles.rewardItem}>
                <Icon name="account-balance-wallet" size={20} color="white" />
                <Text style={styles.rewardLabel}>Saldo</Text>
              </View>
              <Text style={styles.rewardValue}>
                Rp{penitip?.saldo?.toLocaleString('id-ID') || '125.00'}
              </Text>
            </View>
            <View style={styles.rewardCardSecondary}>
              <View style={styles.rewardItem}>
                <Icon name="star" size={20} color="#f59e0b" />
                <Text style={styles.rewardLabelSecondary}>Peringkat</Text>
              </View>
              <Text style={styles.rewardValueSecondary}>
                {penitip?.rating || '4.8'}
              </Text>
            </View>
          </View>
          <View style={[styles.rewardCardSecondary, styles.pointsCard]}>
            <View style={styles.rewardItem}>
              <Icon name="military-tech" size={20} color="#8b5cf6" />
              <Text style={styles.rewardLabelSecondary}>Poin</Text>
            </View>
            <Text style={styles.rewardValueSecondary}>
              {penitip?.poin || 150} Pts
            </Text>
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
    marginBottom: 15,
    marginTop: 10,
  },
  profileInfo: {
    flexDirection: 'column',
    alignItems: 'center',
    paddingTop: 24,
  },
  badgeTopSeller: {
    backgroundColor: '#B4C6FF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    marginTop: 20,
    flexDirection: 'row',
    gap: 5,
    alignItems: 'center',
  },
  topSellerFont: {
    color: '#5145CD',
  },
  profileName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0e1a13',
    textAlign: 'center',
  },
  profileLocation: {
    fontSize: 16,
    fontWeight: '400',
    color: '#6b7280',
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
  rewardsSection: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 12,
  },
  rewardCard: {
    flex: 1,
    flexDirection: 'column',
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#38e07b',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
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
    marginBottom: 12,
  },
  rewardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  rewardLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#ffffff',
    marginLeft: 8,
  },
  rewardLabelSecondary: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
    marginLeft: 8,
  },
  rewardValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
  },
  rewardValueSecondary: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0e1a13',
  },
});