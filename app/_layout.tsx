import { AuthProvider } from "@/context/authContext";
import { Stack, useRouter } from "expo-router";
import "react-native-reanimated";
import { useEffect, useState } from "react";
import { Alert, Platform } from "react-native";
import {
  getMessaging,
  onMessage,
  getInitialNotification,
  onNotificationOpenedApp,
} from "@react-native-firebase/messaging";
import {
  requestNotificationPermission,
  hasRequestedPermission,
  setHasRequestedPermission,
} from "@/utils/notificationHandler";
import { setupBackgroundNotificationHandler } from "@/utils/notificationBackgroundHandler";
import PermissionDialog from "@/components/PermissionDialog";

export default function RootLayout() {
  const router = useRouter();
  const [showPermissionDialog, setShowPermissionDialog] =
    useState<boolean>(false);

  useEffect(() => {
    const checkFirstLaunch = async () => {
      try {
        const hasRequested = await hasRequestedPermission();
        if (!hasRequested) {
          if (Platform.OS === "ios") {
            const granted = await requestNotificationPermission(true);
            if (granted) {
              console.log("Provisional permission granted on iOS.");
            }
            await setHasRequestedPermission();
          } else {
            setShowPermissionDialog(true);
          }
        } else {
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

  const handleAcceptPermission = async () => {
    setShowPermissionDialog(false);
    try {
      const granted = await requestNotificationPermission();
      if (!granted) {
        Alert.alert(
          "Izin Ditolak",
          "Anda telah menolak izin notifikasi. Anda dapat mengaktifkannya kapan saja di pengaturan perangkat."
        );
      }
      await setHasRequestedPermission();
    } catch (error) {
      console.error("Error handling permission acceptance:", error);
    }
  };

  const handleDeclinePermission = async () => {
    setShowPermissionDialog(false);
    await setHasRequestedPermission();
    Alert.alert(
      "Izin Ditolak",
      "Anda telah menolak izin notifikasi. Anda dapat mengaktifkannya kapan saja di pengaturan perangkat."
    );
  };

  return (
    <AuthProvider>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)/login" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      <PermissionDialog
        visible={showPermissionDialog}
        onAccept={handleAcceptPermission}
        onDecline={handleDeclinePermission}
      />
    </AuthProvider>
  );
}
