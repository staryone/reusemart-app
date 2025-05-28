import React, { useState, useContext } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  Modal,
  Animated,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { useRouter } from "expo-router";
import { AuthContext } from "@/context/authContext";

interface LoginResponse {
  data: {
    userId: number;
    token?: string;
    role: string;
  };
  errors?: string;
}

const LoginScreen: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [secureText, setSecureText] = useState<boolean>(true);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [modalMessage, setModalMessage] = useState<string>("");
  const [modalType, setModalType] = useState<"success" | "error" | "">(""); // "success" or "error"
  const [isLoading, setIsLoading] = useState<boolean>(false); // Loading state for API call
  const fadeAnim = useState(new Animated.Value(0))[0]; // Animation for fade-in effect
  const scaleAnim = useState(new Animated.Value(0.8))[0]; // Animation for scale effect
  const router = useRouter();
  const authContext = useContext(AuthContext);

  if (!authContext) {
    throw new Error("AuthContext must be used within an AuthProvider");
  }
  const { login } = authContext;

  // Email validation regex
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleLogin = async () => {
    // Validate email format
    if (!email || !password) {
      setModalMessage("Semua inputan harus diisi!");
      setModalType("error");
      setModalVisible(true);
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();
      return;
    }

    if (!validateEmail(email)) {
      setModalMessage("Format email tidak valid!");
      setModalType("error");
      setModalVisible(true);
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();
      return;
    }

    setIsLoading(true); // Start loading state

    try {
      const response = await fetch(
        "http://192.168.148.202:3001/api/login/mobile",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
          }),
        }
      );

      const res: LoginResponse = await response.json();
      const data = res.data;

      if (response.ok && data.token) {
        await login(data.token, data.role, data.userId);
        setModalMessage("Login berhasil!");
        setModalType("success");
        setModalVisible(true);
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.spring(scaleAnim, {
            toValue: 1,
            friction: 8,
            tension: 40,
            useNativeDriver: true,
          }),
        ]).start(() => {
          setTimeout(() => {
            if (data.role) router.replace("/(tabs)/Profil");
          }, 1000);
        });
      } else {
        setModalMessage(res.errors || "Login gagal, coba lagi.");
        setModalType("error");
        setModalVisible(true);
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.spring(scaleAnim, {
            toValue: 1,
            friction: 8,
            tension: 40,
            useNativeDriver: true,
          }),
        ]).start();
      }
    } catch (error) {
      console.error("Error during login:", error);
      setModalMessage("Terjadi kesalahan, coba lagi nanti.");
      setModalType("error");
      setModalVisible(true);
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();
    } finally {
      setIsLoading(false); // Stop loading state
    }
  };

  const closeModal = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.8,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => setModalVisible(false));
  };

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.push("/(tabs)");
    }
  };

  return (
    <View style={styles.background}>
      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={handleBack}>
        <MaterialIcons name="arrow-back-ios" size={28} color="#72C678" />
      </TouchableOpacity>

      {/* Custom Alert Modal */}
      <Modal
        animationType="none"
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <Animated.View
            style={[
              styles.modalContainer,
              { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
            ]}
          >
            <Ionicons
              name={modalType === "success" ? "checkmark-circle" : "warning"}
              size={48}
              color={modalType === "success" ? "#72C678" : "#FF5252"}
              style={styles.modalIcon}
            />
            <Text style={styles.modalTitle}>
              {modalType === "success" ? "Welcome to Reusemart" : "Error"}
            </Text>
            <Text style={styles.modalMessage}>{modalMessage}</Text>
            <TouchableOpacity style={styles.modalButton} onPress={closeModal}>
              <Text style={styles.modalButtonText}>OK</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>

      {/* Main Login Screen */}
      <View style={styles.topSection}>
        <Image
          source={require("@/assets/images/icon.png")} // Internal image for Reusemart logo
          style={styles.logo}
        />
        <Text style={styles.title}>Welcome to Reusemart!</Text>
        <Text style={styles.subtitle}>Keep the planet green!</Text>
      </View>

      <View style={styles.container}>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#888"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#888"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={secureText}
          />
          <TouchableOpacity
            onPress={() => setSecureText(!secureText)}
            style={styles.eyeIcon}
          >
            <Ionicons
              name={secureText ? "eye-off-outline" : "eye-outline"}
              size={20}
              color="#888"
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.button, isLoading && styles.buttonDisabled]} // Apply disabled style
          onPress={handleLogin}
          disabled={isLoading} // Disable button during loading
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Login</Text>
          )}
        </TouchableOpacity>

        <View style={styles.taglineContainer}>
          <Text style={styles.taglineText}>Reuse, Reduce, Reusemart!</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "75%",
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  modalIcon: {
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#222",
    marginBottom: 8,
  },
  modalMessage: {
    fontSize: 14,
    color: "#555",
    textAlign: "center",
    marginBottom: 16,
    lineHeight: 20,
  },
  modalButton: {
    backgroundColor: "#72C678",
    paddingVertical: 8,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  modalButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
  },

  // Main Screen Styles
  background: {
    flex: 1,
    backgroundColor: "#ffffff",
    justifyContent: "center",
    paddingTop: 50,
  },
  backButton: {
    position: "absolute",
    top: 40,
    left: 20,
    zIndex: 1,
  },
  topSection: {
    alignItems: "center",
    marginBottom: 20,
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 10,
    tintColor: "#72C678",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#72C678",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
  },
  container: {
    marginHorizontal: 20,
    alignItems: "center",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 10,
    marginBottom: 15,
    paddingHorizontal: 15,
    width: "100%",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  input: {
    flex: 1,
    height: 50,
    color: "#333",
    fontSize: 16,
  },
  eyeIcon: {
    padding: 5,
  },
  button: {
    backgroundColor: "#72C678",
    width: "100%",
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
    marginVertical: 20,
  },
  buttonDisabled: {
    backgroundColor: "#a3d7a7", // Lighter green when disabled
    opacity: 0.7,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  taglineContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  taglineText: {
    color: "#666",
    fontSize: 16,
    fontStyle: "italic",
    marginHorizontal: 10,
  },
});

export default LoginScreen;
