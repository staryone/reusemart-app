import React from "react";
import { StyleSheet } from "react-native";

import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedText } from "@/components/ThemedText";
import { IconSymbol } from "@/components/ui/IconSymbol";
import LogoutButton from "../LogoutButton";

export default function PenitipProfile() {
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#D0D0D0", dark: "#353636" }}
      headerImage={
        <IconSymbol
          size={310}
          color="#808080"
          name="chevron.left.forwardslash.chevron.right"
          style={styles.headerImage}
        />
      }
    >
      <ThemedText style={styles.profileText}>Profil Penitip</ThemedText>
      <ThemedText style={styles.profileDetail}>
        Selamat datang, Penitip! Di sini Anda dapat mengelola barang yang
        dititipkan dan melihat statusnya.
      </ThemedText>
      <LogoutButton />
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    color: "#808080",
    bottom: -90,
    left: -35,
    position: "absolute",
  },
  profileText: {
    textAlign: "center",
    marginBottom: 20,
    fontSize: 24,
    fontWeight: "bold",
    color: "#72C678",
  },
  profileDetail: {
    textAlign: "center",
    color: "#555",
    marginBottom: 20,
  },
});
