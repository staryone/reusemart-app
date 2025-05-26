import React from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  Dimensions,
} from "react-native";
import { Link } from "expo-router";
import Icon from "react-native-vector-icons/Ionicons";
import { Colors } from "../constants/Colors";

const { width } = Dimensions.get("window");

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerText}>Reusemart</Text>
        <Link href="/login" asChild>
          <TouchableOpacity>
            <Icon
              name="person-circle-outline"
              size={30}
              color={Colors.primary}
            />
          </TouchableOpacity>
        </Link>
      </View>

      {/* Hero Section */}
      <View style={styles.hero}>
        <Text style={styles.heroTitle}>Welcome to Reusemart</Text>
        <Text style={styles.heroSubtitle}>
          Shop sustainably with eco-friendly products
        </Text>
        <TouchableOpacity style={styles.ctaButton}>
          <Text style={styles.ctaText}>Explore Now</Text>
        </TouchableOpacity>
      </View>

      {/* Product Card */}
      <View style={styles.card}>
        <Image
          source={{ uri: "https://via.placeholder.com/150" }}
          style={styles.cardImage}
        />
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle}>Eco-Friendly Bottle</Text>
          <Text style={styles.cardPrice}>$19.99</Text>
          <TouchableOpacity style={styles.cardButton}>
            <Text style={styles.cardButtonText}>Add to Cart</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    backgroundColor: "#fff",
    elevation: 2,
  },
  headerText: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.primary,
  },
  hero: {
    alignItems: "center",
    padding: 20,
    backgroundColor: "#fff",
    margin: 10,
    borderRadius: 10,
    elevation: 2,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  heroSubtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 20,
  },
  ctaButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    elevation: 2,
  },
  ctaText: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "bold",
  },
  card: {
    flexDirection: "row",
    backgroundColor: "#fff",
    margin: 10,
    borderRadius: 10,
    elevation: 2,
    overflow: "hidden",
  },
  cardImage: {
    width: width * 0.4,
    height: 100,
  },
  cardContent: {
    flex: 1,
    padding: 10,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  cardPrice: {
    fontSize: 16,
    color: Colors.primary,
    marginVertical: 5,
  },
  cardButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    alignSelf: "flex-start",
  },
  cardButtonText: {
    fontSize: 14,
    color: "#fff",
  },
});
