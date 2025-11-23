// import React, { useState } from "react";
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   FlatList,
//   StyleSheet,
//   StatusBar,
// } from "react-native";
// import Icon from "react-native-vector-icons/MaterialCommunityIcons";
// import { heightPercentageToDP as hp, widthPercentageToDP as wp } from "react-native-responsive-screen";
// import { Colors } from "../../Theme";
// import MaintenanceDetails from "./MaintenanceDetails";
// import Modal from "react-native-modal";
// import { AppIcon } from "../../components/AppIcon";
// import { icons } from "../../Assets";
// import { useSelector } from "react-redux";
// import Container from "../../components/Container/Container"; // ✅ imported container

// const Support = ({ navigation }) => {
//   const [showAll, setShowAll] = useState(false);
//   const [showModal, setShowModal] = useState(false);

//   const currentProperty = useSelector(
//     (state) => state.property?.currentProperty || null
//   );
//   const landlordId = useSelector(
//     (state) => state.property?.landlordId || state.user?.landlordId || null
//   );

//   const [requests, setRequests] = useState([
//     {
//       id: "REQ-001",
//       title: "Kitchen Sink Leak",
//       category: "Kitchen • Plumbing • High Priority",
//       description:
//         "Water is dripping from under the kitchen sink. It appears to be coming from the pipe joint.",
//       date: "28/09/2025",
//       schedule: "Scheduled Tomorrow 2-4 PM",
//       status: "In Progress",
//     },
//     {
//       id: "REQ-002",
//       title: "AC Not Cooling",
//       category: "Living Room • High Priority",
//       description:
//         "The air conditioning unit is running but not producing cold air. Room temperature remains warm.",
//       date: "28/09/2025",
//       status: "Pending",
//     },
//     {
//       id: "REQ-003",
//       title: "Bathroom Light Flickering",
//       category: "Bathroom • Electrical • Medium Priority",
//       description:
//         "The main bathroom light flickers intermittently and sometimes doesn't turn on.",
//       date: "27/09/2025",
//       status: "Pending",
//     },
//     {
//       id: "REQ-004",
//       title: "Door Lock Issue",
//       category: "Bedroom • Hardware • Low Priority",
//       description: "The bedroom door lock is loose and needs tightening.",
//       date: "26/09/2025",
//       status: "Completed",
//     },
//   ]);

//   const handleAddMaintenance = (newItem) => {
//     const newRequest = {
//       id: `REQ-${String(requests.length + 1).padStart(3, "0")}`,
//       title: newItem.title,
//       category: `${newItem.location} • ${newItem.category} • ${newItem.priority} Priority`,
//       description: newItem.desc,
//       date: new Date().toLocaleDateString("en-GB"),
//       status: "Pending",
//     };

//     setRequests([newRequest, ...requests]);
//     setShowModal(false);
//   };

//   const visibleRequests = showAll ? requests : requests.slice(0, 2);

//   const getStatusStyle = (status) => {
//     switch (status) {
//       case "In Progress":
//         return { backgroundColor: "#D1FAE5", color: "#047857" };
//       case "Pending":
//         return { backgroundColor: "#FEF3C7", color: "#B45309" };
//       case "Completed":
//         return { backgroundColor: "#F3F4F6", color: "#6B7280" };
//       default:
//         return { backgroundColor: "#F3F4F6", color: "#6B7280" };
//     }
//   };

//   const renderRequest = ({ item }) => (
//     <TouchableOpacity
//       activeOpacity={0.9}
//       onPress={() => navigation.navigate("QueryDetails", { request: item })}
//     >
//       <View style={styles.glassContainer}>
//         <View style={styles.cardHeader}>
//           <Text style={styles.cardTitle}>{item.title}</Text>
//           <View
//             style={[
//               styles.statusBadge,
//               { backgroundColor: getStatusStyle(item.status).backgroundColor },
//             ]}
//           >
//             <Text
//               style={[
//                 styles.statusText,
//                 { color: getStatusStyle(item.status).color },
//               ]}
//             >
//               {item.status}
//             </Text>
//           </View>
//         </View>

//         <Text style={styles.cardId}>{item.id}</Text>
//         <Text style={styles.cardCategory}>{item.category}</Text>

//         <Text style={styles.cardDescription} numberOfLines={2}>
//           {item.description}
//         </Text>

//         <View style={styles.cardFooter}>
//           <View style={styles.footerItem}>
//             <Icon name="calendar" size={14} color="#9CA3AF" />
//             <Text style={styles.footerText}>{item.date}</Text>
//           </View>
//           {item.schedule && (
//             <View style={styles.footerItem}>
//               <Icon name="clock-outline" size={14} color="#9CA3AF" />
//               <Text style={styles.footerText}>{item.schedule}</Text>
//             </View>
//           )}
//         </View>
//       </View>
//     </TouchableOpacity>
//   );

//   return (
//     <Container>
//       <Text style={styles.pageTitle}>Upcoming Maintenance</Text>

//       {/* Status Summary */}
//       <View style={styles.statusCard}>
//         <View style={styles.statusRow}>
//           <View style={styles.statusItem}>
//             <Text style={styles.statusNumber}>02</Text>
//             <Text style={styles.statusLabel}>New Request</Text>
//           </View>
//           <View style={styles.statusItem}>
//             <Text style={[styles.statusNumber, { color: "#F59E0B" }]}>03</Text>
//             <Text style={styles.statusLabel}>In Progress</Text>
//           </View>
//           <View style={styles.statusItem}>
//             <Text style={[styles.statusNumber, { color: "#10B981" }]}>05</Text>
//             <Text style={styles.statusLabel}>Completed</Text>
//           </View>
//         </View>
//       </View>

//       <Text style={styles.sectionTitle}>
//         Your Requests ({requests.length})
//       </Text>

//       <FlatList
//         data={visibleRequests}
//         renderItem={renderRequest}
//         keyExtractor={(item) => item.id}
//         showsVerticalScrollIndicator={false}
//         ListFooterComponent={
//           <>
//             {!showAll && requests.length > 2 && (
//               <TouchableOpacity
//                 style={styles.showMoreButton}
//                 onPress={() => setShowAll(true)}
//               >
//                 <Text style={styles.showMoreText}>
//                   Show More ({requests.length - 2})
//                 </Text>
//               </TouchableOpacity>
//             )}
//             {showAll && requests.length > 2 && (
//               <TouchableOpacity
//                 style={styles.showMoreButton}
//                 onPress={() => setShowAll(false)}
//               >
//                 <Text style={styles.showMoreText}>Show Less</Text>
//                 <Icon name="chevron-up" size={16} color="#DC2626" />
//               </TouchableOpacity>
//             )}
//           </>
//         }
//       />

//       {/* Floating Add Button */}
//       <TouchableOpacity style={styles.fab} onPress={() => setShowModal(true)}>
//         <Text style={styles.fabText}>+</Text>
//       </TouchableOpacity>

//       {/* Add Maintenance Modal */}
//       <Modal
//         isVisible={showModal}
//         onBackdropPress={() => setShowModal(false)}
//         onSwipeComplete={() => setShowModal(false)}
//         swipeDirection={["down"]}
//         style={styles.modalStyle}
//         backdropOpacity={0.5}
//         animationIn="slideInUp"
//         animationOut="slideOutDown"
//         animationInTiming={300}
//         animationOutTiming={300}
//       >
//         <MaintenanceDetails
//           onClose={() => setShowModal(false)}
//           onSubmit={handleAddMaintenance}
//           property={currentProperty}
//           landlordId={landlordId}
//         />
//       </Modal>
//     </Container>
//   );
// };

// export default Support;

// const styles = StyleSheet.create({
//   pageTitle: {
//     fontSize: 20,
//     fontWeight: "bold",
//     color: "#111827",
//     marginBottom: 16,
//     paddingHorizontal: 16,
//   },
//   statusCard: {
//     backgroundColor: "#FFFFFF",
//     borderRadius: 16,
//     padding: 20,
//     marginBottom: 24,
//     marginHorizontal: 16,
//     shadowColor: "#000",
//     shadowOpacity: 0.05,
//     shadowRadius: 2,
//     elevation: 2,
//   },
//   statusRow: { flexDirection: "row", justifyContent: "space-between" },
//   statusItem: { alignItems: "center", flex: 1 },
//   statusNumber: { fontSize: 24, fontWeight: "bold", color: "#1F2937" },
//   statusLabel: { fontSize: 11, color: "#6B7280", marginTop: 4 },
//   sectionTitle: {
//     fontSize: 16,
//     fontWeight: "bold",
//     color: "#111827",
//     marginBottom: 12,
//     paddingHorizontal: 16,
//   },
//   glassContainer: {
//     borderRadius: 20,
//     padding: 16,
//     marginBottom: 16,
//     marginHorizontal: 16,
//     backgroundColor: "rgba(255, 255, 255, 0.75)",
//     borderWidth: 1,
//     borderColor: "rgba(229, 57, 53, 0.15)",
//     shadowColor: "#E53935",
//     shadowOffset: { width: 0, height: 3 },
//     shadowOpacity: 0.15,
//     shadowRadius: 10,
//     elevation: 5,
//   },
//   cardHeader: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     marginBottom: 8,
//   },
//   cardTitle: { fontSize: 15, fontWeight: "bold", color: "#1F2937", flex: 1 },
//   statusBadge: {
//     paddingHorizontal: 10,
//     paddingVertical: 4,
//     borderRadius: 6,
//     marginLeft: 8,
//   },
//   statusText: { fontSize: 11, fontWeight: "600" },
//   cardId: { fontSize: 11, color: "#6B7280", marginBottom: 4 },
//   cardCategory: { fontSize: 11, color: "#6B7280", marginBottom: 8 },
//   cardDescription: { fontSize: 13, color: "#374151", marginBottom: 12 },
//   cardFooter: { flexDirection: "row", gap: 16 },
//   footerItem: { flexDirection: "row", alignItems: "center", gap: 4 },
//   footerText: { fontSize: 11, color: "#9CA3AF" },
//   showMoreButton: {
//     flexDirection: "row",
//     alignItems: "center",
//     alignSelf: "center",
//     marginTop: 8,
//     marginBottom: 16,
//     gap: 8,
//   },
//   showMoreText: { fontSize: 14, fontWeight: "bold", color: "#DC2626" },
//   fab: {
//     position: "absolute",
//     bottom: hp(-2), // fixed distance from bottom
//     right: wp(5),
//     width: 56,
//     height: 56,
//     borderRadius: 28,
//     backgroundColor: "#111827",
//     justifyContent: "center",
//     alignItems: "center",
//     elevation: 6,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.3,
//     shadowRadius: 4,
//   },
//   fabText: {
//     color: "#fff",
//     fontSize: 28,
//     lineHeight: 28,
//     fontWeight: "300",
//   },
//   modalStyle: {
//     justifyContent: "flex-end",
//     margin: 0,
//   },
// });


import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from "react-native-responsive-screen";
import { Colors } from "../../Theme";
import MaintenanceDetails from "./MaintenanceDetails";
import Modal from "react-native-modal";
import { useSelector, useDispatch } from "react-redux";
import Container from "../../components/Container/Container";
import { getMaintenanceRequests } from "../../Redux/Maintenance/services";
import { maintenanceSelectors } from "../../Redux/Maintenance/maintenanceSlice";

const Support = ({ navigation }) => {
  const dispatch = useDispatch();
  const [showAll, setShowAll] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // Get data from Redux
  const token = useSelector((state) => state.loginData?.token || null);
  const tenant_sub = useSelector((state) => state.loginData?.user?.sub || state.loginData?.tenant_sub || null);
  const currentProperty = useSelector((state) => state.properties?.currentProperty || null);
  const landlordId = useSelector((state) => state.properties?.landlordId || state.loginData?.user?.landlordId || null);

  // Get maintenance data from Redux
  const {
    requests,
    loading,
    totalRequests,
    openRequests,
    closedRequests
  } = useSelector(maintenanceSelectors.getMaintenanceData);

  // Fetch maintenance requests on component mount
  useEffect(() => {
    if (token && tenant_sub) {
      dispatch(getMaintenanceRequests({ tenant_sub, token }));
    }
  }, [dispatch, token, tenant_sub]);

  const visibleRequests = showAll ? requests : requests.slice(0, 2);

  const getStatusStyle = (status) => {
    const statusLower = status?.toLowerCase() || '';
    if (statusLower.includes('progress') || statusLower === 'open') {
      return { backgroundColor: "#D1FAE5", color: "#047857" };
    } else if (statusLower === 'pending' || statusLower === 'new') {
      return { backgroundColor: "#FEF3C7", color: "#B45309" };
    } else if (statusLower === 'completed' || statusLower === 'closed' || statusLower === 'resolved') {
      return { backgroundColor: "#F3F4F6", color: "#6B7280" };
    }
    return { backgroundColor: "#F3F4F6", color: "#6B7280" };
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB");
  };

  const handleCloseModal = () => {
    setShowModal(false);
    // Refresh the list after closing modal
    if (token && tenant_sub) {
      dispatch(getMaintenanceRequests({ tenant_sub, token }));
    }
  };

  const renderRequest = ({ item }) => (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => navigation.navigate("QueryDetails", { data: item })}
    >
      <View style={styles.glassContainer}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>{item.title}</Text>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusStyle(item.status).backgroundColor },
            ]}
          >
            <Text
              style={[
                styles.statusText,
                { color: getStatusStyle(item.status).color },
              ]}
            >
              {item.status || "Pending"}
            </Text>
          </View>
        </View>

        <Text style={styles.cardId}>{item.request_id || item.id}</Text>
        <Text style={styles.cardCategory}>
          {item.location} • {item.category} • {item.priority} Priority
        </Text>

        <Text style={styles.cardDescription} numberOfLines={2}>
          {item.description}
        </Text>

        <View style={styles.cardFooter}>
          <View style={styles.footerItem}>
            <Icon name="calendar" size={14} color="#9CA3AF" />
            <Text style={styles.footerText}>{formatDate(item.created_at)}</Text>
          </View>
          {item.preferred_start && (
            <View style={styles.footerItem}>
              <Icon name="clock-outline" size={14} color="#9CA3AF" />
              <Text style={styles.footerText}>
                Scheduled {formatDate(item.preferred_start)}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <Container>
      <Text style={styles.pageTitle}>Upcoming Maintenance</Text>

      {/* Status Summary */}
      <View style={styles.statusCard}>
        <View style={styles.statusRow}>
          <View style={styles.statusItem}>
            <Text style={styles.statusNumber}>
              {requests.filter(r => r.status?.toLowerCase() === 'pending' || r.status?.toLowerCase() === 'new').length.toString().padStart(2, '0')}
            </Text>
            <Text style={styles.statusLabel}>New Request</Text>
          </View>
          <View style={styles.statusItem}>
            <Text style={[styles.statusNumber, { color: "#F59E0B" }]}>
              {openRequests.toString().padStart(2, '0')}
            </Text>
            <Text style={styles.statusLabel}>In Progress</Text>
          </View>
          <View style={styles.statusItem}>
            <Text style={[styles.statusNumber, { color: "#10B981" }]}>
              {closedRequests.toString().padStart(2, '0')}
            </Text>
            <Text style={styles.statusLabel}>Completed</Text>
          </View>
        </View>
      </View>

      <Text style={styles.sectionTitle}>
        Your Requests ({totalRequests})
      </Text>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading requests...</Text>
        </View>
      ) : requests.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Icon name="clipboard-text-outline" size={80} color="#E0E0E0" />
          <Text style={styles.emptyText}>No maintenance requests yet</Text>
          <Text style={styles.emptySubText}>Tap + to create your first request</Text>
        </View>
      ) : (
        <FlatList
          data={visibleRequests}
          renderItem={renderRequest}
          keyExtractor={(item) => item.request_id || item.id}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={
            <>
              {!showAll && requests.length > 2 && (
                <TouchableOpacity
                  style={styles.showMoreButton}
                  onPress={() => setShowAll(true)}
                >
                  <Text style={styles.showMoreText}>
                    Show More ({requests.length - 2})
                  </Text>
                </TouchableOpacity>
              )}
              {showAll && requests.length > 2 && (
                <TouchableOpacity
                  style={styles.showMoreButton}
                  onPress={() => setShowAll(false)}
                >
                  <Text style={styles.showMoreText}>Show Less</Text>
                  <Icon name="chevron-up" size={16} color="#DC2626" />
                </TouchableOpacity>
              )}
            </>
          }
        />
      )}

      {/* Floating Add Button */}
      <TouchableOpacity style={styles.fab} onPress={() => setShowModal(true)}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      {/* Add Maintenance Modal */}
      <Modal
        isVisible={showModal}
        onBackdropPress={handleCloseModal}
        onSwipeComplete={handleCloseModal}
        swipeDirection={["down"]}
        style={styles.modalStyle}
        backdropOpacity={0.5}
        animationIn="slideInUp"
        animationOut="slideOutDown"
        animationInTiming={300}
        animationOutTiming={300}
      >
        <MaintenanceDetails
          onClose={handleCloseModal}
          property={currentProperty}
          landlordId={landlordId}
        />
      </Modal>
    </Container>
  );
};

export default Support;

const styles = StyleSheet.create({
  pageTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  statusCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    marginHorizontal: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  statusRow: { flexDirection: "row", justifyContent: "space-between" },
  statusItem: { alignItems: "center", flex: 1 },
  statusNumber: { fontSize: 24, fontWeight: "bold", color: "#1F2937" },
  statusLabel: { fontSize: 11, color: "#6B7280", marginTop: 4 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  glassContainer: {
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    marginHorizontal: 16,
    backgroundColor: "rgba(255, 255, 255, 0.75)",
    borderWidth: 1,
    borderColor: "rgba(229, 57, 53, 0.15)",
    shadowColor: "#E53935",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  cardTitle: { fontSize: 15, fontWeight: "bold", color: "#1F2937", flex: 1 },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginLeft: 8,
  },
  statusText: { fontSize: 11, fontWeight: "600" },
  cardId: { fontSize: 11, color: "#6B7280", marginBottom: 4 },
  cardCategory: { fontSize: 11, color: "#6B7280", marginBottom: 8 },
  cardDescription: { fontSize: 13, color: "#374151", marginBottom: 12 },
  cardFooter: { flexDirection: "row", gap: 16 },
  footerItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  footerText: { fontSize: 11, color: "#9CA3AF" },
  showMoreButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "center",
    marginTop: 8,
    marginBottom: 16,
    gap: 8,
  },
  showMoreText: { fontSize: 14, fontWeight: "bold", color: "#DC2626" },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: "#6B7280",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6B7280",
    marginTop: 16,
  },
  emptySubText: {
    fontSize: 14,
    color: "#9CA3AF",
    marginTop: 8,
  },
  fab: {
    position: "absolute",
    bottom: hp(-2),
    right: wp(5),
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#111827",
    justifyContent: "center",
    alignItems: "center",
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  fabText: {
    color: "#fff",
    fontSize: 28,
    lineHeight: 28,
    fontWeight: "300",
  },
  modalStyle: {
    justifyContent: "flex-end",
    margin: 0,
  },
});
