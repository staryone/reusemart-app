import { AuthProvider } from "@/context/authContext";
import { setupBackgroundNotificationHandler } from "@/utils/notificationBackgroundHandler";
import {
  hasRequestedPermission,
  requestNotificationPermission,
  setHasRequestedPermission,
} from "@/utils/notificationHandler";
import {
  getInitialNotification,
  getMessaging,
  onMessage,
  onNotificationOpenedApp,
} from "@react-native-firebase/messaging";
import { Stack, useRouter } from "expo-router";
import { useEffect } from "react";
import { Alert, Platform } from "react-native";
import "react-native-reanimated";

export default function RootLayout() {
  const router = useRouter();

  useEffect(() => {
    const checkFirstLaunch = async () => {
      try {
        const hasRequested = await hasRequestedPermission();
        if (!hasRequested) {
          // Minta izin untuk Android dan iOS
          const granted = await requestNotificationPermission(
            Platform.OS === "ios" // Hanya gunakan provisional untuk iOS
          );
          if (!granted) {
            Alert.alert(
              "Izin Ditolak",
              "Anda telah menolak izin notifikasi. Anda dapat mengaktifkannya kapan saja di pengaturan perangkat."
            );
          }
          await setHasRequestedPermission();
        } else {
          // Jika sudah pernah diminta, cek ulang izin
          const granted = await requestNotificationPermission();
          if (!granted) {
            console.log("Notification permission was previously denied.");
          }
        }
      } catch (error) {
        console.error("Error checking first launch:", error);
      }
    };

    checkFirstLaunch();
  }, []);

  useEffect(() => {
    setupBackgroundNotificationHandler();

    const messaging = getMessaging();
    const unsubscribe = onMessage(messaging, async (remoteMessage) => {
      Alert.alert(
        remoteMessage.notification?.title ?? "Notification",
        remoteMessage.notification?.body ?? "You have a new notification"
      );
    });

    getInitialNotification(messaging)
      .then((remoteMessage) => {
        if (remoteMessage) {
          console.log(
            "Notification caused app to open from quit state:",
            remoteMessage
          );
          router.replace("/(tabs)");
        }
      })
      .catch((error) => {
        console.error("Error handling initial notification:", error);
      });

    const unsubscribeOnNotificationOpen = onNotificationOpenedApp(
      messaging,
      (remoteMessage) => {
        console.log(
          "Notification caused app to open from background state:",
          remoteMessage
        );
        router.replace("/(tabs)");
      }
    );

    return () => {
      unsubscribe();
      unsubscribeOnNotificationOpen();
    };
  }, [router]);

  return (
    <AuthProvider>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)/login" options={{ headerShown: false }} />
        <Stack.Screen
          name="pembeli/daftarTransaksi"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="kurir/pengiriman"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="penitip/daftarBarang"
          options={{ headerShown: false, title: "Daftar Barang" }}
        />
        <Stack.Screen
          name="detail-produk"
          options={{ headerShown: false, title: "Detail Barang" }}
        />
        <Stack.Screen name="+not-found" />
      </Stack>
    </AuthProvider>
  );
}
