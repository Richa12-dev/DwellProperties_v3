import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  TextInput,
} from "react-native";
import Modal from "react-native-modal";
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";
import { Colors } from "../../Theme";
import { getFontFamily } from "../../utils";
import { AppIcon } from "../../components/AppIcon";
import { icons } from "../../Assets";
import Container from "../../components/Container/Container";

const TenantNotification = ({ navigation }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [notifications, setNotifications] = useState([
    {
      id: "1",
      title: "Welcome",
      message: "Welcome to Dwell Properties Notification System.",
      time: "9:00 AM",
    },
    {
      id: "2",
      title: "Account Verification",
      message: "Your account has been verified successfully.",
      time: "9:30 AM",
    },
    {
      id: "3",
      title: "App Update",
      message: "Your account has been verified successfully.",
      time: "10:00 AM",
    },
  ]);

  const [subject, setSubject] = useState("");
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");

  const handleAddNotification = () => {
    if (!subject || !description) return;

    const newNotification = {
      id: Date.now().toString(),
      title: subject,
      message: description,
      time: date || "Now",
    };

    setNotifications([newNotification, ...notifications]);
    setSubject("");
    setDate("");
    setDescription("");
    setModalVisible(false);
  };

  const renderNotification = ({ item }) => (
    <View style={styles.notificationCard}>
      <View style={styles.iconContainer}>
        <AppIcon name={icons.dLogo} size={22} />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.message}>{item.message}</Text>
      </View>
      <Text style={styles.time}>{item.time}</Text>
    </View>
  );

  return (
    <View style={{ flex: 1 }}>
      <Container>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <AppIcon name={icons.arrowBack} size={22} />
          </TouchableOpacity>
          <Text style={styles.pageHeaderTitle}>Notification</Text>
        </View>

        {/* Notification List */}
        <FlatList
          data={notifications}
          renderItem={renderNotification}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      </Container>

      {/* Floating Add Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.7}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      {/* Create Notification Modal */}
      <Modal
        isVisible={modalVisible}
        onBackdropPress={() => setModalVisible(false)}
        style={{ margin: 0, justifyContent: "flex-end" }}
      >
        <View style={styles.modalContainer}>
          {/* Unified Header */}
          <View style={styles.modalHeaderContainer}>
            <Text style={styles.modalHeaderTitle}>Create Notification</Text>
            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              style={styles.closeButton}
            >
              <AppIcon name={icons.close} height={hp(2.3)} width={hp(2.3)} />
            </TouchableOpacity>
          </View>

          {/* Subject */}
          <Text style={styles.label}>Subject*</Text>
          <TextInput
            placeholder="Enter Notification Subject"
            style={styles.input}
            value={subject}
            onChangeText={setSubject}
          />

          {/* Date */}
          <Text style={styles.label}>Date (Optional)</Text>
          <TextInput
            placeholder="YY-MM-DD (leave empty for today)"
            style={styles.input}
            value={date}
            onChangeText={setDate}
          />

          {/* Description */}
          <Text style={styles.label}>Description*</Text>
          <TextInput
            placeholder="Enter notification description"
            multiline
            numberOfLines={4}
            style={[styles.input, { height: hp(12), textAlignVertical: "top" }]}
            value={description}
            onChangeText={setDescription}
          />

          {/* Buttons */}
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.resetButton, { backgroundColor: "#E0E0E0" }]}
              onPress={() => {
                setSubject("");
                setDate("");
                setDescription("");
              }}
            >
              <Text style={[styles.buttonText, { color: "#000" }]}>Reset</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, { backgroundColor: Colors.red }]}
              onPress={handleAddNotification}
            >
              <Text style={[styles.buttonText, { color: "#fff" }]}>
                Add Notification
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: hp(2),
    marginBottom: hp(2),
    marginHorizontal: wp(5),
  },
  pageHeaderTitle: {
    fontSize: wp(5),
    fontFamily: getFontFamily("bold"),
    color: "#000",
  },
  listContainer: {
    paddingHorizontal: wp(5),
    paddingBottom: hp(12),
  },
  notificationCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    borderRadius: 12,
    padding: wp(4),
    marginBottom: hp(2),
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 3,
  },
  iconContainer: {
    backgroundColor: "#FCEAEA",
    borderRadius: 8,
    padding: wp(2.2),
    marginRight: wp(3),
  },
  textContainer: { flex: 1 },
  title: {
    fontSize: wp(4),
    fontFamily: getFontFamily("semibold"),
    color: "#000",
  },
  message: {
    fontSize: wp(3.4),
    color: "#666",
    marginTop: 2,
  },
  time: { fontSize: wp(3), color: "#888" },

  // Floating Button
  fab: {
    position: "absolute",
    bottom: hp(5),
    right: wp(5),
    width: wp(18),
    height: wp(18),
    borderRadius: wp(9),
    backgroundColor: Colors.red,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
  },
  fabText: {
    color: "#fff",
    fontSize: 32,
    lineHeight: 32,
    fontWeight: "300",
  },

  // Modal
  modalContainer: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: wp(6),
    paddingTop: hp(3),
    paddingBottom: hp(4),
  },
  modalHeaderContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: hp(2),
  },
  modalHeaderTitle: {
    fontSize: hp(2.2),
    fontWeight: "600",
    color: "#000",
  },
  closeButton: {
    padding: hp(0.5),
    justifyContent: "center",
    alignItems: "center",
  },
  label: {
    fontSize: wp(3.6),
    fontFamily: getFontFamily("medium"),
    color: "#444",
    marginTop: hp(1),
    marginBottom: hp(0.5),
  },
  input: {
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 10,
    padding: wp(3),
    fontSize: wp(3.6),
    color: "#000",
    backgroundColor: "#FAFAFA",
  },
buttonRow: {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  marginTop: hp(3),
  gap: wp(10),
},

button: {
  flex: 1,
  height: hp(5), // fixed height
  borderRadius: 10,
  alignItems: "center",
  justifyContent: "center", // ✅ centers text vertically
  marginHorizontal: wp(1),
},

resetButton: {
  width: wp(25),
  height: hp(5),
  borderRadius: 10,
  alignItems: "center",
  justifyContent: "center", // ✅ centers text vertically
},

  buttonText: {
    fontSize: wp(3.8),
    fontFamily: getFontFamily("semibold"),
  },
});

export default TenantNotification;
