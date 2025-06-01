import {
  getMessaging,
  requestPermission,
  getToken,
} from "@react-native-firebase/messaging";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { PermissionsAndroid, Platform } from "react-native";

export const requestNotificationPermission = async (
  provisional: boolean = false
): Promise<boolean> => {
  try {
    let enabled = false;

    // Untuk Android 13+ (API Level 33), minta izin POST_NOTIFICATIONS
    if (Platform.OS === "android" && Platform.Version >= 33) {
      const permission = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
      );
      if (permission === PermissionsAndroid.RESULTS.GRANTED) {
        console.log("Android POST_NOTIFICATIONS permission granted.");
        enabled = true;
      } else {
        console.log("Android POST_NOTIFICATIONS permission denied.");
        return false;
      }
    }

    // Untuk iOS atau Android < 13, gunakan Firebase requestPermission
    const messaging = getMessaging();
    const authStatus = await requestPermission(messaging, {
      provisional, // Hanya untuk iOS
    });
    enabled =
      enabled ||
      authStatus === 1 || // AUTHORIZED
      authStatus === 2; // PROVISIONAL (iOS only)

    if (enabled) {
      console.log("Notification permission granted.");
      await getFcmToken();
      return true;
    } else {
      console.log("Notification permission denied.");
      return false;
    }
  } catch (error) {
    console.error("Error requesting notification permission:", error);
    return false;
  }
};

export const getFcmToken = async (): Promise<string | null> => {
  try {
    const messaging = getMessaging();
    const fcmToken = await getToken(messaging);
    if (fcmToken) {
      console.log("FCM Token:", fcmToken);
      await AsyncStorage.setItem("fcmToken", fcmToken);
      return fcmToken;
    }
  } catch (error) {
    console.error("Error getting FCM token:", error);
  }
  return null;
};

export const hasRequestedPermission = async (): Promise<boolean> => {
  const hasRequested = await AsyncStorage.getItem(
    "hasRequestedNotificationPermission"
  );
  return hasRequested === "true";
};

export const setHasRequestedPermission = async (): Promise<void> => {
  await AsyncStorage.setItem("hasRequestedNotificationPermission", "true");
};
