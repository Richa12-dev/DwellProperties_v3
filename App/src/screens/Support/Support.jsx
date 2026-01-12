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
import Toast from "react-native-simple-toast";
import { useSelector, useDispatch } from "react-redux";
import Container from "../../components/Container/Container";
import { getMaintenanceRequests } from "../../Redux/Maintenance/services";
import { maintenanceSelectors } from "../../Redux/Maintenance/maintenanceSlice";
import { getTenantProperties } from '../../Redux/Properties/services';
import { AppIcon } from "../../components/AppIcon";
import { icons } from "../../Assets";
import { getFontFamily } from '../../utils';


const Support = ({ navigation }) => {
  const dispatch = useDispatch();
  const [showAll, setShowAll] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [propertyInfo, setPropertyInfo] = useState(null);
  const [loadingProperty, setLoadingProperty] = useState(true);

  // ✅ Use consistent token
  const loginData = useSelector((state) => state.loginData || {});
  const token = loginData?.idToken ; // Use idToken first
  const tenant_sub = loginData?.userData?.tenantId;
  
   const accessToken = loginData?.accessToken;

  // Get maintenance data from Redux
  const {
    requests,
    loading: maintenanceLoading,
    totalRequests,
    openRequests,
    closedRequests
  } = useSelector(maintenanceSelectors.getMaintenanceData);

  useEffect(() => {
    const fetchPropertyInfo = async () => {
      if (!accessToken || !tenant_sub) {
        console.error('❌ Missing tenant_sub or token');
        setLoadingProperty(false);
        return;
      }

      try {
        setLoadingProperty(true);
        console.log('🔍 Fetching tenant properties for:', tenant_sub);

        const result = await dispatch(getTenantProperties({ tenantId: tenant_sub, token: accessToken })).unwrap();
        
        console.log('📦 Tenant properties response:', result);

        if (result && Array.isArray(result) && result.length > 0) {
          const assignedProperty = result[0];
          
          const extractedPropertyInfo = {
            property_id: assignedProperty.propertyId || assignedProperty.property_id,
            property_name: assignedProperty.name || assignedProperty.property_name || 'My Property',
            landlord_id: assignedProperty.landlord_id || assignedProperty.landlordId,
            tenant_id: tenant_sub,
            street: assignedProperty.street || '',
            city: assignedProperty.city || '',
            state: assignedProperty.state || '',
            zipcode: assignedProperty.zipcode || '',
          };
          
          if (!extractedPropertyInfo.property_id) {
            setPropertyInfo(null);
            return;
          }

          if (!extractedPropertyInfo.landlord_id) {
           
            setPropertyInfo(null);
            return;
          }

          setPropertyInfo(extractedPropertyInfo);
          
        } else {
          console.warn(' No properties assigned to this tenant');
          setPropertyInfo(null);
        }
      } catch (error) {
        console.error('Failed to fetch tenant properties:', error);
        Toast.show('Failed to load property information');
        setPropertyInfo(null);
      } finally {
        setLoadingProperty(false);
      }
    };

    fetchPropertyInfo();
  }, [dispatch, accessToken, tenant_sub]);
  
  const sortedRequests = [...requests].sort((a, b) => {
    const titleA = (a.title || 'Untitled Request').toLowerCase();
    const titleB = (b.title || 'Untitled Request').toLowerCase();
    return titleA.localeCompare(titleB);
  });

  useEffect(() => {
    // ✅ Fetch maintenance requests - use same token (idToken)
    if (token && tenant_sub) {
      console.log('📡 Fetching maintenance requests for tenant:', tenant_sub);
      dispatch(
        getMaintenanceRequests({
          tenant_id: tenant_sub,
          token: token, // Use consistent token
        })
      );
    }
  }, [dispatch, token, tenant_sub]);

const visibleRequests = showAll ? sortedRequests : sortedRequests.slice(0, 3);

  const getStatusStyle = (status) => {
  const statusLower = status?.toLowerCase() || '';
  if (statusLower === 'in progress' || statusLower === 'inprogress') {
    return { backgroundColor: "#DBEAFE", color: "#1E40AF" }; // Blue for In Progress
  } else if (statusLower.includes('progress') || statusLower === 'open') {
    return { backgroundColor: "#D1FAE5", color: "#047857" }; // Green
  } else if (statusLower === 'pending' || statusLower === 'new') {
    return { backgroundColor: "#FEF3C7", color: "#B45309" }; // Yellow
  } else if (statusLower === 'completed' || statusLower === 'closed' || statusLower === 'resolved') {
    return { backgroundColor: "#F3F4F6", color: "#6B7280" }; // Gray
  }
  return { backgroundColor: "#F3F4F6", color: "#6B7280" };
};

const getDisplayStatus = (item) => {
  // If contractor has accepted, show "In Progress"
  if (item.contractor_assignment?.state === 'ACCEPTED' &&
      item.status?.toLowerCase() !== 'closed' &&
      item.status?.toLowerCase() !== 'resolved') {
    return 'In Progress';
  }
  // Otherwise show the actual status
  return item.status || 'Pending';
};

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB");
  };
  
  const formatScheduledWindow = (startUtc, endUtc) => {
  if (!startUtc || !endUtc) return "Scheduled";

  const start = new Date(startUtc);
  const end = new Date(endUtc);

  const now = new Date();

  // Remove time for day comparison
  const today = new Date(now.setHours(0, 0, 0, 0));
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  let dayLabel = start.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
  });

  if (start >= today && start < tomorrow) {
    dayLabel = "Today";
  } else if (
    start >= tomorrow &&
    start < new Date(tomorrow.getTime() + 24 * 60 * 60 * 1000)
  ) {
    dayLabel = "Tomorrow";
  }

  const formatTime = (date) =>
    date.toLocaleTimeString("en-GB", {
      hour: "numeric",
      hour12: true,
    });

  return `Scheduled ${dayLabel} ${formatTime(start)}–${formatTime(end)}`;
};



  const handleCloseModal = () => {
    setShowModal(false);
    // ✅ Refresh using same token
    if (token && tenant_sub) {
      console.log('🔄 Refreshing maintenance requests...');
      dispatch(getMaintenanceRequests({
        tenant_id: tenant_sub,
        token: token,
      }));
    }
  };

  const handleOpenModal = () => {
    if (loadingProperty) {
      Toast.show("Loading property information...");
      return;
    }

    if (!propertyInfo) {
      Toast.show("No property assigned. Please contact your landlord.");
      return;
    }
    
    if (!propertyInfo.property_id) {
      Toast.show("Property ID missing. Please contact support.");
      console.error('❌ Property Info:', propertyInfo);
      return;
    }
    
    if (!propertyInfo.landlord_id) {
      Toast.show("Landlord information missing. Please contact support.");
      console.error('❌ Property Info:', propertyInfo);
      return;
    }
    
    setShowModal(true);
  };

  // ✅ Fixed renderRequest to handle backend response structure
  const renderRequest = ({ item }) => {
    // Backend returns: ticket_id, title, description, category, priority, location, status, created_at, preferred_window
    const ticketId = item.ticket_id || item.request_id || item.id || 'N/A';
    const title = item.title || 'Untitled Request';
    const description = item.description || 'No description provided';
    const location = item.location || 'Location not specified';
    const category = item.category || '';
    const priority = item.priority || 'Medium';
   // const status = item.status || 'Pending';
    const displayStatus = getDisplayStatus(item);
    const createdAt = item.created_at || new Date().toISOString();
    const preferredWindow = item.preferred_window || null;
    
    return (
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => {
          console.log("📍 Navigating to QueryDetails with item:", item);
          // ✅ Pass the complete item as 'data' prop
          navigation.navigate("QueryDetails", { data: item });
        }}
      >
        <View style={styles.glassContainer}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>{title}</Text>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: getStatusStyle(displayStatus).backgroundColor },
              ]}
            >
              <Text
                style={[
                  styles.statusText,
                  { color: getStatusStyle(displayStatus).color },
                ]}
              >
                {displayStatus}
              </Text>
            </View>
          </View>

        
          
          {/* ✅ Show all available details */}
          <Text style={styles.cardCategory}>
            {location}
            {category ? ` • ${category}` : ''}
            {priority ? ` • ${priority} Priority` : ''}
          </Text>

          <Text style={styles.cardDescription} numberOfLines={2}>
            {description}
          </Text>

          <View style={styles.cardFooter}>
            <View style={styles.footerItem}>
                         <AppIcon
              name={icons.calender}
              height={hp(2)}
              width={hp(2)}
              color={Colors.placeholder}
            />
              <Text style={styles.footerText}>{formatDate(createdAt)}</Text>
            </View>
            {preferredWindow?.start_utc && (
              <View style={styles.footerItem}>
            <AppIcon
              name={icons.calender}
              height={hp(2)}
              width={hp(2)}
              color={Colors.placeholder}
            />
               <Text style={styles.footerText}>
  {formatScheduledWindow(
    preferredWindow.start_utc,
    preferredWindow.end_utc
  )}
</Text>

              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const loading = maintenanceLoading || loadingProperty;

  return (
    <Container  scroll={false}>
   <Text style={styles.pageTitle}>My Maintenance ({totalRequests})</Text>

      {loading && requests.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading...</Text>
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
          keyExtractor={(item, index) => (item.ticket_id || item.request_id || item.id || index).toString()}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={
            <>
              {!showAll && requests.length > 3 && (
                <TouchableOpacity
                  style={styles.showMoreButton}
                  onPress={() => setShowAll(true)}
                >
                  <Text style={styles.showMoreText}>
                    Show More ({requests.length - 3})
                  </Text>
                </TouchableOpacity>
              )}
              {showAll && requests.length > 3 && (
                <TouchableOpacity
                  style={styles.showMoreButton}
                  onPress={() => setShowAll(false)}
                >
                  <Text style={styles.showMoreText}>Show Less</Text>
                
                </TouchableOpacity>
              )}
            </>
          }
        />
      )}

      {/* Floating Add Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={handleOpenModal}
      >
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
          property={propertyInfo}
          landlordId={propertyInfo?.landlord_id}
          tenant_sub={tenant_sub}
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
 cardTitle: {
  fontFamily: getFontFamily('Poppins', '600'),
  fontSize: hp(1.8),
  lineHeight: hp(3),
  letterSpacing: 0,
  color: Colors.textPrimary,
  width: wp(62),
  height: hp(3),
  opacity: 1,
},

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
    bottom: hp(11),
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
