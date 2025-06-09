import { Tabs, useRouter } from "expo-router";
import React, { useContext } from "react";
import { Platform } from "react-native";

import { HapticTab } from "@/components/HapticTab";
import TabBarBackground from "@/components/ui/TabBarBackground";
import { AuthContext } from "@/context/authContext";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";

export default function TabLayout() {
  const router = useRouter();
  const authContext = useContext(AuthContext);

  if (!authContext) {
    throw new Error("AuthContext must be used within an AuthProvider");
  }
  const { isLoggedIn } = authContext;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#72C678",
        tabBarInactiveTintColor: "#666",
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            position: "absolute",
          },
          default: {},
        }),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="home-filled" size={28} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="notification"
        options={{
          title: "Notification",
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="notifications" size={28} color={color} />
          ),
          tabBarButton: (props) => (
            <HapticTab
              {...props}
              onPress={(e) => {
                if (!isLoggedIn) {
                  e.preventDefault();
                  router.push("/(auth)/login");
                } else {
                  // Safely call onPress if it exists
                  if (props.onPress) {
                    props.onPress(e);
                  }
                }
              }}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="Profil/index"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="account-circle" size={28} color={color} />
          ),
          tabBarButton: (props) => (
            <HapticTab
              {...props}
              onPress={(e) => {
                if (!isLoggedIn) {
                  e.preventDefault();
                  router.push("/(auth)/login");
                } else {
                  if (props.onPress) {
                    props.onPress(e);
                  }
                }
              }}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="detail-produk/index"
        options={{
          title: "DetailProduk",
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="settings" size={28} color={color} />
          ),
          tabBarButton: (props) => (
            <HapticTab
              {...props}
              onPress={(e) => {
                if (!isLoggedIn) {
                  e.preventDefault();
                  router.push("/(auth)/login");
                } else {
                  if (props.onPress) {
                    props.onPress(e);
                  }
                }
              }}
            />
          ),
        }}
      />
    </Tabs>
  );
}
