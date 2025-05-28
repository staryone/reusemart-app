import {
  getMessaging,
  setBackgroundMessageHandler,
} from "@react-native-firebase/messaging";

export const setupBackgroundNotificationHandler = () => {
  const messaging = getMessaging();
  setBackgroundMessageHandler(messaging, async (remoteMessage) => {
    console.log("Message handled in the background!", remoteMessage);
  });
};
