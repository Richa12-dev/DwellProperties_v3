import moment from "moment";
import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Modal,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  SafeAreaView,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";
import { Colors } from "../../Theme";
import { AppIcon } from "../../components/AppIcon";
import { icons } from "../../Assets";
import Container from "../../components/Container/Container";

export default function QueryDetails({ route, navigation }) {
  const data = route?.params?.data || route?.params?.request || {};

  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [el2ModalVisible, setEl2ModalVisible] = useState(false);
  const [el2ModalMessage, setEl2ModalMessage] = useState("");
  const [escalateButtonEnabled, setEscalateButtonEnabled] = useState(true);

  const getStatusText = () =>
    data?.queryStatusL2 || data?.queryStatusL1 || data?.status || "Unknown";

  const getStatusStyle = () => {
    switch (getStatusText().toLowerCase()) {
      case "open":
      case "in progress":
        return { backgroundColor: "#D1FAE5", color: "#047857" };
      case "closed":
      case "completed":
        return { backgroundColor: "#F3F4F6", color: "#6B7280" };
      case "pending":
        return { backgroundColor: "#FEF3C7", color: "#B45309" };
      default:
        return { backgroundColor: "#F3F4F6", color: "#6B7280" };
    }
  };

  const formattedRaiseDate = data?.queryRaisedTime
    ? moment(data.queryRaisedTime).format("DD MMM, YYYY")
    : "N/A";

  const statusStyle = getStatusStyle();

  const handleEscalate = () => {
    setEl2ModalMessage(
      `Request ${data?.queryId || data?.id} has been escalated to Level 2 successfully.`
    );
    setEl2ModalVisible(true);
  };

  if (!data?.queryId && !data?.id) {
    return (
      <Container>
        <View style={styles.centeredContent}>
          <Icon name="alert-circle-outline" size={80} color="#DC2626" />
          <Text style={styles.noRecordText}>Request not found</Text>
        </View>
      </Container>
    );
  }

  return (
    <Container>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {/* 🔹 Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <AppIcon name={icons.arrowBack} size={22} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Request Details</Text>
        </View>

        {/* 🔸 Card */}
        <View style={styles.card}>
          <View style={styles.cardTopRow}>
            <Text style={styles.reqId}>{data?.queryId || data?.id}</Text>
            <View
              style={[
                styles.statusTag,
                { backgroundColor: statusStyle.backgroundColor },
              ]}
            >
              <Text style={[styles.statusText, { color: statusStyle.color }]}>
                {getStatusText()}
              </Text>
            </View>
          </View>

          <View style={styles.levelDateRow}>
            <View style={styles.levelTag}>
              <Text style={styles.levelText}>Level 1</Text>
            </View>
            <Text style={styles.dateText}>Created on: {formattedRaiseDate}</Text>
          </View>

          <View style={styles.infoBlock}>
            <Text style={styles.label}>Query Type</Text>
            <Text style={styles.value}>{data?.queryType || "-"}</Text>

            <Text style={[styles.label, { marginTop: 12 }]}>Query Subject</Text>
            <Text style={styles.value}>
              {data?.querySubject || data?.title}
            </Text>

            <Text style={[styles.label, { marginTop: 12 }]}>Query Details</Text>
            <Text style={styles.value}>
              {data?.queryDescription || data?.description}
            </Text>
          </View>
        </View>

      
{/* 🔺 Escalate Button (Natural Bottom Position) */}
<View style={styles.bottomButtonWrapper}>
  <TouchableOpacity
    style={[
      styles.escalateButton,
      !escalateButtonEnabled && { opacity: 0.6 },
    ]}
    disabled={!escalateButtonEnabled}
    onPress={handleEscalate}
  >
    <Text style={styles.escalateText}>Escalate to Level 2</Text>
  </TouchableOpacity>
</View>



        {/* 🟢 Modal */}
        <Modal transparent visible={el2ModalVisible} animationType="fade">
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPressOut={() => setEl2ModalVisible(false)}
          >
            <TouchableWithoutFeedback>
              <View style={styles.modalBox}>
                <Icon name="arrow-up-circle" size={60} color="#DC2626" />
                <Text style={styles.modalTitle}>Escalated!</Text>
                <Text style={styles.modalText}>{el2ModalMessage}</Text>
                <TouchableOpacity
                  style={styles.modalButton}
                  onPress={() => {
                    setEl2ModalVisible(false);
                    navigation.goBack();
                  }}
                >
                  <Text style={styles.modalButtonText}>OK</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </TouchableOpacity>
        </Modal>
      </KeyboardAvoidingView>
    </Container>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: wp(5),
    marginTop: hp(1),
  },
  headerTitle: {
    fontSize: wp(4.5),
    fontWeight: "700",
    color: "#111827",
    marginLeft: wp(2),
  },
  card: {
    backgroundColor: "#fff",
    marginHorizontal: wp(5),
    marginTop: hp(2),
    borderRadius: 16,
    padding: wp(4.5),
    shadowColor: "#E53935",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  cardTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  reqId: {
    fontSize: wp(4),
    fontWeight: "700",
    color: "#111827",
  },
  statusTag: {
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  statusText: {
    fontSize: wp(3.2),
    fontWeight: "600",
  },
  levelDateRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: hp(1),
    justifyContent: "space-between",
  },
  levelTag: {
    backgroundColor: "#E9EBFF",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 6,
  },
  levelText: { fontSize: wp(3.2), color: "#1D4ED8", fontWeight: "600" },
  dateText: { fontSize: wp(3.2), color: "#6B7280" },
  infoBlock: { marginTop: hp(2) },
  label: { fontSize: wp(3), color: "#9CA3AF" },
  value: { fontSize: wp(3.5), color: "#111827", marginTop: 2, lineHeight: 20 },

bottomButtonWrapper: {
  marginTop: hp(35), // push down naturally to bottom of content
  marginBottom: hp(3),
  paddingHorizontal: wp(5),
},

escalateButton: {
  backgroundColor: "#E53935",
  borderRadius: 10,
  height: 56,
  justifyContent: "center",
  alignItems: "center",
  shadowColor: "#E53935",
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.2,
  shadowRadius: 6,
  elevation: 5,
},
  escalateText: {
    color: "#FFF",
    fontWeight: "700",
    fontSize: wp(4),
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBox: {
    backgroundColor: "#FFF",
    borderRadius: 18,
    padding: 25,
    alignItems: "center",
    width: wp(80),
  },
  modalTitle: { fontSize: wp(5), fontWeight: "700", marginTop: 10 },
  modalText: {
    textAlign: "center",
    color: "#6B7280",
    fontSize: wp(3.6),
    marginVertical: 10,
  },
  modalButton: {
    backgroundColor: "#E53935",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 30,
  },
  modalButtonText: { color: "#FFF", fontWeight: "600" },
  centeredContent: { flex: 1, alignItems: "center", justifyContent: "center" },
  noRecordText: { marginTop: 10, color: "#6B7280", fontSize: wp(4) },
});
