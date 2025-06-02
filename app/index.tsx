import { router } from "expo-router";
import React from "react";
import {
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Komponen untuk menampilkan bullet point dengan struktur yang lebih rapi
const BulletPoint: React.FC<{ title: string; description: string }> = ({ title, description }) => (
  <View style={styles.bulletContainer}>
    <Text style={styles.bullet}>•</Text>
    <Text style={styles.bulletText}>
      <Text style={styles.bold}>{title}</Text>: {description}
    </Text>
  </View>
);

const ReuseMartInfoScreen: React.FC = () => {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Bagian Header */}
        <View style={styles.header}>
          <Image
            source={require("@/assets/images/icon.png")} // Placeholder untuk logo ReuseMart
            style={styles.logo}
          />
          <Text style={styles.title}>Selamat Datang di ReuseMart</Text>
          <Text style={styles.subtitle}>Reduce, Reuse, Recycle</Text>
        </View>

        {/* Bagian Tentang ReuseMart */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tentang ReuseMart</Text>
          <Text style={styles.sectionText}>
            ReuseMart adalah platform berbasis di Yogyakarta yang berdedikasi
            untuk mempromosikan ekonomi sirkular melalui jual beli barang bekas
            berkualitas. Didirikan oleh Raka Pratama, misi kami adalah
            mengurangi limbah, memberikan kehidupan baru bagi barang bekas, dan
            menciptakan peluang ekonomi sambil menjaga keberlanjutan lingkungan.
          </Text>
        </View>

        {/* Bagian Layanan Kami */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Layanan Kami</Text>
          <Text style={styles.sectionText}>
            Di ReuseMart, kami memudahkan proses jual beli barang bekas dengan
            layanan yang andal:
          </Text>
          <BulletPoint
            title="Sistem Penitipan"
            description="Penitip dapat menyerahkan barang bekas berkualitas ke gudang kami, dan kami menangani pemasaran, penjualan, dan pengiriman. Jika barang tidak terjual dalam 30 hari, penitip dapat mengambilnya kembali atau memperpanjang masa penitipan (tambahan 30 hari dengan komisi lebih tinggi)."
          />
          <BulletPoint
            title="Jaminan Kualitas"
            description="Setiap barang diperiksa secara menyeluruh untuk memastikan memenuhi standar kami, menjaga kepercayaan dan keandalan."
          />
          <BulletPoint
            title="Program Donasi"
            description="Barang yang tidak diambil setelah masa penitipan akan didonasikan ke organisasi sosial terdaftar, memastikan tidak ada barang yang terbuang sia-sia."
          />
          <BulletPoint
            title="Belanja Terjangkau"
            description="Pembeli dapat menjelajahi berbagai kategori, dari elektronik hingga pakaian, dengan harga ramah di kantong."
          />
          <BulletPoint
            title="Pengiriman Gratis"
            description="Gratis ongkir untuk transaksi di atas Rp1,5 juta di wilayah Yogyakarta, dengan tarif flat Rp100.000 untuk transaksi di bawah itu."
          />
        </View>

        {/* Bagian Misi Kami */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Misi Kami</Text>
          <Text style={styles.sectionText}>
            Kami bertujuan menciptakan masa depan yang berkelanjutan dengan
            mendorong penggunaan kembali barang, mengurangi limbah, dan
            mendukung ekonomi berbasis komunitas. Bergabunglah dengan kami untuk
            memberikan dampak positif bagi lingkungan dan masyarakat!
          </Text>
        </View>

        {/* Bagian Kontak Kami */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Hubungi Kami</Text>
          <Text style={styles.sectionText}>
            Kunjungi gudang kami di Yogyakarta atau jelajahi platform kami
            melalui web dan aplikasi mobile. Jam operasional: 08.00 - 20.00
            setiap hari.
          </Text>
        </View>

        {/* Tombol Mulai Sekarang */}
        <TouchableOpacity style={styles.getStartedButton} onPress={() => { router.push("/(tabs)") }}>
          <Text style={styles.getStartedText}>Mulai Sekarang</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    alignItems: "center",
    marginBottom: 20,
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#72C678", // Hijau untuk mencerminkan keberlanjutan
  },
  subtitle: {
    fontSize: 16,
    color: "#72C678",
    fontStyle: "italic",
  },
  section: {
    marginBottom: 20,
    backgroundColor: "#FFFFFF",
    padding: 15,
    borderRadius: 10,
    // shadowColor: "#000",
    // shadowOffset: { width: 0, height: 2 },
    // shadowOpacity: 0.1,
    // shadowRadius: 5,
    // elevation: 3,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#72C678",
    marginBottom: 10,
  },
  sectionText: {
    fontSize: 16,
    color: "#333",
    lineHeight: 24,
  },
  bulletContainer: {
    flexDirection: "row",
    marginTop: 5,
    paddingLeft: 10,
  },
  bullet: {
    fontSize: 16,
    color: "#333",
    marginRight: 10,
  },
  bulletText: {
    fontSize: 16,
    color: "#333",
    lineHeight: 24,
    flex: 1,
  },
  bold: {
    fontWeight: "600",
  },
  getStartedButton: {
    backgroundColor: "#72C678",
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
  },
  getStartedText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
});

export default ReuseMartInfoScreen;