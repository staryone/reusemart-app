import React, { useContext, useEffect } from "react";
import { useRouter } from "expo-router";

import { AuthContext } from "@/context/authContext";
import PembeliProfile from "@/components/profiles/PembeliProfile";
import PenitipProfile from "@/components/profiles/PenitipProfile";
import KurirProfile from "@/components/profiles/KurirProfile";
import HunterProfile from "@/components/profiles/HunterProfile";

export default function ProfileScreen() {
  const router = useRouter();
  const authContext = useContext(AuthContext);

  if (!authContext) {
    throw new Error("AuthContext must be used within an AuthProvider");
  }
  const { isLoggedIn, role } = authContext;

  useEffect(() => {
    const validRoles = ["PEMBELI", "PENITIP", "KURIR", "HUNTER"];
    if (!isLoggedIn || !role || !validRoles.includes(role)) {
      router.replace("/(auth)/login");
    }
  }, [isLoggedIn, role, router]);

  const validRoles = ["PEMBELI", "PENITIP", "KURIR", "HUNTER"];
  if (!isLoggedIn || !role || !validRoles.includes(role)) {
    return null;
  }

  let ProfileComponent;
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
      return null;
  }

  return (
    <>
      <ProfileComponent />
    </>
  );
}
