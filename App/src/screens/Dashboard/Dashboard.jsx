import React, { useState, useEffect } from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Modal,
} from "react-native";
import { Box, Text, VStack, HStack } from "native-base";
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";
import { Colors } from "../../Theme";
import { AppIcon } from "../../components/AppIcon";
import { icons } from "../../Assets";
import { useNavigation } from "@react-navigation/native";
import Container from "../../components/Container/Container";
import { useSelector, useDispatch } from "react-redux";
import { getMaintenanceRequests } from "../../Redux/Maintenance/services";
import { maintenanceSelectors } from "../../Redux/Maintenance/maintenanceSlice";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { propertiesSelectors } from "../../Redux/Properties/propertiesSlice";
import { getTenantProperties, getProperty } from "../../Redux/Properties/services";

const Dashboard = () => {
  const [showAllMaintenance, setShowAllMaintenance] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showDocumentsModal, setShowDocumentsModal] = useState(false);
  const navigation = useNavigation();
  const dispatch = useDispatch();

  // Get login data and token
  const loginData = useSelector((state) => state.loginData || {});
  const token = loginData?.accessToken; // ✅ FIXED: Use accessToken instead of idToken
  const tenant_sub = loginData?.userData?.tenantId;
  
  // Get properties data from Redux
  const {
    tenantProperties,
    currentProperty: reduxCurrentProperty,
    loading: propertiesLoading
  } = useSelector(propertiesSelectors.getPropertiesData);

  // Get maintenance data from Redux
  const {
    requests,
    loading: maintenanceLoading,
  } = useSelector(maintenanceSelectors.getMaintenanceData);

  // Fetch tenant properties on mount
  useEffect(() => {
    if (token && tenant_sub) {
      console.log('📡 Dashboard: Fetching tenant properties');
      dispatch(
        getTenantProperties({
          tenantId: tenant_sub,
          token: token,
        })
      );
    }
  }, [dispatch, token, tenant_sub]);

  // Get current property (from Redux or first tenant property)
  const currentProperty = reduxCurrentProperty ||
    (tenantProperties && tenantProperties.length > 0 ? tenantProperties[0] : null);

  // Extract property ID
  const propertyId = currentProperty?.property_id ||
                     currentProperty?.propertyId ||
                     currentProperty?.id;

  // Fetch detailed property data when propertyId is available
  useEffect(() => {
    if (propertyId && token) {
      console.log('📡 Dashboard: Fetching property details for:', propertyId);
      dispatch(getProperty(propertyId));
    }
  }, [dispatch, propertyId, token]);

  // Fetch maintenance requests
  useEffect(() => {
    if (token && tenant_sub) {
      console.log('📡 Dashboard: Fetching maintenance requests');
      dispatch(
        getMaintenanceRequests({
          tenant_id: tenant_sub,
          token: token,
        })
      );
    }
  }, [dispatch, token, tenant_sub]);

  // Extract landlord information with multiple fallbacks
  const landlordName = currentProperty?.landlord_name ||
                       currentProperty?.landlord?.name ||
                       currentProperty?.landlord?.full_name ||
                       (currentProperty?.landlord?.firstName && currentProperty?.landlord?.lastName
                         ? `${currentProperty.landlord.firstName} ${currentProperty.landlord.lastName}`
                         : null) ||
                       "Not Available";

  const landlordEmail = currentProperty?.landlord_email ||
                        currentProperty?.landlord?.email ||
                        "Not Available";

  const landlordPhone = currentProperty?.landlord_phone ||
                        currentProperty?.landlord?.phone ||
                        currentProperty?.landlord?.phoneNumber ||
                        "Not Available";

  // Debug logging
  useEffect(() => {
    if (currentProperty) {
      console.log('🏠 Current Property Data:', {
        property_id: currentProperty.property_id,
        name: currentProperty.name,
        landlord: currentProperty.landlord,
        landlord_name: currentProperty.landlord_name,
        landlord_email: currentProperty.landlord_email,
        landlord_phone: currentProperty.landlord_phone,
        full_object: JSON.stringify(currentProperty, null, 2)
      });
    }
  }, [currentProperty]);

  // Helper function to check if request is accepted (In Progress)
  const isInProgress = (item) => {
    return (
      item.contractor_assignment?.state === 'ACCEPTED' &&
      item.status?.toLowerCase() !== 'closed' &&
      item.status?.toLowerCase() !== 'resolved'
    );
  };

  // Calculate request counts
  const newRequestCount = requests.filter(r =>
    (r.status?.toLowerCase() === 'open' || r.status?.toLowerCase() === 'new') &&
    r.contractor_assignment?.state !== 'ACCEPTED'
  ).length;

  const inProgressCount = requests.filter(r => isInProgress(r)).length;

  const completedCount = requests.filter(r =>
    r.status?.toLowerCase() === 'closed' ||
    r.status?.toLowerCase() === 'resolved'
  ).length;

  // Filter upcoming maintenance (scheduled for today or future)
  const getUpcomingMaintenance = () => {
    const now = new Date();
    const today = new Date(now.setHours(0, 0, 0, 0));

    return requests
      .filter(item => {
        if (!item.preferred_window?.start_utc) return false;
        const scheduledDate = new Date(item.preferred_window.start_utc);
        return scheduledDate >= today &&
               item.status?.toLowerCase() !== 'closed' &&
               item.status?.toLowerCase() !== 'resolved';
      })
      .sort((a, b) => {
        const dateA = new Date(a.preferred_window.start_utc);
        const dateB = new Date(b.preferred_window.start_utc);
        return dateA - dateB;
      });
  };

  const upcomingMaintenance = getUpcomingMaintenance();
  const displayedItems = showAllMaintenance
    ? upcomingMaintenance
    : upcomingMaintenance.slice(0, 1);

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Format time window
  const formatTimeWindow = (startUtc, endUtc) => {
    if (!startUtc || !endUtc) return "";
    
    const start = new Date(startUtc);
    const end = new Date(endUtc);
    
    const formatTime = (date) =>
      date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    
    return `${formatTime(start)} - ${formatTime(end)}`;
  };

  return (
    <Container style={styles.pageContainer}>
      {/* 🔗 Quick Links Section */}
      <VStack mt={hp(2)} mx={wp(4.5)}>
        <Text fontSize={hp(2.2)} bold color={Colors.black} mb={hp(1.5)} alignItems="flex-start">
          Quick Links
        </Text>
        <HStack justifyContent="space-around" mt={hp(1)} space={wp(2)} width="100%" alignItems="center">
          <QuickLink
            icon={icons.LandlordRent}
            label="Contact Landlord"
            onPress={() => setShowContactModal(true)}
          />
          <QuickLink
            icon={icons.RentHistory}
            label="Rent History"
            onPress={() => navigation.navigate("RentHistory")}
          />
          <QuickLink
            icon={icons.RentDocument}
            label="Rent Documents"
            onPress={() => setShowDocumentsModal(true)}
          />
        </HStack>
      </VStack>

      {/* 💰 Rent Payment Card */}
      <View style={styles.rentCardWrapper}>
        <View style={styles.glassCard}>
          <View style={styles.rentCardInner}>
            <HStack alignItems="center" space={3}>
              <View style={styles.rentIconBox}>
                <AppIcon name={icons.RentHistory} height={hp(3)} width={hp(3)} />
              </View>

              <VStack flex={1}>
                <Text fontSize={hp(3.2)} bold color={Colors.black}>
                  $2600
                </Text>
                <Text fontSize={hp(1.8)} color={Colors.textGray}>
                  Pay your rent now
                </Text>
              </VStack>

              <TouchableOpacity style={styles.payRentBtn}>
                <Text style={styles.payRentBtnText}>Pay Rent</Text>
              </TouchableOpacity>
            </HStack>

            <HStack alignItems="center" space={2} mt={hp(1.5)}>
              <AppIcon name={icons.calendar} height={hp(2)} width={hp(2)} />
              <Text fontSize={hp(1.7)} color={Colors.textGray}>
                Next Due Date:{" "}
                <Text bold color={Colors.black}>
                  Sep 28, 2025
                </Text>
              </Text>
            </HStack>
          </View>
        </View>
      </View>

      {/* 🛠 Request Help Section */}
      <VStack mx={wp(4.5)} mt={hp(3)}>
        <Text fontSize={hp(2.2)} bold color={Colors.black} mb={hp(1.5)}>
          Request Help
        </Text>

        <View style={styles.glassCard}>
          <Box style={styles.glassCardInner}>
            {maintenanceLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color={Colors.primary} />
              </View>
            ) : (
              <>
                <HStack justifyContent="space-around" mb={hp(2)}>
                  <VStack alignItems="center" flex={1}>
                    <HStack alignItems="center" space={2}>
                      <AppIcon name={icons.email} height={hp(2.2)} width={hp(2.2)} />
                      <Text fontSize={hp(2.5)} bold color={Colors.black}>
                        {newRequestCount.toString().padStart(2, '0')}
                      </Text>
                    </HStack>
                    <Text fontSize={hp(1.6)} color={Colors.textGray} mt={1}>
                      New Request
                    </Text>
                  </VStack>

                  <VStack alignItems="center" flex={1}>
                    <HStack alignItems="center" space={2}>
                      <View style={styles.progressIcon}>
                        <Text style={styles.progressIconText}>⏱</Text>
                      </View>
                      <Text fontSize={hp(2.5)} bold color={Colors.black}>
                        {inProgressCount.toString().padStart(2, '0')}
                      </Text>
                    </HStack>
                    <Text fontSize={hp(1.6)} color={Colors.textGray} mt={1}>
                      In Progress
                    </Text>
                  </VStack>

                  <VStack alignItems="center" flex={1}>
                    <HStack alignItems="center" space={2}>
                      <View style={styles.completedIcon}>
                        <Text style={styles.completedIconText}>✓</Text>
                      </View>
                      <Text fontSize={hp(2.5)} bold color={Colors.black}>
                        {completedCount.toString().padStart(2, '0')}
                      </Text>
                    </HStack>
                    <Text fontSize={hp(1.6)} color={Colors.textGray} mt={1}>
                      Completed
                    </Text>
                  </VStack>
                </HStack>

                <TouchableOpacity
                  style={styles.viewDetailsBtn}
                  onPress={() => navigation.navigate('Support')}
                >
                  <Text style={styles.viewDetailsBtnText}>View Details</Text>
                </TouchableOpacity>
              </>
            )}
          </Box>
        </View>
      </VStack>

      {/* 🧰 Upcoming Maintenance Section */}
      <VStack mx={wp(4.5)} mt={hp(3)} mb={hp(3)}>
        <Text fontSize={hp(2.2)} bold color={Colors.black} mb={hp(1.5)}>
          Upcoming Maintenance
        </Text>

        <View style={styles.glassCard}>
          <Box style={styles.glassCardInner}>
            {maintenanceLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color={Colors.primary} />
              </View>
            ) : upcomingMaintenance.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Icon name="calendar-check" size={40} color="#E0E0E0" />
                <Text fontSize={hp(1.8)} color={Colors.textGray} mt={2} textAlign="center">
                  No upcoming maintenance scheduled
                </Text>
              </View>
            ) : (
              <>
                <VStack space={3}>
                  {displayedItems.map((item, index) => (
                    <TouchableOpacity
                      key={item.ticket_id || item.id}
                      onPress={() => {
                        navigation.navigate("QueryDetails", { data: item });
                      }}
                    >
                      <HStack
                        alignItems="center"
                        space={3}
                        pb={index < displayedItems.length - 1 ? 3 : 0}
                        borderBottomWidth={index < displayedItems.length - 1 ? 1 : 0}
                        borderBottomColor="#F3F4F6"
                      >
                        <View style={styles.maintenanceIconBox}>
                          <AppIcon
                            name={icons.maintenance}
                            height={hp(2.5)}
                            width={hp(2.5)}
                          />
                        </View>
                        <VStack flex={1}>
                          <Text fontSize={hp(1.6)} color={Colors.textGray}>
                            {formatDate(item.preferred_window?.start_utc)}
                          </Text>
                          <Text fontSize={hp(1.9)} bold color={Colors.black} mt={0.5}>
                            {item.title || 'Maintenance Request'}
                          </Text>
                          <Text fontSize={hp(1.6)} color={Colors.textGray} mt={0.5}>
                            {item.location || 'Location not specified'} • {formatTimeWindow(item.preferred_window?.start_utc, item.preferred_window?.end_utc)}
                          </Text>
                        </VStack>
                      </HStack>
                    </TouchableOpacity>
                  ))}
                </VStack>

                {upcomingMaintenance.length > 1 && (
                  <TouchableOpacity
                    style={styles.showMoreBtn}
                    onPress={() => setShowAllMaintenance(!showAllMaintenance)}
                  >
                    <Text style={styles.showMoreText}>
                      {showAllMaintenance ? "Show less details" : `Show more details (${upcomingMaintenance.length - 1} more)`}{" "}
                      <Text style={styles.arrow}>
                        {showAllMaintenance ? "▲" : "▼"}
                      </Text>
                    </Text>
                  </TouchableOpacity>
                )}
              </>
            )}
          </Box>
        </View>
      </VStack>

      {/* 📞 Contact Landlord Modal */}
      <Modal
        visible={showContactModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowContactModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHandle} />
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => setShowContactModal(false)}
            >
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>

            <Text style={styles.modalTitle}>Contact Landlord</Text>

            {propertiesLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color={Colors.primary} />
                <Text style={{ marginTop: 10, color: Colors.textGray }}>
                  Loading landlord information...
                </Text>
              </View>
            ) : (
              <VStack space={4} mt={hp(3)}>
                <InfoBox
                  icon={icons.person}
                  label="Full Name"
                  value={landlordName}
                />
                <InfoBox
                  icon={icons.email}
                  label="Email ID"
                  value={landlordEmail}
                />
                <InfoBox
                  icon={icons.phone}
                  label="Phone Number"
                  value={landlordPhone}
                />
              </VStack>
            )}
          </View>
        </View>
      </Modal>

      {/* 📄 Rent Documents Modal */}
      <Modal
        visible={showDocumentsModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowDocumentsModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHandle} />
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => setShowDocumentsModal(false)}
            >
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>

            <Text style={styles.modalTitle}>Rent Documents</Text>

            <VStack space={4} mt={hp(3)}>
              <DocumentItem label="Rent Agreement" />
              <DocumentItem label="Inspection Reports" />
              <DocumentItem label="Insurance Policies" />
            </VStack>
          </View>
        </View>
      </Modal>
    </Container>
  );
};

// Quick Link Component
const QuickLink = ({ icon, label, onPress }) => (
  <TouchableOpacity style={styles.quickLink} onPress={onPress}>
    <View style={styles.iconCircle}>
      <AppIcon name={icon} height={hp(4)} width={hp(4)} />
    </View>
    <Text
      fontSize={hp(1.9)}
      color={Colors.textGray}
      style={styles.quickLinkText}
      numberOfLines={2}
    >
      {label}
    </Text>
  </TouchableOpacity>
);

// Info Box Component for Contact Modal
const InfoBox = ({ icon, label, value }) => (
  <Box style={styles.infoBox}>
    <HStack space={3} alignItems="center">
      <AppIcon name={icon} height={hp(2)} width={hp(2)} />
      <VStack>
        <Text fontSize={hp(1.6)} color={Colors.textGray}>
          {label}
        </Text>
        <Text fontSize={hp(2)} bold={value !== "Not Available"}>
          {value}
        </Text>
      </VStack>
    </HStack>
  </Box>
);

// Document Item Component for Documents Modal
const DocumentItem = ({ label }) => (
  <TouchableOpacity style={styles.docItem}>
    <HStack justifyContent="space-between" alignItems="center">
      <HStack space={3} alignItems="center">
        <AppIcon name={icons.document} height={hp(3)} width={hp(3)} />
        <VStack>
          <Text fontSize={hp(1.8)} bold>
            Download
          </Text>
          <Text fontSize={hp(1.8)}>{label}</Text>
        </VStack>
      </HStack>
      <View style={styles.downloadBtn}>
        <AppIcon name={icons.download} height={hp(2.5)} width={hp(2.5)} />
      </View>
    </HStack>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  pageContainer: {},
  rentCardWrapper: {
    marginHorizontal: wp(4.5),
    marginTop: hp(3),
  },
  glassCard: {
    backgroundColor: "rgba(255, 255, 255, 0.6)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    overflow: "hidden",
  },
  glassCardInner: { padding: hp(2) },
  rentCardInner: { padding: hp(2) },
  rentIconBox: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    padding: hp(1.2),
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.5)",
  },
  payRentBtn: {
    backgroundColor: Colors.red,
    paddingVertical: hp(1.5),
    paddingHorizontal: wp(6),
    borderRadius: 10,
    shadowColor: Colors.red,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  payRentBtnText: { color: "#fff", fontWeight: "bold", fontSize: hp(1.8) },
  progressIcon: {
    width: hp(2.5),
    height: hp(2.5),
    borderRadius: hp(1.25),
    backgroundColor: "#FEF3C7",
    alignItems: "center",
    justifyContent: "center",
  },
  progressIconText: { fontSize: hp(1.5) },
  completedIcon: {
    width: hp(2.5),
    height: hp(2.5),
    borderRadius: hp(1.25),
    backgroundColor: "#D1FAE5",
    alignItems: "center",
    justifyContent: "center",
  },
  completedIconText: { fontSize: hp(1.5), color: "#059669", fontWeight: "bold" },
  viewDetailsBtn: {
    borderWidth: 2,
    borderColor: Colors.red,
    paddingVertical: hp(1.5),
    borderRadius: 10,
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.5)",
  },
  viewDetailsBtnText: {
    color: Colors.red,
    fontWeight: "bold",
    fontSize: hp(1.8),
  },
  maintenanceIconBox: {
    backgroundColor: "rgba(255, 232, 232, 0.9)",
    padding: hp(1.5),
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  showMoreBtn: { paddingTop: hp(2), alignItems: "center" },
  showMoreText: { fontSize: hp(1.7), color: Colors.textGray, fontWeight: "600" },
  arrow: { fontSize: hp(1.4) },
  loadingContainer: {
    paddingVertical: hp(2),
    alignItems: "center",
    justifyContent: "center",
  },
  emptyContainer: {
    paddingVertical: hp(3),
    alignItems: "center",
    justifyContent: "center",
  },
  quickLink: {
    alignItems: "center",
    width: wp(22),
  },
  quickLinkText: {
    fontFamily: "Nunito",
    fontWeight: "600",
    fontSize: hp(1.7),
    textAlign: "center",
    color: "#222222",
    width: wp(22),
    marginTop: hp(0.5),
  },
  iconCircle: {
    backgroundColor: "#fff",
    borderRadius: 50,
    padding: hp(1.5),
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    borderWidth: 1.5,
    borderColor: Colors.red,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    paddingHorizontal: wp(5),
    paddingTop: hp(2),
    paddingBottom: hp(4),
    minHeight: hp(50),
  },
  modalHandle: {
    width: wp(15),
    height: 5,
    backgroundColor: "#D1D5DB",
    borderRadius: 3,
    alignSelf: "center",
    marginBottom: hp(2),
  },
  closeBtn: {
    position: "absolute",
    right: wp(5),
    top: hp(2),
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  closeText: {
    fontSize: hp(2.5),
    color: "#6B7280",
    fontWeight: "bold",
  },
  modalTitle: {
    fontSize: hp(2.5),
    fontWeight: "bold",
    color: "#000",
    marginTop: hp(1),
  },
  infoBox: {
    backgroundColor: "#F9FAFB",
    padding: hp(2),
    borderRadius: 12,
  },
  docItem: {
    backgroundColor: "#F9FAFB",
    padding: hp(2),
    borderRadius: 12,
  },
  downloadBtn: {
    backgroundColor: "#FEE2E2",
    padding: hp(1),
    borderRadius: 8,
  },
});

export default Dashboard;
