import React, { createContext, useState, useEffect, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getFcmToken } from "../utils/notificationHandler";

interface AuthContextType {
  isLoggedIn: boolean;
  token: string | null;
  role: string | null;
  userId: number | null; // Add userId to context
  fcmToken: string | null;
  login: (newToken: string, role: string, userId: number) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [token, setToken] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [userId, setUserId] = useState<number | null>(null); // Add userId state
  const [fcmToken, setFcmToken] = useState<string | null>(null);

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const storedToken = await AsyncStorage.getItem("userToken");
        const storedRole = await AsyncStorage.getItem("userRole");
        const storedUserId = await AsyncStorage.getItem("userId");
        const storedFcmToken = await AsyncStorage.getItem("fcmToken");

        if (storedToken && storedRole && storedUserId) {
          setToken(storedToken);
          setRole(storedRole);
          setUserId(parseInt(storedUserId));
          setIsLoggedIn(true);
          if (storedFcmToken) {
            setFcmToken(storedFcmToken);
          }
        }
      } catch (error) {
        console.error("Error checking login status:", error);
      }
    };
    checkLoginStatus();
  }, []);

  const login = async (newToken: string, role: string, userId: number) => {
    try {
      await AsyncStorage.setItem("userToken", newToken);
      await AsyncStorage.setItem("userRole", role);
      await AsyncStorage.setItem("userId", userId.toString());
      setToken(newToken);
      setRole(role);
      setUserId(userId);
      setIsLoggedIn(true);

      const newFcmToken = await getFcmToken();
      if (newFcmToken) {
        await AsyncStorage.setItem("fcmToken", newFcmToken);
        setFcmToken(newFcmToken);

        const response = await fetch(
          "http://192.168.148.202:3001/api/users/update-fcm",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${newToken}`,
            },
            body: JSON.stringify({
              fcmToken: newFcmToken,
            }),
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          console.error(
            "Failed to update FCM token:",
            errorData.errors || "Unknown error"
          );
        }
      }
    } catch (error) {
      console.error("Error during login:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      const response = await fetch("http://192.168.148.202:3001/api/logout", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error(
          "Failed to update FCM token:",
          errorData.errors || "Unknown error"
        );
      }
      await AsyncStorage.removeItem("userToken");
      await AsyncStorage.removeItem("userRole");
      await AsyncStorage.removeItem("userId");
      await AsyncStorage.removeItem("fcmToken");
      setToken(null);
      setRole(null);
      setUserId(null);
      setFcmToken(null);
      setIsLoggedIn(false);
    } catch (error) {
      console.error("Error logging out:", error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{ isLoggedIn, token, role, userId, fcmToken, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};
