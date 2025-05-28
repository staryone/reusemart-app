import React, { useContext, useEffect } from "react";
import { useRouter } from "expo-router";

import { AuthContext } from "@/context/authContext";
import PembeliProfile from "@/components/profiles/PembeliProfile";
import PenitipProfile from "@/components/profiles/PenitipProfile";
import KurirProfile from "@/components/profiles/KurirProfile";
import HunterProfile from "@/components/profiles/HunterProfile";
import LogoutButton from "@/components/LogoutButton";

export default function ProfileScreen() {
  const router = useRouter();
  const authContext = useContext(AuthContext);

  if (!authContext) {
    throw new Error("AuthContext must be used within an AuthProvider");
  }
  const { isLoggedIn, role } = authContext;

  // Redirect to login if not logged in
  useEffect(() => {
    if (!isLoggedIn) {
      router.replace("/(auth)/login");
    }
  }, [isLoggedIn, router]);

  let ProfileComponent = null;
  switch (role) {
    case "PEMBELI":
      ProfileComponent = PembeliProfile;
      break;
    case "PENITIP":
      ProfileComponent = PenitipProfile;
      break;
    case "KURIR":
      ProfileComponent = KurirProfile;
      break;
    case "HUNTER":
      ProfileComponent = HunterProfile;
      break;
    default:
      router.replace("/(auth)/login"); // Fallback if role is invalid
      return null;
  }

  return (
    <>
      <ProfileComponent />
    </>
  );
}
