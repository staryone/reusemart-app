import {
  getMessaging,
  requestPermission,
  getToken,
} from "@react-native-firebase/messaging";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const requestNotificationPermission = async (
  provisional: boolean = false
): Promise<boolean> => {
  try {
    const messaging = getMessaging();
    const authStatus = await requestPermission(messaging);
    const enabled =
      authStatus === 1 || // AUTHORIZED
      authStatus === 2; // PROVISIONAL

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
