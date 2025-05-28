import React from "react";
import { Modal, View, Text, TouchableOpacity, StyleSheet } from "react-native";

interface PermissionDialogProps {
  visible: boolean;
  onAccept: () => void;
  onDecline: () => void;
}

const PermissionDialog: React.FC<PermissionDialogProps> = ({
  visible,
  onAccept,
  onDecline,
}) => {
  return (
    <Modal
      transparent={true}
      visible={visible}
      animationType="fade"
      onRequestClose={onDecline}
    >
      <View style={styles.overlay}>
        <View style={styles.dialog}>
          <Text style={styles.title}>Izinkan Notifikasi</Text>
          <Text style={styles.message}>
            Kami ingin mengirimkan notifikasi untuk memberi tahu Anda tentang
            pesanan baru, promo, dan pembaruan penting lainnya. Izinkan
            notifikasi untuk pengalaman terbaik!
          </Text>
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.declineButton} onPress={onDecline}>
              <Text style={styles.declineText}>Tolak</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.acceptButton} onPress={onAccept}>
              <Text style={styles.acceptText}>Izinkan</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  dialog: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    width: "85%",
    alignItems: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#72C678",
    marginBottom: 10,
  },
  message: {
    fontSize: 16,
    color: "#555",
    textAlign: "center",
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  declineButton: {
    flex: 1,
    backgroundColor: "#e0e0e0",
    paddingVertical: 10,
    borderRadius: 8,
    marginRight: 10,
    alignItems: "center",
  },
  declineText: {
    color: "#555",
    fontSize: 16,
    fontWeight: "500",
  },
  acceptButton: {
    flex: 1,
    backgroundColor: "#72C678",
    paddingVertical: 10,
    borderRadius: 8,
    marginLeft: 10,
    alignItems: "center",
  },
  acceptText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
});

export default PermissionDialog;
